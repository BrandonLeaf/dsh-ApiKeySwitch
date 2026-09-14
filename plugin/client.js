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
      '.apik-set-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}' +
      '.apik-set-input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;height:32px;font:inherit;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px;font-size:14px;line-height:22px}' +
      '.apik-set-input:focus{border-color:var(--dsw-alias-brand-primary);outline:none}' +
      '.apik-set-input::placeholder{color:var(--dsw-alias-label-dimmed)}' +
      '.apik-set-input:disabled{opacity:.6;cursor:default}' +
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
    const notifySwitch = (id, value, prefix) => {
      let name = LABELS[id] || id
      const list = (value && value.profiles) || []
      for (const p of list) {
        if (p.id !== id) continue
        if (p.remark && p.remark !== name) name += '（' + p.remark + '）'
        break
      }
      publishToast((prefix || 'API Key 切换成功') + '：已切换至「' + name + '」')
    }

    // ── 模型目录（由 Host 实时下发，与「设置-模型」页同源）──
    // 不再硬编码模型 id：供应商模型换代、改名或下线后
    // 由 Host 从 settings 命名空间实时解析，界面与默认路由自动跟随。
    const catalogOf = (value) => {
      const list = value && value.catalog
      if (Array.isArray(list) && list.length > 0) return list
      const providers = value && value.providers
      return Array.isArray(providers) ? providers : []
    }
    const modelsOf = (catalog, provider) => {
      const hit = (catalog || []).find((p) => p.id === provider)
      return hit && Array.isArray(hit.models) ? hit.models : []
    }
    const modelIdsOf = (catalog, provider) => modelsOf(catalog, provider).map((m) => m.id)
    const pickModel = (catalog, provider, current, defaultRoute) => {
      const ids = modelIdsOf(catalog, provider)
      if (ids.length === 0) return current || ''
      if (current && ids.indexOf(current) !== -1) return current
      if (defaultRoute && defaultRoute.provider === provider && ids.indexOf(defaultRoute.model) !== -1) return defaultRoute.model
      return ids[0]
    }
    const pickProvider = (catalog, current, defaultRoute) => {
      const ids = (catalog || []).map((p) => p.id)
      if (ids.length === 0) return current || ''
      if (current && ids.indexOf(current) !== -1) return current
      if (defaultRoute && ids.indexOf(defaultRoute.provider) !== -1) return defaultRoute.provider
      return ids[0]
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
        const [addDraft, setAddDraft] = React.useState({ editId: '', key: '', remark: '', provider: '', model: '', dirs: [] })
        const [cat, setCat] = React.useState({ catalog: [], defaultRoute: null, picker: 'unavailable' })
        const [busy, setBusy] = React.useState(false)
        const [msg, setMsg] = React.useState('')
        const [err, setErr] = React.useState('')
        const [confirmId, setConfirmId] = React.useState('')
        const [picking, setPicking] = React.useState('')

        const applyPayload = (value) => {
          const v = value || {}
          if (v.ok === false && v.error) setErr(String(v.error))
          else setErr('')
          setCat({ catalog: catalogOf(v), defaultRoute: v.defaultRoute || null, picker: v.directoryPicker || 'unavailable' })
          if (Array.isArray(v.profiles)) {
            setRows(v.profiles.map((p) => ({
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
            })))
            setDrafts({})
            setEditingId(null)
            setConfirmId('')
          }
        }

        const load = () => {
          setErr('')
          host.call('list').then(applyPayload).catch((e) => setErr(String(e && e.message ? e.message : e)))
        }
        React.useEffect(() => { load() }, [])

        const openEditor = (r) => {
          const provider = pickProvider(cat.catalog, r.provider, cat.defaultRoute)
          const model = pickModel(cat.catalog, provider, r.model, cat.defaultRoute)
          setDrafts((d) => Object.assign({}, d, { [r.id]: { editId: r.editId, key: '', remark: r.remark, provider: provider, model: model, dirs: r.dirs.slice() } }))
          setEditingId(editingId === r.id ? null : r.id)
          setConfirmId('')
        }
        const patchDraft = (id, patch) => setDrafts((d) => Object.assign({}, d, { [id]: Object.assign({}, d[id], patch) }))
        const patchAdd = (patch) => setAddDraft((d) => Object.assign({}, d, patch))
        const patchDir = (id, index, value) => {
          const d = drafts[id]
          if (!d) return
          const next = d.dirs.slice()
          next[index] = value
          patchDraft(id, { dirs: next })
        }
        const removeDir = (id, index) => {
          const d = drafts[id]
          if (!d) return
          const next = d.dirs.slice()
          next.splice(index, 1)
          patchDraft(id, { dirs: next })
        }
        const patchAddDir = (index, value) => {
          const next = addDraft.dirs.slice()
          next[index] = value
          patchAdd({ dirs: next })
        }
        const removeAddDir = (index) => {
          const next = addDraft.dirs.slice()
          next.splice(index, 1)
          patchAdd({ dirs: next })
        }
        const cleanDirs = (dirs) => (dirs || []).map((x) => String(x).trim()).filter((x) => x !== '')

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
          payload.dirs = cleanDirs(d.dirs)
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
          host.call('add', { id: addDraft.editId, key: addDraft.key, remark: addDraft.remark, provider: addDraft.provider, model: addDraft.model, dirs: cleanDirs(addDraft.dirs) })
            .then((v) => {
              const value = v || {}
              if (value.ok === false) setErr(String(value.error || '新增失败'))
              else { setMsg(value.message || '已新增'); setAddOpen(false); setAddDraft({ editId: '', key: '', remark: '', provider: '', model: '', dirs: [] }) }
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
        // 含交互元素的字段：用 div 承载（避免 button 落入 label 触发聚焦）
        const fieldBox = (label, hint, content) => React.createElement('div', { className: 'apik-set-field' },
          React.createElement('span', { className: 'apik-set-fieldLabel' }, label),
          hint ? React.createElement('span', { className: 'apik-set-hint' }, hint) : null,
          content,
        )
        // 目录选择：「+ 添加目录」直接调用宿主 directoryPicker（macOS 为 Finder
        // 选择框）并生成一条记录（目录名 + 小字完整路径）；「重选」替换该行路径。
        // 仅在宿主 capability 为 native 时走选择器流程（browse/不可用时按宿主
        // 契约退回手动填写输入框）。
        const dirBaseName = (path) => {
          const parts = String(path || '').split(/[/\\]/).filter((x) => x !== '')
          return parts.length > 0 ? parts[parts.length - 1] : String(path || '')
        }
        const sameDirValue = (a, b) => {
          const na = String(a || '').replace(/[/\\]+$/, '')
          const nb = String(b || '').replace(/[/\\]+$/, '')
          return na !== '' && na === nb
        }
        const pickDirPath = () => host.call('pickDir').then((v) => {
          const value = v || {}
          if (value.ok === false) { setErr(String(value.error || '目录选择失败')); return null }
          if (value.cancelled === true || !value.path) return null
          return String(value.path)
        }).catch((e) => { setErr(String(e && e.message ? e.message : e)); return null })
        const chooseDir = (id, index) => {
          if (busy || picking !== '') return
          setPicking(id + ':' + index)
          setErr('')
          setMsg('')
          pickDirPath().then((path) => {
            if (!path) return
            const d = drafts[id]
            if (!d) return
            const next = d.dirs.slice()
            next[index] = path
            patchDraft(id, { dirs: next })
          }).then(() => setPicking(''))
        }
        const addDirEntry = (id) => {
          if (cat.picker !== 'native') {
            const d0 = drafts[id]
            if (d0) patchDraft(id, { dirs: d0.dirs.concat(['']) })
            return
          }
          if (busy || picking !== '') return
          setPicking(id + ':new')
          setErr('')
          setMsg('')
          pickDirPath().then((path) => {
            if (!path) return
            const d = drafts[id]
            if (!d) return
            const list = d.dirs || []
            if (list.some((x) => sameDirValue(x, path))) { setMsg('该目录已在列表中：' + path); return }
            patchDraft(id, { dirs: list.concat([path]) })
          }).then(() => setPicking(''))
        }
        const chooseAddDir = (index) => {
          if (busy || picking !== '') return
          setPicking('__add__:' + index)
          setErr('')
          setMsg('')
          pickDirPath().then((path) => {
            if (!path) return
            const next = addDraft.dirs.slice()
            next[index] = path
            patchAdd({ dirs: next })
          }).then(() => setPicking(''))
        }
        const addAddDirEntry = () => {
          if (cat.picker !== 'native') {
            patchAdd({ dirs: addDraft.dirs.concat(['']) })
            return
          }
          if (busy || picking !== '') return
          setPicking('__add__:new')
          setErr('')
          setMsg('')
          pickDirPath().then((path) => {
            if (!path) return
            const list = addDraft.dirs || []
            if (list.some((x) => sameDirValue(x, path))) { setMsg('该目录已在列表中：' + path); return }
            patchAdd({ dirs: list.concat([path]) })
          }).then(() => setPicking(''))
        }
        const dirsEditor = (dirs, onPatch, onRemove, onAdd, onPick, pickKey) => {
          const list = dirs || []
          if (cat.picker !== 'native') {
            return React.createElement('div', { className: 'apik-set-dirs' },
              list.map((dir, i) => React.createElement('div', { className: 'apik-set-dirRow', key: 'dir' + i },
                React.createElement('input', {
                  className: 'apik-set-input',
                  value: dir,
                  placeholder: '/绝对路径/到/workspace',
                  onChange: (e) => onPatch(i, e.target.value),
                }),
                React.createElement('button', { type: 'button', className: 'apik-set-btnSecondary', disabled: busy || picking !== '', onClick: () => onRemove(i) }, '移除'),
              )),
              React.createElement('button', { type: 'button', className: 'apik-set-btnSecondary apik-set-dirAdd', disabled: busy || picking !== '', onClick: onAdd }, '+ 添加目录'),
            )
          }
          return React.createElement('div', { className: 'apik-set-dirs' },
            list.map((dir, i) => {
              const key = pickKey + ':' + i
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
                  onClick: () => onPick(i),
                }, picking === key ? '选择中…' : '重选'),
                React.createElement('button', { type: 'button', className: 'apik-set-btnSecondary', disabled: busy || picking !== '', onClick: () => onRemove(i) }, '移除'),
              )
            }),
            React.createElement('button', {
              type: 'button',
              className: 'apik-set-btnSecondary apik-set-dirAdd',
              disabled: busy || picking !== '',
              title: '打开系统目录选择框',
              onClick: onAdd,
            }, picking === pickKey + ':new' ? '选择中…' : '+ 添加目录'),
          )
        }
        const renderRow = (r) => {
          const d = drafts[r.id]
          const open = editingId === r.id
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
              field('默认模型 model', React.createElement('input', { className: 'apik-set-input', list: 'apik-model-list', value: d.model, placeholder: '从模型目录中选择', onChange: (e) => patchDraft(r.id, { model: e.target.value }) })),
              r.modelStale ? React.createElement('p', { className: 'apik-set-hint' }, '原模型 ' + (r.modelStored || '（空）') + ' 已不在当前模型目录中，切换该项目时按 ' + r.model + ' 同步默认路由；保存后写回配置。') : null,
              fieldBox('工作目录 dirs（可选，支持多个）', (cat.picker === 'native' ? '点击「+ 添加目录」打开系统目录选择框；切换 workspace 到这些目录时自动切换到本项目；一个目录只能绑定一个项目。' : '切换 workspace 到这些目录时自动切换到本项目；一个目录只能绑定一个项目。'), dirsEditor(d.dirs, (i, v) => patchDir(r.id, i, v), (i) => removeDir(r.id, i), () => addDirEntry(r.id), (i) => chooseDir(r.id, i), r.id)),
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
          field('默认模型 model', React.createElement('input', { className: 'apik-set-input', list: 'apik-model-list', value: addDraft.model, placeholder: '从模型目录中选择', onChange: (e) => patchAdd({ model: e.target.value }) })),
          fieldBox('工作目录 dirs（可选，支持多个）', (cat.picker === 'native' ? '点击「+ 添加目录」打开系统目录选择框；切换 workspace 到这些目录时自动切换到本项目；一个目录只能绑定一个项目。' : '切换 workspace 到这些目录时自动切换到本项目；一个目录只能绑定一个项目。'), dirsEditor(addDraft.dirs, patchAddDir, removeAddDir, addAddDirEntry, chooseAddDir, '__add__')),
          React.createElement('div', { className: 'apik-set-editorActions' },
            React.createElement('button', { className: 'apik-set-btnSecondary', disabled: busy, onClick: () => setAddOpen(false) }, '取消'),
            React.createElement('button', { className: 'apik-set-btnPrimary', disabled: busy, onClick: commitAdd }, '新增'),
          ),
        ) : null

        return React.createElement('div', { className: 'apik-set-section' },
          React.createElement('h2', { className: 'apik-set-title' }, 'API Key 管理'),
          React.createElement('p', { className: 'apik-set-intro' }, '维护各项目的名称、密钥、备注、模型供应商、默认模型与工作目录；切换项目时同步切换 Key、供应商与默认模型，切换到已绑定目录的 workspace 时自动切换。'),
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
            cat.catalog.map((p) => React.createElement('option', { key: p.id, value: p.id })),
          ),
          React.createElement('datalist', { id: 'apik-model-list' },
            cat.catalog.reduce((acc, p) => acc.concat(modelsOf(cat.catalog, p.id).map((m) => m.id)), [])
              .filter((id, i, all) => id && all.indexOf(id) === i)
              .map((id) => React.createElement('option', { key: id, value: id })),
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
          host.call('switch', { profile: id, sessionId: sessionId })
            .then((v) => {
              const value = v || {}
              if (value.ok !== false) { rememberConv(sessionId, id); notifySwitch(id, value) }
              else if (value.guard === true) publishToast('已阻止切换：' + (value.error || '有会话正在执行任务'))
              applyResult(v)
            })
            .catch((err) => setError(String(err && err.message ? err.message : err)))
            .then(() => setBusy(''))
        }

        const profiles = (status && status.profiles) || []
        const activeId = (status && status.activeProfile) || ''
        // 运行中的"其他会话"数（自身会话不算，自有切换不受守卫阻止）
        const othersRunning = (status && Array.isArray(status.running))
          ? status.running.filter((r) => (r.sessionId || '') !== (sessionId || '')).length
          : 0

        return React.createElement('div', { style: panelStyle },
          React.createElement('div', { style: headerStyle }, 'API Key 切换面板'),
          React.createElement('div', { style: lineStyle },
            '当前生效：', React.createElement('b', null, activeId),
            status && status.maskedKey ? '（' + status.maskedKey + '）' : null,
            status && status.route ? ' · ' + status.route : null,
            React.createElement('span', { style: { marginLeft: 8, fontSize: 12, opacity: 0.7 } }, '设置页面可管理项目与 Key'),
          ),
          error ? React.createElement('div', { style: errorStyle }, error) : null,
          othersRunning > 0
            ? React.createElement('div', { style: { color: '#b8860b', margin: '4px 0' } },
              othersRunning + ' 个其他会话正在执行任务，切换将被阻止（防止 API Key 串用）')
            : null,
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
      '.apik-ks-warn{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border-radius:8px;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}' +
      '.apik-ks-dir{color:var(--dsw-alias-label-tertiary);border-bottom:1px solid var(--dsw-alias-border-l2);margin-bottom:4px;padding:4px 8px 8px;font-size:11px;line-height:16px;word-break:break-all;display:block}' +
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
        const [dirInfo, setDirInfo] = React.useState(null)

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
            host.call('switch', { profile: mem, sessionId: sessionId }).then((r) => {
              const res = r || {}
              if (res.ok === false) {
                if (res.guard === true) {
                  // 有会话正在执行任务：保留记忆（下次会话激活且空闲时再恢复），并明确提示
                  publishToast('已阻止自动恢复：' + (res.error || '有会话正在执行任务'))
                } else {
                  forgetConv(sessionId)
                }
              } else {
                applyResult(r)
              }
            }).catch(() => { /* 静默：恢复失败不打扰用户 */ })
          }).catch(() => { /* 静默 */ })
        }

        // 目录自动切换：命中目录绑定时由 Host 决定是否写入生效槽。
        // 返回 true 表示目录绑定已接管本次激活（命中，无论成功/被守卫阻止），
        // 此时不再回落到会话记忆，避免与目录绑定互相覆盖。
        const autoByDir = (callback) => {
          if (!sessionId) { callback(false); return }
          host.call('auto', { sessionId: sessionId }).then((v) => {
            const value = v || {}
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
          }).catch(() => callback(false))
        }

        React.useEffect(() => {
          setDirInfo(null)
          refresh()
          autoByDir((handled) => { if (!handled) restoreConv() })
        }, [sessionId])

        const doSwitch = (id) => {
          if (busy || !id) return
          setBusy(true)
          setError('')
          host.call('switch', { profile: id, sessionId: sessionId })
            .then((v) => {
              const value = v || {}
              if (value.ok === false) {
                if (value.guard === true) publishToast('已阻止切换：' + (value.error || '有会话正在执行任务'))
                setError(String(value.error || '切换失败'))
              } else { rememberConv(sessionId, id); notifySwitch(id, value); applyResult(v) }
            })
            .catch((err) => setError(String(err && err.message ? err.message : err)))
            .then(() => setBusy(false))
        }

        const profiles = (status && status.profiles) || []
        const activeId = (status && status.activeProfile) || ''
        const activeLabel = LABELS_KS[activeId] || activeId || '…'
        // 运行中的"其他会话"数（自身会话不算，自有切换不受守卫阻止）
        const othersRunning = (status && Array.isArray(status.running))
          ? status.running.filter((r) => (r.sessionId || '') !== (sessionId || '')).length
          : 0

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
            othersRunning > 0 ? React.createElement('div', { className: 'apik-ks-warn' },
              othersRunning + ' 个其他会话正在执行任务，切换将被阻止',
            ) : null,
            dirInfo && dirInfo.dir ? React.createElement('span', { className: 'apik-ks-dir' },
              '目录：' + dirInfo.dir + (dirInfo.profile ? ' → ' + (LABELS_KS[dirInfo.profile] || dirInfo.profile) : '（未绑定）'),
            ) : null,
            profiles.map((p) => {
              const dirs = Array.isArray(p.dirs) ? p.dirs : []
              return React.createElement('button', {
                key: p.id,
                type: 'button',
                role: 'menuitemradio',
                'aria-checked': p.active ? 'true' : 'false',
                className: 'apik-ks-option',
                disabled: !p.configured,
                title: p.ref + (p.configured ? '' : '（未配置 Key）') + (dirs.length > 0 ? '\n目录：' + dirs.join('\n') : ''),
                onClick: () => { doSwitch(p.id); setOpen(false) },
              },
                React.createElement('span', { className: 'apik-ks-optionCopy' },
                  React.createElement('span', { className: 'apik-ks-optionLabel' }, LABELS_KS[p.id] || p.id),
                  React.createElement('span', { className: 'apik-ks-optionDesc' }, (p.remark || '') + (p.provider && p.provider !== 'deepseek-official' ? ' · ' + p.provider : '') + (dirs.length > 0 ? ' · 目录 ' + dirs.length : '') + (p.configured ? '' : '（未配置）')),
                ),
                p.active ? React.createElement('span', { className: 'apik-ks-check' }, checkIcon) : null,
              )
            }),
          ) : null,
        )
      },
    ))
  },
}
