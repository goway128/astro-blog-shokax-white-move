---
title: 个人常用工具与服务清单
date: 2026-08-24
description: 整理我目前常用的编辑器、AI 工具、建站框架、部署平台和服务器服务，以及它们在实际工作中的分工。
tags: [工具, 开发, AI, 博客]
categories: [科技, 工具]
cover: ../assets/images/cover-15.avif
draft: false
---

我用过的工具不少，真正长期留下来的却不多。有些工具适合写代码，有些适合维护博客，还有一些只负责部署、监控或管理配置。把它们混在一起，很容易装一堆软件，最后仍然不知道该用哪个。

这篇文章整理我目前常用的工具与服务，也顺便记录它们各自负责什么。以后更换工具时，我会回来更新这份清单。

## 代码编辑器

### Visual Studio Code

[Visual Studio Code](https://code.visualstudio.com/) 是我处理前端、Markdown 和日常配置文件时最常用的编辑器。

我的博客使用 Astro、Svelte、TypeScript 和 Markdown，这些内容在 VS Code 里都有成熟的语言支持。改一篇文章、调整 `theme.config.ts`、检查 Git diff，都不需要打开更重的 IDE。

我主要用它做这些事：

- 编写 Markdown 和 MDX 文章
- 修改 Astro、Svelte、TypeScript 文件
- 查看 Git 变更
- 编辑 Docker Compose、Nginx 和其他配置文件
- 通过集成终端运行 Bun、Git 与构建命令

VS Code 的优势是启动快、扩展多，项目类型也不受限制。缺点同样来自扩展：装得太多以后，启动速度、补全质量和快捷键都会变得混乱。我现在只保留真正会用到的扩展。

### CLion

[CLion](https://www.jetbrains.com/clion/) 主要用来处理 C 和 C++ 项目。它对 CMake、代码导航、重构和调试的支持比通用编辑器完整，适合需要认真读工程结构或跟踪运行状态的项目。

小文件用什么编辑器差别不大。项目一旦涉及多个 target、复杂依赖或调试流程，CLion 的索引和工程管理就能省下不少时间。

## AI 工具

### OpenCode

[OpenCode](https://opencode.ai/) 是我目前用来协助开发和维护项目的 AI 编程工具。它可以读取仓库、搜索代码、修改文件、执行命令并检查结果，比单纯在聊天窗口里复制代码更适合真实项目。

我通常让它处理：

- 定位代码所在文件
- 修改配置或实现小功能
- 运行格式化、lint 和类型检查
- 阅读错误日志
- 检查 GitHub Pull Request
- 把开发约定写进项目文档

我不会把所有决定都交给 AI。涉及架构、隐私、安全和部署时，我会先确认它准备改哪些文件，再检查 diff 和测试结果。AI 可以提高执行速度，但最终还是要由维护者判断改动是否符合项目现状。

### CC Switch

CC Switch 用来管理和切换我本地的 AI 工具配置。不同客户端、模型提供方或接口地址经常需要不同配置，手动反复改文件容易出错，用一个专门的切换工具会省事很多。

它解决的是配置管理问题，不负责写代码。这个分工很重要：OpenCode 负责在项目里工作，CC Switch 负责让相关工具使用正确的连接配置。

## 博客与前端技术

### Astro

[Astro](https://astro.build/) 是白の小站的核心框架。它很适合内容型网站：文章可以直接写成 Markdown 或 MDX，构建后生成静态页面，部署时不需要长期运行应用服务器。

我选择 Astro 的原因很直接：

- 内容以文件形式保存在 Git 仓库里
- 静态页面加载快，部署成本低
- 可以按需引入 Svelte 等组件
- 文章迁移和备份都很直观

这个博客的文章位于 `src/posts/`。写完文章后提交到 GitHub，部署平台会重新构建站点。

### Svelte

[Svelte](https://svelte.dev/) 负责站点里的交互组件，例如弹窗、搜索、侧栏和部分动态界面。Astro 管页面和内容，Svelte 管需要在浏览器里运行的交互，两者的分工比较清楚。

这个项目使用 Svelte 5。修改交互组件时，我会沿用项目现有的 runes 写法，避免同一个仓库里同时出现多套状态管理风格。

### ShokaX

[ShokaX](https://github.com/theme-shoka-x/astro-blog-shokax) 提供博客的基础主题、布局和大量现成功能。我在它的基础上调整了导航栏、友链、页脚、隐私政策、外链提示与移动端侧栏。

主题给了我一个能用的起点，我负责把它改成适合自己的站点。保留主题项目链接，也方便以后追踪上游更新和问题修复。

### Bun

[Bun](https://bun.sh/) 是当前项目使用的 JavaScript 运行时和包管理器。开发时常用的命令包括：

```bash
bun run dev
bun run format
bun run lint
bun run check
bun run build
```

项目已经有固定脚本时，我优先运行这些脚本，不临时拼一套新的命令。这样本地和 CI 的行为更容易保持一致。

## 版本管理与代码托管

### Git

[Git](https://git-scm.com/) 负责记录每次改动。对博客来说，Git 不只是代码版本管理，也保存文章历史、配置变化和部署记录。

我会在提交前检查：

```bash
git status
git diff
```

确认没有把密码、`.env` 或无关文件提交进去，再执行 `git add`、`git commit` 和 `git push`。

### GitHub

[GitHub](https://github.com/) 用来托管仓库、接收 Pull Request，并触发后续部署。它也是我查看上游主题更新和开源项目文档的主要入口。

涉及第三方 PR 时，我不会只看“测试通过”这句话。需要检查变更文件、行为影响、安全问题，以及作者是否顺手改了与目标无关的工具链配置。

## 部署与基础设施

### Vercel

[Vercel](https://vercel.com/) 适合部署 Astro 这类前端项目。主站提交到 GitHub 后，可以由 Vercel 自动拉取、构建和发布。

静态博客放在 Vercel 的好处是维护成本低。服务器升级、进程守护和数据库备份都不需要我处理，适合长期保存正式文章。

### VPS

需要数据库、登录注册和后台管理的应用不能只靠静态托管。我目前用 VPS 运行另一套 Anheyu 博客，让它与 Astro 主站并行存在。

两个博客的分工如下：

| 站点        | 用途                             | 运行方式       |
| ----------- | -------------------------------- | -------------- |
| Astro 主站  | 正式文章、长期内容、个人页面     | 静态构建与托管 |
| Anheyu 副站 | 后台写作、用户系统、动态功能体验 | VPS 上持续运行 |

我暂时不做双向文章同步。两边都能编辑同一篇文章时，很容易出现版本冲突。若以后需要迁移，我更倾向于写一次性导入脚本，把 Markdown 单向导入 Anheyu。

### Docker Compose

[Docker Compose](https://docs.docker.com/compose/) 用来部署 Anheyu 与 PostgreSQL。它把镜像、端口、环境变量和数据卷写在一个 YAML 文件里，更新或重启时不需要重新回忆一长串参数。

我没有启用 Redis。当前站点规模不大，Anheyu 可以自动降级到内存缓存。少运行一个容器，也能减少内存占用和维护环节。

### PostgreSQL

[PostgreSQL](https://www.postgresql.org/) 保存 Anheyu 的文章、用户和站点配置。它和 Astro 的 Markdown 文件不同：删除容器不等于删除数据库，但删除 Docker 数据卷会造成数据丢失。

数据库需要单独备份，不能只备份应用目录：

```bash
docker exec anheyu_postgresql \
  pg_dump -U anheyu anheyu > backup-db.sql
```

### Nginx

[Nginx](https://nginx.org/) 负责把 `blog.life-white.uk` 的请求转发到 Anheyu 的本地端口。应用只绑定 `127.0.0.1:8091`，访客通过 80/443 端口访问，避免把管理应用的内部端口直接暴露在公网。

Nginx 还负责 HTTPS、上传大小限制、真实 IP 请求头和长连接配置。配置改完后，我会先运行 `nginx -t`，确认语法通过再 reload。

### Cloudflare

[Cloudflare](https://www.cloudflare.com/) 可以提供 DNS、CDN 和安全防护。启用代理时，需要注意真实 IP 请求头、缓存规则和证书签发。动态后台不适合缓存 HTML，否则更新后可能仍然看到旧页面。

## 站点监控

我把服务状态放在 [白の监控](https://status.life-white.uk/) 中，用来确认主站、副站或其他服务是否可以访问。

监控页面不能代替日志。它只能告诉我“服务现在能不能访问”，无法解释 Docker 容器为什么退出、数据库为什么连接失败。排障时仍然要看：

```bash
docker compose ps
docker compose logs -f anheyu
sudo systemctl status nginx
```

## 我如何选择工具

我不会因为某个工具流行就把现有流程全部换掉。只要它能解决明确的问题，并且维护成本可以接受，我才会把它留下。

目前这套组合的分工已经比较稳定：VS Code 和 CLion 负责编辑，OpenCode 协助执行，Astro 与 Svelte 构建主站，Vercel 承担静态部署，Docker Compose、PostgreSQL 和 Nginx 运行动态副站。每个工具只做自己擅长的部分，比寻找一个“什么都能做”的工具更实际。
