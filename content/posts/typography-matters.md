---
title: "Go 并发编程：从理论到实践"
date: "2024-03-05"
excerpt: "深入学习 Go 语言的并发模型，通过实际案例理解 goroutine 和 channel"
tags: ["Go", "后端", "并发"]
---

# Go 并发编程：从理论到实践

Go 语言的并发模型是我最喜欢它的原因之一。简洁的语法背后是强大的并发能力。

## Goroutine：轻量级线程

Goroutine 是 Go 并发的基础。与操作系统线程相比，它非常轻量：

- 初始栈大小只有 2KB（OS 线程通常 1MB+）
- 由 Go 运行时调度，而非操作系统
- 创建和销毁开销极小

```go
// 启动一个 goroutine
go func() {
    fmt.Println("Hello from goroutine")
}()
```

## Channel：通信机制

Go 的哲学是："不要通过共享内存来通信，而要通过通信来共享内存"。

### 基本 Channel 操作

```go
// 创建 channel
ch := make(chan int)

// 发送数据
ch <- 42

// 接收数据
value := <-ch

// 带缓冲的 channel
bufferedCh := make(chan int, 10)
```

### 实际案例：工作池

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("worker %d: processing job %d\n", id, j)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // 启动 3 个 worker
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // 发送 5 个任务
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    // 收集结果
    for r := 1; r <= 5; r++ {
        <-results
    }
}
```

## Select：多路复用

Select 让你可以同时等待多个 channel 操作：

```go
select {
case msg1 := <-ch1:
    fmt.Println("Received from ch1:", msg1)
case msg2 := <-ch2:
    fmt.Println("Received from ch2:", msg2)
case <-time.After(time.Second):
    fmt.Println("Timeout!")
}
```

## 常见陷阱

### 1. Goroutine 泄漏

确保 goroutine 能够正常退出，否则会造成内存泄漏。

### 2. 死锁

当所有 goroutine 都在等待时，程序会死锁。使用 `go vet` 和 `race detector` 帮助排查。

```bash
go run -race main.go
```

### 3. 关闭 channel 的时机

只有发送方应该关闭 channel，接收方不应该关闭。

## 总结

Go 的并发模型简单而强大。通过 goroutine 和 channel，我们可以写出高效、易读的并发代码。关键是理解其设计哲学，避免常见陷阱。
