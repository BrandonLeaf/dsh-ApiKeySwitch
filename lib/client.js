// ApiKeySwitch - Client 半区（正式部署版）
//
// 模块加载器（__ModuleLoader__）格式的浏览器模块，导出 apply 作为 Cordis
// 客户端插件。与动态版（plugin/client.js）的差异：
// - 用同源 fetch 调用 Host 的 /apikeyswitch/api（替代 host.call）
// - CSS 通过 <style> 注入（替代 styles.insert）
// - 不注册 Run 卡片面板（tool.view.cordis 为动态插件专属插槽）
// 保留：设置页「API Key 管理」、作曲栏 Key 切换下拉框
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
      '.apik-set-input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;height:32px;font:inherit;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px;font-size:14px;line-height:22px}' +
      '.apik-set-input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}' +
      '.apik-set-input::placeholder{color:var(--dsw-alias-label-dimmed)}' +
      '.apik-set-input:disabled{opacity:.6;cursor:default}' +
      'select.apik-set-input{cursor:pointer}' +
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
      '.apik-ks-option{width:100%;min-height:38px;color:inherit;text-align:left;cursor:pointer;background:transparent;border:none;border-radius:10px;outline:none;align-items:center;gap:8px;padding:6px 8px;display:flex}' +
      '.apik-ks-option:hover:not(:disabled),.apik-ks-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}' +
      '.apik-ks-option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}' +
      '.apik-ks-optionCopy{flex-direction:column;flex:1;min-width:0;display:flex}' +
      '.apik-ks-optionLabel{color:inherit;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}' +
      '.apik-ks-optionDesc{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}' +
      '.apik-ks-check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}'

    var LABELS = {
      personal: 'default',
    }

    var catalogApi = null

    function getPath(obj, path) {
      var cur = obj
      for (var i = 0; i < path.length; i++) {
        if (cur == null) return undefined
        cur = cur[path[i]]
      }
      return cur
    }

    function fetchCatalog() {
      if (!catalogApi) return Promise.resolve([])
      return Promise.all([catalogApi.llm.providers({}), catalogApi.settings.describe({})]).then(function (res) {
        var p = res[0].result
        var s = res[1].result
        if (!p || !p.ok || !s || !s.ok) return []
        var namespaces = {}
        var views = (s.value && s.value.namespaces) || []
        for (var i = 0; i < views.length; i++) namespaces[views[i].ns] = views[i]
        var out = []
        var entries = (p.value && p.value.providers) || []
        for (var j = 0; j < entries.length; j++) {
          var entry = entries[j]
          var ns = namespaces[entry.settingsNs]
          // 与「设置-模型」页一致的 configured 判定：只列出已配置的供应商
          var configured = false
          if (ns) {
            if (entry.settingsPath.length === 0) configured = true
            else configured = getPath(ns.value, entry.settingsPath) !== undefined
          }
          if (!configured) continue
          var models = []
          if (entry.settingsPath.length === 0 && ns && ns.value && Array.isArray(ns.value.models)) {
            models = ns.value.models.map(function (m) { return typeof m === 'string' ? m : (m && m.id) }).filter(Boolean)
          } else if (ns && ns.value) {
            var profile = getPath(ns.value, entry.settingsPath)
            if (profile && Array.isArray(profile.models)) {
              models = profile.models.map(function (m) { return typeof m === 'string' ? m : (m && m.id) }).filter(Boolean)
            }
          }
          out.push({ id: entry.provider, name: entry.name || entry.provider, models: models })
        }
        return out
      }).catch(function () { return [] })
    }

    function providersOf(catalog) {
      return (catalog || []).map(function (p) { return p.id })
    }

    function modelsOf(catalog, provider) {
      var p = (catalog || []).filter(function (x) { return x.id === provider })[0]
      return p ? p.models : []
    }

    function optionsFor(catalog, current, list, emptyLabel) {
      var opts = list.slice()
      if (current && opts.indexOf(current) === -1) opts = [current].concat(opts)
      if (opts.length === 0) return [React.createElement('option', { key: '__none__', value: '' }, emptyLabel || '无可用选项')]
      return opts.map(function (x) { return React.createElement('option', { key: x, value: x }, x) })
    }

    function field(label, input) {
      return React.createElement('label', { className: 'apik-set-field' },
        React.createElement('span', { className: 'apik-set-fieldLabel' }, label),
        input,
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
      var _st3 = React.useState({ editId: '', key: '', remark: '', provider: '', model: '' })
      var addDraft = _st3[0]
      var setAddDraft = _st3[1]
      var _st4 = React.useState(['deepseek-v4-flash', 'deepseek-v4-pro'])
      var modelOptions = _st4[0]
      var setModelOptions = _st4[1]
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

      var _catState = React.useState(null)
      var catalog = _catState[0]
      var setCatalog = _catState[1]

      React.useEffect(function () {
        fetchCatalog().then(function (v) { setCatalog(v) })
      }, [])

      function load() {
        setErr('')
        rpc('list').then(function (v) {
          var value = v || {}
          if (value.ok === false && value.error) setErr(String(value.error))
          else setErr('')
          if (Array.isArray(value.profiles)) {
            setRows(value.profiles.map(function (p) {
              return { id: p.id, editId: LABELS[p.id] || p.id, key: '', remark: p.remark || '', provider: p.provider || '', model: p.model || '', ref: p.ref, user: !!p.user, configured: !!p.configured, active: !!p.active }
            }))
            setDrafts({})
            setEditingId(null)
            setConfirmId('')
            setMsg('')
          }
        }).catch(function (e) { setErr(String(e && e.message ? e.message : e)) })
      }

      React.useEffect(function () { load() }, [])

      function patchRow(id, patch) {
        setRows(function (rs) { return rs.map(function (r) { return r.id === id ? Object.assign({}, r, patch) : r }) })
      }
      function patchDraft(id, patch) {
        setDrafts(function (d) {
          return Object.assign({}, d, Object.assign({}, { [id]: Object.assign({}, d[id] || {}, patch) }))
        })
      }
      function patchAdd(patch) {
        setAddDraft(function (d) { return Object.assign({}, d, patch) })
      }
      function openEditor(r) {
        setDrafts(function (d) { return Object.assign({}, d, Object.assign({}, { [r.id]: { editId: r.editId, key: '', remark: r.remark, provider: r.provider, model: r.model } })) })
        setEditingId(editingId === r.id ? null : r.id)
        setConfirmId('')
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
        rpc('add', { id: addDraft.editId, key: addDraft.key, remark: addDraft.remark, provider: addDraft.provider, model: addDraft.model }).then(function (v) {
          var value = v || {}
          if (value.ok === false) setErr(String(value.error || '新增失败'))
          else { setMsg(value.message || '已新增'); setAddOpen(false); setAddDraft({ editId: '', key: '', remark: '', provider: '', model: '' }) }
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

      function renderRow(r) {
        var d = drafts[r.id]
        var open = editingId === r.id
        return React.createElement('li', { key: r.id, className: 'apik-set-rowCard' },
          React.createElement('div', { className: 'apik-set-rowHead' },
            React.createElement('span', { className: 'apik-set-rowIdentity' },
              React.createElement('span', { className: 'apik-set-rowName' }, LABELS[r.id] || r.id),
              r.remark ? React.createElement('span', { className: 'apik-set-rowTag' }, r.remark) : null,
              r.provider && r.provider !== 'deepseek-official' ? React.createElement('span', { className: 'apik-set-rowTag' }, r.provider) : null,
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
            field('备注 remark', React.createElement('input', { className: 'apik-set-input', value: d.remark, placeholder: '如：示例项目 1', onChange: function (e) { patchDraft(r.id, { remark: e.target.value }) } })),
            field('模型供应商 provider', React.createElement('select', {
              className: 'apik-set-input',
              value: d.provider,
              onChange: function (e) {
                var prov = e.target.value
                var models = modelsOf(catalog, prov)
                var next = d.model
                if (models.indexOf(next) === -1) next = models.length > 0 ? models[0] : ''
                patchDraft(r.id, { provider: prov, model: next })
              },
            }, optionsFor(catalog, d.provider, providersOf(catalog), '无可用供应商'))),
            field('默认模型 model', React.createElement('select', {
              className: 'apik-set-input',
              value: d.model,
              onChange: function (e) { patchDraft(r.id, { model: e.target.value }) },
            }, optionsFor(catalog, d.model, modelsOf(catalog, d.provider), '无可用模型'))),
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
        field('备注 remark', React.createElement('input', { className: 'apik-set-input', value: addDraft.remark, placeholder: '如：示例项目 1', onChange: function (e) { patchAdd({ remark: e.target.value }) } })),
        field('模型供应商 provider', React.createElement('select', {
          className: 'apik-set-input',
          value: addDraft.provider,
          onChange: function (e) {
            var prov = e.target.value
            var models = modelsOf(catalog, prov)
            var next = addDraft.model
            if (models.indexOf(next) === -1) next = models.length > 0 ? models[0] : ''
            patchAdd({ provider: prov, model: next })
          },
        }, optionsFor(catalog, addDraft.provider, providersOf(catalog), '无可用供应商'))),
        field('默认模型 model', React.createElement('select', {
          className: 'apik-set-input',
          value: addDraft.model,
          onChange: function (e) { patchAdd({ model: e.target.value }) },
        }, optionsFor(catalog, addDraft.model, modelsOf(catalog, addDraft.provider), '无可用模型'))),
        React.createElement('div', { className: 'apik-set-editorActions' },
          React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: function () { setAddOpen(false) } }, '取消'),
          React.createElement('button', { className: 'apik-set-btnPrimary', disabled: busy, onClick: commitAdd }, '新增'),
        ),
      ) : null

      return React.createElement('div', { className: 'apik-set-section' },
        React.createElement('h2', { className: 'apik-set-title' }, 'API Key 管理'),
        React.createElement('p', { className: 'apik-set-intro' }, '维护各项目的名称、密钥、备注、模型供应商与默认模型；切换项目时同步切换 Key、供应商与默认模型。'),
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
    // 会话激活（作曲栏下拉框挂载）时，若记忆项目与当前全局生效项目不同则静默切回。
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
          rpc('switch', { profile: mem }).then(function (r) {
            var res = r || {}
            if (res.ok === false) forgetConv(sessionId)
            else applyResult(r)
          }).catch(function () { /* 静默：恢复失败不打扰用户 */ })
        }).catch(function () { /* 静默 */ })
      }

      React.useEffect(function () { refresh(); restoreConv() }, [])

      function doSwitch(id) {
        if (busy || !id) return
        setBusy(true)
        setError('')
        rpc('switch', { profile: id }).then(function (v) {
          var value = v || {}
          if (value.ok === false) setError(String(value.error || '切换失败'))
          else { rememberConv(sessionId, id); applyResult(v) }
        }).catch(function (e) { setError(String(e && e.message ? e.message : e)) }).then(function () { setBusy(false) })
      }

      var profiles = (status && status.profiles) || []
      var activeId = (status && status.activeProfile) || ''
      var activeLabel = LABELS[activeId] || activeId || '…'

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

      return React.createElement('div', { className: 'apik-ks-root', onBlur: onBlur, onKeyDown: onKeyDown },
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
          profiles.map(function (p) {
            return React.createElement('button', {
              key: p.id,
              type: 'button',
              role: 'menuitemradio',
              'aria-checked': p.active ? 'true' : 'false',
              className: 'apik-ks-option',
              disabled: !p.configured,
              title: p.ref + (p.configured ? '' : '（未配置 Key）'),
              onClick: function () { doSwitch(p.id); setOpen(false) },
            },
              React.createElement('span', { className: 'apik-ks-optionCopy' },
                React.createElement('span', { className: 'apik-ks-optionLabel' }, LABELS[p.id] || p.id),
                React.createElement('span', { className: 'apik-ks-optionDesc' }, (p.remark || '') + (p.provider && p.provider !== 'deepseek-official' ? ' · ' + p.provider : '') + (p.configured ? '' : '（未配置）')),
              ),
              p.active ? React.createElement('span', { className: 'apik-ks-check' }, checkIcon) : null,
            )
          }),
        ) : null,
      )
    }

    function apply(ctx) {
      var connection = ctx.get('connection')
      catalogApi = connection && connection.api ? connection.api : null
      if (typeof document !== 'undefined' && document.querySelector('style[data-apikeyswitch]') === null) {
        var tag = document.createElement('style')
        tag.dataset.apikeyswitch = '1'
        tag.textContent = SET_CSS + KS_CSS
        document.head.appendChild(tag)
      }
      ctx.inject(['slots'], function (scope) {
        var slots = scope.slots
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
