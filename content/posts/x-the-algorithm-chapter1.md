---
title: "[算法解析] X For You Feed Algorithm: X平台开源的推荐算法项目解析"
date: "2026-03-16"
excerpt: "X 的 For You 算法解析 chapter 1 `candidate-pipeline` 目录下的核心组件定义"
tags: ["开源", "算法", "推荐", "rust"]
---

## `candidate-pipeline` 简单介绍

推荐系统本质上是一系列数据处理步骤的组合：

```
获取用户信息 -> 获取候选内容 -> 补充候选信息 -> 过滤不合适内容 -> 评分排序 -> 排序选择
```

为了让代码更好维护更加清晰，可以抽象出一个**推荐管道**（Candidate Pipeline）的概念，定义标准接口（Trait），让各个场景实现需要的具体逻辑。

### `candidate-pipeline` 的设计模式

X 采用了经典的**管道模式（Pipeline Pattern）**：

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CandidatePipeline                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐                                                  │
│   │ Query        │                                                  │
│   │ (用户请求)    │                                                  │
│   └──────┬───────┘                                                  │
│          │                                                          │
│          ▼                                                          │
│   ┌──────────────┐     ┌──────────────┐                            │
│   │ Query        │ ──▶ │ Source 1     │ ──┐                        │
│   │ Hydrators    │     │ Source 2     │ ──┼──▶ 合并候选            │
│   │ (获取用户信息)│     │ ...          │ ──┘                        │
│   └──────────────┘     └──────────────┘                            │
│          │                    │                                    │
│          └────────────────────┘                                    │
│                    │                                                │
│                    ▼                                                │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐       │
│   │ Hydrator 1   │     │ Filter 1     │     │ Scorer 1     │       │
│   │ Hydrator 2   │ ──▶ │ Filter 2     │ ──▶ │ Scorer 2     │ ──▶   │
│   │ ...          │     │ ...          │     │ ...          │       │
│   └──────────────┘     └──────────────┘     └──────────────┘       │
│          │                    │                    │                │
│      (并行执行)           (顺序执行)           (顺序执行)            │
│                                                    │                │
│                                                    ▼                │
│                                            ┌──────────────┐        │
│                                            │ Selector     │        │
│                                            │ (排序+截断)   │        │
│                                            └──────────────┘        │
│                                                    │                │
│                                                    ▼                │
│                                            ┌──────────────┐        │
│                                            │ SideEffect   │        │
│                                            │ (异步副作用)  │        │
│                                            └──────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Code anlysis

### CandidatePipeline Trait 定义

`candidate-pipeline` 定义了 7 个 Trait，每个 Trait 对应管道的一个阶段：

| Trait           | 职责         | 执行方式   | 输入                   | 输出              |
| --------------- | ------------ | ---------- | ---------------------- | ----------------- |
| `QueryHydrator` | 丰富查询信息 | 并行       | `Q`                    | `Q`               |
| `Source`        | 获取候选     | 并行       | `Q`                    | `Vec<C>`          |
| `Hydrator`      | 丰富候选信息 | 并行       | `Q`, `&[C]`            | `Vec<C>`          |
| `Filter`        | 过滤候选     | 顺序       | `Q`, `Vec<C>`          | `FilterResult<C>` |
| `Scorer`        | 评分         | 顺序       | `Q`, `&[C]`            | `Vec<C>`          |
| `Selector`      | 排序选择     | 单次       | `Q`, `Vec<C>`          | `Vec<C>`          |
| `SideEffect`    | 副作用       | 并行(异步) | `SideEffectInput<Q,C>` | `()`              |

Code:

```rust
#[async_trait]
pub trait CandidatePipeline<Q, C>: Send + Sync
where
    Q: HasRequestId + Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn query_hydrators(&self) -> &[Box<dyn QueryHydrator<Q>>];
    fn sources(&self) -> &[Box<dyn Source<Q, C>>];
    fn hydrators(&self) -> &[Box<dyn Hydrator<Q, C>>];
    fn filters(&self) -> &[Box<dyn Filter<Q, C>>];
    fn scorers(&self) -> &[Box<dyn Scorer<Q, C>>];
    fn selector(&self) -> &dyn Selector<Q, C>;
    fn post_selection_hydrators(&self) -> &[Box<dyn Hydrator<Q, C>>];
    fn post_selection_filters(&self) -> &[Box<dyn Filter<Q, C>>];
    fn side_effects(&self) -> Arc<Vec<Box<dyn SideEffect<Q, C>>>>;
    fn result_size(&self) -> usize;
    // ...
}
```

