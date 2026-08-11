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
  "底部被裁掉、内部又不触发滚动"问题；保留 `100vh` 作为老浏览器兜底
- aside 是 `display: flex; flex-direction: column`；
  `.panels { min-height: 0; flex: 1 1 auto }` 让面板占满剩余空间；
  `.panels > .inner { overflow-y: auto; overscroll-behavior: contain }` 是真正的滚动容器
- 桌面端 affix 行为不变，仍使用 `height: 100vh`（PC 无地址栏动态变化问题）

---

## 开发日志

### 2026-08-11 — 外链弹窗文案萌系化

**改动路径**

- `src/i18n/locales/zh-CN.json` — `externalLink.title` / `lead` 加"喵"尾，删除 `hint`
- `src/i18n/locales/zh-TW.json` — 同上（繁体版本）
- `src/i18n/locales/ja.json` — 同上（にゃ 尾）
- `src/i18n/locales/en.json` — 同上（nya 尾）
- `src/components/ExternalLinkDialog.svelte` — 删除 `<p class="dialog-hint">` 及配套 `.dialog-hint` CSS

**说明**

- 弹窗定位为温和提示而非警告，去掉"请确认目标可信后再继续"这类硬邦邦的引导句
- `title` 与 `lead` 全部改为带语气尾（喵 / にゃ / nya），四种语言保持一致
- `urlLabel` 未使用；实际 URL 展示走 `<p class="dialog-url">` 直接渲染
- i18n key `externalLink.hint` 已从组件与四语言 JSON 一同移除，避免残留死键

### 2026-08-11 — 友链卡片主题色

**改动路径**

- `src/theme.config.ts` — 6 位个人博客与 Svelte / UnoCSS / Astro 分别配 `color`

**说明**

- 主题本已内置 `color` 字段（`FriendLinks.astro:47` 通过 `--friend-accent` 消费），
  之前未设置时全部回落到 `var(--color-blue)`，视觉上千篇一律
- 配色遵循站点意象或品牌色，可选值：`--color-{red,pink,orange,yellow,green,aqua,blue,purple,grey}`，
  也支持任意 CSS 颜色（如 `#ff6b9d`）
- 变量 `--friend-accent` 影响卡片边框、作者标签、悬停晕染与外发光，整体统一

### 2026-08-11 — 友链分组支持

**改动路径**

- `src/toolkit/themeConfig.ts` — 新增 `FriendGroupConfig` 类型，`FriendsConfig` 添加 `groups?` 字段
- `src/components/friends/FriendLinks.astro` — 支持 `groups` 与 `links` 双入参，优先渲染分组，回落扁平列表
- `src/pages/friends/index.astro` — 读取 `friendsConfig?.groups` 并透传给组件
- `src/theme.config.ts` — 示例配置：将原有 6 个博客归入"个人博客"组，新增"工具与资源"组

**设计要点**

- 分组结构：`{ title: string; description?: string; links: FriendLinkConfig[] }`
- 未设置 `groups` 或 `groups` 为空时自动回落到 `links`，零 breaking change
- 分组标题 `.friend-group-title` 左侧带主题色渐变小条（`::before`），组间自动 `2rem` 间距
- 卡片样式保持一致，stretched-link 模式确保整卡可点且外链弹窗正常拦截
- 未来扩展方向：折叠/展开、分组独立主题色、拖拽排序

### 2026-08-11 — 页脚精简与萌 ICP 图标自托管

**改动路径**

- `src/components/footer/Footer.astro` — 移除整段 Copyright Section（`{author} @ {siteName}` 版权行）
- `src/components/friends/FriendLinks.astro` — 删除 `.friend-card::before` 顶部渐变色带，保留 `::after` 晕染
- `src/theme.config.ts` — 友链新增 `avatar` 字段用于配置示例；`friends.groups` 分组配置就绪
- `uno.config.ts` — `collectConfigIcons()` 补上 `footer.icp.icon`，纳入 UnoCSS safelist
- `public/images/moe-icp.svg` — 萌 ICP 官方图标自托管（原 URL 存在访客网络屏蔽风险）

**说明**

- 图标 URL 由外链改为本地 `/images/moe-icp.svg`，避开外部防盗链与网络屏蔽
- 版权行不属于主题致谢范畴，用户可自行决定是否显示，去掉后视觉更纯粹
- Powered by Astro + ShokaX 段保留（属于主题版权声明，按开源礼仪保留）

### 2026-08-11 — 移动端侧栏滚动修复

**改动路径**

- `src/components/sidebar/Sidebar.svelte` — 移动端媒体查询块重构为 flex 布局

**根因**

- 移动端 `.panels { min-height: 100vh }` 与 `.panels > .inner { overflow-y: auto }` 双向锁死：
  滚动容器与内容等高，浏览器判定"未溢出"，`auto` 不触发滚动条
- iOS Safari 上 `100vh` = 最大视口（地址栏收起时），实际可视区被地址栏遮挡

**修复要点**

- aside 高度改用 `100dvh`（动态视口高度），保留 `100vh` 老浏览器兜底
- 移动端 aside 改为 `display: flex; flex-direction: column`
- `.panels` 在移动端解除 `min-height: 100vh`，改用 `flex: 1 1 auto` 占满剩余空间
- `.panels > .inner` 加 `overscroll-behavior: contain`，防止边缘滚动带动 body
- 桌面端 affix 行为完全不动

### 2026-08-11 — 全站外链访问确认弹窗

**改动路径**

- `src/toolkit/externalLinkGuard.ts` — 纯逻辑（URL 判断 + 全局委托监听）
- `src/toolkit/externalLinkGuard.test.ts` — 单元测试（15 用例）
- `src/components/ExternalLinkDialog.svelte` — Svelte 5 runes 弹窗，原生 `<dialog>` + `showModal()`
- `src/layouts/Layout.astro` — 挂载 `<ExternalLinkDialog client:load siteUrl={siteUrl} />`
- `src/i18n/locales/{zh-CN,zh-TW,ja,en}.json` — 新增 `externalLink.*` 文案键（4 种语言）
- `src/components/friends/FriendLinks.astro` — 友链卡片改为 stretched-link，头像与预览图不再是独立 `<a>`

**设计要点**

- 拦截范围：全站所有站外 `http(s)` 链接（菜单栏、侧栏 social、页脚、友链、正文）
- `client:load` 保证首屏点击就能拦得住，不使用信任记忆
- 放行：站内、`mailto:`/`tel:` 等非 http(s)、修饰键点击、`download` 或 `data-no-guard` 属性
- 友链卡片 stretched-link：整卡可点，同时保证外链弹窗一次触发（不会因为多个 `<a>` 重复触发）

### 2026-08-11 — 顶部菜单栏新增"白の监控"外链

**改动路径**

- `src/theme.config.ts` — `nav` 数组显式配置（覆盖 `themeConfig.defaults` 的默认菜单），末尾追加白の监控项

**说明**

- `mergeThemeConfig` 对数组是整体替换而非追加，必须写完整列表
- 图标使用 `i-ri-computer-line`（remixicon 已安装，无需额外依赖）
- `nav` 中所有图标由 `uno.config.ts` 的 `collectConfigIcons()` 自动纳入 safelist
