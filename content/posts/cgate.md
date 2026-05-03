---
title: "[项目解析] cgate：Claude Code 自动化流水线，从Issue到PR"
date: "2026-05-03"
excerpt: "cgate是一个自动化流水线项目，旨在将Github项目的Issue发送到Claude Code中进行处理，并最终生成PR。项目核心是两个Docker镜像，使用GitHub Actions监听Issue事件，通过Webhook发送到CGate，CGate负责处理事件并与Claude Code交互。整个系统架构采用Clean Architecture设计原则，使用Go语言编写后端服务，Docker管理运行环境，SQLite存储数据。项目的核心理念是让Claude Code处理所有核心功能，尽可能减少人工参与，提高研发效率。"
tags: ["项目解析", "AI", "Docker", "Claude Code", "开源", "项目"]
---

## 项目介绍

这个项目的定位是一个自动化流水线，旨在将你的Github项目的Issue发送到Claude Code中按照一些规则约束进行处理，最后生成PR。这个项目的核心是两个Docker镜像，包含了所有必要的工具和依赖，可以轻松地部署和运行。项目使用了GitHub Actions来监听Issue事件，并通过Webhook将事件发送到CGate，CGate负责处理这些事件并与Claude Code进行交互。

项目链接： [Github]("https://github.com/Lin-Jiong-HDU/cgate")

### How It Works

```
GitHub Issue [... claude bot]
  → GitHub Actions sends webhook to CGate
    → CGate creates a Task, enqueues it
      → Scheduler launches an isolated Docker container
        → Container clones repo, runs Claude Code
          → Claude implements, tests, commits, opens a PR
            → Container and workspace are cleaned up
```

## 主要功能

- **自动化处理Issue**：当接受到webhook时，CGate会创建一个Task并将其加入队列。调度器会定期检查队列，并在有空闲资源时启动一个新的Docker容器来处理这个Task。
- **与Claude Code集成**：在Docker容器中，CGate会克隆相关的GitHub仓库，并运行Claude Code来处理Issue。Claude Code会根据预设的规则进行实现、测试、提交代码，并最终打开一个PR。
- **资源管理**：每个Task在一个隔离的Docker容器中运行，处理完成后会自动清理容器和工作空间，确保系统资源的有效利用。

## 技术解析

其实我在设计这一整个项目的时候，核心理念就是，使用Claude Code作为核心部分实现一个AI自动化流水线，尽可能地让Claude Code来处理所有的核心功能，而不是让人来参与到这个流程中来。加快整个研发流程的效率。

所以我让这个项目架构尽可能简答，运行的资源尽可能轻量化，把核心功能“处理Issue并发起PR”部分全部交给Claude Code让人工尽可能少的参与到这个流程中来。

CGate的核心功能就是监听GitHub Issue事件，创建Task并将其加入队列，调度器负责管理这些Task并启动Docker容器来处理它们。Docker容器中运行的Claude Code则负责具体的实现、测试、提交代码和打开PR的工作。

### 技术栈

- **Go**：后端服务使用Go语言编写。
- **Docker**：用于创建和管理隔离的运行环境。
- **SQLite**：作为轻量级数据库存储Task和相关数据。

### 项目架构

```
.
├── AGENTS.md
├── api
│   ├── controller
│   │   ├── task_controller_test.go
│   │   ├── task_controller.go
│   │   ├── webhook_controller_test.go
│   │   └── webhook_controller.go
│   ├── middleware
│   │   ├── auth_test.go
│   │   └── auth.go
│   └── route
│       └── route.go
├── bootstrap
│   └── bootstrap.go
├── CLAUDE.md
├── cmd
│   └── main.go
├── config.yaml
├── config.yaml.example
├── docker-compose.yml
├── Dockerfile
├── domain
│   ├── config.go
│   ├── errors.go
│   ├── repository.go
│   ├── task_test.go
│   ├── task.go
│   └── usecase.go
├── go.mod
├── go.sum
├── internal
│   ├── docker
│   │   ├── runner_test.go
│   │   └── runner.go
│   └── queue
│       ├── queue_test.go
│       └── queue.go
├── Makefile
├── README.md
├── repository
│   ├── sqlite_test.go
│   ├── sqlite.go
│   ├── task_repository_test.go
│   └── task_repository.go
├── runner-image
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── prompt-template.txt
├── SECURITY_REVIEW.md
├── test
│   └── docker
│       ├── test-runner-image.sh
│       └── test-server-image.sh
└── usecase
    ├── task_usecase_test.go
    └── task_usecase.go

16 directories, 41 files
```