**关键点**：

- **泛型参数**：`Q` 是查询类型（用户请求），`C` 是候选类型（帖子）
- **返回切片**：`&[Box<dyn Trait>]` 允许返回多个实现
- **Send + Sync**：支持跨线程共享（异步运行时需要）

### execute 方法流程

```rust
async fn execute(&self, query: Q) -> PipelineResult<Q, C> {
    // 1. 查询增强（并行）
    let hydrated_query = self.hydrate_query(query).await;

    // 2. 获取候选（并行）
    let candidates = self.fetch_candidates(&hydrated_query).await;

    // 3. 候选增强（并行）
    let hydrated_candidates = self.hydrate(&hydrated_query, candidates).await;

    // 4. 过滤（顺序）
    let (kept_candidates, mut filtered_candidates) = self
        .filter(&hydrated_query, hydrated_candidates.clone())
        .await;

    // 5. 评分（顺序）
    let scored_candidates = self.score(&hydrated_query, kept_candidates).await;

    // 6. 选择（排序+截断）
    let selected_candidates = self.select(&hydrated_query, scored_candidates);

    // 7. 选择后增强（并行）
    let post_selection_hydrated_candidates = self
        .hydrate_post_selection(&hydrated_query, selected_candidates)
        .await;

    // 8. 选择后过滤（顺序）
    let (mut final_candidates, post_selection_filtered_candidates) = self
        .filter_post_selection(&hydrated_query, post_selection_hydrated_candidates)
        .await;

    // 9. 最终截断
    final_candidates.truncate(self.result_size());

    // 10. 异步副作用
    let arc_hydrated_query = Arc::new(hydrated_query);
    let input = Arc::new(SideEffectInput {
        query: arc_hydrated_query.clone(),
        selected_candidates: final_candidates.clone(),
    });
    self.run_side_effects(input);

    PipelineResult {
        retrieved_candidates: hydrated_candidates,
        filtered_candidates,
        selected_candidates: final_candidates,
        query: arc_hydrated_query,
    }
}
```

**执行顺序图**：

```
Query ──▶ hydrate_query ──▶ fetch_candidates ──▶ hydrate
                                                        │
                    ┌───────────────────────────────────┘
                    ▼
              filter (pre-scoring) ──▶ score ──▶ select
                                                        │
                    ┌───────────────────────────────────┘
                    ▼
         hydrate_post_selection ──▶ filter_post_selection
                                                        │
                    ┌───────────────────────────────────┘
                    ▼
                truncate ──▶ side_effects (异步)
```

### QueryHydrator Trait

Path: `candidate-pipeline/query_hydrator.rs`

```rust
#[async_trait]
pub trait QueryHydrator<Q>: Any + Send + Sync
where
    Q: Clone + Send + Sync + 'static,
{
    /// 是否启用（默认 true）
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    /// 执行增强，返回增强后的 Query
    async fn hydrate(&self, query: &Q) -> Result<Q, String>;

    /// 将增强结果合并回原 Query
    fn update(&self, query: &mut Q, hydrated: Q);

    /// 组件名称（用于日志）
    fn name(&self) -> &'static str {
        util::short_type_name(type_name_of_val(self))
    }
}
```

### Source Trait

**文件**：`candidate-pipeline/source.rs`

```rust
#[async_trait]
pub trait Source<Q, C>: Any + Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    /// 获取候选列表
    async fn get_candidates(&self, query: &Q) -> Result<Vec<C>, String>;

    fn name(&self) -> &'static str {
        util::short_type_name(type_name_of_val(self))
    }
}
```

### Hydrator Trait

**文件**：`candidate-pipeline/hydrator.rs`

```rust
#[async_trait]
pub trait Hydrator<Q, C>: Any + Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    /// 增强候选
    /// IMPORTANT: 返回的 Vec 必须与输入顺序一致，长度相同
    async fn hydrate(&self, query: &Q, candidates: &[C]) -> Result<Vec<C>, String>;

    /// 将增强结果合并回原候选
    fn update(&self, candidate: &mut C, hydrated: C);

    /// 批量更新（默认实现）
    fn update_all(&self, candidates: &mut [C], hydrated: Vec<C>) {
        for (c, h) in candidates.iter_mut().zip(hydrated) {
            self.update(c, h);
        }
    }

    fn name(&self) -> &'static str {
        util::short_type_name(type_name_of_val(self))
    }
}
```

**关键约束**：

> **IMPORTANT**: 返回的 Vec 必须与输入顺序一致，长度相同

因为 `update_all` 使用 `zip` 来配对更新：

