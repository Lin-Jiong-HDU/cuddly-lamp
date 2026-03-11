---
title: "[算法解析] X For You Feed Algorithm: X平台开源的推荐算法项目解析"
date: "2026-03-10"
excerpt: "X 的 For You 算法解析 chapter 0"
tags: ["开源", "算法", "推荐"]
---

## 项目介绍

[x-algorithm](https://github.com/xai-org/x-algorithm)
是 X 平台开源的推荐算法项目，旨在提供一个透明、可扩展的推荐系统框架，帮助开发者理解和构建个性化内容推荐系统。

> This repository contains the core recommendation system powering the "For You" feed on X. It combines in-network content (from accounts you follow) with out-of-network content (discovered through ML-based retrieval) and ranks everything using a Grok-based transformer model.

X 的 For You 算法采用了现代化的推荐系统架构，核心设计理念是**端到端学习**——系统几乎不依赖手工设计的特征，而是让模型从用户行为中自动学习。

chapter 0 是项目的总览，后续章节会深入各个组件的实现细节。

## 项目架构

文件树：

```
x-algorithm/
├── README.md                 # 项目总览，必读
├── candidate-pipeline/       # 核心框架
│   ├── lib.rs
│   ├── candidate_pipeline.rs # CandidatePipeline trait 定义
│   ├── source.rs             # Source trait
│   ├── hydrator.rs           # Hydrator trait
│   ├── filter.rs             # Filter trait
│   ├── scorer.rs             # Scorer trait
│   ├── selector.rs           # Selector trait
│   ├── query_hydrator.rs     # QueryHydrator trait
│   └── side_effect.rs        # SideEffect trait
├── home-mixer/               # 编排层实现
│   ├── main.rs
│   ├── server.rs
│   ├── query_hydrators/      # 用户上下文获取
│   ├── sources/              # 候选来源
│   ├── candidate_hydrators/  # 候选信息补充
│   ├── filters/              # 过滤逻辑
│   ├── scorers/              # 评分逻辑
│   └── side_effects/         # 副作用（缓存等）
├── thunder/                  # 实时数据层
│   ├── main.rs
│   ├── thunder_service.rs    # gRPC 服务
│   └── posts/                # 帖子存储
└── phoenix/                  # ML 模型
    ├── README.md             # 模型架构详解
    ├── grok.py               # Transformer 基础实现
    ├── recsys_model.py       # 排序模型
    └── recsys_retrieval_model.py  # 检索模型
```

核心框架在 `candidate-pipeline` 目录下，定义了推荐系统的基本组件和接口。`home-mixer` 实现了具体的推荐逻辑，`thunder` 负责实时数据处理，`phoenix` 包含了 ML 模型的实现。

### 核心组件

| 组件                   | 语言       | 职责                                                                   |
| ---------------------- | ---------- | ---------------------------------------------------------------------- |
| **candidate-pipeline** | Rust       | 通用推荐管道框架，定义 Source/Hydrator/Filter/Scorer/Selector 等 Trait |
| **home-mixer**         | Rust       | 核心编排层，组装完整推荐管道，暴露 gRPC 服务                           |
| **thunder**            | Rust       | 实时数据层，内存存储最近帖子，支持亚毫秒级查询                         |
| **phoenix**            | Python/JAX | ML 模型，包含 Retrieval（Two-Tower）和 Ranking（Transformer）          |

### 关键设计决策

1. **无手工特征**：系统不依赖人工设计的特征（如"用户过去 7 天点赞数"），而是让 Transformer 从用户行为序列中自动学习

2. **Candidate Isolation**：排序时候选帖子之间不能相互 attend，确保每个帖子的评分独立，可缓存

3. **多任务预测**：模型同时预测多种行为概率（点赞、回复、转发、点击等），最终分数是加权组合

4. **两阶段 Retrieval**：
   - In-Network：从关注用户获取（Thunder）
   - Out-of-Network：ML 检索全局候选（Phoenix Retrieval）

## 总结

介绍了 X 的 For You 推荐算法项目的整体架构和设计理念。后续章节将深入分析各个组件的实现细节，帮助读者理解现代推荐系统的构建方法。

对于有 Rust 和 ML 基础的开发者，建议的阅读顺序：

```
1. README.md (全文)
       ↓
2. candidate-pipeline/candidate_pipeline.rs (理解框架)
       ↓
3. home-mixer/main.rs + server.rs (理解入口)
       ↓
4. phoenix/README.md (理解 ML 架构)
       ↓
5. 按需深入各模块
```

## Next Chapter Preview

下一章将深入分析 `candidate-pipeline` 目录下的核心组件定义，帮助读者理解推荐系统的基本构建块。
