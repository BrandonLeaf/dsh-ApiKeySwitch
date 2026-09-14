// ApiKeySwitch - Host 半区（正式部署版）
//
// 作为标准 Cordis 插件挂载进宿主组合（cordis.patch.yml），进程启动即加载，
// 无需手动运行。与动态版（plugin/host.js）的差异：
// - 模型工具改用 ctx.tools.register（替代 harness.registerTool）
// - Client 通信改用 webServer HTTP 路由（替代 harness.handle / host.call）
// - 凭据、路由同步、项目目录、目录绑定与自动切换逻辑与动态版一致
//
// DSH 0.1.5 适配要点：
// - 模型目录不再硬编码：供应商取自 llm.listProviders / llm.listConfigurableProviders，
//   模型取自对应 settings 命名空间（与「设置-模型」页同源），默认模型取自
//   agentDefaultModel.currentSelection()，模型换代后自动跟随
// - 目录自动切换：会话目录取自 agent.session.header.cwd / workspaceRegistry，
//   与各项目 meta.dirs 绑定比对，切换 workspace 时自动写入对应项目的 Key
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'apikeyswitch'
export const inject = ['credentials']

const ACTIVE_REF = 'DEEPSEEK_API_KEY'
const BACKUP_REF = 'DSH_APIK_BACKUP'
const META_REF = 'DSH_APIK_META'
const ID_RE = /^[a-z0-9]{1,20}$/
const DEFAULT_PROVIDER = 'deepseek-official'
// 模型目录缓存时长：避免每次 status 都重复读取 settings 命名空间
const CATALOG_TTL_MS = 5000

const BASE = [
  { id: 'personal', remark: '默认', provider: DEFAULT_PROVIDER, ref: 'DEEPSEEK_API_KEY' },
]
const BASE_IDS = BASE.map((p) => p.id)

function maskKey(value) {
  if (typeof value !== 'string' || value.length === 0) return null
  if (value.length <= 10) return value.slice(0, 3) + '***'
  return value.slice(0, 6) + '***' + value.slice(-4)
}

function refFor(id) {
  return 'DSH_' + id.toUpperCase() + '_API_KEY'
}

// 目录归一化：仅用于字符串比较（去掉首尾空白与结尾分隔符）
function normalizeDir(value) {
  if (typeof value !== 'string') return ''
  let s = value.trim()
  if (s === '') return ''
  s = s.replace(/[/\\]+$/, '')
  return s === '' ? '/' : s
}

function dirsOf(meta) {
  const raw = meta && Array.isArray(meta.dirs) ? meta.dirs : []
  const out = []
  for (const item of raw) {
    const d = normalizeDir(item)
    if (d !== '' && out.indexOf(d) === -1) out.push(d)
  }
  return out
}

