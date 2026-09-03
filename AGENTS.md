---
scope: project
version: "2.0"
domains: [documentation, security, code-style, build-test]
---

# Directive: 文档与注释

## 项目信息获取
- id: documentation.readme-first
  rule: 需要快速了解项目情况时 MUST 首先阅读项目根目录的 README.md，再依据其中的项目索引定位所需信息

## 规范对齐
- id: documentation.spec-check
  rule: 代码开发完毕后 MUST 检查项目对应的规范文档（如 README.md 中的架构说明、plugin/manifest.json 中的清单约定），逐项核对代码是否符合项目规范要求，存在偏差 MUST 修正后再交付

# Directive: 安全

## 密钥保护
- id: security.secret-reference
  rule: 文档、注释、示例、commit message 中 MUST NOT 出现真实 API Key，需要示例时 MUST 使用占位符（如 sk-REPLACE_ME）
- id: security.credentials-file
  rule: MUST NOT 将 ~/.dsh/.credentials.yaml 或任何包含真实密钥的文件提交到仓库；.gitignore MUST 覆盖本地密钥相关文件

# Directive: 代码风格

## 插件源码约束
- id: code-style.plugin-plain-js
  rule: plugin/host.js 与 plugin/client.js MUST 保持 Plain JavaScript，禁止 import / require / TypeScript / JSX，Client 端 React 必须使用 React.createElement
- id: code-style.sync-with-runtime
  rule: 修改 lib/ 或 plugin/ 下任一源码后，MUST 同步更新运行中的插件版本：部署形态通过复制 lib/ 与 package.json 到 ~/.dsh/profiles/web/node_modules/apikeyswitch/ 并重启 dsh web，动态形态通过 cordis_define 追加 Package 并 cordis_run，保证仓库源码与运行版本一致

# Directive: 构建与测试

- id: build-test.no-build
  rule: 本项目为纯源码与文档项目，无构建与测试步骤，MUST NOT 引入构建系统或测试框架

# Knowledge: 项目概述

项目名称：ApiKeySwitch
项目定位：DeepSeek Harness（DSH）Cordis 插件源码项目，为 DSH 提供按项目维护多把 DeepSeek API Key 并手动切换的能力。
运行环境：DSH 0.1.0-rc.8（@deepseek-ai/dsh）。
代码形态：仓库根目录即正式部署插件包（lib/ + package.json + cordis.patch.yml，支持 dsh plugin add 官方安装）；plugin/ 为动态插件形态（cordis_define 的 code.host / code.client 原文）。

# Knowledge: 架构

## 分层职责

| 端 | 文件 | 职责 |
| --- | --- | --- |
| Host（动态） | `plugin/host.js` | 凭据读写、项目目录管理、模型工具注册、Client RPC 处理器、路由同步 |
| Client（动态） | `plugin/client.js` | 设置页「API Key 管理」、作曲栏切换下拉框、Run 卡片切换面板 |
| Host（部署） | `lib/index.js` | 与动态版同逻辑；工具用 ctx.tools.register，通信用 webServer 路由 |
| Client（部署） | `lib/client.js` | 设置页、作曲栏下拉框（fetch RPC，无 Run 卡片面板） |

## 数据模型

- 生效槽：`DEEPSEEK_API_KEY`，模型提供商每次请求重新解析，写入后立即生效，无需重启
- 项目引用：每个项目一个凭据引用（`DSH_<NAME>_API_KEY`），default 直接使用生效槽
- 备份槽：`DSH_APIK_BACKUP`，切走 default 时保护其 Key，切回时恢复
- 元数据：`DSH_APIK_META`（JSON 字符串），存放 remark / provider / model / user / deleted

## 关键机制

- 切换项目：备份当前生效 Key（如处于 default）→ 写入目标项目 Key → 通过 agentDefaultModel.saveSelection 同步默认路由（供应商 + 模型）
- 生效判定：扫描非 default 项目的引用值是否与生效槽相等，未匹配则为 default
- 旧版迁移：首次运行时删除 DSH_PERSONAL_API_KEY，其值转入备份槽
- 会话记忆：每个会话在 localStorage（键 apikeyswitch.conv.<sessionId>）记录自己最后选择的项目；会话激活（作曲栏下拉框挂载）时若记忆项目与当前生效项目不同则静默切回，保证切换会话后 Key 跟随该会话
- 切换守卫：宿主 agents 服务（`ctx.get('agents')`，dsh-agent 提供，web 组合已挂载）中除调用者自身会话（客户端传 sessionId，模型工具从 exec.agent 推导）外的任意 agent 的 `status` getter 为 `running`（含子代理）时，`switchProfile` 返回 `ok:false + guard:true + running` 列表并拒绝写入生效槽；UI 手动切换、会话激活自动恢复、模型工具 `api_key_switch` 均受守卫约束，`opts.guard === false` 为运维强制切换逃生口

# Knowledge: 配置

## 凭据引用清单

> 示例说明：内置项目仅 default（直接使用生效槽）；其他项目为设置页新增的自定义项目，引用形如 `DSH_<NAME>_API_KEY`。真实项目名称与引用不入库。

| 引用 | 用途 |
| --- | --- |
| DEEPSEEK_API_KEY | 生效槽，也是 default 项目的引用 |
| DSH_APIK_BACKUP | 隐藏备份槽 |
| DSH_APIK_META | 项目元数据 JSON |

## 插槽占用

| 插槽 | id | 说明 |
| --- | --- | --- |
| settings.section | apik-switch | 设置页「API Key 管理」（order 12） |
| conversation.input.right | apik-composer-switch | 作曲栏切换下拉框（order 100） |
| tool.view.cordis | self | Run 卡片切换面板 |
| shell.overlay | apik-toast | 切换成功 Toast 容器（order 100） |

## 模型工具

api_key_status / api_key_switch / api_key_set；RPC：status / list / models / switch / set / save / add / remove

# Knowledge: 约束与注意事项

- 动态插件是进程内临时实体：进程重启后需重新加载，历史版本 Package 不可删除
- Client 半区激活需要用户批准；Host 半区无需批准
- 切换对全局生效（所有会话共用一条模型路由）
- 路由同步写入默认模型选择，对当前会话运行中的模型由作曲栏「模型切换框」主导
- 当前部署仅挂载 deepseek-official 供应商；dsh-llm-example（示例供应商）已安装但未挂载，其他供应商需先修改宿主组合
- 凭据文件 ~/.dsh/.credentials.yaml 权限必须保持 600
- 切换守卫基于 agents 服务运行状态：守卫检查与写入生效槽之间存在极小的竞态窗口（检查后、写入前会话可能起步），需要严格隔离时 SHOULD 为每个项目使用独立 DSH profile 或独立进程
- 会话记忆基于全局生效槽实现：有会话正在执行任务时，会话激活的自动恢复会被守卫阻止（记忆保留），需先停止运行中的任务；运行时无每会话独立槽位，同时执行的会话中"后起步请求"的 Key 归属由请求发起瞬间的全局生效槽决定
- 本仓库为示例形态，MUST NOT 将真实项目名称、备注或凭据引用写入仓库
