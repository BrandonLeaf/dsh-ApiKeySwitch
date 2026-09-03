// ApiKeySwitch - Host 半区源码（动态 Cordis 插件）
//
// 本文件是 cordis_define 的 code.host 函数体原文，Plain JavaScript，
// 不使用 import / require / TypeScript / JSX。
//
// 职责：
// - 通过 credentials 服务（凭据接缝）管理各项目 API Key 与元数据
// - 注册模型工具：api_key_status / api_key_switch / api_key_set
// - 注册 Client RPC：status / list / models / switch / set / save / add / remove
// - 切换项目时同步默认模型路由（agentDefaultModel.saveSelection）
return {
  apply(ctx) {
    const credentials = ctx.get('credentials')
    if (credentials === undefined) return

    const ACTIVE_REF = 'DEEPSEEK_API_KEY'
    const BACKUP_REF = 'DSH_APIK_BACKUP'
    const META_REF = 'DSH_APIK_META'
    const ID_RE = /^[a-z0-9]{1,20}$/
    const DEFAULT_PROVIDER = 'deepseek-official'
    const DEFAULT_MODEL = 'deepseek-v4-flash'

    const BASE = [
      { id: 'personal',       remark: '默认',           provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL, ref: 'DEEPSEEK_API_KEY' },
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

    async function catalog() {
      const meta = await readMeta()
      const profiles = BASE.map((b) => {
        const m = meta[b.id] || {}
        if (m.deleted === true) return null
        return { id: b.id, remark: m.remark || b.remark, provider: m.provider || b.provider, model: m.model || b.model, ref: b.ref, user: false }
      }).filter((p) => p !== null)
      for (const id of Object.keys(meta)) {
        if (BASE_IDS.includes(id)) continue
        const m = meta[id]
        if (!m || m.user !== true || m.deleted === true) continue
        profiles.push({ id: id, remark: m.remark || id, provider: m.provider || DEFAULT_PROVIDER, model: m.model || DEFAULT_MODEL, ref: refFor(id), user: true })
      }
      return profiles
    }

    async function syncRoute(profile) {
      const amd = ctx.get('agentDefaultModel')
      if (amd === undefined) return false
      try {
        const current = amd.currentSelection()
        const next = {
          provider: profile.provider || DEFAULT_PROVIDER,
          model: profile.model || DEFAULT_MODEL,
          ...(current && current.reasoningEffort ? { reasoningEffort: current.reasoningEffort } : {}),
        }
        if (current && current.provider === next.provider && current.model === next.model) return true
        await amd.saveSelection(next)
        return true
      } catch (e) {
        return false
      }
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

    async function collectStatus() {
      await migrateLegacy()
      const active = await credentials.resolve(ACTIVE_REF)
      const list = await catalog()
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
        if (p.id === activeProfile) route = p.provider + '/' + p.model
        profiles.push({
          id: p.id,
          remark: p.remark,
          provider: p.provider,
          model: p.model,
          ref: p.ref,
          user: p.user,
          configured: info.configured,
          source: info.source ?? null,
          active: p.id === activeProfile,
        })
      }
      return { activeProfile, maskedKey: maskKey(active?.value), route, profiles, running: collectRunningSessions() }
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
        return { ok: true, switchedTo: 'personal', routeSynced: synced, ...status }
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
      return { ok: true, switchedTo: id, maskedKey: maskKey(resolved.value), routeSynced: synced, ...status }
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
      const entry = { user: true }
      if (typeof args.remark === 'string' && args.remark.trim() !== '') entry.remark = args.remark.trim()
      if (typeof args.provider === 'string' && args.provider.trim() !== '') entry.provider = args.provider.trim()
      if (typeof args.model === 'string' && args.model.trim() !== '') entry.model = args.model.trim()
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

    function renderJson(_args, value) {
      return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
    }

    const profileParam = {
      type: 'string',
      required: true,
      // 项目目录是动态的（设置页可新增/删除自定义项目），不能用静态 enum 限定；
      // 未知 id 由执行期校验返回明确错误。
      description: '项目 id：' + BASE.map((p) => p.id + '(' + p.remark + ')').join('、') + '；设置页新增的自定义项目也可切换（先用 api_key_status 查看完整项目清单）',
    }

    const tools = [
      harness.defineTool({
        name: 'api_key_status',
        description: '查看当前生效的 API Key 属于哪个项目（只显示掩码，不暴露密钥），以及每个项目是否已配置 Key。',
        parameters: {},
        output: { schema: { type: 'json' }, render: renderJson },
        execute: async () => {
          const status = await collectStatus()
          return { ok: true, ...status }
        },
      }),
      harness.defineTool({
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
      }),
      harness.defineTool({
        name: 'api_key_set',
        description: '配置或更新某个项目的 API Key（仅保存到该项目独立的凭据引用，不立即切换；需要生效时再调用 api_key_switch）。',
        parameters: {
          profile: profileParam,
          key: { type: 'string', required: true, description: '该项目的 DeepSeek API Key，通常以 sk- 开头' },
        },
        output: { schema: { type: 'json' }, render: renderJson },
        execute: async (args) => setProfile(args.profile, args.key),
      }),
    ]

    for (const tool of tools) {
      ctx.effect(() => harness.registerTool(ctx, tool))
    }

    ctx.effect(() => harness.handle('status', async () => {
      const status = await collectStatus()
      return { ok: true, ...status }
    }))
    ctx.effect(() => harness.handle('list', async () => {
      const status = await collectStatus()
      return { ok: true, ...status }
    }))
    ctx.effect(() => harness.handle('models', async () => {
      return { ok: true, models: [{ id: 'deepseek-v4-flash', name: 'DeepSeek-V4-Flash' }, { id: 'deepseek-v4-pro', name: 'DeepSeek-V4-Pro' }], providers: ['deepseek-official'] }
    }))
    ctx.effect(() => harness.handle('switch', async (args) => {
      const result = await switchProfile(args && args.profile, args)
      if (result.ok) return result
      const status = await collectStatus()
      return Object.assign({}, result, status)
    }))
    ctx.effect(() => harness.handle('set', async (args) => {
      const result = await setProfile(args && args.profile, args && args.key)
      if (result.ok) return result
      const status = await collectStatus()
      return { ok: false, error: result.error, ...status }
    }))
    ctx.effect(() => harness.handle('save', async (args) => {
      const result = await saveProfile(args)
      if (result.ok) return result
      const status = await collectStatus()
      return { ok: false, error: result.error, ...status }
    }))
    ctx.effect(() => harness.handle('add', async (args) => {
      const result = await addProfile(args)
      if (result.ok) return result
      const status = await collectStatus()
      return { ok: false, error: result.error, ...status }
    }))
    ctx.effect(() => harness.handle('remove', async (args) => {
      const result = await removeProfile(args)
      if (result.ok) return result
      const status = await collectStatus()
      return { ok: false, error: result.error, ...status }
    }))
  },
}
