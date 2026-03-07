# Easter Eggs 设计文档

## 概述

为个人博客添加隐藏彩蛋，增加趣味性和互动性。

## 彩蛋列表

### 1. Logo 旋转
- **触发**：点击导航栏 logo 5 次
- **效果**：logo 360° 旋转 + 发光
- **页面**：全站
- **技术**：CSS animation + JS 计数器

### 2. Konami Code 终端游戏
- **触发**：`↑↑↓↓←→←→BA` 键盘组合
- **效果**：打开终端风格弹窗，包含贪吃蛇游戏
- **样式**：黑色背景 + 绿色文字，复古终端风格
- **页面**：全站
- **技术**：React Portal + Canvas Snake 游戏

### 3. F1 赛车
- **触发**：首页连续点击 "F1爱好者" 文字 3 次
- **效果**：
  - F1 赛车从左到右飞过屏幕
  - 播放 F1 引擎声
- **页面**：首页
- **技术**：CSS animation + Web Audio API

### 4. 代码雨
- **触发**：`Shift + C` 键盘组合
- **效果**：短暂的矩阵风格代码雨效果
- **页面**：全站
- **技术**：Canvas 粒子动画

## 文件结构

```
components/
  easter-eggs/
    KonamiTerminal.tsx    # 终端 + Snake 游戏
    F1Racer.tsx           # F1 赛车动画
    MatrixRain.tsx        # 代码雨
    EasterEggManager.tsx  # 统一管理键盘事件

public/
  sounds/
    f1-engine.mp3         # F1 引擎声
```

## 设计原则

1. **轻量**：使用原生 CSS + 少量 JS，避免引入大型动画库
2. **不打扰**：彩蛋可随时关闭，不影响正常浏览
3. **性能**：使用 CSS 动画优先，Canvas 仅用于复杂效果
4. **可扩展**：方便后续添加更多彩蛋
