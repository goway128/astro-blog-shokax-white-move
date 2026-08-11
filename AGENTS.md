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
  只有 `.friend-title` 是真实 `<a>`，通过 `.stretched-link::after { position: absolute; inset: 0 }`
  伪元素铺满整卡，实现点击整张卡片跳转，同时保留一次拦截触发
- 头像与站点预览图不再是独立 `<a>`，避免出现"点头像时绕过弹窗"的死角
- 卡片顶部原有的 `::before` 主题色渐变条已移除，视觉更简洁；
  卡片右上角的 `::after` 径向渐变晕染保留

## 友链分组

- `theme.config.ts` 的 `friends` 支持两种数据源：
  - `groups: FriendGroupConfig[]` —— 分组视图，每组一个标题 + 一格卡片
  - `links: FriendLinkConfig[]` —— 扁平列表（未分组时使用）
  - 两者可共存，`groups` 存在且非空时优先渲染；否则回落到 `links`
- 分组结构：`{ title: string; description?: string; links: FriendLinkConfig[] }`
- 分组标题 `.friend-group-title` 左侧带主题色小条，配色沿用主色渐变；
  多组之间自动加 `2rem` 间距，视觉分隔明显但保持统一卡片风格
- 未来若需要"折叠 / 单独排序 / 分组独立主题色"，扩展 `FriendGroupConfig` 即可

## Footer 备案图标

- `src/components/footer/Footer.astro` 支持两种 `theme.config.ts` → `footer.icp.icon` 写法：
  - `i-*` 开头字符串：走 UnoCSS 图标 class，需要在 `uno.config.ts`
    的 `collectConfigIcons()` 内被 safelist 覆盖（已包含）
  - 其它字符串：作为图片 URL 走 `<img>`
- 官方图标（如萌 ICP `gov.svg`）优先自托管到 `public/images/`，
  引用路径写 `/images/moe-icp.svg`，避免访客网络屏蔽或外部防盗链

## 移动端侧栏滚动

- `src/components/sidebar/Sidebar.svelte` 移动端（`max-width: 1023px`）走
  抽屉布局，只有内部滚动，绝不让 body 一起滑
- 高度使用 `100dvh`（动态视口高度）避免 iOS Safari 地址栏收合导致的
  “底部被裁掉、内部又不触发滚动”问题；保留 `100vh` 作为老浏览器兜底
- aside 是 `display: flex; flex-direction: column`；
  `.panels { min-height: 0; flex: 1 1 auto }` 让面板占满剩余空间；
  `.panels > .inner { overflow-y: auto; overscroll-behavior: contain }` 是真正的滚动容器
- 桌面端 affix 行为不变，仍使用 `height: 100vh`（PC 无地址栏动态变化问题）