整个项目的架构采用了Clean Architecture的设计原则，DDD设计思想，分为多个层次，包括API层、Domain层、Repository层等。每个层次都有明确的职责和边界，确保了代码的可维护性和可扩展性。

后端没有用到什么很特别的技术，因为我的理念是尽量简单清晰Keep it Simple and Stupid，所以我就用Go语言来实现了这个后端，数据库用的是SQLite，使用Docker来管理运行环境。这让整个系统运行和部署都非常简单，而且由于它的简易，可靠性也非常好。

### Issue数据流

1. 接收 Webhook

// api/route/route.go

```go
mux.Handle("POST /webhook/github", webhookHandler)
```

这个路由负责接收来自GitHub的Webhook请求。当有新的Issue事件发生时，GitHub会发送一个POST请求到这个路由。

请求经 X-Webhook-Secret 认证后，webhook_controller.go 解析 JSON 为 domain.WebhookPayload，调用 usecase.HandleWebhook()。

2. 创建 Task

usecase/task_usecase.go:34 中 HandleWebhook 会检查是否已有活跃任务，没有则创建 pending 状态的 Task，持久化到 SQLite，然后入队。

// usecase/task_usecase.go

```go
func (u *taskUsecase) HandleWebhook(ctx context.Context, payload domain.WebhookPayload) (domain.Task, error) {
 active, err := u.repo.FindActiveByIssue(ctx, payload.Repository, payload.IssueNumber)
 if err != nil {
  return domain.Task{}, fmt.Errorf("check active tasks: %w", err)
 }
 if len(active) > 0 {
  return domain.Task{}, domain.ErrActiveTaskExists
 }

 task, err := domain.NewTask(payload)
 if err != nil {
  return domain.Task{}, fmt.Errorf("create task: %w", err)
 }
 if err := u.repo.Create(ctx, task); err != nil {
  return domain.Task{}, fmt.Errorf("persist task: %w", err)
 }

 u.queue.Enqueue(task)
 slog.Info("task enqueued", "task_id", task.ID, "issue", task.IssueNumber, "repo", task.Repository)
 return task, nil
}
```

3. 调度器启动容器

scheduleLoop 协程从队列取出任务，检查并发数，然后调用 internal/docker/runner.go:45 的 StartContainer：

// internal/docker/runner.go

```go
func (r *runner) StartContainer(ctx context.Context, task domain.Task) (string, error) {
 env := []string{
  fmt.Sprintf("ANTHROPIC_API_KEY=%s", r.apiKey),
  fmt.Sprintf("GITHUB_TOKEN=%s", r.githubToken),
  fmt.Sprintf("CGATE_URL=%s", r.cgateURL),
  fmt.Sprintf("REPOSITORY=%s", task.Repository),
  fmt.Sprintf("ISSUE_NUMBER=%d", task.IssueNumber),
  fmt.Sprintf("ISSUE_TITLE=%s", task.Title),
  fmt.Sprintf("ISSUE_BODY=%s", task.Body),
  fmt.Sprintf("ISSUE_URL=%s", task.HTMLURL),
  fmt.Sprintf("GIT_USER_NAME=%s", r.cfg.GitUserName),
  fmt.Sprintf("GIT_USER_EMAIL=%s", r.cfg.GitUserEmail),
  fmt.Sprintf("MAX_TURNS=%d", r.cfg.MaxTurns),
 }

 if r.baseURL != "" {
  env = append(env, fmt.Sprintf("ANTHROPIC_BASE_URL=%s", r.baseURL))
 }
 if r.model != "" {
  env = append(env, fmt.Sprintf("ANTHROPIC_MODEL=%s", r.model))
 }

 repoDir := fmt.Sprintf("/tmp/cgate/repos/%s", task.ID)
 _ = os.MkdirAll(repoDir, 0755)

 mounts := []mount.Mount{
  {
   Type:   mount.TypeBind,
   Source: fmt.Sprintf("/tmp/cgate/repos/%s", task.ID),
   Target: "/workspace",
  },
 }

 if r.cfg.PermissionMode == "permissive" {
  env = append(env, "SKIP_PERMISSIONS=true")
 } else if r.cfg.SettingsPath != "" {
  mounts = append(mounts, mount.Mount{
   Type:     mount.TypeBind,
   Source:   r.cfg.SettingsPath,
   Target:   "/root/.claude/settings.json",
   ReadOnly: true,
  })
 }

 for _, key := range []string{"HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"} {
  if v := os.Getenv(key); v != "" {
   v = strings.Replace(v, "127.0.0.1", "host.docker.internal", 1)
   v = strings.Replace(v, "localhost", "host.docker.internal", 1)
   env = append(env, fmt.Sprintf("%s=%s", key, v))
  }
 }

 resp, err := r.cli.ContainerCreate(ctx, &container.Config{
  Image: r.cfg.Image,
  Env:   env,
  Cmd:   []string{"/entrypoint.sh"},
  Tty:   false,
 }, &container.HostConfig{
  Mounts:     mounts,
  ExtraHosts: []string{"host.docker.internal:host-gateway"},
 }, nil, nil, fmt.Sprintf("cgate-%s", task.ID))
 if err != nil {
  return "", fmt.Errorf("create container: %w", err)
 }

 if err := r.cli.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
  _ = r.cli.ContainerRemove(ctx, resp.ID, container.RemoveOptions{Force: true})
  return "", fmt.Errorf("start container: %w", err)
 }

 return resp.ID, nil
}
```

