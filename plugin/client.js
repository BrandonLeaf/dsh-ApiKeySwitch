// ApiKeySwitch - Client 半区源码（动态 Cordis 插件）
//
// 本文件是 cordis_define 的 code.client 函数体原文，Plain JavaScript，
// 不使用 JSX / TypeScript / import，React 一律使用 React.createElement。
//
// 职责：
// - 设置页「API Key 管理」（settings.section，复刻设置-模型页形态）
// - 作曲栏 Key 切换下拉框（conversation.input.right，外观对齐模型切换框）
// - Run 卡片切换面板（tool.view.cordis）
return {
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return

    // ── 设置页「API Key 管理」：复刻「设置-模型」页形态 ──
    ctx.effect(() => styles.insert(
      '.apik-set-section{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;display:flex}' +
      '.apik-set-title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}' +
      '.apik-set-intro{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}' +
      '.apik-set-toolbar{flex-wrap:wrap;align-items:center;gap:10px;display:flex}' +
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
      '.apik-set-editorActions{justify-content:flex-end;gap:8px;display:flex}' +
      '.apik-set-addCard{background:var(--dsw-alias-bg-module-platform);border-radius:12px;flex-direction:column;gap:14px;padding:14px 16px;list-style:none;display:flex}' +
      '.apik-set-msg{color:var(--dsw-alias-state-success-primary);margin:0;font-size:12px;line-height:18px}' +
      '.apik-set-err{color:var(--dsw-alias-state-error-primary);margin:0;font-size:12px;line-height:18px}'
    ))

    // ── 切换成功 Toast 样式：帧级浮层底部居中，容器可点击穿透 ──
    ctx.effect(() => styles.insert(
      '.apik-toastLayer{pointer-events:none;position:fixed;left:0;right:0;bottom:92px;z-index:60;display:flex;justify-content:center}' +
      '.apik-toast{pointer-events:auto;background:var(--dsw-specific-menu);color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-inverted);box-shadow:var(--dsw-shadow-lv3);align-items:center;gap:8px;border-radius:999px;padding:8px 16px;font-size:13px;line-height:20px;display:flex;animation:apik-toast-in .18s ease-out}' +
      '.apik-toastOk{color:var(--dsw-alias-state-success-primary);flex:none;display:flex}' +
      '@keyframes apik-toast-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}'
    ))

    const LABELS = {
      personal: 'default',
    }

    // ── 切换成功提示：帧级悬浮 Toast ──
    // 宿主提供 shell.overlay 帧级浮层插槽（列表型、可叠加、可点击穿透），
    // 本插件在此注册 Toast 容器；作曲栏下拉框、Run 卡片面板手动切换成功后
    // 调用 notifySwitch 弹出「API Key 切换成功」提示。
    // 会话激活时的静默恢复（restoreConv）属于自动行为，不弹提示。
    let toastListeners = []
    let toastSeq = 0
    let toastTimer = null

    const publishToast = (text) => {
      const listeners = toastListeners.slice()
      for (const fn of listeners) {
        try { fn(text) } catch (e) { /* 单个订阅者异常不影响其他订阅者 */ }
      }
    }
    const notifySwitch = (id, value) => {
      let name = LABELS[id] || id
      const list = (value && value.profiles) || []
      for (const p of list) {
        if (p.id !== id) continue
        if (p.remark && p.remark !== name) name += '（' + p.remark + '）'
        break
      }
      publishToast('API Key 切换成功：已切换至「' + name + '」')
    }

    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'apik-toast', order: 100 },
      () => {
        const [toast, setToast] = React.useState(null)
        React.useEffect(() => {
          const sub = (text) => { toastSeq += 1; setToast({ text: text, seq: toastSeq }) }
          toastListeners.push(sub)
          return () => { toastListeners = toastListeners.filter((s) => s !== sub) }
        }, [])
        React.useEffect(() => {
          if (!toast) return
          if (toastTimer) clearTimeout(toastTimer)
          toastTimer = setTimeout(() => setToast(null), 2600)
          return () => { if (toastTimer) clearTimeout(toastTimer) }
        }, [toast])
        const icon = React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('polyline', { points: '20 6 9 17 4 12' }))
        return React.createElement('div', { className: 'apik-toastLayer' },
          toast ? React.createElement('div', { className: 'apik-toast', key: toast.seq, role: 'status' },
            React.createElement('span', { className: 'apik-toastOk' }, icon),
            React.createElement('span', null, toast.text),
          ) : null,
        )
      },
    ))

    slots.inject('settings.section', () => slots.register(
      { name: 'settings.section', id: 'apik-switch', order: 12, label: 'API Key 管理' },
      () => {
        const [rows, setRows] = React.useState(null)
        const [drafts, setDrafts] = React.useState({})
        const [editingId, setEditingId] = React.useState(null)
        const [addOpen, setAddOpen] = React.useState(false)
        const [addDraft, setAddDraft] = React.useState({ editId: '', key: '', remark: '', provider: '', model: '' })
        const [modelOptions, setModelOptions] = React.useState(['deepseek-v4-flash', 'deepseek-v4-pro'])
        const [busy, setBusy] = React.useState(false)
        const [msg, setMsg] = React.useState('')
        const [err, setErr] = React.useState('')
        const [confirmId, setConfirmId] = React.useState('')

        React.useEffect(() => {
          host.call('models').then((v) => {
            const value = v || {}
            if (value.ok && Array.isArray(value.models) && value.models.length > 0) {
              setModelOptions(value.models.map((m) => m.id || m))
            }
          }).catch(() => { /* 保持默认列表 */ })
        }, [])

        const load = () => {
          setErr('')
          host.call('list').then((v) => {
            const value = v || {}
            if (value.ok === false && value.error) setErr(String(value.error))
            else setErr('')
            if (Array.isArray(value.profiles)) {
              setRows(value.profiles.map((p) => ({ id: p.id, editId: LABELS[p.id] || p.id, key: '', remark: p.remark || '', provider: p.provider || '', model: p.model || '', ref: p.ref, user: !!p.user, configured: !!p.configured, active: !!p.active })))
              setDrafts({})
              setEditingId(null)
              setConfirmId('')
              setMsg('')
            }
          }).catch((e) => setErr(String(e && e.message ? e.message : e)))
        }
        React.useEffect(() => { load() }, [])

        const openEditor = (r) => {
          setDrafts((d) => Object.assign({}, d, { [r.id]: { editId: r.editId, key: '', remark: r.remark, provider: r.provider, model: r.model } }))
          setEditingId(editingId === r.id ? null : r.id)
          setConfirmId('')
        }
        const patchDraft = (id, patch) => setDrafts((d) => Object.assign({}, d, { [id]: Object.assign({}, d[id], patch) }))
        const patchAdd = (patch) => setAddDraft((d) => Object.assign({}, d, patch))

        const commit = (id) => {
          if (busy) return
          const d = drafts[id]
          const row = rows && rows.find((r) => r.id === id)
          if (!d || !row) return
          setBusy(true)
          setErr('')
          setMsg('')
          const payload = { id: id }
          if (row.user && d.editId !== id) payload.renameTo = d.editId
          payload.remark = d.remark.trim()
          payload.provider = d.provider.trim()
          payload.model = d.model.trim()
          if (d.key.trim() !== '') payload.key = d.key.trim()
          host.call('save', payload).then((v) => {
            const value = v || {}
            if (value.ok === false) setErr(String(value.error || '保存失败'))
            else setMsg(value.message || '已保存')
            load()
          }).catch((e) => setErr(String(e && e.message ? e.message : e))).then(() => setBusy(false))
        }

        const commitAdd = () => {
          if (busy) return
          setBusy(true)
          setErr('')
          setMsg('')
          host.call('add', { id: addDraft.editId, key: addDraft.key, remark: addDraft.remark, provider: addDraft.provider, model: addDraft.model })
            .then((v) => {
              const value = v || {}
              if (value.ok === false) setErr(String(value.error || '新增失败'))
              else { setMsg(value.message || '已新增'); setAddOpen(false); setAddDraft({ editId: '', key: '', remark: '', provider: '', model: '' }) }
              load()
            }).catch((e) => setErr(String(e && e.message ? e.message : e))).then(() => setBusy(false))
        }

        const removeRow = (r) => {
          if (busy) return
          if (confirmId !== r.id) { setConfirmId(r.id); return }
          setBusy(true)
          setErr('')
          host.call('remove', { id: r.id }).then((v) => {
            const value = v || {}
            if (value.ok === false) setErr(String(value.error || '删除失败'))
            else setMsg(value.message || '已删除')
            load()
          }).catch((e) => setErr(String(e && e.message ? e.message : e))).then(() => { setBusy(false); setConfirmId('') })
        }

        const field = (label, input) => React.createElement('label', { className: 'apik-set-field' },
          React.createElement('span', { className: 'apik-set-fieldLabel' }, label),
          input,
        )

        const renderRow = (r) => {
          const d = drafts[r.id]
          const open = editingId === r.id
          return React.createElement('li', { key: r.id, className: 'apik-set-rowCard' },
            React.createElement('div', { className: 'apik-set-rowHead' },
              React.createElement('span', { className: 'apik-set-rowIdentity' },
                React.createElement('span', { className: 'apik-set-rowName' }, LABELS[r.id] || r.id),
                r.remark ? React.createElement('span', { className: 'apik-set-rowTag' }, r.remark) : null,
                r.provider && r.provider !== 'deepseek-official' ? React.createElement('span', { className: 'apik-set-rowTag' }, r.provider) : null,
                React.createElement('span', { className: 'apik-set-dot ' + (r.configured ? 'apik-set-dotOk' : 'apik-set-dotMissing'), title: r.configured ? '已配置 Key' : '未配置 Key' }),
              ),
              React.createElement('span', { className: 'apik-set-rowActions' },
                React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: () => openEditor(r) }, open ? '收起' : '编辑'),
              ),
            ),
            open && d ? React.createElement('div', { className: 'apik-set-editor' },
              React.createElement('div', { className: 'apik-set-editorHeader' },
                React.createElement('span', { className: 'apik-set-editorTitle' }, '编辑项目'),
                React.createElement('span', { className: 'apik-set-editorRoute' }, r.ref),
              ),
              field('名称 name', React.createElement('input', { className: 'apik-set-input', value: d.editId, disabled: !r.user, placeholder: '小写字母与数字（1-20 位）', onChange: (e) => patchDraft(r.id, { editId: e.target.value }) })),
              field(r.configured ? 'API Key（已配置，留空不修改）' : 'API Key（未配置）', React.createElement('input', { className: 'apik-set-input', type: 'password', value: d.key, placeholder: 'sk- 开头', onChange: (e) => patchDraft(r.id, { key: e.target.value }) })),
              field('备注 remark', React.createElement('input', { className: 'apik-set-input', value: d.remark, placeholder: '如：内部系统', onChange: (e) => patchDraft(r.id, { remark: e.target.value }) })),
              field('模型供应商 provider', React.createElement('input', { className: 'apik-set-input', list: 'apik-provider-list', value: d.provider, placeholder: '如 deepseek-official', onChange: (e) => patchDraft(r.id, { provider: e.target.value }) })),
              field('默认模型 model', React.createElement('input', { className: 'apik-set-input', list: 'apik-model-list', value: d.model, placeholder: '如 deepseek-v4-flash', onChange: (e) => patchDraft(r.id, { model: e.target.value }) })),
              React.createElement('div', { className: 'apik-set-editorActions' },
                r.id !== 'personal' ? React.createElement('button', { className: 'apik-set-btnDanger', disabled: busy, onClick: () => removeRow(r) }, confirmId === r.id ? '确认删除' : '删除') : null,
                React.createElement('div', { style: { flex: 1 } }),
                React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: () => setEditingId(null) }, '取消'),
                React.createElement('button', { className: 'apik-set-btnPrimary', disabled: busy, onClick: () => commit(r.id) }, '保存'),
              ),
            ) : null,
          )
        }

        const renderAdd = () => addOpen ? React.createElement('li', { className: 'apik-set-addCard' },
          React.createElement('div', { className: 'apik-set-editorHeader' },
            React.createElement('span', { className: 'apik-set-editorTitle' }, '新增项目'),
          ),
          field('名称 name', React.createElement('input', { className: 'apik-set-input', value: addDraft.editId, placeholder: '小写字母与数字（1-20 位）', onChange: (e) => patchAdd({ editId: e.target.value }) })),
          field('API Key', React.createElement('input', { className: 'apik-set-input', type: 'password', value: addDraft.key, placeholder: 'sk- 开头', onChange: (e) => patchAdd({ key: e.target.value }) })),
          field('备注 remark', React.createElement('input', { className: 'apik-set-input', value: addDraft.remark, placeholder: '如：内部系统', onChange: (e) => patchAdd({ remark: e.target.value }) })),
          field('模型供应商 provider', React.createElement('input', { className: 'apik-set-input', list: 'apik-provider-list', value: addDraft.provider, placeholder: '如 deepseek-official', onChange: (e) => patchAdd({ provider: e.target.value }) })),
          field('默认模型 model', React.createElement('input', { className: 'apik-set-input', list: 'apik-model-list', value: addDraft.model, placeholder: '如 deepseek-v4-flash', onChange: (e) => patchAdd({ model: e.target.value }) })),
          React.createElement('div', { className: 'apik-set-editorActions' },
            React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: () => setAddOpen(false) }, '取消'),
            React.createElement('button', { className: 'apik-set-btnPrimary', disabled: busy, onClick: commitAdd }, '新增'),
          ),
        ) : null

        return React.createElement('div', { className: 'apik-set-section' },
          React.createElement('h2', { className: 'apik-set-title' }, 'API Key 管理'),
          React.createElement('p', { className: 'apik-set-intro' }, '维护各项目的名称、密钥、备注、模型供应商与默认模型；切换项目时同步切换 Key、供应商与默认模型。'),
          React.createElement('div', { className: 'apik-set-toolbar' },
            React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: () => setAddOpen(!addOpen) }, addOpen ? '收起新增' : '+ 新增项目'),
            rows ? React.createElement('span', { className: 'apik-set-intro' }, '共 ' + rows.length + ' 个项目') : null,
          ),
          msg ? React.createElement('p', { className: 'apik-set-msg' }, msg) : null,
          err ? React.createElement('p', { className: 'apik-set-err' }, err) : null,
          rows === null
            ? React.createElement('p', { className: 'apik-set-intro' }, '加载中…')
            : React.createElement('ul', { className: 'apik-set-rows' },
                renderAdd(),
                rows.map(renderRow),
              ),
          React.createElement('datalist', { id: 'apik-provider-list' },
            React.createElement('option', { value: 'deepseek-official' }),
          ),
          React.createElement('datalist', { id: 'apik-model-list' },
            modelOptions.map((m) => React.createElement('option', { key: m, value: m })),
          ),
        )
      },
    ))

    // ── Run 卡片内的完整切换面板 ──
    const panelStyle = { border: '1px solid rgba(127,127,127,.35)', borderRadius: 8, padding: '10px 12px', margin: '6px 0', fontSize: 13, lineHeight: 1.6 }
    const headerStyle = { fontWeight: 600, marginBottom: 6 }
    const lineStyle = { margin: '4px 0' }
    const errorStyle = { color: '#e5484d', margin: '4px 0' }
    const wrapStyle = { display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0' }
    const btnStyle = { padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(127,127,127,.5)', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 12 }
    const activeBtnStyle = { background: '#4caf50', borderColor: '#4caf50', color: '#fff' }
    const dimBtnStyle = { opacity: 0.55 }
    const smallBtnStyle = { padding: '2px 10px', borderRadius: 6, border: '1px solid rgba(127,127,127,.5)', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 12 }

    // ── 每会话记忆：切换会话时自动恢复该会话上次选择的项目 ──
    // sessionId 来自会话级插槽标准 props；记忆存 localStorage（按会话隔离）。
    // 会话激活（作曲栏下拉框挂载）时，若记忆项目与当前全局生效项目不同则静默切回。
    const convMemoryPrefix = 'apikeyswitch.conv.'
    const convMemoryKey = (sessionId) => convMemoryPrefix + sessionId
    const rememberConv = (sessionId, profileId) => {
      try {
        if (sessionId && profileId) localStorage.setItem(convMemoryKey(sessionId), profileId)
      } catch (e) { /* 忽略存储异常 */ }
    }
    const rememberedConv = (sessionId) => {
      try {
        if (!sessionId) return null
        return localStorage.getItem(convMemoryKey(sessionId))
      } catch (e) { return null }
    }
    const forgetConv = (sessionId) => {
      try {
        if (sessionId) localStorage.removeItem(convMemoryKey(sessionId))
      } catch (e) { /* 忽略存储异常 */ }
    }

    slots.inject('tool.view.cordis', () => slots.register(
      { name: 'tool.view.cordis', key: 'self' },
      (props) => {
        const sessionId = props && props.sessionId
        const [status, setStatus] = React.useState(null)
        const [busy, setBusy] = React.useState('')
        const [error, setError] = React.useState('')

        const applyResult = (value) => {
          const v = value || {}
          if (v.ok === false && v.error) setError(String(v.error))
          else setError('')
          if (Array.isArray(v.profiles)) setStatus(v)
        }

        const refresh = () => {
          setError('')
          host.call('status').then(applyResult).catch((err) => setError(String(err && err.message ? err.message : err)))
        }

        React.useEffect(() => { refresh() }, [])

        const doSwitch = (id) => {
          if (busy) return
          setBusy(id)
          setError('')
          host.call('switch', { profile: id })
            .then((v) => {
              const value = v || {}
              if (value.ok !== false) { rememberConv(sessionId, id); notifySwitch(id, value) }
              applyResult(v)
            })
            .catch((err) => setError(String(err && err.message ? err.message : err)))
            .then(() => setBusy(''))
        }

        const profiles = (status && status.profiles) || []
        const activeId = (status && status.activeProfile) || ''

        return React.createElement('div', { style: panelStyle },
          React.createElement('div', { style: headerStyle }, 'API Key 切换面板'),
          React.createElement('div', { style: lineStyle },
            '当前生效：', React.createElement('b', null, activeId),
            status && status.maskedKey ? '（' + status.maskedKey + '）' : null,
            status && status.route ? ' · ' + status.route : null,
            React.createElement('span', { style: { marginLeft: 8, fontSize: 12, opacity: 0.7 } }, '设置页面可管理项目与 Key'),
          ),
          error ? React.createElement('div', { style: errorStyle }, error) : null,
          React.createElement('div', { style: wrapStyle },
            profiles.map((p) => React.createElement('button', {
              key: p.id,
              onClick: () => doSwitch(p.id),
              disabled: busy !== '' || p.active,
              style: Object.assign({}, btnStyle, p.active ? activeBtnStyle : (p.configured ? {} : dimBtnStyle)),
              title: p.ref + (p.configured ? '' : '（未配置 Key）'),
            }, (p.remark || p.id) + (p.active ? '（当前）' : '') + (p.configured ? '' : '（未配置）'))),
          ),
          React.createElement('div', { style: lineStyle },
            React.createElement('button', { onClick: refresh, disabled: busy !== '', style: smallBtnStyle }, '刷新'),
            ' 切换写入 DEEPSEEK_API_KEY，下一次模型请求立即生效，无需重启',
          ),
        )
      },
    ))

    // ── 作曲栏 Key 切换：外观对齐「模型切换框」──
    ctx.effect(() => styles.insert(
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
    ))

    const LABELS_KS = {
      personal: 'default',
    }
    const ICON = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
    const keyIcon = React.createElement('svg', ICON, React.createElement('path', { d: 'm21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4' }))
    const chevronIcon = React.createElement('svg', ICON, React.createElement('polyline', { points: '6 9 12 15 18 9' }))
    const checkIcon = React.createElement('svg', ICON, React.createElement('polyline', { points: '20 6 9 17 4 12' }))

    slots.inject('conversation.input.right', () => slots.register(
      { name: 'conversation.input.right', id: 'apik-composer-switch', order: 100 },
      (props) => {
        const sessionId = props && props.sessionId
        const [status, setStatus] = React.useState(null)
        const [busy, setBusy] = React.useState(false)
        const [open, setOpen] = React.useState(false)
        const [error, setError] = React.useState('')

        const applyResult = (value) => {
          const v = value || {}
          if (v.ok === false && v.error) setError(String(v.error))
          else setError('')
          if (Array.isArray(v.profiles)) setStatus(v)
        }

        const refresh = () => {
          host.call('status').then(applyResult).catch((err) => setError(String(err && err.message ? err.message : err)))
        }

        const restoreConv = () => {
          const mem = rememberedConv(sessionId)
          if (!mem) return
          host.call('status').then((v) => {
            const value = v || {}
            if (value.ok === false || !Array.isArray(value.profiles)) return
            if (value.activeProfile === mem) return
            const target = value.profiles.find((p) => p.id === mem)
            if (!target || !target.configured) { forgetConv(sessionId); return }
            host.call('switch', { profile: mem }).then((r) => {
              const res = r || {}
              if (res.ok === false) forgetConv(sessionId)
              else applyResult(r)
            }).catch(() => { /* 静默：恢复失败不打扰用户 */ })
          }).catch(() => { /* 静默 */ })
        }

        React.useEffect(() => { refresh(); restoreConv() }, [])

        const doSwitch = (id) => {
          if (busy || !id) return
          setBusy(true)
          setError('')
          host.call('switch', { profile: id })
            .then((v) => {
              const value = v || {}
              if (value.ok === false) setError(String(value.error || '切换失败'))
              else { rememberConv(sessionId, id); notifySwitch(id, value); applyResult(v) }
            })
            .catch((err) => setError(String(err && err.message ? err.message : err)))
            .then(() => setBusy(false))
        }

        const profiles = (status && status.profiles) || []
        const activeId = (status && status.activeProfile) || ''
        const activeLabel = LABELS_KS[activeId] || activeId || '…'

        // 点击外部自动收起：菜单打开期间监听 document 的 pointerdown / Escape，
        // 点击目标不在下拉框容器内（或按下 Escape）即收起。
        // 不使用捕获阶段则可能被宿主组件的 stopPropagation 拦截导致无法收起。
        const rootRef = React.useRef(null)
        React.useEffect(() => {
          if (!open) return
          const onDocDown = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
          }
          const onDocKey = (e) => {
            if (e.key === 'Escape') setOpen(false)
          }
          document.addEventListener('pointerdown', onDocDown, true)
          document.addEventListener('keydown', onDocKey, true)
          return () => {
            document.removeEventListener('pointerdown', onDocDown, true)
            document.removeEventListener('keydown', onDocKey, true)
          }
        }, [open])

        const onBlur = (e) => {
          const next = e.relatedTarget
          if (!next || !e.currentTarget.contains(next)) setOpen(false)
        }
        const onKeyDown = (e) => {
          if (e.key === 'Escape') setOpen(false)
        }

        return React.createElement('div', { className: 'apik-ks-root', ref: rootRef, onBlur: onBlur, onKeyDown: onKeyDown },
          React.createElement('button', {
            type: 'button',
            className: 'apik-ks-trigger',
            onClick: () => setOpen(!open),
            disabled: busy,
            title: error || '切换 API Key 项目（写入 DEEPSEEK_API_KEY，下一次模型请求生效）',
          },
            React.createElement('span', { className: 'apik-ks-icon' }, keyIcon),
            React.createElement('span', { className: 'apik-ks-label' }, activeLabel),
            React.createElement('span', { className: 'apik-ks-chevron' + (open ? ' apik-ks-chevronOpen' : '') }, chevronIcon),
          ),
          open ? React.createElement('div', { className: 'apik-ks-menu', role: 'menu' },
            error ? React.createElement('div', { className: 'apik-ks-error' }, error) : null,
            profiles.map((p) => React.createElement('button', {
              key: p.id,
              type: 'button',
              role: 'menuitemradio',
              'aria-checked': p.active ? 'true' : 'false',
              className: 'apik-ks-option',
              disabled: !p.configured,
              title: p.ref + (p.configured ? '' : '（未配置 Key）'),
              onClick: () => { doSwitch(p.id); setOpen(false) },
            },
              React.createElement('span', { className: 'apik-ks-optionCopy' },
                React.createElement('span', { className: 'apik-ks-optionLabel' }, LABELS_KS[p.id] || p.id),
                React.createElement('span', { className: 'apik-ks-optionDesc' }, (p.remark || '') + (p.provider && p.provider !== 'deepseek-official' ? ' · ' + p.provider : '') + (p.configured ? '' : '（未配置）')),
              ),
              p.active ? React.createElement('span', { className: 'apik-ks-check' }, checkIcon) : null,
            )),
          ) : null,
        )
      },
    ))
  },
}
