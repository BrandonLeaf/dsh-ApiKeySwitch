# ApiKeySwitch

DSH（DeepSeek Harness）动态 Cordis 插件：按项目维护独立的 DeepSeek API Key，用户可手动切换当前生效的 Key，切换时同步模型供应商与默认模型。

## 项目简介

DSH 默认只为整个进程配置一把 API Key。本插件通过 DSH 的凭据接缝（`credentials` 服务 + `~/.dsh/.credentials.yaml`）为每个项目维护独立 Key，并提供三个切换入口：

- 作曲栏 Key 下拉框（模型切换框旁，外观对齐模型切换框）
- Run 卡片内切换面板
- 模型工具：`api_key_status` / `api_key_switch` / `api_key_set`

切换写入 `DEEPSEEK_API_KEY`（生效槽），模型提供商每次请求重新解析，立即生效、无需重启。切换时通过 `agentDefaultModel.saveSelection` 同步默认路由（供应商 + 模型）。手动切换成功后页面底部弹出「API Key 切换成功」Toast 提示（会话激活时的静默恢复不提示）。

每个会话会记住自己最后选择的项目（localStorage，按会话隔离）：切换到其他会话时自动恢复该会话的项目与 Key，不再串用上一个会话的 Key。

内置项目仅 default（默认，受保护不可删除）；其他项目均在设置页「API Key 管理」中新增，每个项目独立维护 Key、备注、模型供应商与默认模型。真实项目名称与凭据引用不入库。

## 技术栈

| 项 | 说明 |
| --- | --- |
| 宿主环境 | DSH 0.1.0-rc.8（@deepseek-ai/dsh） |
| 插件形态 | 动态 Cordis 插件（Host + Client 双半区，Plain JavaScript） |
| Host 接口 | `credentials` 服务、`agentDefaultModel` 服务、`harness`（defineTool / registerTool / handle） |
| Client 接口 | `slots`（settings.section / conversation.input.right / tool.view.cordis）、`host.call`、`styles`、React（createElement） |
| 数据存储 | `~/.dsh/.credentials.yaml`（凭据接缝，热加载，权限 600） |

## 目录结构

```
ApiKeySwitch/
├── AGENTS.md            # AI 行为约束（Directive + Knowledge）
├── README.md            # 本项目索引
├── .gitignore
├── package.json         # 插件包清单（dsh.bundle.patch + dsh.client 声明）——仓库根目录即插件包
├── cordis.patch.yml     # bundle 补丁：安装后自动插入 apikeyswitch 插件行
├── lib/                 # 正式部署形态源码（进程级插件包，推荐）
│   ├── index.js         # Host 半区（ctx.tools.register + webServer 路由）
│   └── client.js        # Client 半区（模块加载器格式 + fetch RPC）
└── plugin/              # 动态插件形态源码（cordis_define 直接使用）
    ├── manifest.json    # 插件元数据（内置项目、插槽、工具与 RPC 清单）
    ├── host.js          # Host 半区源码（cordis_define 的 code.host 原文）
    └── client.js        # Client 半区源码（cordis_define 的 code.client 原文）
```

## 模块说明

| 模块 | 文件 | 职责 |
| --- | --- | --- |
| Host 半区 | `plugin/host.js` | 凭据读写、项目目录（内置 + 自定义）管理、备份与迁移、模型工具注册、Client RPC 处理器、路由同步 |
| Client 半区 | `plugin/client.js` | 设置页「API Key 管理」（复刻设置-模型页形态，折叠卡片 + 编辑展开）、作曲栏切换下拉框、Run 卡片切换面板 |

Host 内部函数一览：

| 函数 | 职责 |
| --- | --- |
| `catalog()` | 完整项目目录 = 内置项目（含元数据覆盖）+ 用户自定义项目 |
| `collectStatus()` | 当前生效判定（引用值匹配，未匹配则为 default）+ 各项目配置状态 |
| `switchProfile(id)` | 切换 Key（备份/恢复 default）+ 同步默认路由 |
| `syncRoute(profile)` | 通过 `agentDefaultModel.saveSelection` 写入供应商 + 模型 |
| `saveProfile / addProfile / removeProfile` | 设置页增删改（删除仅限非 default） |
| `migrateLegacy()` | 旧版迁移：删除 DSH_PERSONAL_API_KEY，值转入备份槽 |

