---
title: 什么是 Function Calling：让模型说结构化的话
date: 2026-08-04
description: Function Calling 让大模型能返回结构化的工具调用请求，而不是自由文本。这篇讲清楚它怎么工作、schema 怎么写、以及为什么它是 Agent 时代最重要的一层能力。
tags: [Function Calling, LLM, Tool Use]
categories: [科技, AI]
cover: ../assets/images/cover-1.avif
draft: false
---

Function Calling 是 OpenAI 在 2023 年 6 月推出的能力，Anthropic 那边叫 Tool Use，Google 叫 Function Declarations，指的都是同一件事。它是 Agent、MCP、以及绝大多数"能干活"的 LLM 应用的地基。

## 一句话定义

> Function Calling 是让模型根据一组工具描述，返回一段结构化 JSON 表示"我要调用哪个工具、传什么参数"的能力。

它不改变模型的推理，它改变的是**模型输出的形状**。原本模型只会吐自然语言，加了 Function Calling 后，它可以在需要时吐一段严格符合 schema 的 JSON。

## 没有它的时候是什么样

在 Function Calling 出现之前，让模型"调用工具"要靠 prompt 硬约定：

```python
prompt = """
你是一个助手。需要查天气时，输出以下格式：
CALL: get_weather(city="北京")
其他情况正常回答。
"""

response = llm.chat(prompt + user_input)

if response.startswith("CALL:"):
    call_str = response[5:].strip()
    match = re.match(r"(\w+)\((.*)\)", call_str) # [!code error]
    fn_name = match.group(1)
    args = eval(match.group(2)) # [!code error]
```

标红的两行是这种做法的死穴：正则和 `eval` 面对模型的自由发挥毫无防御力。模型可能写成 `CALL:get_weather(city='北京')` 也可能写成 `我需要调用 get_weather，参数是北京`。每一种变体都要写 fallback，写到最后发现是在给模型做体力活。

Function Calling 把这一层完全抹掉：模型直接返回一个保证合法的 JSON，你直接解析就行。

## 三步循环

一次 Function Calling 调用走三步：

1. **声明工具**：把工具的名字、描述、参数 schema 传给模型。
2. **模型决定**：模型看到用户问题后，要么直接回答，要么返回一个 tool_call 请求。
3. **执行并回传**：你执行工具，把结果作为新一轮消息传回模型，模型基于结果生成最终回复。

一个完整例子：

```python
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "查询指定城市的当前天气",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名，例如 北京"}
            },
            "required": ["city"],
        },
    },
}]

messages = [{"role": "user", "content": "北京今天天气怎么样？"}]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools,
)

tool_call = response.choices[0].message.tool_calls[0] # [!code highlight]
args = json.loads(tool_call.function.arguments) # [!code highlight]
weather = get_weather(**args)

messages.append(response.choices[0].message)
messages.append({
    "role": "tool",
    "tool_call_id": tool_call.id,
    "content": weather,
})

final = client.chat.completions.create(model="gpt-4o", messages=messages)
print(final.choices[0].message.content)
```

高亮的两行是关键：`tool_calls` 是数组，`arguments` 是保证能被 `json.loads` 解析的字符串。不用正则、不用 eval、不用担心格式漂移。

## Schema 决定了一切

工具的 schema 是模型判断"什么时候用、传什么参数"的唯一依据。写好 schema 比换更强的模型收益更大。

一份糟糕的 schema：

```json
{
    "name": "search",
    "description": "搜索",
    "parameters": {
        "type": "object",
        "properties": {
            "q": {"type": "string"}
        }
    }
}
```

模型看到这个几乎什么都判断不出来：搜什么？搜哪里？`q` 是什么？

改好之后：

```json
{
    "name": "search_internal_docs", // [!code ++]
    "description": "在公司内部文档库中检索。适用于用户问及内部流程、规范、产品细节时。不要用于外部知识查询。", // [!code ++]
    "parameters": {
        "type": "object",
        "properties": {
            "query": { // [!code ++]
                "type": "string", // [!code ++]
                "description": "查询关键词，用自然语言短语" // [!code ++]
            },
            "top_k": {
                "type": "integer",
                "description": "返回结果数，默认 5，最多 20",
                "default": 5
            }
        },
        "required": ["query"]
    }
}
```

变化里最重要的是 description。模型读它决定"什么场景用这个工具"，一句"搜索"和一句"在公司内部文档库中检索，不要用于外部知识查询"给模型的信号量是数量级的差距。

