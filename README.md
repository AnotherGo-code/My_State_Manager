# 🎯 My State Manager - 时间管理养成类应用

**项目状态**：MVP 已完成基础功能 | **最后更新**：2026年3月30日

## 📌 项目概述

**My State Manager** 是一个游戏化时间管理应用，帮助大学生、自学者通过**可视化课程表、任务进度追踪和学习日志**实现高效时间管理与自我监督。

### 🎯 核心特性

- ✅ **课程管理**：添加课程并在周课表中可视化
- ✅ **任务进度追踪**：游戏化进度条，支持打卡完成
- ✅ **智能时间表**：8:00-22:00 时间网格（周一～周五）
- ✅ **任务单元系统**：将任务分解为时间片段，支持状态追踪
- ✅ **学习日记**：记录每日学习心得反思
- ✅ **实时编辑面板**：快捷编辑课程、任务、任务单元

### 🎨 设计理念

- **3列响应式布局**：左侧课程/日记 | 中间任务进度/时间表 | 右侧编辑区
- **Notion风格极简设计**：深色主题，Apple设计语言
- **游戏化激励**：进度条、颜色编码、打卡反馈
- **One-Click编辑**：点击即编辑，无需切屏幕

---

## 🚀 快速开始

### 环境要求

- **Node.js** 18+
- **pnpm** 或 npm

### 安装与启动

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm dev
# 访问 http://localhost:5173

# 3. 构建生产版本
pnpm build

# 4. 预览生产构建
pnpm preview
```

### 环境配置

#### Supabase 项目配置

创建 `.env.local` 文件，配置 Supabase 凭证：

```env
VITE_SUPABASE_URL=https://glmvftjwtrghfizwwkdb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_k8wGG5gvFD4V8Hga71FCaw_gTjMOrQH
```

**项目信息**：

- **项目ID**：`glmvftjwtrghfizwwkdb`
- **Publishable Key**：`sb_publishable_k8wGG5gvFD4V8Hga71FCaw_gTjMOrQH`

运行 `supabase_setup.sql` 初始化数据库表结构。

#### 部署配置

**Vercel 部署（推荐）**：

1. 将项目推送到 GitHub
2. 在 [Vercel 仪表盘](https://vercel.com) 导入项目
3. 在部署配置中添加环境变量（同 `.env.local`）
4. 配置项目设置：
   - Framework: Other
   - Build Command: `pnpm build`
   - Output Directory: `dist`
5. 点击 Deploy 完成部署

**本地生产构建预览**：

```bash
pnpm build    # 构建生产版本
pnpm preview  # 预览生产构建
```

---

## 📊 技术栈

| 技术 | 版本 | 用途 |
| ------ | ------ | ------ |
| React | 19.2.4 | 前端UI框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 8.0.1 | 构建工具 & 开发服务器 |
| Supabase | - | 后端 & 身份验证 |
| CSS-in-JS | - | 内联样式 |
| pnpm | - | 包管理 |

---

## 📁 项目结构

```md
src/
├── App.tsx                    # 主应用（413行）- 核心逻辑和状态管理
├── components/
│   ├── Header.tsx            # 顶部导航栏（180+行）- 用户信息、周数、打开状态日历
│   ├── Sidebar.tsx           # 左侧边栏（50行）- 日记区域
│   ├── CoursesAndTasks.tsx   # 并排组件（180+行）- 课程列表 + 任务卡片
│   ├── Timetable.tsx         # 时间表网格（160+行）- 课程背景块 + 任务圆角矩形
│   ├── EditZone.tsx          # 右侧编辑面板（255行）- 编辑表单
│   ├── TaskProgress.tsx      # [已弃用] 任务进度卡片 - 废弃组件
├── supabaseClient.ts         # Supabase 客户端配置
├── main.tsx                  # 应用入口
├── index.css                 # 全局样式
└── assets/                   # 静态资源
```

### 组件划分

| 组件 | 职责 | 行数 | 新特性 |
| ------ | ------ | ------ | ------ |
| **Header** | 顶部导航、学校信息、用户信息、周数显示、打开状态日期选择器 | 180+ | 用户头像、日历弹层、粉色周标题 |
| **Sidebar** | 学习日记区域 | 50 | 简化设计，齐平时间表 |
| **CoursesAndTasks** ⭐ | 并排显示课程列表（左）+ 任务卡片（右） | 180+ | 新组件，共享一个区域，无分界线 |
| **Timetable** ⭐ | 时间网格、课程背景块、任务圆角矩形 | 160+ | 课程填充背景，任务浮层显示 |
| **EditZone** | 任务单元编辑、课程编辑、任务编辑 | 255 | 保持不变 |

---

## 🎨 UI设计规范

### 布局

**3列响应式布局**（100% 宽、100vh 高）：

- 左侧：18% 宽（课程 + 日记）
- 中间：64% 宽（主内容区）
- 右侧：18% 宽（编辑面板）

### 配色方案（深色主题）

| 用途 | 颜色 | HEX |
| ---- | ---- | ------ |
| 背景 | 极深黑 | `#0f0f0f` |
| 容器 | 深灰黑 | `#1a1a1a` |
| 卡片 | 深灰 | `#2a2a2a` |
| 悬停 | 中深灰 | `#333` |
| 主文本 | 白色 | `#fff` |
| 次文本 | 浅灰 | `#e5e5e5` |
| 弱文本 | 中灰 | `#b0b0b0` |
| 主色调 | 蓝色 | `#2a6dd3` |
| 成功 | 绿色 | `#28a745` |
| 警告 | 橙色 | `#fb923c` |
| 强调 | 粉红 | `#fda4af` |

