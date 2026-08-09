---
title: 从 Jekyll 到 Astro：两个博客的技术栈对比
date: 2026-08-06
description: 我的旧博客用 Chirpy Jekyll 主题，新博客换成了 Astro + Svelte 5 + UnoCSS。这篇把两代技术栈拆开摆在一起，比较它们的语言、构建、样式、Markdown 处理和部署方式。
tags: [Jekyll, Astro, Svelte, 博客, 技术栈]
categories: [科技, 博客]
cover: ../assets/images/cover-4.avif
draft: false
---

我有两个博客。旧的那个还在跑，用的是 Chirpy Jekyll 主题，地址 https://goway128.club/goway128two/ ，仓库 goway128/goway128two 。新的这个就是你正在看的站，用 Astro 加 ShokaX 风格重写，仓库 goway128/astro-blog-shokax-white-move 。

两边写的都是 Markdown，但从写作者往下一层看，技术栈几乎没有重合。

**旧站跑在 Ruby 上，新站跑在 Bun 上。旧站模板是 Liquid，新站模板是 Astro 组件加 Svelte。旧站样式是 SCSS，新站样式是 UnoCSS 原子类。中间那一层 Markdown 处理，两边也换了引擎。**

## 生成器：Jekyll 7 vs Astro 7

Jekyll 是 2008 年出的 Ruby 静态站点生成器。Chirpy 主题把它包装成一份现成模板，Gemfile 里锁 `jekyll-theme-chirpy ~> 7.0`，再拉一批 gem：`jekyll-paginate`、`jekyll-seo-tag`、`jekyll-archives`、`jekyll-sitemap`。整个 build 是一个 Ruby 进程从 `_posts` 读文件，套 Liquid 模板，写出 `_site`。

Astro 是 2021 年出的静态优先框架，2024 年之后加了岛屿架构、Server Islands、View Transitions。新站锁的是 `astro@7.0.6`，配套用 `@astrojs/mdx`、`@astrojs/sitemap`、`@astrojs/svelte`、`@astrojs/rss` 这些一等公民集成。它默认把每一页编译成静态 HTML，只在你显式声明 `client:load` 的组件处注入 JS。

从写作者视角看这一层几乎没差别：往 `_posts/` 或 `src/posts/` 扔一个 `.md`，剩下的都是别人的问题。从改主题的人视角看差别很大：一边写 Ruby，一边写 TypeScript。

## 主要语言：Ruby vs TypeScript

旧站的技术栈是 Ruby 加 Liquid。Chirpy 内部十多个 Ruby 插件把 Jekyll 的扩展点用满了，想改点什么就得动 Ruby。

新站几乎不写 Ruby。`theme.config.ts` 是 TypeScript，`src/components/*.astro` 是 Astro 组件，交互组件是 Svelte 5。项目根 `package.json` 里 `packageManager: bun@1.3.12`，运行时和包管理都是 Bun。

写文章两边一样。改主题时，我从 Ruby 生态整体切到了 JavaScript 生态。

## 模板：Liquid vs Astro + Svelte

Chirpy 的每个页面是 HTML 混 Liquid：

```liquid
{% for post in site.posts limit:5 %}
  <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
  <time>{{ post.date | date: "%Y-%m-%d" }}</time>
{% endfor %}
```

Liquid 能循环能判断，做不了交互。想加动效或者动态组件，只能在页面末尾塞一段 vanilla JS。

Astro 的模板长这样：

```astro
---
import { getCollection } from "astro:content";
const posts = (await getCollection("posts")).slice(0, 5);
---
{posts.map((post) => (
  <article>
    <h2><a href={`/posts/${post.id}/`}>{post.data.title}</a></h2>
    <time>{post.data.date.toISOString().slice(0, 10)}</time>
  </article>
))}
```

看着像 JSX，跑起来是纯静态 HTML。需要交互的地方直接写 Svelte 5 组件，用 `$state` / `$props` / `$effect` 那套 runes：

```svelte
<script lang="ts">
  let { open = false } = $props();
  let count = $state(0);
</script>

{#if open}
  <button onclick={() => count++}>点了 {count} 次</button>
{/if}
```

新站里搜索框、代码折叠、Tabs 切换、加密文章解密都是这么写的。

## 样式：SCSS vs UnoCSS

Chirpy 走 SCSS 组织。`_sass/` 下几十个片段编到一份 CSS，写法是给类起名字然后写规则：

```scss
.post-content {
  h2 {
    font-size: 1.5rem;
    margin-top: 2em;
  }
  code {
    background: #f5f5f5;
    padding: 2px 4px;
  }
}
```

新站用 UnoCSS 的 Wind4 预设，原子类直接写在模板里：

```astro
<article class="prose max-w-none">
  <h2 class="text-2xl mt-8">标题</h2>
  <code class="bg-neutral-100 px-1 py-0.5">inline</code>
</article>
```

