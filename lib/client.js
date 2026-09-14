// ApiKeySwitch - Client 半区（正式部署版）
//
// 模块加载器（__ModuleLoader__）格式的浏览器模块，导出 apply 作为 Cordis
// 客户端插件。与动态版（plugin/client.js）的差异：
// - 用同源 fetch 调用 Host 的 /apikeyswitch/api（替代 host.call）
// - CSS 通过 <style> 注入（替代 styles.insert）
// - 不注册 Run 卡片面板（tool.view.cordis 为动态插件专属插槽）
// 保留：设置页「API Key 管理」、作曲栏 Key 切换下拉框、目录自动切换
//
// DSH 0.1.5 适配要点：
// - 供应商与模型列表改为由 Host 的 /apikeyswitch/api 实时下发（catalog），
//   不再依赖 0.1.0 时代的 connection.api.llm.providers（该接口已不存在），
//   也不再有硬编码的供应商模型 id 列表
// - 会话激活时先按工作目录绑定自动切换（auto），未命中才回落到会话记忆
window.__ModuleLoader__.load({
  id: 'apikeyswitch',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')

    function rpc(action, args) {
      return fetch('/apikeyswitch/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action, args: args || {} }),
      }).then((res) => res.json())
    }

    var SET_CSS =
      '.apik-set-section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;display:flex}' +
      '.apik-set-title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}' +
      '.apik-set-intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}' +
      '.apik-set-toolbar{flex-wrap:wrap;align-items:center;gap:10px;display:flex;justify-content:space-between}' +
      '.apik-set-rows{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}' +
      '.apik-set-rowCard{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;flex-direction:column;gap:12px;padding:12px 14px;display:flex}' +
      '.apik-set-rowHead{align-items:center;gap:10px;display:flex}' +
      '.apik-set-rowIdentity{align-items:center;gap:6px;min-width:0;display:inline-flex}' +
      '.apik-set-rowName{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}' +
      '.apik-set-rowTag{border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);border-radius:4px;flex:none;padding:1px 6px;font-size:11px;line-height:16px}' +
      '.apik-set-dot{box-sizing:border-box;border-radius:50%;flex:none;width:8px;height:8px;display:inline-block}' +
      '.apik-set-dotOk{background:var(--dsw-alias-state-success-primary)}' +
      '.apik-set-dotMissing{background:var(--dsw-alias-state-error-primary)}' +
      '.apik-set-rowActions{align-items:center;gap:4px;margin-left:auto;display:inline-flex}' +
      '.apik-set-btnPrimary,.apik-set-btnSecondary{box-sizing:border-box;height:36px;font:inherit;cursor:pointer;border:none;border-radius:18px;justify-content:center;align-items:center;gap:4px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}' +
      '.apik-set-btnPrimary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}' +
      '.apik-set-btnPrimary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}' +
      '.apik-set-btnSecondary{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:transparent}' +
      '.apik-set-btnSecondary:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}' +
      '.apik-set-btnDanger{box-sizing:border-box;height:36px;color:var(--dsw-alias-state-error-primary);font:inherit;cursor:pointer;background:transparent;border:none;border-radius:18px;justify-content:center;align-items:center;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}' +
      '.apik-set-btnDanger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger)}' +
      '.apik-set-rowActions .apik-set-btnSecondary{border-radius:14px;height:28px;padding:0 10px;font-size:12px;line-height:18px}' +
      '.apik-set-btnPrimary:disabled,.apik-set-btnSecondary:disabled,.apik-set-btnDanger:disabled{opacity:.4;cursor:default}' +
      '.apik-set-btnPrimary:focus-visible,.apik-set-btnSecondary:focus-visible,.apik-set-btnDanger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3);outline:none}' +
      '.apik-set-editor{background:var(--dsw-alias-bg-module-platform);border-radius:12px;flex-direction:column;gap:14px;padding:14px 16px;display:flex}' +
      '.apik-set-editorHeader{align-items:baseline;gap:8px;display:flex}' +
      '.apik-set-editorTitle{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:22px}' +
      '.apik-set-editorRoute{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}' +
      '.apik-set-field{flex-direction:column;gap:6px;display:flex}' +
      '.apik-set-fieldLabel{color:var(--dsw-alias-label-secondary);align-items:center;gap:10px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex}' +
      '.apik-set-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}' +
      '.apik-set-input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;height:32px;font:inherit;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px;font-size:14px;line-height:22px}' +
      '.apik-set-input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}' +
      '.apik-set-input::placeholder{color:var(--dsw-alias-label-dimmed)}' +
      '.apik-set-input:disabled{opacity:.6;cursor:default}' +
      'select.apik-set-input{cursor:pointer}' +
      '.apik-set-dirs{flex-direction:column;gap:8px;display:flex}' +
      '.apik-set-dirRow{align-items:center;gap:8px;display:flex}' +
      '.apik-set-dirItem{align-items:center;gap:8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 10px;display:flex}' +
      '.apik-set-dirCopy{flex-direction:column;flex:1;min-width:0;display:flex}' +
      '.apik-set-dirName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:500;line-height:20px;overflow:hidden}' +
      '.apik-set-dirPath{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden}' +
      '.apik-set-dirItem .apik-set-btnSecondary{border-radius:14px;height:28px;padding:0 10px;font-size:12px;line-height:18px}' +
      '.apik-set-dirRow .apik-set-input{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}' +
      '.apik-set-dirAdd{align-self:flex-start;border-radius:14px;height:28px;padding:0 10px;font-size:12px;line-height:18px}' +
      '.apik-set-editorActions{justify-content:flex-end;gap:8px;display:flex}' +
      '.apik-set-addCard{background:var(--dsw-alias-bg-module-platform);border-radius:12px;flex-direction:column;gap:14px;padding:14px 16px;list-style:none;display:flex}' +
      '.apik-set-msg{color:var(--dsw-alias-state-success-primary);margin:0;font-size:12px;line-height:18px}' +
      '.apik-set-err{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px;line-height:18px}'

    var KS_CSS =
      '.apik-ks-root{position:relative;display:inline-flex;align-items:center}' +
      '.apik-ks-trigger{min-width:0;max-width:200px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:transparent;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}' +
      '.apik-ks-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}' +
      '.apik-ks-trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}' +
      '.apik-ks-trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}' +
      '.apik-ks-icon{color:var(--dsw-alias-label-caption);flex:none;display:flex}' +
      '.apik-ks-label{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}' +
      '.apik-ks-chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s;display:flex}' +
      '.apik-ks-chevronOpen{transform:rotate(180deg)}' +
      '.apik-ks-menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(220px,100vw - 32px);max-height:min(320px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow-y:auto}' +
      '.apik-ks-error{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}' +
      '.apik-ks-warn{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border-radius:8px;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}' +
      '.apik-ks-dir{color:var(--dsw-alias-label-tertiary);border-bottom:1px solid var(--dsw-alias-border-l2);margin-bottom:4px;padding:4px 8px 8px;font-size:11px;line-height:16px;word-break:break-all;display:block}' +
      '.apik-ks-option{width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:transparent;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}' +
      '.apik-ks-option:hover:not(:disabled),.apik-ks-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}' +
      '.apik-ks-option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}' +
      '.apik-ks-optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}' +
      '.apik-ks-optionLabel{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}' +
      '.apik-ks-optionDesc{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}' +
      '.apik-ks-check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}'

    var TOAST_CSS =
      '.apik-toastLayer{pointer-events:none;position:fixed;left:0;right:0;bottom:92px;z-index:60;display:flex;justify-content:center}' +
      '.apik-toast{pointer-events:auto;background:var(--dsw-specific-menu);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-inverted);box-shadow:var(--dsw-shadow-lv3);align-items:center;gap:8px;border-radius:999px;padding:8px 16px;font-size:13px;line-height:20px;display:flex;animation:apik-toast-in .18s ease-out}' +
      '.apik-toastOk{color:var(--dsw-alias-state-success-primary);flex:none;display:flex}' +
      '@keyframes apik-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}'

    var LABELS = {
      personal: 'default',
    }

    // ── 切换成功提示：帧级悬浮 Toast ──
    // 宿主提供 shell.overlay 帧级浮层插槽（列表型、可叠加、可点击穿透），
    // 本插件在此注册 Toast 容器；作曲栏下拉框手动切换成功后调用 notifySwitch
    // 弹出「API Key 切换成功」提示。会话激活时的静默恢复（restoreConv）不弹提示，
    // 目录自动切换命中时弹带目录前缀的提示。
    var toastListeners = []
    var toastSeq = 0
    var toastTimer = null

    function publishToast(text) {
      var listeners = toastListeners.slice()
      for (var i = 0; i < listeners.length; i++) {
        try { listeners[i](text) } catch (e) { /* 单个订阅者异常不影响其他订阅者 */ }
      }
    }
    function profileName(id, value) {
      var name = LABELS[id] || id
      var list = (value && value.profiles) || []
      for (var i = 0; i < list.length; i++) {
        if (list[i].id !== id) continue
        if (list[i].remark && list[i].remark !== name) name += '（' + list[i].remark + '）'
        break
      }
      return name
    }
    function notifySwitch(id, value, prefix) {
      publishToast((prefix || 'API Key 切换成功') + '：已切换至「' + profileName(id, value) + '」')
    }

    function ToastHost() {
      var state = React.useState(null)
      var toast = state[0]
      var setToast = state[1]
      React.useEffect(function () {
        var sub = function (text) {
          toastSeq += 1
          setToast({ text: text, seq: toastSeq })
        }
        toastListeners.push(sub)
        return function () {
          toastListeners = toastListeners.filter(function (s) { return s !== sub })
        }
      }, [])
      React.useEffect(function () {
        if (!toast) return
        if (toastTimer) clearTimeout(toastTimer)
        toastTimer = setTimeout(function () { setToast(null) }, 2600)
        return function () { if (toastTimer) clearTimeout(toastTimer) }
      }, [toast])
      var icon = React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        React.createElement('polyline', { points: '20 6 9 17 4 12' }))
      return React.createElement('div', { className: 'apik-toastLayer' },
        toast ? React.createElement('div', { className: 'apik-toast', key: toast.seq, role: 'status' },
          React.createElement('span', { className: 'apik-toastOk' }, icon),
          React.createElement('span', null, toast.text),
        ) : null,
      )
    }

    // ── 模型目录（由 Host 实时下发，与「设置-模型」页同源）──
    function catalogOf(value) {
      var list = value && value.catalog
      if (Array.isArray(list) && list.length > 0) return list
      var providers = value && value.providers
      return Array.isArray(providers) ? providers : []
    }
    function providerIds(catalog) {
      return (catalog || []).map(function (p) { return p.id })
    }
    function modelsOf(catalog, provider) {
      var p = (catalog || []).filter(function (x) { return x.id === provider })[0]
      return p && Array.isArray(p.models) ? p.models : []
    }
    function modelIdsOf(catalog, provider) {
      return modelsOf(catalog, provider).map(function (m) { return m.id })
    }
    // 默认选择：优先实时默认路由，其次该供应商首个模型，最后保留原值
    function pickModel(catalog, provider, current, defaultRoute) {
      var ids = modelIdsOf(catalog, provider)
      if (ids.length === 0) return current || ''
      if (current && ids.indexOf(current) !== -1) return current
      if (defaultRoute && defaultRoute.provider === provider && defaultRoute.model && ids.indexOf(defaultRoute.model) !== -1) return defaultRoute.model
      return ids[0]
    }
    function pickProvider(catalog, current, defaultRoute) {
      var ids = providerIds(catalog)
      if (ids.length === 0) return current || ''
      if (current && ids.indexOf(current) !== -1) return current
      if (defaultRoute && defaultRoute.provider && ids.indexOf(defaultRoute.provider) !== -1) return defaultRoute.provider
      return ids[0]
    }
    function modelOptions(catalog, provider, current, emptyLabel) {
      var list = modelsOf(catalog, provider)
      var opts = list.slice()
      if (current && list.every(function (m) { return m.id !== current })) opts = [{ id: current, name: '不在当前模型目录中' }].concat(opts)
      if (opts.length === 0) return [React.createElement('option', { key: '__none__', value: '' }, emptyLabel || '无可用模型')]
      return opts.map(function (m) {
        return React.createElement('option', { key: m.id, value: m.id }, m.name && m.name !== m.id ? m.id + '（' + m.name + '）' : m.id)
      })
    }
    function providerOptions(catalog, current, emptyLabel) {
      var ids = providerIds(catalog)
      var opts = ids.slice()
      if (current && opts.indexOf(current) === -1) opts = [current].concat(opts)
      if (opts.length === 0) return [React.createElement('option', { key: '__none__', value: '' }, emptyLabel || '无可用供应商')]
      return opts.map(function (x) { return React.createElement('option', { key: x, value: x }, x) })
    }

    function field(label, input) {
      return React.createElement('label', { className: 'apik-set-field' },
        React.createElement('span', { className: 'apik-set-fieldLabel' }, label),
        input,
      )
    }
    // 含交互元素的字段：用 div 承载（避免 button 落入 label 触发聚焦）
    function fieldBox(label, hint, content) {
      return React.createElement('div', { className: 'apik-set-field' },
        React.createElement('span', { className: 'apik-set-fieldLabel' }, label),
        hint ? React.createElement('span', { className: 'apik-set-hint' }, hint) : null,
        content,
      )
    }

    function SettingsPage() {
      var state = React.useState(null)
      var rows = state[0]
      var setRows = state[1]
      var _st0 = React.useState({})
      var drafts = _st0[0]
      var setDrafts = _st0[1]
      var _st1 = React.useState(null)
      var editingId = _st1[0]
      var setEditingId = _st1[1]
      var _st2 = React.useState(false)
      var addOpen = _st2[0]
      var setAddOpen = _st2[1]
      var _st3 = React.useState({ editId: '', key: '', remark: '', provider: '', model: '', dirs: [] })
      var addDraft = _st3[0]
      var setAddDraft = _st3[1]
      var _st5 = React.useState(false)
      var busy = _st5[0]
      var setBusy = _st5[1]
      var _st6 = React.useState('')
      var msg = _st6[0]
      var setMsg = _st6[1]
      var _st7 = React.useState('')
      var err = _st7[0]
      var setErr = _st7[1]
      var _st8 = React.useState('')
      var confirmId = _st8[0]
      var setConfirmId = _st8[1]
      var _st9 = React.useState('')
      var picking = _st9[0]
      var setPicking = _st9[1]

      var _catState = React.useState({ catalog: [], defaultRoute: null, picker: 'unavailable' })
      var cat = _catState[0]
      var setCat = _catState[1]

      function applyPayload(value) {
        var v = value || {}
        if (v.ok === false && v.error) setErr(String(v.error))
        else setErr('')
        setCat({ catalog: catalogOf(v), defaultRoute: v.defaultRoute || null, picker: v.directoryPicker || 'unavailable' })
        if (Array.isArray(v.profiles)) {
          setRows(v.profiles.map(function (p) {
            return {
              id: p.id,
              editId: LABELS[p.id] || p.id,
              key: '',
              remark: p.remark || '',
              provider: p.provider || '',
              model: p.model || '',
              modelStale: !!p.modelStale,
              modelStored: p.modelStored || '',
              dirs: Array.isArray(p.dirs) ? p.dirs.slice() : [],
              ref: p.ref,
              user: !!p.user,
              configured: !!p.configured,
              active: !!p.active,
            }
          }))
          setDrafts({})
          setEditingId(null)
          setConfirmId('')
        }
      }

      function load() {
        setErr('')
        rpc('list').then(applyPayload).catch(function (e) { setErr(String(e && e.message ? e.message : e)) })
      }

      React.useEffect(function () { load() }, [])

      function patchDraft(id, patch) {
        setDrafts(function (d) {
          return Object.assign({}, d, Object.assign({}, { [id]: Object.assign({}, d[id] || {}, patch) }))
        })
      }
      function patchAdd(patch) {
        setAddDraft(function (d) { return Object.assign({}, d, patch) })
      }
      function openEditor(r) {
        var provider = pickProvider(cat.catalog, r.provider, cat.defaultRoute)
        var model = pickModel(cat.catalog, provider, r.model, cat.defaultRoute)
        setDrafts(function (d) {
          return Object.assign({}, d, Object.assign({}, { [r.id]: { editId: r.editId, key: '', remark: r.remark, provider: provider, model: model, dirs: r.dirs.slice() } }))
        })
        setEditingId(editingId === r.id ? null : r.id)
        setConfirmId('')
      }
      function patchDir(id, index, value) {
        var d = drafts[id]
        if (!d) return
        var next = d.dirs.slice()
        next[index] = value
        patchDraft(id, { dirs: next })
      }
      function removeDir(id, index) {
        var d = drafts[id]
        if (!d) return
        var next = d.dirs.slice()
        next.splice(index, 1)
        patchDraft(id, { dirs: next })
      }
      function patchAddDir(index, value) {
        var next = addDraft.dirs.slice()
        next[index] = value
        patchAdd({ dirs: next })
      }
      function removeAddDir(index) {
        var next = addDraft.dirs.slice()
        next.splice(index, 1)
        patchAdd({ dirs: next })
      }

      function commit(id) {
        if (busy) return
        var d = drafts[id]
        var row = rows && rows.filter(function (r) { return r.id === id })[0]
        if (!d || !row) return
        setBusy(true)
        setErr('')
        setMsg('')
        var payload = { id: id }
        if (row.user && d.editId !== id) payload.renameTo = d.editId
        payload.remark = d.remark.trim()
        payload.provider = d.provider.trim()
        payload.model = d.model.trim()
        payload.dirs = (d.dirs || []).map(function (x) { return String(x).trim() }).filter(function (x) { return x !== '' })
        if (d.key.trim() !== '') payload.key = d.key.trim()
        rpc('save', payload).then(function (v) {
          var value = v || {}
          if (value.ok === false) setErr(String(value.error || '保存失败'))
          else setMsg(value.message || '已保存')
          load()
        }).catch(function (e) { setErr(String(e && e.message ? e.message : e)) }).then(function () { setBusy(false) })
      }

      function commitAdd() {
        if (busy) return
        setBusy(true)
        setErr('')
        setMsg('')
        var payload = {
          id: addDraft.editId,
          key: addDraft.key,
          remark: addDraft.remark,
          provider: addDraft.provider,
          model: addDraft.model,
          dirs: (addDraft.dirs || []).map(function (x) { return String(x).trim() }).filter(function (x) { return x !== '' }),
        }
        rpc('add', payload).then(function (v) {
          var value = v || {}
          if (value.ok === false) setErr(String(value.error || '新增失败'))
          else {
            setMsg(value.message || '已新增')
            setAddOpen(false)
            setAddDraft({ editId: '', key: '', remark: '', provider: '', model: '', dirs: [] })
          }
          load()
        }).catch(function (e) { setErr(String(e && e.message ? e.message : e)) }).then(function () { setBusy(false) })
      }

      function removeRow(r) {
        if (busy) return
        if (confirmId !== r.id) { setConfirmId(r.id); return }
        setBusy(true)
        setErr('')
        rpc('remove', { id: r.id }).then(function (v) {
          var value = v || {}
          if (value.ok === false) setErr(String(value.error || '删除失败'))
          else setMsg(value.message || '已删除')
          load()
        }).catch(function (e) { setErr(String(e && e.message ? e.message : e)) }).then(function () { setBusy(false); setConfirmId('') })
      }

      // 目录选择：「+ 添加目录」直接调用宿主 directoryPicker（macOS 为 Finder
      // 选择框）并生成一条记录（目录名 + 小字完整路径）；「重选」替换该行路径。
      // 仅在宿主 capability 为 native 时走选择器流程（browse/不可用时按宿主
      // 契约退回手动填写输入框）。
      function dirBaseName(path) {
        var parts = String(path || '').split(/[/\\]/).filter(function (x) { return x !== '' })
        return parts.length > 0 ? parts[parts.length - 1] : String(path || '')
      }

      function sameDirValue(a, b) {
        var na = String(a || '').replace(/[/\\]+$/, '')
        var nb = String(b || '').replace(/[/\\]+$/, '')
        return na !== '' && na === nb
      }

      function pickDirPath() {
        return rpc('pickDir').then(function (v) {
          var value = v || {}
          if (value.ok === false) { setErr(String(value.error || '目录选择失败')); return null }
          if (value.cancelled === true || !value.path) return null
          return String(value.path)
        }).catch(function (e) { setErr(String(e && e.message ? e.message : e)); return null })
      }

      function dirsEditor(dirs, onPatch, onRemove, onAdd, onPick, pickKey) {
        var canPick = cat.picker === 'native'
        var list = dirs || []
        if (!canPick) {
          return React.createElement('div', { className: 'apik-set-dirs' },
            list.map(function (dir, i) {
              return React.createElement('div', { className: 'apik-set-dirRow', key: 'dir' + i },
                React.createElement('input', {
                  className: 'apik-set-input',
                  value: dir,
                  placeholder: '/绝对路径/到/workspace',
                  onChange: function (e) { onPatch(i, e.target.value) },
                }),
                React.createElement('button', { type: 'button', className: 'apik-set-btnSecondary', disabled: busy || picking !== '', onClick: function () { onRemove(i) } }, '移除'),
              )
            }),
            React.createElement('button', { type: 'button', className: 'apik-set-btnSecondary apik-set-dirAdd', disabled: busy || picking !== '', onClick: onAdd }, '+ 添加目录'),
          )
        }
        return React.createElement('div', { className: 'apik-set-dirs' },
          list.map(function (dir, i) {
            var key = pickKey + ':' + i
            return React.createElement('div', { className: 'apik-set-dirItem', key: 'dir' + i },
              React.createElement('span', { className: 'apik-set-dirCopy', title: dir },
                React.createElement('span', { className: 'apik-set-dirName' }, dirBaseName(dir)),
                React.createElement('span', { className: 'apik-set-dirPath' }, dir),
              ),
              React.createElement('button', {
                type: 'button',
                className: 'apik-set-btnSecondary',
                disabled: busy || picking !== '',
                title: '重新打开系统目录选择框',
                onClick: function () { onPick(i) },
              }, picking === key ? '选择中…' : '重选'),
              React.createElement('button', { type: 'button', className: 'apik-set-btnSecondary', disabled: busy || picking !== '', onClick: function () { onRemove(i) } }, '移除'),
            )
          }),
          React.createElement('button', {
            type: 'button',
            className: 'apik-set-btnSecondary apik-set-dirAdd',
            disabled: busy || picking !== '',
            title: cat.picker === 'native' ? '打开系统目录选择框' : '',
            onClick: onAdd,
          }, picking === pickKey + ':new' ? '选择中…' : '+ 添加目录'),
        )
      }

      function chooseDir(id, index) {
        if (busy || picking !== '') return
        setPicking(id + ':' + index)
        setErr('')
        setMsg('')
        pickDirPath().then(function (path) {
          if (path) patchDir(id, index, path)
        }).then(function () { setPicking('') })
      }

      function addDirEntry(id) {
        if (cat.picker !== 'native') {
          var d0 = drafts[id]
          if (d0) patchDraft(id, { dirs: d0.dirs.concat(['']) })
          return
        }
        if (busy || picking !== '') return
        setPicking(id + ':new')
        setErr('')
        setMsg('')
        pickDirPath().then(function (path) {
          if (!path) return
          var d = drafts[id]
          if (!d) return
          var list = d.dirs || []
          for (var i = 0; i < list.length; i++) {
            if (sameDirValue(list[i], path)) { setMsg('该目录已在列表中：' + path); return }
          }
          patchDraft(id, { dirs: list.concat([path]) })
        }).then(function () { setPicking('') })
      }

      function chooseAddDir(index) {
        if (busy || picking !== '') return
        setPicking('__add__:' + index)
        setErr('')
        setMsg('')
        pickDirPath().then(function (path) {
          if (path) patchAddDir(index, path)
        }).then(function () { setPicking('') })
      }

      function addAddDirEntry() {
        if (cat.picker !== 'native') {
          patchAdd({ dirs: addDraft.dirs.concat(['']) })
          return
        }
        if (busy || picking !== '') return
        setPicking('__add__:new')
        setErr('')
        setMsg('')
        pickDirPath().then(function (path) {
          if (!path) return
          var list = addDraft.dirs || []
          for (var i = 0; i < list.length; i++) {
            if (sameDirValue(list[i], path)) { setMsg('该目录已在列表中：' + path); return }
          }
          patchAdd({ dirs: list.concat([path]) })
        }).then(function () { setPicking('') })
      }

      function renderRow(r) {
        var d = drafts[r.id]
        var open = editingId === r.id
        return React.createElement('li', { key: r.id, className: 'apik-set-rowCard' },
          React.createElement('div', { className: 'apik-set-rowHead' },
            React.createElement('span', { className: 'apik-set-rowIdentity' },
              React.createElement('span', { className: 'apik-set-rowName' }, LABELS[r.id] || r.id),
              r.remark ? React.createElement('span', { className: 'apik-set-rowTag' }, r.remark) : null,
              r.provider && r.provider !== 'deepseek-official' ? React.createElement('span', { className: 'apik-set-rowTag' }, r.provider) : null,
              r.dirs && r.dirs.length > 0 ? React.createElement('span', { className: 'apik-set-rowTag', title: r.dirs.join('\n') }, '目录 ' + r.dirs.length) : null,
              r.modelStale ? React.createElement('span', { className: 'apik-set-rowTag', title: '原模型 ' + (r.modelStored || '') + ' 已不在当前模型目录中，运行时按 ' + r.model + ' 生效' }, '模型已更新') : null,
              React.createElement('span', { className: 'apik-set-dot ' + (r.configured ? 'apik-set-dotOk' : 'apik-set-dotMissing'), title: r.configured ? '已配置 Key' : '未配置 Key' }),
            ),
            React.createElement('span', { className: 'apik-set-rowActions' },
              React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: function () { openEditor(r) } }, open ? '收起' : '编辑'),
            ),
          ),
          open && d ? React.createElement('div', { className: 'apik-set-editor' },
            React.createElement('div', { className: 'apik-set-editorHeader' },
              React.createElement('span', { className: 'apik-set-editorTitle' }, '编辑项目'),
              React.createElement('span', { className: 'apik-set-editorRoute' }, r.ref),
            ),
            field('名称 name', React.createElement('input', { className: 'apik-set-input', value: d.editId, disabled: !r.user, placeholder: '小写字母与数字（1-20 位）', onChange: function (e) { patchDraft(r.id, { editId: e.target.value }) } })),
            field(r.configured ? 'API Key（已配置，留空不修改）' : 'API Key（未配置）', React.createElement('input', { className: 'apik-set-input', type: 'password', value: d.key, placeholder: 'sk- 开头', onChange: function (e) { patchDraft(r.id, { key: e.target.value }) } })),
            field('备注 remark', React.createElement('input', { className: 'apik-set-input', value: d.remark, placeholder: '如：内部系统', onChange: function (e) { patchDraft(r.id, { remark: e.target.value }) } })),
            field('模型供应商 provider', React.createElement('select', {
              className: 'apik-set-input',
              value: d.provider,
              onChange: function (e) {
                var prov = e.target.value
                patchDraft(r.id, { provider: prov, model: pickModel(cat.catalog, prov, '', cat.defaultRoute) })
              },
            }, providerOptions(cat.catalog, d.provider, '无可用供应商'))),
            field('默认模型 model', React.createElement('select', {
              className: 'apik-set-input',
              value: d.model,
              onChange: function (e) { patchDraft(r.id, { model: e.target.value }) },
            }, modelOptions(cat.catalog, d.provider, d.model, '无可用模型'))),
            r.modelStale ? React.createElement('p', { className: 'apik-set-hint' }, '原模型 ' + (r.modelStored || '（空）') + ' 已不在当前模型目录中，切换该项目时按 ' + r.model + ' 同步默认路由；保存后写回配置。') : null,
            fieldBox('工作目录 dirs（可选，支持多个）', (cat.picker === 'native' ? '点击「+ 添加目录」打开系统目录选择框；切换 workspace 到这些目录时自动切换到本项目；一个目录只能绑定一个项目。' : '切换 workspace 到这些目录时自动切换到本项目；一个目录只能绑定一个项目。'), dirsEditor(d.dirs, function (i, v) { patchDir(r.id, i, v) }, function (i) { removeDir(r.id, i) }, function () { addDirEntry(r.id) }, function (i) { chooseDir(r.id, i) }, r.id)),
            React.createElement('div', { className: 'apik-set-editorActions' },
              r.id !== 'personal' ? React.createElement('button', { className: 'apik-set-btnDanger', disabled: busy, onClick: function () { removeRow(r) } }, confirmId === r.id ? '确认删除' : '删除') : null,
              React.createElement('div', { style: { flex: 1 } }),
              React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: function () { setEditingId(null) } }, '取消'),
              React.createElement('button', { className: 'apik-set-btnPrimary', disabled: busy, onClick: function () { commit(r.id) } }, '保存'),
            ),
          ) : null,
        )
      }

      var renderAdd = addOpen ? React.createElement('li', { className: 'apik-set-addCard' },
        React.createElement('div', { className: 'apik-set-editorHeader' },
          React.createElement('span', { className: 'apik-set-editorTitle' }, '新增项目'),
        ),
        field('名称 name', React.createElement('input', { className: 'apik-set-input', value: addDraft.editId, placeholder: '小写字母与数字（1-20 位）', onChange: function (e) { patchAdd({ editId: e.target.value }) } })),
        field('API Key', React.createElement('input', { className: 'apik-set-input', type: 'password', value: addDraft.key, placeholder: 'sk- 开头', onChange: function (e) { patchAdd({ key: e.target.value }) } })),
        field('备注 remark', React.createElement('input', { className: 'apik-set-input', value: addDraft.remark, placeholder: '如：内部系统', onChange: function (e) { patchAdd({ remark: e.target.value }) } })),
        field('模型供应商 provider', React.createElement('select', {
          className: 'apik-set-input',
          value: addDraft.provider,
          onChange: function (e) {
            var prov = e.target.value
            patchAdd({ provider: prov, model: pickModel(cat.catalog, prov, '', cat.defaultRoute) })
          },
        }, providerOptions(cat.catalog, addDraft.provider, '无可用供应商'))),
        field('默认模型 model', React.createElement('select', {
          className: 'apik-set-input',
          value: addDraft.model,
          onChange: function (e) { patchAdd({ model: e.target.value }) },
        }, modelOptions(cat.catalog, addDraft.provider, addDraft.model, '无可用模型'))),
        fieldBox('工作目录 dirs（可选，支持多个）', (cat.picker === 'native' ? '点击「+ 添加目录」打开系统目录选择框；切换 workspace 到这些目录时自动切换到本项目；一个目录只能绑定一个项目。' : '切换 workspace 到这些目录时自动切换到本项目；一个目录只能绑定一个项目。'), dirsEditor(addDraft.dirs, patchAddDir, removeAddDir, addAddDirEntry, chooseAddDir, '__add__')),
        React.createElement('div', { className: 'apik-set-editorActions' },
          React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: function () { setAddOpen(false) } }, '取消'),
          React.createElement('button', { className: 'apik-set-btnPrimary', disabled: busy, onClick: commitAdd }, '新增'),
        ),
      ) : null

      return React.createElement('div', { className: 'apik-set-section' },
        React.createElement('h2', { className: 'apik-set-title' }, 'API Key 管理'),
        React.createElement('p', { className: 'apik-set-intro' }, '维护各项目的名称、密钥、备注、模型供应商、默认模型与工作目录；切换项目时同步切换 Key、供应商与默认模型，切换到已绑定目录的 workspace 时自动切换。'),
        React.createElement('div', { className: 'apik-set-toolbar' },
          rows ? React.createElement('span', { className: 'apik-set-intro' }, '共 ' + rows.length + ' 个项目') : React.createElement('span', { className: 'apik-set-intro' }, ''),
          React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: function () { setAddOpen(!addOpen) } }, addOpen ? '收起新增' : '+ 新增项目'),
        ),
        msg ? React.createElement('p', { className: 'apik-set-msg' }, msg) : null,
        err ? React.createElement('p', { className: 'apik-set-err' }, err) : null,
        rows === null
          ? React.createElement('p', { className: 'apik-set-intro' }, '加载中…')
          : React.createElement('ul', { className: 'apik-set-rows' },
              renderAdd,
              rows.map(renderRow),
            ),

      )
    }

    // ── 每会话记忆：切换会话时自动恢复该会话上次选择的项目 ──
    // sessionId 来自会话级插槽标准 props；记忆存 localStorage（按会话隔离）。
    // 会话激活（作曲栏下拉框挂载）时：先按工作目录绑定自动切换（目录优先），
    // 未命中目录绑定时，若记忆项目与当前全局生效项目不同则静默切回。
    function convMemoryKey(sessionId) {
      return 'apikeyswitch.conv.' + sessionId
    }
    function rememberConv(sessionId, profileId) {
      try {
        if (sessionId && profileId) localStorage.setItem(convMemoryKey(sessionId), profileId)
      } catch (e) { /* 忽略存储异常 */ }
    }
    function rememberedConv(sessionId) {
      try {
        if (!sessionId) return null
        return localStorage.getItem(convMemoryKey(sessionId))
      } catch (e) { return null }
    }
    function forgetConv(sessionId) {
      try {
        if (sessionId) localStorage.removeItem(convMemoryKey(sessionId))
      } catch (e) { /* 忽略存储异常 */ }
    }

    function ComposerSwitcher(props) {
      var sessionId = props && props.sessionId
      var _st9 = React.useState(null)
      var status = _st9[0]
      var setStatus = _st9[1]
      var _st10 = React.useState(false)
      var busy = _st10[0]
      var setBusy = _st10[1]
      var _st11 = React.useState(false)
      var open = _st11[0]
      var setOpen = _st11[1]
      var _st12 = React.useState('')
      var error = _st12[0]
      var setError = _st12[1]
      var _st13 = React.useState(null)
      var dirInfo = _st13[0]
      var setDirInfo = _st13[1]

      function applyResult(value) {
        var v = value || {}
        if (v.ok === false && v.error) setError(String(v.error))
        else setError('')
        if (Array.isArray(v.profiles)) setStatus(v)
      }

      function refresh() {
        rpc('status').then(applyResult).catch(function (e) { setError(String(e && e.message ? e.message : e)) })
      }

      function restoreConv() {
        var mem = rememberedConv(sessionId)
        if (!mem) return
        rpc('status').then(function (v) {
          var value = v || {}
          if (value.ok === false || !Array.isArray(value.profiles)) return
          if (value.activeProfile === mem) return
          var target = null
          for (var i = 0; i < value.profiles.length; i++) {
            if (value.profiles[i].id === mem) { target = value.profiles[i]; break }
          }
          if (!target || !target.configured) { forgetConv(sessionId); return }
          rpc('switch', { profile: mem, sessionId: sessionId }).then(function (r) {
            var res = r || {}
            if (res.ok === false) {
              if (res.guard === true) {
                // 有会话正在执行任务：保留记忆（下次会话激活且空闲时再恢复），并明确提示
                publishToast('已阻止自动恢复：' + (res.error || '有会话正在执行任务'))
              } else {
                forgetConv(sessionId)
              }
            } else { applyResult(r) }
          }).catch(function () { /* 静默：恢复失败不打扰用户 */ })
        }).catch(function () { /* 静默 */ })
      }

      // 目录自动切换：命中目录绑定时由 Host 决定是否写入生效槽。
      // 返回 true 表示目录绑定已接管本次激活（命中，无论成功/被守卫阻止），
      // 此时不再回落到会话记忆，避免与目录绑定互相覆盖。
      function autoByDir(callback) {
        if (!sessionId) { callback(false); return }
        rpc('auto', { sessionId: sessionId }).then(function (v) {
          var value = v || {}
          if (value.matched !== true) {
            setDirInfo(value.dir ? { dir: value.dir, profile: null } : null)
            callback(false)
            return
          }
          setDirInfo({ dir: value.dir || '', profile: value.dirProfile || null })
          if (value.ok === false) {
            if (value.guard === true) publishToast('已阻止目录自动切换：' + (value.error || '有会话正在执行任务'))
            else publishToast('目录自动切换失败：' + (value.error || '未知错误'))
            applyResult(value)
            callback(true)
            return
          }
          if (value.switched !== false && value.switchedTo) {
            rememberConv(sessionId, value.switchedTo)
            notifySwitch(value.switchedTo, value, '已按目录自动切换')
          }
          applyResult(value)
          callback(true)
        }).catch(function () { callback(false) })
      }

      React.useEffect(function () {
        setDirInfo(null)
        refresh()
        autoByDir(function (handled) { if (!handled) restoreConv() })
      }, [sessionId])

      function doSwitch(id) {
        if (busy || !id) return
        setBusy(true)
        setError('')
        rpc('switch', { profile: id, sessionId: sessionId }).then(function (v) {
          var value = v || {}
          if (value.ok === false) {
            if (value.guard === true) publishToast('已阻止切换：' + (value.error || '有会话正在执行任务'))
            setError(String(value.error || '切换失败'))
          } else { rememberConv(sessionId, id); notifySwitch(id, value); applyResult(v) }
        }).catch(function (e) { setError(String(e && e.message ? e.message : e)) }).then(function () { setBusy(false) })
      }

      var profiles = (status && status.profiles) || []
      var activeId = (status && status.activeProfile) || ''
      var activeLabel = LABELS[activeId] || activeId || '…'
      // 运行中的"其他会话"数（自身会话不算，自有切换不受守卫阻止）
      var othersRunning = status && Array.isArray(status.running)
        ? status.running.filter(function (r) { return (r.sessionId || '') !== (sessionId || '') }).length
        : 0

      // 点击外部自动收起：菜单打开期间监听 document 的 pointerdown / Escape，
      // 点击目标不在下拉框容器内（或按下 Escape）即收起。
      // 使用捕获阶段可避免被宿主组件的 stopPropagation 拦截导致无法收起。
      var rootRef = React.useRef(null)
      React.useEffect(function () {
        if (!open) return
        function onDocDown(e) {
          if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
        }
        function onDocKey(e) {
          if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('pointerdown', onDocDown, true)
        document.addEventListener('keydown', onDocKey, true)
        return function () {
          document.removeEventListener('pointerdown', onDocDown, true)
          document.removeEventListener('keydown', onDocKey, true)
        }
      }, [open])

      function onBlur(e) {
        var next = e.relatedTarget
        if (!next || !e.currentTarget.contains(next)) setOpen(false)
      }
      function onKeyDown(e) {
        if (e.key === 'Escape') setOpen(false)
      }

      var ICON = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
      var keyIcon = React.createElement('svg', ICON, React.createElement('path', { d: 'm21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4' }))
      var chevronIcon = React.createElement('svg', ICON, React.createElement('polyline', { points: '6 9 12 15 18 9' }))
      var checkIcon = React.createElement('svg', ICON, React.createElement('polyline', { points: '20 6 9 17 4 12' }))

      return React.createElement('div', { className: 'apik-ks-root', ref: rootRef, onBlur: onBlur, onKeyDown: onKeyDown },
        React.createElement('button', {
          type: 'button',
          className: 'apik-ks-trigger',
          onClick: function () { setOpen(!open) },
          disabled: busy,
          title: error || '切换 API Key 项目（写入 DEEPSEEK_API_KEY，下一次模型请求生效）',
        },
          React.createElement('span', { className: 'apik-ks-icon' }, keyIcon),
          React.createElement('span', { className: 'apik-ks-label' }, activeLabel),
          React.createElement('span', { className: 'apik-ks-chevron' + (open ? ' apik-ks-chevronOpen' : '') }, chevronIcon),
        ),
        open ? React.createElement('div', { className: 'apik-ks-menu', role: 'menu' },
          error ? React.createElement('div', { className: 'apik-ks-error' }, error) : null,
          othersRunning > 0 ? React.createElement('div', { className: 'apik-ks-warn' },
            othersRunning + ' 个其他会话正在执行任务，切换将被阻止',
          ) : null,
          dirInfo && dirInfo.dir ? React.createElement('span', { className: 'apik-ks-dir' },
            '目录：' + dirInfo.dir + (dirInfo.profile ? ' → ' + (LABELS[dirInfo.profile] || dirInfo.profile) : '（未绑定）'),
          ) : null,
          profiles.map(function (p) {
            var dirs = Array.isArray(p.dirs) ? p.dirs : []
            return React.createElement('button', {
              key: p.id,
              type: 'button',
              role: 'menuitemradio',
              'aria-checked': p.active ? 'true' : 'false',
              className: 'apik-ks-option',
              disabled: !p.configured,
              title: p.ref + (p.configured ? '' : '（未配置 Key）') + (dirs.length > 0 ? '\n目录：' + dirs.join('\n') : ''),
              onClick: function () { doSwitch(p.id); setOpen(false) },
            },
              React.createElement('span', { className: 'apik-ks-optionCopy' },
                React.createElement('span', { className: 'apik-ks-optionLabel' }, LABELS[p.id] || p.id),
                React.createElement('span', { className: 'apik-ks-optionDesc' }, (p.remark || '') + (p.provider && p.provider !== 'deepseek-official' ? ' · ' + p.provider : '') + (dirs.length > 0 ? ' · 目录 ' + dirs.length : '') + (p.configured ? '' : '（未配置）')),
              ),
              p.active ? React.createElement('span', { className: 'apik-ks-check' }, checkIcon) : null,
            )
          }),
        ) : null,
      )
    }

    function apply(ctx) {
      if (typeof document !== 'undefined' && document.querySelector('style[data-apikeyswitch]') === null) {
        var tag = document.createElement('style')
        tag.dataset.apikeyswitch = '1'
        tag.textContent = SET_CSS + KS_CSS + TOAST_CSS
        document.head.appendChild(tag)
      }
      ctx.inject(['slots'], function (scope) {
        var slots = scope.slots
        slots.inject('shell.overlay', function () {
          return slots.register({ name: 'shell.overlay', id: 'apik-toast', order: 100 }, ToastHost)
        })
        slots.inject('settings.section', function () {
          return slots.register({ name: 'settings.section', id: 'apik-switch', order: 12, label: 'API Key 管理' }, SettingsPage)
        })
        slots.inject('conversation.input.right', function () {
          return slots.register({ name: 'conversation.input.right', id: 'apik-composer-switch', order: 100 }, ComposerSwitcher)
        })
      })
    }

    exports.apply = apply
    return module.exports
  },
})
