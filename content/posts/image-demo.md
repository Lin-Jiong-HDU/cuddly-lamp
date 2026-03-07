---
title: "博客图片使用指南"
date: "2024-03-10"
excerpt: "如何在博客文章中添加和展示图片"
tags: ["教程", "Markdown"]
---

# 博客图片使用指南

这篇文章演示如何在博客中使用图片。

## 基本语法

在 Markdown 中插入图片的基本语法：

```markdown
![图片描述](/images/screenshot.png)
```

## 图片存放位置

将图片放在 `public/images/` 目录下，然后在文章中引用：

```
public/
  images/
    screenshot.png      → /images/screenshot.png
    diagram.svg         → /images/diagram.svg
    photos/
      profile.jpg       → /images/photos/profile.jpg
```

## 示例图片

下面是一张示例图片：

![示例截图](/images/screenshot.png)

## 图片居中

如果需要图片居中显示，可以使用 HTML：

```html
<div style="text-align: center;">
  <img
    src="/images/example.png"
    alt="居中图片"
    style="max-width: 100%; height: auto;"
  />
  <p
    style="font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.5rem;"
  >
    图片说明文字
  </p>
</div>
```

## 建议的图片规格

| 类型      | 建议宽度   | 格式      |
| --------- | ---------- | --------- |
| 文章配图  | 800-1200px | PNG, WebP |
| 截图      | 800-1000px | PNG       |
| 图标/Logo | SVG 优先   | SVG, PNG  |

## 小技巧

1. **文件命名**：使用英文和小写，用连字符分隔，如 `my-screenshot.png`
2. **压缩图片**：使用工具压缩图片以加快加载速度
3. **添加 alt 文本**：为图片提供描述性文字，提升可访问性
