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
  rule: 修改 lib/ 或 plugin/ 下任一源码后，MUST 同步更新运行中的插件版本：部署形态通过复制 lib/ 与 package.json 到 ~/.dsh/profiles/web/node_modules/apikswitch/ 并重启 dsh web，动态形态通过 cordis_define 追加 Package 并 cordis_run，保证仓库源码与运行版本一致

# Directive: 构建与测试

- id: build-test.no-build
  rule: 本项目为纯源码与文档项目，无构建与测试步骤，MUST NOT 引入构建系统或测试框架

# Knowledge: 项目概述

项目名称：ApiKeySwitch
项目定位：DeepSeek Harness（DSH）Cordis 插件源码项目，为 DSH 提供按项目维护多把 DeepSeek API Key 并手动切换的能力。
运行环境：DSH 0.1.0-rc.7（@deepseek-ai/dsh）。
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

# Knowledge: 配置

## 凭据引用清单

> 示例说明：本清单为示例内容（demo1 至 demo5），真实项目名称与引用不入库。

| 引用 | 用途 |
| --- | --- |
| DEEPSEEK_API_KEY | 生效槽，也是 default 项目的引用 |
| DSH_DEMO1_API_KEY | 示例项目 1 |
| DSH_DEMO2_API_KEY | 示例项目 2 |
| DSH_DEMO3_API_KEY | 示例项目 3 |
| DSH_DEMO4_API_KEY | 示例项目 4 |
| DSH_DEMO5_API_KEY | 示例项目 5 |
| DSH_APIK_BACKUP | 隐藏备份槽 |
| DSH_APIK_META | 项目元数据 JSON |

## 插槽占用

| 插槽 | id | 说明 |
| --- | --- | --- |
| settings.section | apik-switch | 设置页「API Key 管理」（order 12） |
| conversation.input.right | apik-composer-switch | 作曲栏切换下拉框（order 100） |
| tool.view.cordis | self | Run 卡片切换面板 |

## 模型工具

api_key_status / api_key_switch / api_key_set；RPC：status / list / models / switch / set / save / add / remove

# Knowledge: 约束与注意事项

- 动态插件是进程内临时实体：进程重启后需重新加载，历史版本 Package 不可删除
- Client 半区激活需要用户批准；Host 半区无需批准
- 切换对全局生效（所有会话共用一条模型路由）
- 路由同步写入默认模型选择，对当前会话运行中的模型由作曲栏「模型切换框」主导
- 当前部署仅挂载 deepseek-official 供应商；dsh-llm-example（示例供应商）已安装但未挂载，其他供应商需先修改宿主组合
- 凭据文件 ~/.dsh/.credentials.yaml 权限必须保持 600
- 本仓库为示例形态：内置项目均为示例名称（demo1 至 demo5），MUST NOT 将真实项目名称、备注或凭据引用写入仓库