### 关键组件样式

**Header** (160px 高，3个区域)：

- **左侧**：学校名称（"XXX Univ." 红色）+ 用户头像（48x48px 蓝色圆形）+ 用户信息（"Greatest Me" + 邮箱）
- **中间**：Week N（32px 金色#c9a961 标题）+ 日期范围（yyyy.mm.dd ~ yyyy.mm.dd）
- **右侧**：Calendar 按钮，点击后显示打开状态的日期选择器（Windows 风格）
  - 日期选择器包含：月份导航、日期网格、"今天"/"关闭"快速按钮

**日期选择器**（打开状态的日历）：

- 样式：深色卡片，280px 宽，浮层显示（position: absolute）
- 功能：选择日期改变当前周、返回今天、关闭弹层
- 布局：7x7 网格（星期行 + 日期行），月份导航在顶部

**CoursesAndTasks** (并排显示，约200px 高)：

- **左侧（50%）**：名为 "Courses:" 的课程列表
  - 紧凑项目：彩色点 + 课程名（竖向堆叠）
  - 各项约 28px 高，极简设计
- **右侧（50%）**：名为 "Tasks:" 的任务卡片
  - 紧凑卡片：任务名 + 比例 + **简约进度条**（约50px高）
  - **进度条设计**（🎨 新特性）：
    - 已完成部分：粗线条（3px 高）
    - 未完成部分：细线条（1px 高）
    - 完成百分比 + 任务单元统计
  - 中间无分界线，两侧无分割

**Sidebar**（日记区域）：

- 上边界与时间表齐平
- 标题："Diary / Log Area"（浅灰色）
- 内容：textarea + 添加按钮 + 日期

**Timetable** (时间网格，占据所有剩余空间)：

- **课程显示**：填满对应时间块的背景颜色（低透明度，0.3）
  - 悬停时透明度上升到 0.5，视为可交互
- **任务显示**：圆角矩形（3px radius）浮层在课程上方
  - 高度 16px，显示任务首字母 + "+n"（如 R+3）
  - 点击可选中，支持hover缩放效果
  - 超过一个时显示在不同垂直位置（错开）
- **网格布局**：45px 时间列 + 5 列日期（Mon-Fri）
- **时间跨度**：8:00 ~ 22:00（15小时行）

---

## 📋 数据模型

### Core Entities

```md
User (Supabase Auth)
├── Courses [] - 课程列表
├── Tasks [] - 任务列表
├── TaskUnits [] - 任务单元（关联 Tasks）
└── Diaries [] - 学习日记
```

### 1️⃣ Course（课程）

```typescript
interface Course {
  id: string;                 // UUID
  user_id: string;            // 用户ID
  name: string;               // 名称
  color: string;              // 颜色 (十六进制)
  schedule: Array<{           // 时间段数组
    day_of_week: number;      // 0-4 (一～五)
    start_time: string;       // "09:00"
    end_time: string;         // "10:00"
  }>;
  is_optional: boolean;       // 是否选修
  note: string;               // 备注
  created_at: string;         // 创建时间
}
```

### 2️⃣ Task（任务）

```typescript
interface Task {
  id: string;                 // UUID
  user_id: string;            // 用户ID
  name: string;               // 任务名 (如"阅读")
  progress: number;           // 当前进度
  total: number;              // 总进度 (如100)
  color: string;              // 颜色
  created_at: string;         // 创建时间
}
```

### 3️⃣ TaskUnit（任务单元 - 核心）

**定义**：任务的时间片段，嵌入时间表

```typescript
interface TaskUnit {
  id: string;                 // UUID
  task_id: string;            // 任务ID (外键)
  day_of_week: number;        // 0-4 (一～五)
  start_time: string;         // "09:00"
  end_time: string;           // "10:00"
  planned_amount: number;     // 计划进度 (如+3)
  completed_amount: number;   // 实际完成
  status: 'pending'|'done';   // 状态
}
```

**生命周期**：

```md
pending → (用户点击打卡) → done
  ↓
- 在时间表显示为彩色标签
- completed_amount 加到 Task.progress
- 标签变灰 + 删除线
```

---

## 🔧 核心功能实现

### 认证流程

1. 用户打开应用 → 检查 Supabase session
2. 有 session → 加载用户数据 → 显示主界面
3. 无 session → 显示登录/注册
4. 自动恢复登录状态（即使刷新页面）

### 时间表渲染

