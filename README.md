# 🎯 My State Manager — 游戏化时间管理 SPA

帮助大学生通过**可视化课程表、任务进度追踪和学习日志**实现高效时间管理与自我监督。

## ✨ 核心功能

- **课程管理** — 添加/编辑课程，在周课表中以彩色背景显示（区分必修/水课）
- **任务进度追踪** — 游戏化进度条，将任务分解为时间片段，支持弹性打卡
- **智能时间表** — 15 小时 × 5 天网格（8:00–22:00，周一～周五）
- **学习日记** — 每日日志区域，记录学习心得与日常反思
- **实时编辑面板** — 点击任意元素，右侧面板即时弹出编辑/打卡表单

## 🎨 设计理念

- **3 列响应式布局**：左侧日记 | 中间课程/任务/时间表 | 右侧编辑区
- **Notion 风格极简设计**：深色主题，Apple 设计语言
- **游戏化激励**：进度条、颜色编码、打卡反馈
- **点击即编辑**：无需切换页面，所见即所得

## 🚀 快速开始

### 环境要求

- **Node.js** 18+
- **pnpm**（推荐）或 npm

### 安装与启动

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 → http://localhost:5173
pnpm build            # 类型检查 + 生产构建
pnpm preview          # 预览生产构建
```

### 环境配置

```bash
cp .env.example .env.local
```

在 `.env.local` 中填入你的 [Supabase](https://supabase.com/dashboard) 项目凭证：

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_publishable_key
```

然后运行 `supabase_setup.sql` 初始化数据库表结构。

### 部署（Vercel）

1. 推送项目到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量（同 `.env.local`）
4. 配置：Framework → Other，Build → `pnpm build`，Output → `dist`

## 📊 技术栈

React 19 · TypeScript 5 · Vite 8 · Supabase (Postgres + Auth) · CSS-in-JS · pnpm

## 📁 项目结构

```
src/
├── App.tsx                    # 主应用 — 所有状态管理与 CRUD 逻辑
├── components/
│   ├── Header.tsx             # 顶部栏（用户信息、周数、日历）
│   ├── Sidebar.tsx            # 左侧日记区域
│   ├── CoursesAndTasks.tsx    # 课程列表 + 任务卡片（并排）
│   ├── Timetable.tsx          # 时间表网格（课程背景 + 任务浮层）
│   └── EditZone.tsx           # 右侧编辑/打卡面板
├── supabaseClient.ts          # Supabase 客户端配置
├── main.tsx                   # 应用入口
└── index.css                  # 全局样式
```

## 📄 许可证

MIT

---

***Happy Coding! 🚀***