为容器添加了代理的支持，可以使用宿主机的代理。

5. entrypoint.sh 执行

容器的启动脚本就是`entrypoint.sh`，这个脚本包含了：

- 验证环境变量 — REPOSITORY、ISSUE_NUMBER、ISSUE_TITLE、GITHUB_TOKEN、ANTHROPIC_API_KEY
- 生成分支名 — feat/issue-{ISSUE_NUMBER}-{slug}
- 配置 git 和 gh CLI — 设置用户名/邮箱、credential helper
- 克隆仓库 — 克隆到 /workspace/repo，基于 main 创建新分支
- 生成 Claude 提示词 — 用 envsubst 处理 prompt-template.txt，将 issue 内容注入
- 切换到非 root 用户执行 — 因为 --dangerously-skip-permissions 要求非 root

- F: 为什么使用这么一个简单的脚本？

- A: 为了保持简单，牺牲一些易用性和可维护性是可行的。

后续可能回为了安全性做出一些修改。

6. 监控与清理

回到 task_usecase.go:187 的 watchContainer，流式读取容器日志写入数据库，等待容器退出后更新状态（成功/失败），最后调用 CleanupTask 删除容器和工作目录。

## 感想

LLM进化的速度真的很快，在多步复杂任务上的能力也越来越好。我是在2024年底接触的Agent应用研发，最开始用的是langchain，可以帮我做掉一些dartywork，但是后面发现根本就无需使用什么Agnet框架，自己从0开始搭一套infra就可以了，重点还是在于你的业务上。

2024年用LLM做一些任务的时候还要学习一些如何设计提示词，如何正确引导模型等。但是现在模型能力越来越强大，甚至不需要去精心设计你对LLM说的话，LLM就已经能清晰理解你的需求了。Agent系统、多Agent系统共同的核心其实就是如何让模型更好的聚焦任务，设计上下文系统本质也是为了让模型聚焦任务，像是比较流行的上下文设计理念“记忆分级、折叠、检索”等等的，其实都是在帮模型更好地聚焦任务。现在的模型能力已经很强了，甚至不需要我们去设计什么复杂的上下文系统了，直接把所有相关的信息都丢给模型，让它自己去理解和聚焦就好了。这方面做Post train的人都已经做过了。多Agent系统也是一样的道理，核心就是让模型更好地聚焦任务，相较于单Agent，还多了一个“Agent间交互”的点，应该如何设计交互逻辑，如何让模型高效协作，是共享记忆来实现通信还是通过通信来实现共享记忆。我是倾向于前者的。

我觉得未来的趋势是，模型能力越来越强大，我们对它的使用会越来越简单，我们不需要去设计什么复杂的系统了，直接把需求告诉模型，让它自己去理解和处理就好了。我们需要做的就是把我们的需求清晰地表达出来，让模型能够理解我们的需求，然后让它去处理就好了。所以我做了这个项目，完全没有设计什么复杂的系统，核心功能全部交给Claude Code来实现，我只需要搭建一个简单的infra，让Claude Code能正常跑起来就行。