function getPath(obj, path) {
  let cur = obj
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = cur[key]
  }
  return cur
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch (e) {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

function writeJson(res, code, value) {
  const text = JSON.stringify(value)
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(text)
}

function modelListOf(value) {
  const out = []
  if (!Array.isArray(value)) return out
  for (const entry of value) {
    if (typeof entry === 'string' && entry !== '') out.push({ id: entry, name: entry })
    else if (entry && typeof entry === 'object' && typeof entry.id === 'string' && entry.id !== '') {
      out.push({ id: entry.id, name: typeof entry.name === 'string' && entry.name !== '' ? entry.name : entry.id })
    }
  }
  return out
}

export function apply(ctx) {
  const credentials = ctx.credentials

  async function readMeta() {
    const raw = await credentials.resolve(META_REF)
    if (raw === undefined) return {}
    try {
      const obj = JSON.parse(raw.value)
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj
    } catch (e) { /* ignore */ }
    return {}
  }

  async function writeMeta(meta) {
    await credentials.set(META_REF, JSON.stringify(meta))
  }

  async function migrateLegacy() {
    const info = await credentials.describe('DSH_PERSONAL_API_KEY')
    if (!info.configured) return
    const personal = await credentials.resolve('DSH_PERSONAL_API_KEY')
    const backup = await credentials.resolve(BACKUP_REF)
    if (personal !== undefined && backup === undefined) {
      await credentials.set(BACKUP_REF, personal.value)
    }
    await credentials.unset('DSH_PERSONAL_API_KEY')
  }

  async function currentIsDefault() {
    const active = await credentials.resolve(ACTIVE_REF)
    if (active === undefined) return true
    const profiles = await catalog()
    for (const p of profiles) {
      if (p.id === 'personal') continue
      const v = await credentials.resolve(p.ref)
      if (v !== undefined && v.value === active.value) return false
    }
    return true
  }

  // ── 实时模型目录（供应商 + 模型）──
  // 与「设置-模型」页同源：
  // - 供应商：llm.listProviders()（已挂载路由）+ llm.listConfigurableProviders()（可配置目录）
  // - 模型：对应 settings 命名空间在 settingsPath 处的 models 数组
  // - 兜底：已挂载但未声明目录的供应商用 llm.listModels(provider)
  // 结果缓存 CATALOG_TTL_MS，避免每次状态读取都重复解析。
  let catalogCache = { at: 0, value: null }

  function settingsModels(settings, ns, path) {
    if (!ns || !settings || typeof settings.get !== 'function') return []
    let value
    try {
      value = settings.get(ns)
    } catch (e) {
      return []
    }
    const profile = path.length === 0 ? value : getPath(value, path)
    return modelListOf(profile && typeof profile === 'object' ? profile.models : undefined)
  }

  async function adapterModels(llm, provider) {
    try {
      if (!llm || typeof llm.listModels !== 'function') return []
      const list = await llm.listModels(provider)
      return modelListOf(list)
    } catch (e) {
      return []
    }
  }

  async function liveCatalog() {
    const now = Date.now()
    if (catalogCache.value !== null && now - catalogCache.at < CATALOG_TTL_MS) return catalogCache.value

    const llm = ctx.get('llm')
    const settings = ctx.get('settings')
    const registered = []
    try {
      if (llm && typeof llm.listProviders === 'function') {
        for (const p of llm.listProviders()) {
          if (p && typeof p.id === 'string' && p.id !== '') {
            registered.push({ id: p.id, name: typeof p.name === 'string' && p.name !== '' ? p.name : p.id })
          }
        }
      }
    } catch (e) { /* 供应商枚举失败时按空目录处理，不影响 Key 管理 */ }

    const directory = []
    try {
      if (llm && typeof llm.listConfigurableProviders === 'function') {
        for (const entry of llm.listConfigurableProviders()) {
          if (!entry || typeof entry.provider !== 'string' || entry.provider === '') continue
          directory.push({
            provider: entry.provider,
            displayName: typeof entry.displayName === 'string' && entry.displayName !== '' ? entry.displayName : entry.provider,
            settingsNs: typeof entry.settingsNs === 'string' ? entry.settingsNs : '',
            settingsPath: Array.isArray(entry.settingsPath) ? entry.settingsPath.map(String) : [],
          })
        }
      }
    } catch (e) { /* 同上 */ }

    const providers = []
    const seen = new Set()
    for (const entry of directory) {
      const mounted = registered.some((r) => r.id === entry.provider)
      let models = settingsModels(settings, entry.settingsNs, entry.settingsPath)
      if (models.length === 0 && mounted) models = await adapterModels(llm, entry.provider)
      // 只保留真正可用的供应商：已挂载路由，或已被配置出模型目录；
      // 未挂载且未配置的声明项（pi-ai 等适配器的休眠路由）不进入选择列表。
      if (!mounted && models.length === 0) continue
      providers.push({ id: entry.provider, name: entry.displayName, mounted, models })
      seen.add(entry.provider)
    }
    for (const r of registered) {
      if (seen.has(r.id)) continue
      providers.push({ id: r.id, name: r.name, mounted: true, models: await adapterModels(llm, r.id) })
      seen.add(r.id)
    }
    if (providers.length === 0) {
      providers.push({ id: DEFAULT_PROVIDER, name: DEFAULT_PROVIDER, mounted: false, models: [] })
    }
    catalogCache = { at: now, value: providers }
    return providers
  }

  // 实时默认路由：模型换代后自动跟随「设置-模型」页，而不是沿用硬编码模型 id
  function liveDefaultRoute() {
    try {
      const amd = ctx.get('agentDefaultModel')
      const cur = amd && typeof amd.currentSelection === 'function' ? amd.currentSelection() : null
      if (cur && typeof cur.provider === 'string' && cur.provider !== '' && typeof cur.model === 'string' && cur.model !== '') {
        return { provider: cur.provider, model: cur.model }
      }
    } catch (e) { /* agent-default-model 未挂载时回落到静态供应商 */ }
    return { provider: DEFAULT_PROVIDER, model: '' }
  }

  // 有效路由解析：项目配置的模型若已不在实时目录中（供应商模型换代、改名或下线），
  // 依次回落到「实时默认路由 → 该供应商首个模型」，
  // 并以 stale 标记告知界面，避免把失效模型写进默认路由。
  function effectiveRoute(profile, providers, fallback) {
    const provider = profile.provider || fallback.provider || DEFAULT_PROVIDER
    const entry = providers.find((p) => p.id === provider)
    const ids = entry ? entry.models.map((m) => m.id) : []
    const stored = profile.model || ''
    let model = stored
    let stale = false
    if (stored !== '' && ids.length > 0 && ids.indexOf(stored) === -1) {
      stale = true
      model = ''
    }
    if (model === '') {
      if (fallback.model !== '' && fallback.provider === provider && (ids.length === 0 || ids.indexOf(fallback.model) !== -1)) {
        model = fallback.model
      } else if (ids.length > 0) {
        model = ids[0]
      } else {
        model = stored !== '' ? stored : fallback.model
      }
    }
    return { provider, model, stale }
  }

  async function catalog() {
    const meta = await readMeta()
    const fallback = liveDefaultRoute()
    const profiles = BASE.map((b) => {
      const m = meta[b.id] || {}
      if (m.deleted === true) return null
      return {
        id: b.id,
        remark: m.remark || b.remark,
        provider: m.provider || b.provider || fallback.provider,
        model: m.model || fallback.model,
        dirs: dirsOf(m),
        ref: b.ref,
        user: false,
      }
    }).filter((p) => p !== null)
    for (const id of Object.keys(meta)) {
      if (BASE_IDS.includes(id)) continue
      const m = meta[id]
      if (!m || m.user !== true || m.deleted === true) continue
      profiles.push({
        id: id,
        remark: m.remark || id,
        provider: m.provider || DEFAULT_PROVIDER,
        model: m.model || fallback.model,
        dirs: dirsOf(m),
        ref: refFor(id),
        user: true,
      })
    }
    return profiles
  }

  async function syncRoute(profile) {
    const amd = ctx.get('agentDefaultModel')
    if (amd === undefined) return false
    try {
      const providers = await liveCatalog()
      const route = effectiveRoute(profile, providers, liveDefaultRoute())
      if (route.model === '') return false
      const current = amd.currentSelection()
      const next = {
        provider: route.provider,
        model: route.model,
        ...(current && current.reasoningEffort ? { reasoningEffort: current.reasoningEffort } : {}),
      }
      if (current && current.provider === next.provider && current.model === next.model) return true
      await amd.saveSelection(next)
      return true
    } catch (e) {
      return false
    }
  }

  // 当前项目配置的模型是否已被实时目录淘汰（用于界面提示）
  async function routeStale(profile) {
    const providers = await liveCatalog()
    return effectiveRoute(profile, providers, liveDefaultRoute()).stale
  }

  // ── 目录绑定 ──
  // 每个目录只能绑定一个项目：canonDir 用 workspaceRegistry.resolveByPath 做
  // 真实路径归一（目录不存在时静默回落到字符串归一，不阻塞配置）。
  async function canonDir(dir) {
    const normalized = normalizeDir(dir)
    if (normalized === '') return ''
    const reg = ctx.get('workspaceRegistry')
    if (reg && typeof reg.resolveByPath === 'function') {
      try {
        const ws = await reg.resolveByPath(normalized)
        if (ws && typeof ws.path === 'string' && ws.path !== '') return normalizeDir(ws.path)
      } catch (e) { /* 目录当前不存在：按字符串比较 */ }
    }
    return normalized
  }

  async function sameDir(a, b) {
    const na = normalizeDir(a)
    const nb = normalizeDir(b)
    if (na === '' || nb === '') return false
    if (na === nb) return true
    return (await canonDir(na)) === (await canonDir(nb))
  }

  // 找出与 dirs 冲突的其他项目（excludeId 自身除外）
  async function findDirConflict(dirs, excludeId) {
    if (dirs.length === 0) return null
    const profiles = await catalog()
    for (const p of profiles) {
      if (p.id === excludeId) continue
      for (const owned of p.dirs) {
        for (const dir of dirs) {
          if (await sameDir(owned, dir)) return { dir: dir, profile: p }
        }
      }
    }
    return null
  }

  // 会话目录 → 绑定项目
  async function matchDirProfile(dir) {
    if (normalizeDir(dir) === '') return null
    const profiles = await catalog()
    for (const p of profiles) {
      for (const owned of p.dirs) {
        if (await sameDir(owned, dir)) return p
      }
    }
    return null
  }

  // 会话当前工作目录：live 会话取 header.cwd，历史会话取 workspaceRegistry 归属
  async function resolveSessionDir(sessionId) {
    if (!sessionId) return ''
    const agents = ctx.get('agents')
    if (agents && typeof agents.get === 'function') {
      try {
        const agent = agents.get(sessionId)
        const cwd = agent && agent.session && agent.session.header ? agent.session.header.cwd : ''
        if (typeof cwd === 'string' && cwd !== '') return normalizeDir(cwd)
      } catch (e) { /* 会话不在 live 注册表：继续用 workspaceRegistry 兜底 */ }
    }
    const reg = ctx.get('workspaceRegistry')
    if (reg && typeof reg.list === 'function') {
      try {
        for (const ws of reg.list()) {
          const ids = ws && ws.sessionIds ? ws.sessionIds : []
          for (const id of ids) {
            if (String(id) === String(sessionId)) return normalizeDir(String(ws.path || ''))
          }
        }
      } catch (e) { /* 枚举异常按未知目录处理 */ }
    }
    return ''
  }

  // ── 运行会话探测：防止切换与会话任务并发造成 API Key 交叉污染 ──
  // 宿主 agents 服务登记了所有 live agent（会话任务含子代理），其 status
  // getter 反映该会话是否正在执行（'idle' / 'running'）。切换 Key 会改写
  // 全局生效槽，若有会话正在执行，其下一次模型请求会立即使用新 Key，
  // 造成跨会话使用量交叉污染；因此探测到运行中的会话时拒绝切换。
  function collectRunningSessions() {
    const agents = ctx.get('agents')
    if (agents === undefined || typeof agents.list !== 'function') return []
    const list = []
    try {
      for (const agent of agents.list()) {
        let status = null
        try { status = agent && agent.status } catch (e) { status = null }
        if (status !== 'running') continue
        const sessionId = agent.session && agent.session.id ? agent.session.id : (agent.id || '?')
        list.push({ sessionId: String(sessionId), agentId: String(agent.id || '') })
      }
    } catch (e) { /* 枚举异常不阻塞切换，按无运行会话处理 */ }
    return list
  }

  // 守卫：有"其他会话"（非本次切换调用者所在会话）正在执行时返回阻止结果
  // （ok:false + guard:true），否则 null。调用者自身会话的 agent 允许切换
  // （同会话内切换属于功能操作，不构成跨会话污染）。
  // opts.guard === false 可显式关闭（运维强制切换场景），UI 与模型工具默认守卫。
  function guardRunning(opts) {
    if (opts && opts.guard === false) return null
    const excludeSession = opts && opts.sessionId ? String(opts.sessionId) : null
    const excludeAgent = opts && opts.agentId ? String(opts.agentId) : null
    const running = collectRunningSessions()
    const others = running.filter((r) => r.agentId !== excludeAgent && r.sessionId !== excludeSession)
    if (others.length === 0) return null
    const shown = others.slice(0, 3).map((r) => r.sessionId).join('、')
    const suffix = others.length > 3 ? ' 等 ' + others.length + ' 个' : ''
    return {
      ok: false,
      guard: true,
      error: '检测到 ' + others.length + ' 个其他会话正在执行任务（' + shown + suffix + '）。为防止 API Key 串用（使用量交叉污染），已停止本次切换；请先停止运行中的会话后再重试。',
      running: others,
    }
  }

  // ── 目录选择：调用宿主 directoryPicker 能力 ──
  // 与「设置-工作区」的添加工作区同源：darwin/win32 且 loopback 绑定时为
  // native（macOS 弹出 Finder 选择框），远程/SSH/无显示会话时为 browse
  // （浏览器内逐级浏览，需要另一套界面）。capability 契约要求：未知或
  // browse 能力时隐藏选择入口而不是失败，因此 pickerKind() 先下发给界面。
  function pickerKind() {
    try {
      const picker = ctx.get('directoryPicker')
      const capability = picker && typeof picker.capability === 'function' ? picker.capability() : null
      if (capability && typeof capability.kind === 'string' && capability.kind !== '') return capability.kind
    } catch (e) { /* 服务缺失或能力解析异常按不可用处理 */ }
    return 'unavailable'
  }

  async function pickDirectory(res) {
    const kind = pickerKind()
    if (kind !== 'native') {
      return {
        ok: false,
        error: '当前部署未提供原生目录选择器（directoryPicker capability=' + kind + '），请手动填写绝对路径。',
      }
    }
    const picker = ctx.get('directoryPicker')
    const capability = picker.capability()
    const controller = new AbortController()
    const onClose = () => { controller.abort() }
    try { if (res && typeof res.on === 'function') res.on('close', onClose) } catch (e) { /* 无响应对象时由选择框自身生命周期结束 */ }
    try {
      const picked = await capability.pick(controller.signal)
      if (typeof picked !== 'string' || picked === '') return { ok: true, cancelled: true, path: '' }
      return { ok: true, cancelled: false, path: normalizeDir(picked) }
    } catch (e) {
      const message = e && e.message ? String(e.message) : String(e)
      if (controller.signal.aborted || /abort/i.test(message)) return { ok: true, cancelled: true, path: '' }
      return { ok: false, error: '目录选择失败：' + message }
    } finally {
      try { if (res && typeof res.off === 'function') res.off('close', onClose) } catch (e) { /* 同上 */ }
    }
  }

  async function collectStatus() {
    await migrateLegacy()
    const active = await credentials.resolve(ACTIVE_REF)
    const list = await catalog()
    const providers = await liveCatalog()
    const fallback = liveDefaultRoute()
    let activeProfile = 'unknown'
    if (active !== undefined) {
      activeProfile = 'personal'
      for (const p of list) {
        if (p.id === 'personal') continue
        const info = await credentials.describe(p.ref)
        if (!info.configured) continue
        const v = await credentials.resolve(p.ref)
        if (v !== undefined && v.value === active.value) {
          activeProfile = p.id
          break
        }
      }
    }
    const profiles = []
    let route = null
    for (const p of list) {
      const info = await credentials.describe(p.ref)
      const eff = effectiveRoute(p, providers, fallback)
      if (p.id === activeProfile) route = eff.provider + '/' + eff.model
      profiles.push({
        id: p.id,
        remark: p.remark,
        provider: eff.provider,
        model: eff.model,
        modelStale: eff.stale,
        modelStored: p.model,
        dirs: p.dirs,
        ref: p.ref,
        user: p.user,
        configured: info.configured,
        source: info.source ?? null,
        active: p.id === activeProfile,
      })
    }
    return {
      activeProfile,
      maskedKey: maskKey(active?.value),
      route,
      profiles,
      running: collectRunningSessions(),
      defaultRoute: fallback,
      catalog: providers,
      directoryPicker: pickerKind(),
    }
  }

  async function switchProfile(id, opts) {
    const profiles = await catalog()
    const profile = profiles.find((p) => p.id === id)
    if (!profile) return { ok: false, error: '未知项目 id: ' + id }
    await migrateLegacy()
    const blocked = guardRunning(opts)
    if (blocked) return blocked

    if (profile.id === 'personal') {
      const backup = await credentials.resolve(BACKUP_REF)
      if (backup !== undefined) {
        await credentials.set(ACTIVE_REF, backup.value)
      } else {
        const active = await credentials.resolve(ACTIVE_REF)
        if (active === undefined) {
          return { ok: false, error: '项目 default 尚未配置 API Key，请在设置页「API Key 管理」中填写。' }
        }
      }
      const synced = await syncRoute(profile)
      const status = await collectStatus()
      return { ok: true, switchedTo: 'personal', routeSynced: synced, routeFixed: await routeStale(profile), ...status }
    }

    if (await currentIsDefault()) {
      const active = await credentials.resolve(ACTIVE_REF)
      if (active !== undefined) await credentials.set(BACKUP_REF, active.value)
    }
    const resolved = await credentials.resolve(profile.ref)
    if (resolved === undefined) {
      return {
        ok: false,
        error: '项目「' + (profile.remark || profile.id) + '」尚未配置 API Key（凭据引用 ' + profile.ref + ' 为空）。' +
          '请在设置页「API Key 管理」中填写 Key，或直接编辑 ~/.dsh/.credentials.yaml。',
      }
    }
    await credentials.set(ACTIVE_REF, resolved.value)
    const synced = await syncRoute(profile)
    const status = await collectStatus()
    return {
      ok: true,
      switchedTo: id,
      maskedKey: maskKey(resolved.value),
      routeSynced: synced,
      routeFixed: await routeStale(profile),
      ...status,
    }
  }

  // ── 目录自动切换 ──
  // 切换 workspace（会话激活）时按会话目录匹配项目绑定：命中且未生效则自动
  // 切换；命中但被守卫阻止时保留 matched 结果，由界面提示，下次激活重试。
  async function autoSwitchByDir(args) {
    const sessionId = args && args.sessionId ? String(args.sessionId) : ''
    const dir = await resolveSessionDir(sessionId)
    if (dir === '') return { ok: true, matched: false, dir: '', ...(await collectStatus()) }
    const target = await matchDirProfile(dir)
    if (target === null) return { ok: true, matched: false, dir: dir, ...(await collectStatus()) }

    const status = await collectStatus()
    const current = status.profiles.find((p) => p.id === target.id)
    if (status.activeProfile === target.id) {
      return { ok: true, matched: true, auto: true, switched: false, dir: dir, dirProfile: target.id, ...status }
    }
    if (current && current.configured !== true) {
      return {
        ok: false,
        matched: true,
        auto: true,
        dir: dir,
        dirProfile: target.id,
        error: '目录 ' + dir + ' 已绑定项目「' + (target.remark || target.id) + '」，但该项目尚未配置 API Key。',
        ...status,
      }
    }
    const result = await switchProfile(target.id, { guard: true, sessionId: sessionId })
    return Object.assign({ matched: true, auto: true, dir: dir, dirProfile: target.id }, result)
  }

  async function setProfile(id, key) {
    const profiles = await catalog()
    const profile = profiles.find((p) => p.id === id)
    if (!profile) return { ok: false, error: '未知项目 id: ' + id }
    if (typeof key !== 'string' || key.trim().length < 8) {
      return { ok: false, error: 'key 无效：应为非空字符串（通常以 sk- 开头）' }
    }
    await migrateLegacy()
    if (profile.id === 'personal') {
      await credentials.set(ACTIVE_REF, key.trim())
      await credentials.set(BACKUP_REF, key.trim())
    } else {
      await credentials.set(profile.ref, key.trim())
    }
    const status = await collectStatus()
    return { ok: true, message: '已保存项目「' + (profile.remark || profile.id) + '」的 API Key。如需立即生效，请调用 api_key_switch（profile=' + profile.id + '）。', ...status }
  }

  // 目录列表入参归一 + 唯一性校验（一个目录只能绑定一个项目）
  async function resolveDirsArg(args, ownerId, ownerLabel) {
    if (!Array.isArray(args.dirs)) return { ok: true, dirs: null }
    const next = []
    for (const item of args.dirs) {
      const d = normalizeDir(item)
      if (d !== '' && next.indexOf(d) === -1) next.push(d)
    }
    const conflict = await findDirConflict(next, ownerId)
    if (conflict !== null) {
      const other = conflict.profile.remark || conflict.profile.id
      return {
        ok: false,
        error: '目录已被项目「' + other + '」绑定：' + conflict.dir + '（一个目录只能绑定一个项目）。请先从该项目移除，再绑定到「' + ownerLabel + '」。',
      }
    }
    return { ok: true, dirs: next }
  }

  async function saveProfile(args) {
    const id = args && args.id
    const profiles = await catalog()
    const cur = profiles.find((p) => p.id === id)
    if (!cur) return { ok: false, error: '未知项目 id: ' + id }
    const meta = await readMeta()

    let finalId = id
    const renameTo = args && args.renameTo
    if (renameTo && renameTo !== id) {
      if (cur.user !== true) return { ok: false, error: '内置项目不允许修改名称' }
      if (!ID_RE.test(renameTo)) return { ok: false, error: '名称仅允许小写字母与数字（1-20 位）' }
      if (BASE_IDS.includes(renameTo)) return { ok: false, error: '名称冲突：' + renameTo + ' 是内置项目' }
      if (meta[renameTo]) return { ok: false, error: '名称已存在：' + renameTo }
      const newRef = refFor(renameTo)
      if (newRef !== cur.ref) {
        const v = await credentials.resolve(cur.ref)
        if (v !== undefined) {
          await credentials.set(newRef, v.value)
          await credentials.unset(cur.ref)
        }
      }
      const entry = meta[id] || {}
      delete meta[id]
      meta[renameTo] = entry
      finalId = renameTo
    }

    const dirsResult = await resolveDirsArg(args || {}, finalId, (args && args.remark) || finalId)
    if (dirsResult.ok !== true) return dirsResult

    const entry = meta[finalId] || (cur.user ? {} : {})
    if (typeof args.remark === 'string') {
      const r = args.remark.trim()
      if (r === '') delete entry.remark
      else entry.remark = r
    }
    if (typeof args.provider === 'string') {
      const p = args.provider.trim()
      if (p === '') delete entry.provider
      else entry.provider = p
    }
    if (typeof args.model === 'string') {
      const m = args.model.trim()
      if (m === '') delete entry.model
      else entry.model = m
    }
    if (dirsResult.dirs !== null) {
      if (dirsResult.dirs.length === 0) delete entry.dirs
      else entry.dirs = dirsResult.dirs
    }
    if (cur.user) entry.user = true
    await writeMeta(meta)
    const ref = cur.user ? refFor(finalId) : cur.ref
    if (typeof args.key === 'string' && args.key.trim() !== '') {
      const value = args.key.trim()
      if (finalId === 'personal') {
        await credentials.set(ACTIVE_REF, value)
        await credentials.set(BACKUP_REF, value)
      } else {
        await credentials.set(ref, value)
      }
    }
    const status = await collectStatus()
    return { ok: true, message: '已保存项目 ' + finalId, ...status }
  }

  async function addProfile(args) {
    const id = args && args.id
    if (!ID_RE.test(id || '')) return { ok: false, error: '名称仅允许小写字母与数字（1-20 位）' }
    if (BASE_IDS.includes(id)) return { ok: false, error: '名称冲突：' + id + ' 是内置项目' }
    const meta = await readMeta()
    if (meta[id] && meta[id].deleted !== true) return { ok: false, error: '名称已存在：' + id }
    const profiles = await catalog()
    const ref = refFor(id)
    if (profiles.some((p) => p.ref === ref)) return { ok: false, error: '凭据引用冲突：' + ref }
    const key = args && args.key
    if (typeof key !== 'string' || key.trim().length < 8) {
      return { ok: false, error: 'key 无效：应为非空字符串（通常以 sk- 开头）' }
    }
    const dirsResult = await resolveDirsArg(args || {}, id, (args && args.remark) || id)
    if (dirsResult.ok !== true) return dirsResult
    const entry = { user: true }
    if (typeof args.remark === 'string' && args.remark.trim() !== '') entry.remark = args.remark.trim()
    if (typeof args.provider === 'string' && args.provider.trim() !== '') entry.provider = args.provider.trim()
    if (typeof args.model === 'string' && args.model.trim() !== '') entry.model = args.model.trim()
    if (dirsResult.dirs !== null && dirsResult.dirs.length > 0) entry.dirs = dirsResult.dirs
    meta[id] = entry
    await writeMeta(meta)
    await credentials.set(ref, key.trim())
    const status = await collectStatus()
    return { ok: true, message: '已新增项目 ' + id, ...status }
  }

  async function removeProfile(args) {
    const id = args && args.id
    if (id === 'personal') return { ok: false, error: '项目 default（个人）不允许删除' }
    const meta = await readMeta()
    const profiles = await catalog()
    const cur = profiles.find((p) => p.id === id)
    if (!cur) return { ok: false, error: '项目不存在：' + id }

    let wasActive = false
    const active = await credentials.resolve(ACTIVE_REF)
    const info = await credentials.describe(cur.ref)
    if (info.configured) {
      const v = await credentials.resolve(cur.ref)
      wasActive = active !== undefined && v !== undefined && v.value === active.value
      await credentials.unset(cur.ref)
    }
    if (cur.user) {
      delete meta[id]
    } else {
      const entry = meta[id] || {}
      entry.deleted = true
      meta[id] = entry
    }
    await writeMeta(meta)
    if (wasActive) {
      const backup = await credentials.resolve(BACKUP_REF)
      if (backup !== undefined) await credentials.set(ACTIVE_REF, backup.value)
      const personal = BASE.find((b) => b.id === 'personal')
      if (personal) await syncRoute(personal)
    }
    const status = await collectStatus()
    return { ok: true, message: '已删除项目 ' + id, ...status }
  }

  // ── HTTP API（Client 页面通过同源 fetch 调用）──
  async function apiHandler(req, res) {
    try {
      const body = await readBody(req)
      const action = body && body.action
      const args = (body && body.args) || {}
      let result
      switch (action) {
        case 'status':
          result = { ok: true, ...(await collectStatus()) }
          break
        case 'list':
          result = { ok: true, ...(await collectStatus()) }
          break
        case 'models':
        case 'catalog': {
          const providers = await liveCatalog()
          result = { ok: true, providers: providers, catalog: providers, defaultRoute: liveDefaultRoute() }
          break
        }
        case 'auto':
          result = await autoSwitchByDir(args)
          break
        case 'pickDir':
          result = await pickDirectory(res)
          break
        case 'switch':
          result = await switchProfile(args.profile, args)
          break
        case 'set':
          result = await setProfile(args.profile, args.key)
          break
        case 'save':
          result = await saveProfile(args)
          break
        case 'add':
          result = await addProfile(args)
          break
        case 'remove':
          result = await removeProfile(args)
          break
        default:
          result = { ok: false, error: '未知 action: ' + action }
      }
      if (result.ok !== true) {
        const status = await collectStatus()
        // 保留 result 的 error / guard / running / matched / dir 等自有字段，仅补充全局状态。
        result = Object.assign({}, result, status)
      }
      writeJson(res, 200, result)
    } catch (e) {
      writeJson(res, 500, { ok: false, error: String(e && e.message ? e.message : e) })
    }
  }

  // ── 模型工具注册 ──
  const tools = ctx.get('tools')
  if (tools !== undefined) {
    const profileParam = {
      type: 'string',
      required: true,
      // 项目目录是动态的（设置页可新增/删除自定义项目），不能用静态 enum 限定；
      // 未知 id 由执行期校验返回明确错误。
      description: '项目 id：' + BASE.map((p) => p.id + '(' + p.remark + ')').join('、') + '；设置页新增的自定义项目也可切换（先用 api_key_status 查看完整项目清单）',
    }
    const renderJson = (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }]
    tools.register(defineTool({
      name: 'api_key_status',
      description: '查看当前生效的 API Key 属于哪个项目（只显示掩码，不暴露密钥），以及每个项目是否已配置 Key、绑定了哪些工作目录。',
      parameters: {},
      output: { schema: { type: 'json' }, render: renderJson },
      execute: async () => {
        const status = await collectStatus()
        return { ok: true, ...status }
      },
    }))
    tools.register(defineTool({
      name: 'api_key_switch',
      description: '切换当前生效的 API Key 到指定项目。同时把该项目的模型供应商与默认模型同步为默认路由，下一次模型请求立即生效，无需重启。注意：若有其他会话正在执行任务（agent 运行中），为防止 API Key 串用将拒绝切换。',
      parameters: { profile: profileParam },
      output: { schema: { type: 'json' }, render: renderJson },
      execute: async (args, exec) => {
        const agent = exec && exec.agent ? exec.agent : null
        return switchProfile(args.profile, {
          guard: true,
          sessionId: agent && agent.session ? String(agent.session.id) : null,
          agentId: agent ? String(agent.id) : null,
        })
      },
    }))
    tools.register(defineTool({
      name: 'api_key_set',
      description: '配置或更新某个项目的 API Key（仅保存到该项目独立的凭据引用，不立即切换；需要生效时再调用 api_key_switch）。',
      parameters: {
        profile: profileParam,
        key: { type: 'string', required: true, description: '该项目的 DeepSeek API Key，通常以 sk- 开头' },
      },
      output: { schema: { type: 'json' }, render: renderJson },
      execute: async (args) => setProfile(args.profile, args.key),
    }))
  }

  // ── Web 路由注册 ──
  const webServer = ctx.get('webServer')
  if (webServer !== undefined) {
    ctx.effect(() => webServer.register({ kind: 'exact', path: '/apikeyswitch/api', handler: apiHandler }))
  }
}