```rust
for (c, h) in candidates.iter_mut().zip(hydrated) {
    self.update(c, h);
}
```

如果长度不一致，会静默丢失数据。

### Filter Trait

**文件**：`candidate-pipeline/filter.rs`

```rust
pub struct FilterResult<C> {
    pub kept: Vec<C>,      // 保留的候选
    pub removed: Vec<C>,   // 被过滤掉的候选
}

#[async_trait]
pub trait Filter<Q, C>: Any + Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    /// 过滤候选，返回保留和移除的集合
    async fn filter(&self, query: &Q, candidates: Vec<C>) -> Result<FilterResult<C>, String>;

    fn name(&self) -> &'static str {
        util::short_type_name(type_name_of_val(self))
    }
}
```

### Scorer Trait

**文件**：`candidate-pipeline/scorer.rs`

```rust
#[async_trait]
pub trait Scorer<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: &Q) -> bool {
        true
    }

    /// 评分
    /// IMPORTANT: 返回的 Vec 必须与输入顺序一致，长度相同
    async fn score(&self, query: &Q, candidates: &[C]) -> Result<Vec<C>, String>;

    /// 更新单个候选的分数字段
    fn update(&self, candidate: &mut C, scored: C);

    fn update_all(&self, candidates: &mut [C], scored: Vec<C>) {
        for (c, s) in candidates.iter_mut().zip(scored) {
            self.update(c, s);
        }
    }

    fn name(&self) -> &'static str {
        util::short_type_name(type_name_of_val(self))
    }
}
```

**与 Hydrator 的区别**：

- **Hydrator**：补充信息（如文本、作者名）
- **Scorer**：计算分数（如 ML 预测概率）

**顺序执行的原因**：后一个 Scorer 可能依赖前一个 Scorer 的结果。例如：

1. `PhoenixScorer`：计算 ML 预测概率
2. `WeightedScorer`：基于概率计算加权分数
3. `AuthorDiversityScorer`：基于历史调整分数（衰减重复作者）

### Selector Trait

**文件**：`candidate-pipeline/selector.rs`

```rust
pub trait Selector<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    /// 选择（默认：排序 + 截断）
    fn select(&self, _query: &Q, candidates: Vec<C>) -> Vec<C> {
        let mut sorted = self.sort(candidates);
        if let Some(limit) = self.size() {
            sorted.truncate(limit);
        }
        sorted
    }

    fn enable(&self, _query: &Q) -> bool {
        true
    }

    /// 提取分数用于排序
    fn score(&self, candidate: &C) -> f64;

    /// 按分数降序排序
    fn sort(&self, candidates: Vec<C>) -> Vec<C> {
        let mut sorted = candidates;
        sorted.sort_by(|a, b| {
            self.score(b)
                .partial_cmp(&self.score(a))
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        sorted
    }

    /// 返回选择的数量（None = 不截断）
    fn size(&self) -> Option<usize> {
        None
    }

    fn name(&self) -> &'static str {
        util::short_type_name(type_name_of_val(self))
    }
}
```

### SideEffect Trait

**文件**：`candidate-pipeline/side_effect.rs`

```rust
#[derive(Clone)]
pub struct SideEffectInput<Q, C> {
    pub query: Arc<Q>,
    pub selected_candidates: Vec<C>,
}

#[async_trait]
pub trait SideEffect<Q, C>: Send + Sync
where
    Q: Clone + Send + Sync + 'static,
    C: Clone + Send + Sync + 'static,
{
    fn enable(&self, _query: Arc<Q>) -> bool {
        true
    }

    /// 执行副作用
    async fn run(&self, input: Arc<SideEffectInput<Q, C>>) -> Result<(), String>;

    fn name(&self) -> &'static str {
        util::short_type_name(type_name_of_val(self))
    }
}
```

## Summary

7 个 Trait 的设计：

| Trait           | 核心方法           | 返回类型          | 执行方式 |
| --------------- | ------------------ | ----------------- | -------- |
| `QueryHydrator` | `hydrate()`        | `Q`               | 并行     |
| `Source`        | `get_candidates()` | `Vec<C>`          | 并行     |
| `Hydrator`      | `hydrate()`        | `Vec<C>`          | 并行     |
| `Filter`        | `filter()`         | `FilterResult<C>` | 顺序     |
| `Scorer`        | `score()`          | `Vec<C>`          | 顺序     |
| `Selector`      | `select()`         | `Vec<C>`          | 单次     |
| `SideEffect`    | `run()`            | `()`              | 异步     |

## Next Chapter Preview

`home-mixer` 模块
