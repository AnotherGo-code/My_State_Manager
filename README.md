# 🎯 Gamified Time Management App

一个基于React + TypeScript + Vite开发的游戏化时间管理应用，帮助大学生更好地规划学习和生活。

## ✨ 主要功能

- 📚 **课程管理**：添加和管理你的课程安排
- ✅ **任务进度追踪**：可视化任务完成进度，采用游戏化设计
- 📅 **智能时间表**：8:00-22:00的时间网格，支持周一到周五的课程和任务安排
- 📖 **学习日记**：记录每日学习心得和反思
- ⚙️ **编辑面板**：便捷的课程、任务和任务单元编辑功能

## 🎨 设计特色

- **3列响应式布局**：左侧课程/日记、中间任务进度/时间表、右侧编辑区域
- **Notion风格界面**：简洁现代的设计语言
- **Google Calendar启发**：直观的时间网格布局
- **游戏化元素**：进度条、颜色编码等激励性设计

## 🛠️ 技术栈

- **前端框架**：React 19.2.4 + TypeScript
- **构建工具**：Vite 8.0.1
- **后端服务**：Supabase
- **样式方案**：CSS-in-JS (内联样式)
- **包管理**：pnpm

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📁 项目结构

```
src/
├── App.tsx              # 主应用组件
├── App.css              # 应用样式
├── index.css            # 全局样式
├── main.tsx             # 应用入口
├── supabaseClient.ts    # Supabase客户端配置
└── assets/              # 静态资源
```

## 🔧 配置说明

### Supabase设置

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 复制项目URL和API密钥
3. 创建 `.env.local` 文件并配置：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 数据库表结构

运行 `supabase_setup.sql` 中的SQL语句创建所需的数据表。

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