```md
for each hour (8:00 - 22:00):
  for each day (一～五):
    // 渲染课程块（绝对定位）
    if course.schedule [day][hour]:
      render Course Block
    
    // 渲染任务单元（绝对定位，top: 34px）
    if taskUnits [day][hour]:
      render TaskUnit Label
```

### 编辑面板（Edit Zone）

三层条件渲染：

```md
if selectedTaskUnit:
  → 显示任务单元详情 + 打卡按钮
else if editingCourse:
  → 显示课程编辑表单
else if editingTask:
  → 显示任务编辑表单
else:
  → 显示"点击项目进行编辑"提示
```

---

## 👨‍💻 开发指南

### 要添加新功能怎么做？

#### 1. 修改数据模型

在 `App.tsx` 中更新 interface：

```typescript
// src/App.tsx
export interface MyNewEntity {
  id: string;
  // ... 字段
}
```

#### 2. 在 Supabase 创建表

在 `supabase_setup.sql` 中添加创建语句，然后运行初始化。

#### 3. 在 App 中添加状态

```typescript
const [myData, setMyData] = useState<MyNewEntity[]>([]);

async function fetchMyData() {
  const { data, error } = await supabase.from("my_table").select("*");
  if (!error) setMyData(data || []);
}
```

#### 4. 创建新组件

在 `src/components/` 中创建 `MyComponent.tsx`：

```typescript
import React from "react";
import type { MyEntity } from "../App";

interface MyComponentProps {
  data: MyEntity[];
  setData: (data: MyEntity[]) => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ data, setData }) => (
  <div>
    {/* 组件内容 */}
  </div>
);

export default MyComponent;
```

#### 5. 在 App 中引入使用

```typescript
// App.tsx
import MyComponent from "./components/MyComponent";

// 在返回的 JSX 中使用
<MyComponent data={myData} setData={setMyData} />
```

### 常见开发任务

| 任务 | 位置 | 代码示例 |
| ---- | ---- | ------- |
| 修改颜色 | 各组件 style 属性 | `backgroundColor: "#2a6dd3"` |
| 调整布局宽度 | Header/Sidebar/Timetable | `width: "18%"` |
| 添加新按钮 | 任何组件内 | `<button onClick={handler}>...</button>` |
| 修改表格行数 | Timetable | `Array.from({ length: 15 })` |
| 修改表格列数 | Timetable | `[0,1,2,3,4].map()` |

---

## 🏢 大规模开发建议

### 当前状态

- ✅ 所有组件 < 260 行（易维护）
- ✅ TypeScript 全覆盖
- ✅ 模块化架构
- ✅ props drilling 控制良好

### 下一步优化建议

1. **状态管理**：当 prop 层级 > 3 层时考虑 Context API 或 Redux
2. **样式系统**：CSS Module 或 Tailwind（目前用内联样式）
3. **测试框架**：Jest + React Testing Library
4. **路由**：React Router（未来多页面时）
5. **HTTP 客户端**：考虑 TanStack Query 处理缓存

---

## 📈 项目统计

### 代码拆分效果

| 项 | 数值 |
| -- | ---- |
| 主文件行数 | 1,139 → 386 (-66%) |
| 组件数 | 5 个 |
| 最大组件行数 | 255 行（EditZone） |
| 类型安全 | 100% |
| 零编译错误 | ✅ |

### 编译性能

```md
TypeScript 编译：✅ 无错误
生产构建：
  - HTML: 0.46 kB (gzip: 0.30 kB)
  - CSS: 1.78 kB (gzip: 0.81 kB)
  - JS: 398.85 kB (gzip: 112.90 kB)
开发服务器：VITE v8.0.2 ready in 472ms
热更新：已启用 ✅
```

---

## 🐛 常见问题

### Q1: 为什么打卡后进度没有更新？

**A**: 检查 EditZone 中的 onClick 处理函数是否正确调用了 setTasks：

```typescript
// ✅ 正确做法
const updatedTask = { ...targetTask, progress: newProgress };
setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
```

### Q2: 时间表为什么显示错误？

**A**: 检查 taskUnits day_of_week 是否正确（0=周一，4=周五）：

```typescript
// ✅ 正确的 day_of_week
tu.day_of_week === 0  // 周一
tu.day_of_week === 2  // 周三
tu.day_of_week === 4  // 周五
```

### Q3: 环境变量加载失败？

**A**: 确保 `.env.local` 中的变量名称以 `VITE_` 开头：

```env
# ✅ 正确
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# ❌ 错误
SUBABASE_URL=...
```

### Q4: 如何禁用某个功能？

**A**: 可以简单地注释掉组件或返回 null：

```typescript
// 临时禁用 EditZone
return !editingTask && !editingCourse && !selectedTaskUnit ? (
  <div>Click to edit</div>
) : null;
```

---

## 📞 支持与反馈

- 📧 任何问题，请检查浏览器控制台错误日志
- 🔍 启用 Supabase 日志：在 Supabase Dashboard 查看实时日志
- 💡 代码修改后自动热更新，无需手动刷新

---

## 📄 许可证

MIT License

---

***Happy Coding! 🚀***
