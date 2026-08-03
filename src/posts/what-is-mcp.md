---
title: 什么是 MCP：让 AI 应用共享工具的协议
date: 2026-08-01
description: MCP 是一个开放协议，让不同的 LLM 应用可以复用同一套工具。这篇讲清楚它的三方模型、与 Function Calling 的边界、以及一个最小 Server 长什么样。
tags: [MCP, LLM, 协议]
categories: [科技, AI]
cover: ../assets/images/cover-3.avif
draft: false
---

Anthropic 在 2024 年 11 月开源了 Model Context Protocol，一年过去，它已经是 LLM 应用里默认要考虑的一块。这篇讲清楚它是什么、和 Function Calling 的边界在哪、以及一个最小的 Server 长什么样。

## 一句话定义

> MCP（Model Context Protocol）是一个开放协议，规定了嵌入了大模型的应用如何和外部进程互相声明能力、传输数据、调用工具。

它不是模型能力，也不是框架，只是一份"接线规范"。任何应用只要按这份规范说话，就能挂上任何按这份规范提供能力的进程。

## 为什么需要一层协议

在 MCP 出现之前，每个 LLM 应用都自己发明一套工具接入方式。Cursor 有自己的插件，Claude Desktop 有自己的扩展，IDE 里的 Copilot 又是另一套。写一个"读取本地文件"的能力，得给每个客户端各实现一遍。

问题不在于工作量，而在于生态被切开。写一个内部的公司数据库查询工具，只能挂到一个客户端里。换个 LLM 应用，前面的工作等于白费。

MCP 想解决的正是这件事：让能力和客户端解耦。写一次 Server，任何支持 MCP 的客户端都能挂载。

## 三方模型

MCP 里有三个角色：

- **Host**：嵌入了大模型的应用本身，例如 Claude Desktop、Cursor、Zed。
- **Client**：Host 内部为每个连接维护的一个实例，一个 Host 可以持有多个 Client。
- **Server**：一个独立进程，声明自己能提供哪些工具、资源、提示词。

Server 有三种可暴露的东西：

| 类型 | 说明 | 典型例子 |
|------|------|---------|
| Tools | 模型可以调用的函数 | 查数据库、发消息、执行命令 |
| Resources | 模型可以读取的数据 | 一份文档、一段日志、一张表 |
| Prompts | 预设的提示词模板 | "以代码评审的口吻回复" |

其中 Tools 是目前用得最广的。

## 和 Function Calling 的差别

这是最容易混的一点。

Function Calling 是**模型的能力**，模型根据工具的 schema 决定要不要调用、传什么参数。它规定的是"模型和工具之间怎么对话"。

MCP 是**应用间的协议**，规定的是"提供工具的进程和使用工具的应用之间怎么对话"。它并不关心模型本身怎么理解工具。

一次真实的调用链路是这样：

```
用户 → Host 应用 → LLM（决定要调用哪个工具，用 Function Calling）
                  ↓
                  MCP Client → MCP Server → 实际执行 → 返回结果
                  ↑
                  LLM（继续生成回复）
```

Function Calling 决定"调什么"，MCP 决定"这个工具从哪里来、怎么调到它"。两层不冲突，各管一段。

## 一个最小 Server

官方给了 Python 和 TypeScript 两个 SDK，下面是一个只提供一个 `get_weather` 工具的 Server。

:::code-group

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

@mcp.tool() # [!code highlight]
def get_weather(city: str) -> str:
    return f"{city}: sunny, 26°C"

if __name__ == "__main__":
    mcp.run()
```

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "weather", version: "1.0.0" });

server.tool( // [!code highlight]
  "get_weather",
  { city: z.string() },
  async ({ city }) => ({
    content: [{ type: "text", text: `${city}: sunny, 26°C` }],
  }),
);

await server.connect(new StdioServerTransport());
```

:::

高亮的那行就是 MCP 的核心：把一个普通函数登记成模型可见的工具。剩下的握手、schema 声明、stdio 通信全部由 SDK 处理。

在 Claude Desktop 里挂上这个 Server，只需要一段配置：

```json
{
  "mcpServers": {
    "weather": {
      "command": "python",
      "args": ["/path/to/weather_server.py"]
    }
  }
}
```

同一份 Server 换到 Cursor 或其他客户端，配置格式类似，Server 本身不用改。

## 传输层

MCP 规定了两种传输方式：

- **stdio**：Server 作为子进程被 Host 拉起，双方通过标准输入输出通信。适合本地进程。
- **HTTP + SSE**：Server 作为独立服务，Host 通过网络连接。适合远程服务、多客户端共享。

绝大多数本地工具走 stdio 就够了。需要多人共用一份 Server 时，才考虑 HTTP。

## 生态现状

到 2026 年，MCP 已经从 Anthropic 的私有提议变成了跨厂商的事实标准：

- **客户端**：Claude Desktop、Cursor、Zed、Continue、Windsurf、Cline 等主流 AI 编辑器都原生支持。
- **服务端**：GitHub、Notion、Slack、Postgres、Filesystem 官方 Server 由社区或厂商维护，可以直接装。
- **SDK**：Python、TypeScript、Go、Rust、Java 均有实现。

安装一个第三方 Server 前，最好读一下它的源码或权限说明——它拿到的是执行 shell、读文件、调 API 的完整能力。

## 什么时候用 MCP

**合适的场景**：

- 一组能力想跨多个 LLM 应用复用，比如把公司内部 API 封成一个 Server，团队里用不同 AI 编辑器的人都能挂。
- 能力本身是独立进程，例如数据库客户端、浏览器控制、本地脚本执行。
- 需要清晰的权限边界，Server 作为独立进程可以单独限速、限权。

**不太合适的场景**：

- 一次性任务，直接写函数交给模型调用更快。
- 只服务单个应用的能力，多一层协议就是多一层开销。
- 对延迟敏感的场景，进程间通信比直接调用总归多几毫秒。

## 一些工程经验

- **Server 越薄越好**。让 Server 只做参数校验和调用，业务逻辑留在 Server 依赖的库里。这样同一套逻辑既能给 MCP 用，也能给别的地方用。
- **工具描述要写清楚**。`description` 字段是模型判断"什么时候用这个工具"的唯一依据。模糊的描述会让模型乱调。
- **返回值要结构化**。避免把结果全部塞进一段自然语言，尽量返回字段清晰的文本或 JSON，让模型少猜。
- **错误信息要可读**。工具失败时返回一段模型能看懂的说明，模型可以据此重试或换路径。抛一个二进制堆栈跟踪没有意义。
- **本地 Server 优先 stdio**。除非有明确的远程需求，不要一上来就上 HTTP，会自找麻烦。

## 写在最后

MCP 的价值不在协议本身有多精巧，而在它让 AI 应用第一次有了共享工具生态的可能。写一个 Server，全网的 AI 客户端都能用。

对开发者来说，MCP 值得作为默认选项：新工具优先考虑封成 Server，即便暂时只在一个应用里用，未来也留着一条通路。

> 参考资料：
> - Model Context Protocol 官方文档：modelcontextprotocol.io
> - Anthropic *Introducing the Model Context Protocol* (2024-11-25)
> - MCP Python SDK: github.com/modelcontextprotocol/python-sdk
