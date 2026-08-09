# AGENTS.md — astro-blog-shokax

本文件定义你在此仓库工作的最小安全边界与执行流程。

## 运行环境与总原则

- 运行时与包管理器：**Bun**（`packageManager: bun@1.3.6`）
- 默认沟通语言：**中文**（输出与代码注释优先中文）
- 优先使用仓库脚本，不要自创命令
- 路由要求：`trailingSlash: "always"`（内部链接保留尾 `/`）
- 不要随意偏离现有架构（Astro + Svelte 5 + UnoCSS + Pagefind）
- Svelte 5 交互代码遵循现有 runes 风格（`$state/$props/$effect`）
- 有代码改动后至少执行：
  1. `bun run format`
  2. `bun run lint`
  3. `bun run check`

## 注释

- 默认中文输出与中文注释
- 不要新增“工作总结 Markdown 报告”文件

## 代码标准

- 可复用独立 helper 优先放置到`/src/toolkit/`中，并编写独立单元测试
- 较为复杂的 UI 组件或页面需编写对应 E2E 测试
- 如果需要添加测试用或展示效果的 Markdown/MDX 页面，优先复用现有文件

## 外链访问确认弹窗

- 实现位置：`src/toolkit/externalLinkGuard.ts`（纯逻辑，含单测 `externalLinkGuard.test.ts`）
  与 `src/components/ExternalLinkDialog.svelte`（UI，全局挂载于 `src/layouts/Layout.astro`）
- 拦截范围：全站所有站外 `http(s)` 链接，包含菜单栏、侧栏 social、页脚、友链页与文章正文
- 客户端加载策略：`client:load`，保证用户在页面首屏点外链就能拦得住
- 放行规则（不弹窗）：
  - 站内链接（相对路径、锚点、同源绝对 URL）
  - `mailto:` / `tel:` / `javascript:` / `data:` 等非 http(s) 协议
  - 中键、`Ctrl` / `Meta` / `Alt` / `Shift` 修饰键点击（视为用户明确新开）
  - 带 `download` 属性或 `data-no-guard` 属性的链接（显式豁免）
- 弹窗形态：居中模态框，展示目标 URL 与提示，仅"返回 / 继续访问"两个按钮，不做信任记忆
- 若需在某个特定链接上关闭弹窗，请在 `<a>` 上加 `data-no-guard` 属性
- 弹窗文案通过 i18n key `externalLink.*` 提供，四种语言均需同步维护
- 组件使用原生 `<dialog>` + `showModal()`，天然获得 Esc 关闭、焦点陷阱与 `::backdrop`
- 外链 rel 属性保持 `noopener noreferrer`（`src/toolkit/wrapExternalLinks.ts`），
  确认后通过 `window.open(url, "_blank", "noopener,noreferrer")` 打开

## 友链卡片可点区域

- `src/components/friends/FriendLinks.astro` 使用 stretched-link 模式：
  只有 `.friend-title` 是真实 `<a>`，通过 `::after { position: absolute; inset: 0 }`
  伪元素铺满整卡，实现点击整张卡片跳转，同时保留一次拦截触发
- 头像与站点预览图不再是独立 `<a>`，避免出现"点头像时绕过弹窗"的死角
