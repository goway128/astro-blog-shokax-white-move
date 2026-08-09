---
title: 什么是 RAG：给大模型接上一个外挂知识库
date: 2026-08-03
description: RAG 把检索和生成拼在一起，让模型能回答训练数据里不存在的问题。这篇讲清楚它的三段结构、为什么要 chunk、以及从最朴素的实现到加了 rerank 的形态之间发生了什么。
tags: [RAG, 检索, LLM]
categories: [科技, AI]
cover: ../assets/images/cover-5.avif
draft: false
---

RAG 是 Retrieval-Augmented Generation 的缩写，2020 年由 Meta 提出，如今已经是给大模型接私域知识最主流的做法。这篇从最朴素的实现开始，一步步演化到工业界常用的形态。

**RAG 是一种在生成前先做检索、把检索到的相关片段拼进提示词、再让模型生成回复的方法。**

它解决的问题是：模型的参数里只固化了训练截止日之前的公开知识，但真实业务里你要问的是公司内部文档、昨天的日志、客户的资料。这些内容模型不可能知道，光靠 prompt 全塞进去又会超上下文、贵、慢。

RAG 的做法是：把海量知识存到外部索引里，每次提问只捞出最相关的几段拼进 prompt，让模型基于这几段回答。

## 三段结构

一个 RAG 系统跑起来分三步：

1. **检索（Retrieval）**：把用户问题变成一个查询，从索引里捞出相关的若干片段。
2. **增强（Augmentation）**：把这些片段拼进 prompt，形成新的上下文。
3. **生成（Generation）**：模型基于这个上下文生成回复。

看起来平淡，但每一步都有工程细节可以磨。

## 最朴素的版本

先看一个能跑但很粗糙的实现。假设你有一堆技术文档想让 LLM 能答：

```python
def naive_rag(question: str, docs: list[str]) -> str:
    context = "\n\n".join(docs)
    prompt = f"根据以下资料回答问题：\n\n{context}\n\n问题：{question}"
    return llm.chat(prompt)
```

这版有两个问题：

- **docs 全塞进去**，超上下文只是时间问题。
- **没有相关性判断**，无关内容也一起进 prompt，模型会被带偏。

## 加上向量检索

第一次真正的 RAG 长这样：

```python
def basic_rag(question: str, index) -> str:
    query_vec = embed(question) # [!code ++]
    chunks = index.search(query_vec, top_k=5) # [!code ++]

    context = "\n\n".join(c.text for c in chunks)
    prompt = f"根据以下资料回答问题：\n\n{context}\n\n问题：{question}"
    return llm.chat(prompt)
```

绿色的两行是关键变化：把问题转成向量，从向量索引里捞出语义最接近的 5 段。

要让 `index.search` 能用，事先要做一遍**索引构建**：

```python
def build_index(docs: list[str], index):
    for doc in docs:
        for chunk in split(doc, size=500, overlap=50): # [!code highlight]
            vec = embed(chunk)
            index.add(vec, chunk)
```

高亮那行就是 chunk 的核心：把长文档切成 500 字左右、有 50 字重叠的小段。切法直接决定检索质量。

## 为什么要 chunk

如果不切，直接把整篇文档作为一个向量：

- 一个向量要表达一整篇文档的全部语义，信息被压平。
- 检索命中时返回整篇文档，token 消耗爆炸。

如果切得太细（比如每句话一个 chunk）：

- 上下文被砍碎，检索到的句子脱离原语境。
- 索引膨胀，查询变慢。

工程上 500~1000 字是常见起点，配合 10%~20% 的 overlap 防止关键句被切在边界上。文档结构清晰时按标题切效果更好，非结构化文本才用固定长度。

## 检索的两条路

向量检索不是唯一选项。实际系统里往往两种一起用：

| 方法 | 擅长 | 短板 |
|------|------|------|
| 向量检索（Embedding） | 语义相近但用词不同的匹配 | 精确关键词、专有名词 |
| 关键词检索（BM25） | 精确匹配、专有名词、代码符号 | 同义改写、语义泛化 |

一个纯向量的系统查"K8s 的 pod 重启策略"，可能捞回一堆讲"容器编排"的段落但漏掉直接讲 pod 的那篇。反过来纯 BM25 又会漏掉说"kubernetes 中 pod 的 restart policy"的段落。

工业界的做法是混合检索：两种各捞一批，合并后统一打分。