## 构建与运行

本项目无构建步骤（无 prepare 脚本，git 安装无需构建），源码以两种形态提供：

### 形态一：正式部署（仓库根目录即插件包，进程级，推荐）

**方式 A：官方安装命令**

仓库根目录是标准 DSH 插件包（`dsh.bundle.patch` + `dsh.client` 声明）。推送到 git 托管后，任何同事可执行：

```bash
dsh plugin --profile web add "https://github.com/BrandonLeaf/dsh-ApiKeySwitch#main"
```

流程：pnpm 安装仓库根目录为依赖 → `dsh plugin` 自动把声明了 `dsh.bundle` 的新依赖加入 `dsh.profile.bundles` → 启动时 bundle 补丁（`cordis.patch.yml`）自动插入插件行 → 插件挂载。无需手动编辑组合文件。安装后重启 `dsh web` 并刷新页面即可。

要求：机器装有 pnpm 且可访问 git 托管地址；`github:` 为 pnpm spec，GitLab/内网仓库可改用 `git+https://...` 或 `git+ssh://...`；建议用标签固定版本（如 `#v0.1.0-rc.8-p-0.1.0`）。

**方式 B：手动复制（本地单机）**

1. 将 `lib/`、`package.json`、`cordis.patch.yml` 放入 `~/.dsh/profiles/web/node_modules/apikswitch/`；
2. 在 `~/.dsh/profiles/web/cordis.patch.yml` 追加挂载行：

```yaml
- insert:
    - id: apikeyswitch
      name: apikeyswitch
```

3. 重启 `dsh web` 进程（组合改动需要重启进程生效；HMR 需 `--expose-internals` 启动才可用），刷新页面后自动加载，无需手动运行。

与动态版的差异：模型工具改用 `ctx.tools.register`，Client 通信改用 webServer HTTP 路由（`POST /apikeyswitch/api`，action 分发），不注册 Run 卡片面板（`tool.view.cordis` 为动态插件专属插槽）。

### 形态二：动态插件（plugin/，会话级）

1. 在 DSH 会话中调用 `cordis_define`：
   - `plugin.kind: "new"`，`idPrefix: "apik"`
   - `code.host` 填入 `plugin/host.js` 内容
   - `code.client` 填入 `plugin/client.js` 内容
2. 调用 `cordis_run` 激活（Client 半区需在页面批准）。
3. 首次使用自动完成旧版迁移；在设置页「API Key 管理」配置各项目 Key。

限制：动态插件是会话级临时实体，页面刷新后需重新运行。

数据位置：

| 文件 | 说明 |
| --- | --- |
| `~/.dsh/.credentials.yaml` | 各项目 Key、备份槽、元数据 JSON（权限必须 600） |
| `~/.dsh/settings.yaml` | `agent-default-model` 默认路由（切换时由插件更新） |

## 文档索引

| 文档 | 用途 |
| --- | --- |
| `AGENTS.md` | AI 行为约束：密钥保护、源码约束、运行版本同步 |
| `README.md` | 本项目索引（本文件） |

当前无 `docs/` 子目录；后续设计/运维/bugfix 类文档按项目规范放入 `docs/` 对应子目录（design / ops / bugfix / task）。

## 约束与注意事项

- 动态插件是进程内临时实体：进程重启后需重新加载，历史版本 Package 不可单独删除
- 切换对全局生效：所有会话共用一条模型路由
- 会话记忆基于全局生效槽：切换会话时自动恢复会改写全局生效 Key，其他会话运行中的后台任务会随会话切换换 Key
- 路由同步写入默认模型选择；当前会话运行中的模型由作曲栏「模型切换框」主导
- 当前部署仅挂载 `deepseek-official` 供应商；`dsh-llm-example`（示例供应商）已安装但未挂载，配置其他供应商需先修改宿主组合（`~/.dsh/profiles/web/cordis.patch.yml`）并重启 Web 服务
- 文档与示例中不得出现真实 API Key，一律使用占位符（如 `sk-REPLACE_ME`）
- 本仓库为示例形态，真实项目名称、备注与凭据引用不得写入仓库


## 效果图
![alt text](README.link/image-2.png)
![alt text](README.link/image-1.png)


