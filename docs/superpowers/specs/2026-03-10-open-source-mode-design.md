# 开源爱好者模式设计文档

## 概述

为个人博客添加一个沉浸式的开源主题彩蛋页面，通过渐进式触发方式进入，包含 3D 银河体验、经典开源项目展示和个人贡献轨迹。

## 触发机制

**渐进式彩蛋设计**（与 F1 模式一致）：

1. **第一层**：快速点击 "开源爱好者" 3 次 → 触发 Git Commit 爆发动画（约 2.5 秒）
2. **第二层**：在动画播放期间继续点击 2 次 → 进入开源专属页面

实现方式：
- 使用状态追踪点击次数和动画状态
- 动画期间额外点击 2 次触发页面跳转
- 页面路由：`/open-source-mode`（独立页面，可分享链接）

### Git Commit 爆发动画

- 从屏幕中心爆发出数十个"commit"元素
- 每个元素包含：`a1b2c3d` 格式的 hash + 简短 commit message
- 不同颜色代表不同类型的提交（绿色=feature、蓝色=fix、黄色=docs 等）
- 带有淡出和下落的轨迹效果
- 同时播放键盘敲击音效

## 视觉风格

### 配色方案

- **主背景**：深空黑 `#050510`
- **星云**：渐变紫蓝 `#1a0a2e` → `#0a1628`
- **恒星发光**：基于项目颜色的多层发光效果
- **连接线**：半透明白色 `rgba(255,255,255,0.1)`
- **文字**：白色 + 项目对应颜色高亮

### 字体

- 标题：保留现有 serif 字体
- 代码/hash：`MesloLGS NF`

## 页面结构

### Section 1: 沉浸式 3D 银河

**视觉效果**：
- 用户视角位于银河中心区域
- 经典开源项目是巨大的恒星，带发光效果和粒子光环
- 用户的 commits 是围绕恒星的小星星
- 连接线连接星星和最近的恒星

**滚动驱动的叙事节奏**：

```
滚动进度 0% - 20%    → 星空背景淡入，远景星星出现
滚动进度 20% - 50%   → 经典项目恒星逐个亮起（带光晕动画）
滚动进度 50% - 80%   → 用户的 commit 星星涌现，连接线绘制
滚动进度 80% - 100%  → 完整银河展现，相机拉远展示全貌
```

### Section 2: 开源恒星系统

展示经典开源项目：
- 每个项目卡片：名称、描述、领域
- 滚动进入时动画效果

### Section 3: 贡献轨迹

- 最近提交的时间线
- 语言分布统计

## 经典开源项目清单

| 项目 | 领域 | 恒星颜色 | 描述 |
|------|------|----------|------|
| Linux | 操作系统 | 红巨星 `#e54b4b` | 改变世界的内核 |
| Git | 版本控制 | 橙色 `#f05032` | 代码协作的基础 |
| React | 前端框架 | 蓝矮星 `#61dafb` | 声明式 UI |
| Python | 编程语言 | 黄色 `#3776ab` | 优雅与实用 |
| VS Code | 开发工具 | 紫色 `#007acc` | 开源编辑器 |
| Node.js | 运行时 | 绿色 `#339933` | JavaScript 后端 |
| Docker | 容器化 | 蓝色 `#2496ed` | 容器革命 |
| Rust | 编程语言 | 橙红 `#dea584` | 安全与性能 |

## 交互设计

### 3D 银河交互

| 交互 | 效果 |
|------|------|
| 鼠标拖拽 | 旋转视角，从不同角度观察银河 |
| 滚轮 | 缩放视图（有限制范围） |
| 悬停恒星 | 显示项目名称 + 简介 tooltip，恒星发光增强 |
| 悬停小星星 | 显示 commit hash + message + 日期 |
| 点击恒星 | 相机平滑飞向该恒星，展示详细信息卡片 |
| 滚动页面 | 控制星星出现的进度，同时视角缓慢自动旋转 |

### 退出方式

- 顶部左上角 "← Back" 按钮
- ESC 键返回首页
- 浏览器后退按钮

## 技术栈

| 技术 | 用途 |
|------|------|
| React Three Fiber | 3D 场景渲染 |
| @react-three/drei | Stars, Html, Float 等工具组件 |
| @react-three/postprocessing | Bloom 发光后处理效果 |
| Framer Motion | 滚动驱动动画、进入动画 |
| Next.js App Router | 独立页面路由 `/open-source-mode` |
| Tailwind CSS | 2D 元素样式 |

## 关键实现点

### 星星生成

```typescript
interface Star {
  position: [number, number, number];
  color: string;
  size: number;
  type: 'commit' | 'project';
  data?: CommitData | ProjectData;
}
```

- 用户 commit 星星：从 GitHub API 获取数据生成
- 经典项目恒星：预定义位置和属性

### 滚动控制

```typescript
const { scrollYProgress } = useScroll({
  target: galaxySectionRef,
  offset: ["start start", "end end"],
});
// scrollYProgress 控制星星出现、相机位置、旋转角度
```

### 性能优化

1. **代码分割**：React Three Fiber 相关依赖动态导入，仅开源模式页面加载
2. **3D 优化**：
   - 使用 `InstancedMesh` 渲染大量小星星
   - 经典项目恒星数量有限（8个），可直接用独立 Mesh
   - 移动端关闭后处理 Bloom，降低星星数量
3. **懒加载**：开源模式页面独立 chunk，首屏不加载

## 文件结构

```
app/
  open-source-mode/
    page.tsx                    # 开源模式主页面
    components/
      Galaxy3D.tsx              # 3D 银河场景
      ProjectStar.tsx           # 经典项目恒星组件
      CommitStar.tsx            # 用户 commit 星星组件
      ProjectGallery.tsx        # Section 2: 项目展示卡片
      ContributionTimeline.tsx  # Section 3: 贡献时间线

components/
  easter-eggs/
    OpenSourceMode.tsx          # 新增：过渡动画 + 触发逻辑
    F1Racer.tsx                 # 现有：F1 触发组件

lib/
  open-source-data/
    projects.ts                 # 经典开源项目数据
    stars-generator.ts          # 星星位置生成器
```

## 页面修改

`app/page.tsx` 需要修改，将 "开源爱好者" 和 "F1爱好者" 分开：

```typescript
<p className="...">
  <span ref={openSourceTriggerRef} className="cursor-default">开源爱好者</span>
  <span> / </span>
  <span ref={f1TriggerRef} className="cursor-default">F1爱好者</span>
</p>
```