## 加上 Rerank

再进一步，是在检索之后加一层重排：

```python
def rag_with_rerank(question: str, index) -> str:
    query_vec = embed(question)
    candidates = index.search(query_vec, top_k=30)

    scored = reranker.score(question, [c.text for c in candidates]) # [!code highlight]
    chunks = [c for c, _ in sorted(zip(candidates, scored), key=lambda x: -x[1])[:5]]

    context = "\n\n".join(c.text for c in chunks)
    prompt = f"根据以下资料回答问题：\n\n{context}\n\n问题：{question}"
    return llm.chat(prompt)
```

Reranker 是一个专门的小模型（通常是 cross-encoder），它把问题和每个候选段落一起喂进去，输出一个精确的相关性分数。它比向量检索准，但慢，只适合处理少量候选。

标准套路是：向量检索先粗筛 30 个，rerank 精排出前 5 个。这个组合能显著提升命中质量。

## 常见的坑

**chunk 切在句子中间**。用固定长度切时，容易把一句话从中间劈开。解决办法是切分时对齐到句号、换行等分隔符，长度作为上限而不是硬边界。

**embedding 模型和领域不匹配**。用通用 embedding 处理专业术语（法律、医疗、代码）时相似度会失真。要么用领域 embedding，要么在关键词检索上补足。

**问题和文档表达差异大**。用户问"密码忘了怎么办"，文档里写的是"账户恢复流程"。这种时候可以先让 LLM 把用户问题改写或扩写成几种变体，分别检索再合并（HyDE、Query Rewriting）。

**只看召回，不看生成**。检索命中不等于回答正确。模型可能没看懂片段，可能被无关片段带偏，可能片段之间矛盾。评估 RAG 要同时看检索指标（recall、MRR）和生成指标（答对没答对、有没有幻觉）。

**忘了权限**。多租户系统里 RAG 一定要在检索层就做隔离，否则 A 用户可能问出 B 用户的文档。这是 RAG 系统最常见的安全事故来源。

## 什么时候用 RAG

**合适的场景**：

- 知识量大、频繁更新，塞不下上下文，也不适合微调。
- 需要引用出处、需要审计。RAG 天然能返回"这段回答来自哪个文档"。
- 私域数据不能进训练集，只能挂外部索引。

**不太合适的场景**：

- 问题不需要外部知识，直接问模型更快。
- 知识极少（一两页 PDF），塞进 prompt 更简单可靠。
- 问题需要跨文档推理和综合。RAG 擅长找相关片段，不擅长把 10 个片段拼成一个新结论。这种场景考虑 Agent 或 GraphRAG。

## 和其他方案的边界

| 方案 | 适用场景 |
|------|---------|
| Long Context | 知识量能塞进上下文，且愿意为长 prompt 付费 |
| Fine-tuning | 想改变模型的**风格、格式、思维路径** |
| RAG | 想让模型使用**外部、可更新、需要引用**的知识 |
| Agent + 工具 | 知识存在结构化系统里（数据库、API），需要主动查询 |

它们不互斥，实际系统里经常同时存在。

## 一些工程经验

- **先用最朴素的版本跑起来**。向量库 + top-k，不加 rerank、不加 hybrid，先看命中率能到哪。看到具体错例再决定加什么。
- **给模型看到检索片段的机会，也给模型说"没找到"的机会**。prompt 里明确写"如果资料里没有相关信息就说不知道"，能大幅降低幻觉。
- **保留来源**。每个 chunk 存好文档 id 和位置，回答时能标注来源。用户信任度和调试效率都会提升。
- **评估不能只靠人眼**。搭一个小的评测集，问题 + 期望答案 + 期望命中的文档，每次改动都跑一遍，防止改一处坏三处。
- **别过早追新技术**。GraphRAG、多跳检索、agentic retrieval 在特定场景确实有效，但基础没打牢时上这些只会让问题更难定位。

## 写在最后

RAG 的技术门槛不高，做出一个能跑的原型只要几十行代码。但把它做**准、快、稳、可维护**，是另一件事。真正拉开差距的是数据处理（怎么切、怎么清洗）、检索策略（混合、rerank、改写）、以及评估体系。

模型每一代都在变强，RAG 的角色也在调整。上下文变长后有人喊"RAG 死了"，但只要私域数据、审计需求、成本约束存在，RAG 就还有位置。它不是终极方案，只是一个务实的中间态。

