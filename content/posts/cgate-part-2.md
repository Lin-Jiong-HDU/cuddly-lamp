---
title: "[项目解析] cgate：再谈🍊CGate，从Issue到PR"
date: "2026-05-07"
excerpt: "之前讲的太仓促了，没有提到如何部署和使用这个项目，今天就来补充一下这个部分。"
tags: ["项目解析", "教程", "Docker", "Claude Code", "开源", "项目"]
---

## 部署指南

### 环境准备

- **基础软件**：安装并启动 Docker 和 Docker Compose。
- **工具链**：本地安装 `make`（用于简化构建命令）和 `git`。
- **网络要求**：服务器需具备公网 IP 或使用内网穿透（如 cpolar/frp），确保能接收 GitHub Webhook 请求。
- **开发环境**：Go 1.24+ (如果需要本地编译)。

### GitHub Secrets 配置

- **目标仓库配置**：在需要自动化的仓库中（Settings -> Secrets and variables -> Actions）添加：
  - `WEBHOOK_URL`：CGate 服务的地址（例如 `http://your-ip:8000/webhook/github`）。
  - `WEBHOOK_SECRET`：与 `.env` 中一致的鉴权密钥。
- **Personal Access Token (PAT)**：创建一个具有 `repo` 权限的 PAT，用于 AI 容器内部执行 Git 操作和提交 PR。

### 其他

#### 代理配置

- **Runner 代理**：在 `.env` 中配置 `HTTP_PROXY` 和 `HTTPS_PROXY`，这些变量会自动透传给执行任务的 Docker 容器，确保 AI 能够顺利访问 Anthropic 或 GitHub API。
- **API 基准地址**：如果使用中转 API，可在 `config.yaml` 或 `.env` 中设置 `ANTHROPIC_BASE_URL`。

#### 测试

- **镜像构建**：运行 `make docker-build-all` 构建服务端和 Runner 镜像（Runner 镜像包含完整工具链，约 2GB，首次构建需耐心等待）。
- **连通性校验**：通过 `curl http://localhost:8000/api/tasks` 确认 API 响应正常。
- **首个任务**：在目标仓库创建一个标题带 `[claude bot]` 的 Issue，观察服务端日志 `docker logs -f cgate-cgate-1`。

#### 安全

- **隔离机制**：基于 Docker 的 ephemeral 容器，任务结束后自动销毁，防止代码污染。
- **权限控制**：
  - **Strict 模式**：通过 `settings.json` 精确限制 Claude Code 可执行的 Bash 命令。
  - **作者白名单**：在 `config.yaml` 的 `allowed_authors` 中指定允许触发任务的 GitHub 用户名，防止被恶意利用。

## 使用指南

### 功能

#### 如何使用

1. **开启服务**：`docker compose up -d`。
2. **触发自动化**：在 GitHub 仓库新建 Issue，标题结尾加上 `[claude bot]` 后缀。
3. **描述需求**：在 Issue 正文中详细描述任务（例如：“修复 main.go 中的并发竞争问题”）。
4. **接收 PR**：CGate 会自动分配 Runner，完成后你会收到一个由 Bot 提交的 Pull Request。

#### 功能解析

- **自动化流水线**：Issue -> Webhook -> 任务队列 -> Docker Runner -> Claude Code 执行 -> 自动提交 PR。
- **并发控制**：默认支持 3 个并发任务，防止服务器资源耗尽。
- **断点续传**：支持任务持久化（SQLite），服务器重启后会自动重新处理 Pending 任务或重新挂载运行中的容器。
- **REST API**：提供了查看任务状态、实时获取日志、取消任务的接口。

### 建议

- **Issue 描述**：尽量提供清晰的上下文和验收标准，有助于 AI 提高 PR 质量。
- **镜像预热**：建议在网络环境较好的时候完成镜像构建。
- **监控**：定期查看 `/api/tasks` 或日志，以了解队列积压情况和任务执行失败的原因。
- **清理**：虽然程序有自动清理机制，但建议定期检查宿主机是否有残留的临时 Workspace 目录。

---

**项目地址**：[Lin-Jiong-HDU/cgate](https://github.com/Lin-Jiong-HDU/cgate)