## 并行调用

现代模型（GPT-4 之后、Claude 3.5 之后）都支持一次返回多个 tool_call。用户问"北京和上海的天气怎么样？"，模型会一次返回两个 `get_weather` 调用，两个可以并行执行。

```python
tool_calls = response.choices[0].message.tool_calls

results = await asyncio.gather(*[
    execute_tool(tc) for tc in tool_calls
])

for tc, result in zip(tool_calls, results):
    messages.append({
        "role": "tool",
        "tool_call_id": tc.id,
        "content": result,
    })
```

如果按顺序执行两个独立调用，延迟直接翻倍。默认写并行。

## 常见的坑

**description 写太笼统**。"处理数据"、"获取信息"这类描述模型基本没法判断适用场景，结果就是要么该用不用，要么乱用。

**参数用 optional 太多**。所有参数都可选时，模型经常漏传关键参数。真正必需的字段放进 `required`，别偷懒。

**返回值扔一坨自然语言**。工具返回 `"北京今天天气不错，气温 26 度左右，风力适中……"` 这种散文，模型下一轮解析容易出错。返回 `{"city": "北京", "temp": 26, "condition": "sunny"}` 更稳。

**错误一律抛异常**。工具失败时应该返回一段模型能读懂的说明，比如 `{"error": "city not found", "hint": "请确认城市名拼写"}`，让模型有机会重试或换路径。抛堆栈跟踪没有意义，模型看不懂也改不了。

**枚举值不用 enum**。参数只接受几个特定值时，直接在 schema 里写 `"enum": ["sunny", "cloudy", "rainy"]`。模型会严格挑，比在 description 里写"只能是这几个"可靠得多。

**忘了强制模式**。OpenAI 有 `tool_choice="required"`，Anthropic 有 `tool_choice={"type": "any"}`，可以强制模型必须调用工具。做纯 Agent 循环时经常需要。

## 和 Structured Output 的关系

Function Calling 的底层能力是"让模型输出符合 schema 的 JSON"，这个能力被独立抽出后就是 Structured Output（JSON Mode / Response Format）。

区别在意图：

| 能力 | 目的 |
|------|------|
| Function Calling | 模型自主决定**何时**输出一段结构化 JSON 表示"调工具" |
| Structured Output | 强制模型的**最终回复**符合某个 schema |

两者可以叠加：一个工具的返回可以强制走 Structured Output，让内部流转更稳。

## 和 MCP 的关系

上一篇讲 MCP 时说过：Function Calling 决定"调什么"，MCP 决定"这个工具从哪里来、怎么调到它"。

具体分工：

- 你有一个工具想让模型用 → Function Calling 就够了，直接在代码里声明 schema。
- 你有一批工具想跨多个 LLM 应用复用 → 用 MCP 封装，各客户端挂载后，MCP Client 会在内部转成 Function Calling 的 schema 交给模型。

两层之间的转换是 MCP SDK 做的，写业务时通常不需要关心。

## 一些工程经验

- **工具粒度别太粗**。一个 `manage_user` 工具同时能查、能改、能删是灾难。拆成 `get_user`、`update_user`、`delete_user` 三个，schema 清晰，模型判断也准。
- **工具数量控制在 20 个以内**。工具过多时，模型会开始漏选或误选。真的需要几十个工具时，先做一层路由（例如按类别分组），或者用 MCP 让 Server 自己管理。
- **加一个 `finish` 工具**。Agent 循环里，让模型可以主动"声明完成"而不是靠外部判断，行为会稳定很多。
- **日志记全 tool_call**。每一次工具调用的入参、出参、耗时都记下来，出错时回放能省几个小时。
- **给模型看到自己的错误**。工具执行失败后把错误消息作为 tool 结果传回，模型会尝试调整参数重试，这比外部代码写重试逻辑聪明。

## 写在最后

Function Calling 是 Agent 时代的基础设施。它本身不复杂，一份好的 schema 加一段循环就是全部。但 90% 的 Agent 问题——工具选错、参数传乱、循环卡死——最后追根究底都会追回到 schema 写得不够清楚，或者错误没有回传给模型。

先把工具的 name、description、参数 schema 磨到位，再考虑上任何框架和抽象。这是唯一值得反复投入时间的地方。

> 参考资料：
> - OpenAI *Function calling and other API updates* (2023-06-13)
> - Anthropic *Tool use with Claude* 官方文档
> - OpenAI Structured Outputs 官方文档
