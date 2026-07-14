---
title: 什么是 Skills：让 AI 拥有"专长"的新范式
date: 2026-06-24
description: Skills 是一组装着指令、脚本和资源的文件夹，让 Claude 在需要时自动加载，把自己变成某个领域的"专家"。
tags: [Skills, Claude, AI]
categories: [科技, AI]
cover: ../assets/images/cover-9.avif
draft: false
---

如果说过去两年大模型的故事是"越来越聪明",那么 2025 年下半年开始的故事,则是"越来越专业"。Skills(技能)就是这个新故事里的一个关键词。

它最早由 Anthropic 在 2025 年 10 月推出,正式名称是 **Agent Skills**。简单一句话概括:

> Skills 是一组装着指令、脚本和资源的文件夹,Claude 会在需要时自动加载它们,从而把自己变成某个领域的"专家"。

听起来很普通,但它代表了一种和 Prompt、RAG、MCP 都不完全相同的新思路。下面我从几个角度聊聊它。

## 一、Skills 到底是什么

一个 Skill 就是一个文件夹,里面通常长这样:

```
my-skill/
├── SKILL.md          # 入口文件,说明这个技能是干嘛的、什么时候用
├── reference.md      # 可选的参考资料
├── scripts/          # 可选的可执行脚本
│   └── convert.py
└── assets/           # 可选的模板、样例文件
    └── template.xlsx
```

其中最关键的是 `SKILL.md`。它有一段 YAML 头部,声明这个技能的名字、描述、触发条件;后面则是给模型读的自然语言说明书,告诉它"遇到这种任务,按这个流程做"。

模型在工作时并不会一次性把所有 Skill 全部读进上下文,而是先"扫一眼"目录,只在判断某个 Skill 与当前任务相关时,才真正加载它的内容。Anthropic 把这种机制叫做 **progressive disclosure(渐进式披露)**。

## 二、为什么需要 Skills

要理解 Skills,可以把它和已有的几种增强手段对比一下。

- **Prompt**:把所有要求塞在一次对话里,简单直接,但容易超长、难以复用,也无法跨会话稳定。
- **RAG / 知识库**:擅长"查事实",但不擅长"教流程"。它能告诉模型"公司有这条规定",却很难让模型按某种风格、按某个步骤产出结果。
- **MCP / Tools**:擅长"调外部能力",比如查数据库、调 API。它解决的是"能做什么",而不是"怎么做得好"。
- **Skills**:介于两者之间,既能写入流程和规范,又能携带脚本、模板和参考资料,是一种"可被随取随用的专业知识包"。

打个比方:Prompt 像是临时贴的便利贴,RAG 像是公司的内部 Wiki,MCP 像是接通的外部系统,而 Skill 更像是入职培训手册加上配套工具箱。

## 三、Skills 的几个核心特性

官方对 Skills 的描述里,有四个词反复出现:

1. **Composable(可组合)**:多个 Skill 可以同时存在,模型会自己判断该用哪些、怎么配合。比如"按公司品牌排版"+"生成 Excel 报表"可以叠加使用。
2. **Portable(可移植)**:同一份 Skill 在 Claude 应用、Claude Code、API 里都能用。写一次,到处跑。
3. **Efficient(高效)**:只在相关时才加载,不会因为你装了一百个 Skill 就把上下文撑爆。
4. **Powerful(强大)**:Skill 里可以带可执行脚本。对那些"用代码做比让模型生成更可靠"的任务(比如解析 PDF、操作表格),直接交给脚本完成。

## 四、Skills 长什么样:一个最小例子

下面是一个最小化的 `SKILL.md` 示例,假设我们要让 Claude 帮我们按团队规范写 Git 提交信息:

```markdown
---
name: conventional-commits
description: 当用户让我写 Git 提交信息,或者整理 commit message 时,使用本技能。
---

# Conventional Commits

请按 Conventional Commits 规范输出,格式为:

`<type>(<scope>): <subject>`

常用 type:
- feat: 新功能
- fix: 修 bug
- docs: 文档
- refactor: 重构
- test: 测试
- chore: 杂项

要求:
- subject 用英文,小写开头,不加句号
- 超过 72 个字符时,补充 body 段落说明动机和影响
```

当用户说"帮我写一条提交信息"时,Claude 会扫到这个 Skill 的 description,判断匹配,然后按里面的规则输出。无需在每次对话里重复粘贴规范。

## 五、Skills 用在哪里

Anthropic 把 Skills 铺到了几乎所有 Claude 产品里:

- **Claude 应用(Pro / Max / Team / Enterprise)**:自带一些常用 Skill,比如生成 Excel、PowerPoint、Word、可填写 PDF;也可以自己创建。
- **Claude Developer Platform(API)**:可以在 Messages API 中挂载 Skill,配合 Code Execution Tool 在沙箱里运行脚本。
- **Claude Code**:通过插件市场安装,或者把 Skill 放进 `~/.claude/skills`,Claude Code 会在合适的时候自动调用。
- **Claude Agent SDK**:自己搭智能体时,也能使用同一套 Skill 格式。

更值得注意的是,2025 年 12 月,Anthropic 把 Agent Skills 作为一个**开放标准**发布到了 `agentskills.io`,意图让它跨平台通用,而不只是 Claude 的私有格式。

## 六、Skills 适合做什么,不适合做什么

适合的场景:

- 把组织或个人的工作流程沉淀下来,例如代码评审清单、文档模板、品牌规范。
- 让模型稳定地操作某类文件,例如生成符合公司样式的 Excel、PPT、PDF。
- 在多个项目里复用同一套"做事方法",比如 issue 三段式分诊流程、bug 复现脚本。
- 让脚本承担确定性任务,把模型解放出来做判断和沟通。

不太适合的场景:

- 需要实时外部数据时,这是 MCP 和工具调用更擅长的事。
- 需要大规模知识检索时,RAG 仍然是主力。
- 一次性的简单任务,直接写 Prompt 就够了,不必上 Skill。

## 七、一个值得留意的安全提示

因为 Skills 可以包含可执行代码,Anthropic 在官方文章里反复强调一句话:**只使用来自可信来源的 Skill**。

这点和浏览器扩展、VS Code 插件是同一个逻辑。Skill 越强大,执行环境越广,越需要清楚自己装进来的是什么。

## 八、写在最后

我自己的感受是,Skills 真正有意思的地方,不在于"它能做什么",而在于它把"如何让 AI 做一件事"这件事**变成了一种可分享、可版本化、可组合的资产**。

Prompt 是个人的笔记,Skills 更像团队的标准作业程序。当越来越多人开始把自己的工作流写成 Skill 时,我们可能会看到一个新的生态:不是模型本身在卷,而是围绕模型的"专业知识包"在卷。

如果你也在用 Claude,可以试着把自己每天重复的一两件事写成一个 Skill。哪怕只是一个简单的 Markdown 文件,也能在下一次工作时少敲十几行 Prompt。

> 参考资料:
> - Anthropic 官方博客 *Introducing Agent Skills* (2025-10-16)
> - Anthropic Engineering: *Equipping agents for the real world with Agent Skills*
> - Agent Skills 开放标准: agentskills.io