我的观察：写新页面时原子类快，改配色主题时集中的 SCSS 更好维护。两种做法各占一边，没有谁替代谁。

## Markdown：Kramdown + Rouge vs satteri + Shiki

Jekyll 用 Kramdown 解析 Markdown，用 Rouge 做代码高亮。Rouge 是纯 Ruby 的高亮器，输出带 CSS class 的 HTML，颜色靠 Sass 主题控制。

新站用 satteri（一个基于 remark / rehype 生态的处理器），代码高亮换成 Shiki。Shiki 直接把颜色内联到 HTML，产物大，运行时零开销，还能挂 transformer 做扩展。下面这几种写法都是新站原生支持的：

```ts {1,3-5}
const enable = true; // [!code highlight]
const oldName = "hewwo"; // [!code --]
const newName = "hello"; // [!code ++]
console.warn("careful"); // [!code warning]
```

Rouge 写不出这些，只能靠自定义 CSS 类模仿。

提示框语法两边也不一样。Chirpy 用 Kramdown IAL：

```markdown
> 这是一段提示
{: .prompt-info }
```

新站用 CommonMark directive：

```markdown
:::info title="提示"
这是一段提示
:::
```

数学公式的处理更能拉开差距。Chirpy 靠 MathJax 客户端渲染，页面到达浏览器后再算一遍公式。新站在 satteri 处理阶段跑 KaTeX，写出的 HTML 里已经是公式的最终形态，浏览器不用再算。

## 包管理与运行时

| 项 | 旧站 | 新站 |
|----|------|------|
| 语言运行时 | Ruby 3.x | Bun 1.3.12 |
| 包管理器 | Bundler + RubyGems | Bun 内置 |
| 依赖清单 | Gemfile / Gemfile.lock | package.json / bun.lock |
| 首次安装耗时 | 分钟级（部分 gem 需要本机编译） | 秒级 |
| 常用命令 | `bundle exec jekyll serve` | `bun dev` |

Bun 除了当包管理器还当运行时。dev、build、test 都由 `bun run xxx` 拉起，不用另装 Node。

## 部署

Chirpy Starter 默认走 GitHub Pages 加 GitHub Actions。仓库里放一个 `pages-deploy.yml`，push 到 main 后 Actions 拉一个 Ruby 环境、跑 `jekyll build`、把 `_site` 推到 `gh-pages` 分支。整条链路 2 到 5 分钟。

新站直接连 Vercel。把 GitHub 仓库授权给 Vercel 一次，之后每次 push 触发一次构建，30 到 90 秒之内上线。免费额度覆盖个人博客的全部流量。

## 搜索

Chirpy 内置的搜索是 Simple-Jekyll-Search：把所有文章的标题、正文导出到一个 JSON，客户端加载后本地匹配。文章过一百篇后 JSON 会膨胀到几百 KB。

新站用 Pagefind。它在构建后扫 `dist/`，为每篇文章生成分片索引，运行时按需加载。500 篇的站点首次搜索加载不到 100 KB。

## 交互能力

两代技术栈在这里差距最大。

Chirpy 的所有"交互"都是脚本挂页面：夜间模式切换、目录高亮、返回顶部按钮。想加一个稍复杂的组件，得手写 vanilla JS 或者引进 jQuery。

新站的交互写 Svelte 组件，标注 `client:load` / `client:visible` / `client:idle` 决定何时 hydrate。评论框只在滚到底部时加载；搜索框第一次点击时加载；首屏的公告轮播直接跟着页面 hydrate。这些控制在 Chirpy 上做不到。

## 迁移的账

我从 Chirpy 迁到现在这套，前后花了两周。真正吃时间的不是学 Astro，是磨旧文章的 frontmatter 差异（Chirpy 用 `tags` / `categories`，新站的 schema 更严一点），以及把老图床搬到 CDN。

新站带来的收益：

- Cold build 快，Astro 15 秒左右，Jekyll 40 秒起步
- 需要交互的场景上不封顶
- 类型安全，改 `theme.config.ts` 时 IDE 会告诉我漏了什么字段

新站带来的代价：

- 依赖多，Astro + Svelte + UnoCSS + Bun 加插件一堆
- Node / Bun 生态半年就变一次样，跟着升要花时间
- 出问题时报错栈比 Ruby 长

## 什么情况下应该选哪个

**如果你写的是纯文字、图片、代码块，Chirpy 已经够用，Ruby 生态成熟、依赖少、部署路径最短。学一次 Bundler 之后基本不用回头。**

**如果你打算在页面里加互动组件、自定义 Markdown 语法、细控构建流程，Astro 让这些变得便宜。代价是要能忍受 Node / Bun 生态本身的抖动。**

**两代博客都能"发一篇 Markdown"，差别在这条链路继续往下延伸时会长成什么样。选栈的时候别按流行度选，按你打算做的事选。只写字的人在 Chirpy 上照样过得很好；想动手改主题、加功能的人在 Astro 上手更快。**

