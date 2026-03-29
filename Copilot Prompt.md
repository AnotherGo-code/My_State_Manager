# 🎯 时间管理养成类应用 - 完整开发指南

**最后更新**：2026年3月29日  
**项目状态**：开发中 (MVP 已完成基础功能)

---

## 📌 一、项目概述

### 项目名称

**My State Manager** - 一个游戏化时间管理应用，帮助用户通过可视化课程表、任务进度追踪和学习日志实现时间管理和自我监督。

### 核心定位

- **目标用户**：大学生、自学者、需要时间管理的专业人士
- **核心价值**：将任务分解为时间片段，通过"打卡"完成进度追踪，形成可视化反馈
- **创新点**：任务单元系统（TaskUnit）+ 周课表可视化 + 社交监督机制

### 技术栈

| 技术 | 版本 | 用途 |
| ------ | ------ | ------ |
| React | 19.2.4 | 前端UI框架 |
| TypeScript | - | 类型安全 |
| Vite | 8.0.1 | 构建工具和开发服务器 |
| Supabase | - | 后端数据库和身份验证 |
| pnpm | - | 包管理工具 |
| CSS-in-JS | - | 样式（内联样式对象） |

### 项目结构

```py
My_State_Manager/
├── src/
│   ├── App.tsx           # 主应用组件（1109+ 行）
│   ├── main.tsx          # 应用入口
│   ├── index.css         # 全局样式
│   └── supabaseClient.ts # Supabase 客户端配置
├── public/               # 静态资源
├── .env.local           # 环境变量（Supabase 配置）
├── package.json         # 依赖管理
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 构建配置
├── pnpm-lock.yaml       # 依赖锁定文件
├── UI界面示意图.png     # 界面设计稿
└── supabase_setup.sql   # Supabase 表结构
```

---

## 🎨 二、UI 界面设计

### 2.1 总体布局

**参考**：[UI界面示意图.png](UI界面示意图.png)

**响应式 3 列布局**：

- **左侧面板**：18% 宽度，黑色背景
- **中间区域**：64% 宽度，主内容区
- **右侧编辑面板**：18% 宽度，黑色背景

**整体尺寸**：100vh (满屏)、100% 宽度

### 2.2 配色方案

#### 深色主题（Apple 风格极简设计）

| 用途 | 颜色 | HEX 代码 |
| ------ | ------ | --------- |
| 背景 | 极深黑 | `#0f0f0f` |
| 容器 | 深灰黑 | `#1a1a1a` |
| 卡片/组件 | 深灰 | `#2a2a2a` |
| 悬停状态 | 中深灰 | `#333` / `#3a3a3a` |
| 主文本 | 白色 | `#fff` |
| 次文本 | 浅灰 | `#e5e5e5` |
| 弱文本 | 中灰 | `#b0b0b0` / `#888` |
| 主色调 | 蓝色 | `#2a6dd3` |
| 成功 | 绿色 | `#28a745` |
| 警告 | 橙色 | `#fb923c` / `#f59e0b` |
| 强调 | 粉红 | `#fda4af` |

### 2.3 组件详细描述

#### 顶部 Header (60px 高度)

**布局**：

- **左侧**：学校标志 + 用户头像 (32px) + 用户名 (font-size: 12px)
- **中间**：当前周数标题 (font-size: 18px, color: #888) + 日期范围
- **右侧**：日历按钮 (✓ 已预留，hover: #333)

**样式**：

- 背景：`#1a1a1a`
- 下边框：`1px solid #2a2a2a`
- 文本颜色：`#fff` (标题), `#888` (副文本)
- 字体权重：500 (标题), 400 (副文本)

#### 左侧边栏 (18% 宽度)

**分两个区域**：

##### 1️⃣ 课程列表区域 (上半部分)

**组件**：

- **标题**："📚 Courses" (font-size: 14px, color: #fff)
- **添加按钮**：绿色 `#28a745`，hover → `#32b14a`
- **课程项**：
  - 背景：`#2a2a2a`
  - 左侧彩色点：8px 圆形指示器 (课程颜色)
  - 课程名称 (font-size: 12px)
  - Hover 效果：背景 → `#333`，可点击进入编辑

##### 2️⃣ 学习日记区域 (下半部分)

**组件**：

- **Textarea**：2 行高度，`#2a2a2a` 背景，`#3a3a3a` 边框
- **添加按钮**：绿色 `#28a745`，hover → `#32b14a`
- **占位符文本**："Dairy / Log Area"
  - font-size: 48px
  - color: `#4a5a6a`
  - opacity: 0.4
  - 居中显示
- **日期**：font-size: 11px, color: `#666`

#### 中间主要区域 (64% 宽度)

**分两部分**：

##### 📊 上部：任务进度区 (20% 高度)

**布局**：

- **标题行**："✅ 任务进度" + "+ 添加任务" 按钮
- **任务卡片网格**：`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`
- **单个任务卡片**：
  - 背景：`#1a1a1a`
  - 边框：`1px solid #2a2a2a`
  - 圆角：6px
  - 内边距：12px
  - Hover：背景 → `#222`，边框 → `#3a3a3a`
  
  **卡片内容**：
  - 任务名 + 进度比例 (font-size: 13px, color: 任务颜色 / #888)
  - 进度条：
    - 背景：`#2a2a2a`
    - 前景：任务颜色
    - 高度：4px
    - 圆角：2px
  - 完成百分比：font-size: 10px, color: #666
  - **新增**：📋 任务单元统计 (如 "2/4 任务单元完成")

##### 📅 下部：时间表区 (80% 高度)

**网格布局**：

- 行：8:00 - 22:00 (15 行)
- 列：时间列 (50px) + 周一到周五 (5 列)
- 间隔：2px
- 总体边框：2px solid `#333`

**单元格样式**：

- 默认背景：`#1f2435`
- 最小高度：50px
- 底部边框：`1px solid #2a3040`
- 悬停：可点击

**事件渲染**（课程块）：

- 位置：绝对定位，top/left/right: 4px，height: 28px
- 颜色：课程颜色
- 字体：10px，加粗标题
- 圆角：4px
- 阴影：`0 1px 3px rgba(0,0,0,0.3)`

**任务单元渲染**（彩色标签）：

- 位置：绝对定位，top: 34px（不与课程重叠）
- 尺寸：height: 24px
- 格式：`{任务名} +{计划进度}` (如 "Reading +3")
- 颜色：任务颜色
- 字体：8px，font-weight: 500
- 状态：
  - 进行中：正常显示
  - 已完成：opacity: 0.6，text-decoration: line-through
- 可点击：点击打开 Edit Zone

#### 右侧编辑面板 (18% 宽度)

**整体**：

- 背景：`#1a1a1a`
- 左边框：`1px solid #2a2a2a`
- 内边距：16px
- 可滚动

**标题**："Edit\nZone"

- font-size: 32px
- color: `#2a6dd3`
- 居中
- lineHeight: 1.0
- fontWeight: 400

**条件渲染面板**：

##### 1️⃣ TaskUnit 编辑面板

**显示内容**：

- 标题："任务单元详情"
- 任务名称
- 时间：周X HH:MM
- 计划进度（显示）
- 实际进度（输入框）
- 状态指示（进行中 🟡 / 已完成 🟢）

**打卡按钮**：

- 未完成状态：绿色 `#28a745`，hover → `#32b14a`
- 已完成状态：灰色 `#555`，disabled
- 功能：
  - 将 `completed_amount` 加到任务总 `progress`
  - 更新 TaskUnit 状态为 `done`
  - 立即反馈（进度条更新、标签变灰）

##### 2️⃣ 课程编辑面板

**表单字段**：

- 课程名称（文本输入）
- 颜色选择器（color input）
- 保存/取消按钮

**按钮样式**：

- 保存：绿色 `#28a745`
- 取消：灰色 `#555`

##### 3️⃣ 任务编辑面板

**表单字段**：

- 任务名称（文本输入）
- 总进度（数字输入）
- 颜色选择器（color input）
- 保存/取消按钮

**按钮样式**：同课程编辑

**所有表单通用样式**：

- 卡片背景：`#2a2a2a`
- 标签字样：font-size: 11px, color: #b0b0b0, font-weight: 400
- 输入框：
  - 背景：`#333`
  - 边框：`1px solid #3a3a3a`
  - 文本颜色：`#e5e5e5`
  - 圆角：4px
  - 内边距：6px

---

## 🗂️ 三、核心数据模型

### Entity Relationship Diagram

```py
User
├── Profile (avatar, university, calendar_config)
└── Owns:
    ├── Courses
    ├── Tasks
    ├── TaskUnits (关联 Tasks)
    └── Diaries
        └── DiaryEntries
```

### 3.1 用户 (User)

| 字段 | 类型 | 说明 |
| ------ | ------ | ------ |
| id | UUID | 主键（Supabase Auth 自动生成） |
| email | String | 邮箱 |
| username | String | 用户名 |
| avatar_url | String | 头像 URL |
| university | String | 学校名称 |
| calendar_config | JSON | 校历配置 |

### 3.2 课程 (Course)

| 字段 | 类型 | 说明 |
| ------ | ------ | ------ |
| id | UUID | 主键 |
| user_id | UUID | 用户 ID (外键) |
| name | String | 课程名称 (如 "数据库原理") |
| color | String | 颜色代码 (如 "#3B82F6") |
| schedule | JSON Array | 时间段数组，包含 day_of_week, start_time, end_time |
| is_optional | Boolean | 是否为选修课 |
| note | String | 备注 |
| created_at | Timestamp | 创建时间 |

**schedule 示例**：

```json
[
  { "day_of_week": 1, "start_time": "09:00", "end_time": "10:00" },
  { "day_of_week": 3, "start_time": "14:00", "end_time": "15:00" }
]
```

### 3.3 任务 (Task)

| 字段 | 类型 | 说明 |
| ------ | ------ | ------ |
| id | UUID | 主键 |
| user_id | UUID | 用户 ID (外键) |
| name | String | 任务名称 (如 "阅读论文") |
| progress | Number | 当前进度 (默认 0) |
| total | Number | 总进度 (如 100) |
| color | String | 颜色代码 (如 "#fb923c") |
| created_at | Timestamp | 创建时间 |

### 3.4 任务单元 (TaskUnit) 【核心】

**定义**：任务的时间片段，可嵌入周课表

| 字段 | 类型 | 说明 |
| ------ | ------ | ------- |
| id | UUID | 主键 |
| task_id | UUID | 任务 ID (外键) |
| day_of_week | Number | 星期几 (0=周一, 4=周五) |
| start_time | String | 开始时间 (如 "09:00") |
| end_time | String | 结束时间 (如 "10:00") |
| planned_amount | Number | 计划进度 (如 +3) |
| completed_amount | Number | 实际完成 (默认 0) |
| status | Enum | "pending" / "done" |

**TaskUnit 生命周期**：

```py
pending → (用户打卡) → done
↓
显示在时间表中作为彩色标签
点击可在 Edit Zone 编辑实际进度
点击"打卡完成"将进度加到 Task.progress
```

### 3.5 日记 (Diary)

| 字段 | 类型 | 说明 |
| ------ | ------ | ------ |
| id | UUID | 主键 |
| user_id | UUID | 用户 ID (外键) |
| date | Date | 日期 |

### 3.6 日记条目 (DiaryEntry)

| 字段 | 类型 | 说明 |
| ------ | ------ | ------ |
| id | UUID | 主键 |
| diary_id | UUID | 日记 ID (外键) |
| content | String | 条目内容 |
| created_at | Timestamp | 创建时间戳 |

---

## 🔌 四、Supabase 配置

### 4.1 连接信息

| 项目 | 值 |
| ------ | ----- |
| **Supabase URL** | `https://glmvftjwtrghfizwwkdb.supabase.co` |
| **Anon Key** | `sb_publishable_k8wGG5gvFD4V8Hga71FCaw_gTjMOrQH` |
| **项目 ID** | `glmvftjwtrghfizwwkdb` |

### 4.2 环境变量配置

**.env.local**：

```py
VITE_SUPABASE_URL=https://glmvftjwtrghfizwwkdb.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_k8wGG5gvFD4V8Hga71FCaw_gTjMOrQH
```

### 4.3 数据库表

**初始化 SQL**：见 `supabase_setup.sql`

**表清单**：

- `users` (Supabase Auth 自动创建)
- `courses`
- `tasks`
- `task_units`
- `diaries`
- `diary_entries`

### 4.4 认证流程

**三种模式**：

1. **正常登录**（已实现）
   - 邮箱 + 密码
   - 拥有全部权限（读写）

2. **访客模式**（TODO）
   - 输入用户 ID
   - 只读访问（不能编辑）

3. **学伴模式**（TODO）
   - 邮箱 + 密码 + 对方用户 ID
   - 权限：可修改 TaskUnit，不可修改 Course/Task

---

## 🚀 五、技术实现细节

### 5.1 Supabase 客户端

**文件**：`src/supabaseClient.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function getSessionWithTimeout(timeoutMs: number) {
  // 实现超时机制，防止长时间等待
  // 返回 { data, error } 对象
}
```

### 5.2 React 组件结构

**App.tsx** (主要文件，1109+ 行)

**状态管理**（全部 useState）：

```typescript
// 身份验证
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const [sessionError, setSessionError] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isLogin, setIsLogin] = useState(true);

// 数据
const [courses, setCourses] = useState<Course[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [taskUnits, setTaskUnits] = useState<TaskUnit[]>([]);

// UI 状态
const [showCalendar, setShowCalendar] = useState(false);
const [selectedTaskUnit, setSelectedTaskUnit] = useState<TaskUnit | null>(null);
const [editingCourse, setEditingCourse] = useState<Course | null>(null);
const [editingTask, setEditingTask] = useState<Task | null>(null);
const [newDiaryEntry, setNewDiaryEntry] = useState("");
```

**示例数据**：

```typescript
// 示例任务
const exampleTaskUnits: TaskUnit[] = [
  {
    id: 'tu1',
    task_id: 'task1',
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    planned_amount: 3,
    completed_amount: 0,
    status: 'pending'
  },
  // ... 更多示例
];
```

### 5.3 打卡功能实现

**核心逻辑**（Edit Zone 中）：

```typescript
onClick={() => {
  const targetTask = tasks.find(t => t.id === selectedTaskUnit.task_id);
  if (!targetTask) return;
  
  // 1. 更新任务单元状态
  const updatedTaskUnit = { 
    ...selectedTaskUnit, 
    completed_amount: selectedTaskUnit.planned_amount, 
    status: 'done' 
  };
  setTaskUnits(taskUnits.map(tu => tu.id === selectedTaskUnit.id ? updatedTaskUnit : tu));
  setSelectedTaskUnit(updatedTaskUnit);
  
  // 2. 更新任务进度（不超过总值）
  const newProgress = Math.min(
    targetTask.progress + updatedTaskUnit.completed_amount, 
    targetTask.total
  );
  const updatedTask = { ...targetTask, progress: newProgress };
  setTasks(tasks.map(t => t.id === selectedTaskUnit.task_id ? updatedTask : t));
}}
```

### 5.4 样式系统

**方案**：CSS-in-JS（内联 style 对象）

**优点**：

- 不需要外部 CSS 文件
- 完整的 TypeScript 类型检查
- 动态样式支持

**示例**：

```typescript
<div style={{
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: "6px",
  padding: "12px",
  transition: "all 0.2s"
}}>
  {/* 内容 */}
</div>
```

---

## 📊 六、当前实现状态

### ✅ 已完成

- [x] 3 列响应式布局 (18%-64%-18%)
- [x] Header 组件（60px 高度）
- [x] 左侧边栏（课程列表 + 学习日记）
- [x] 任务进度卡片网格（显示进度条和完成百分比）
- [x] 时间表 Grid（周一到周五，8:00-22:00）
- [x] 课程块渲染（coloring, 绝对定位）
- [x] **TaskUnit 系统**（4 个示例任务单元）
- [x] **TaskUnit 在时间表中显示**（彩色标签，可点击）
- [x] **打卡完成功能**（更新进度，状态反馈）
- [x] **编辑面板**（课程、任务、TaskUnit 编辑表单）
- [x] **深色主题**（Apple 风格最小化设计）
- [x] **示例数据初始化**（未登录时自动加载）
- [x] Supabase 认证框架（Login/Signup 表单）
- [x] TypeScript 编译无错误
- [x] Vite 构建成功（109ms）
- [x] 开发服务器运行 (localhost:5174)

### 🔄 开发中

- [ ] Supabase 数据持久化（save handlers）
- [ ] Calendar 日期选择器功能
- [ ] TaskUnit 更多操作（编辑、删除）
- [ ] 日记内容保存到 Supabase

### 📋 待实现

- [ ] 访客模式登录
- [ ] 学伴模式权限管理
- [ ] 课程时间段复杂编辑
- [ ] 任务单元批量创建
- [ ] 成就系统和徽章
- [ ] 数据统计分析页面
- [ ] 移动端响应式适配
- [ ] 离线支持（Progressive Web App）
- [ ] 实时协作功能（多用户同步）
- [ ] 校历共享与同步

---

## 🔗 七、外部链接

### 项目仓库

| 服务 | 链接 |
| ------ | ------ |
| **GitHub** | `https://github.com/AnotherGo-code/My_State_Manager` |
| **主分支** | `main` |
| **最新提交** | `42c0f11` (2026-03-29) |

### 开发环境

| 工具 | 跳转 |
| ------ | ----- |
| **本地开发** | `http://localhost:5174/` |
| **Supabase 控制台** | `https://app.supabase.com/` |
| **Vite 文档** | `https://vite.dev/` |
| **React 文档** | `https://react.dev/` |

---

## ⚙️ 八、开发规范

### 8.1 文件命名

- **React 组件**：PascalCase (如 `src/App.tsx`)
- **工具函数**：camelCase (如 `fetchCourses()`)
- **类型定义**：PascalCase 和 Interface (如 `interface Task { }`)

### 8.2 提交规范

**Commit Message 格式**：

```py
<type>: <subject>

<description>

- <detail 1>
- <detail 2>
```

**Types**：

- `feat`: 新功能
- `fix`: 修复
- `style`: 样式调整
- `refactor`: 代码重构
- `chore`: 依赖更新、CI/CD 等

**示例**：

```py
feat: 实现任务单元系统和任务列表组件

- 启用 TaskUnit 状态管理
- 创建 4 个示例任务单元关联 2 个任务
- 在时间表中显示和点击任务单元
- 实现打卡完成功能（更新任务进度）
```

### 8.3 代码风格

- **缩进**：2 spaces
- **分号**：必需
- **引号**：双引号优先
- **箭头函数**：优先于 function 关键字
- **TypeScript**：禁止 `any` 类型，使用明确的类型注解

### 8.4 UI 更新流程

1. **修改样式**：使用 `replace_string_in_file` 或 `multi_replace_string_in_file`
2. **验证编译**：运行 `pnpm build`（确保无 TypeScript 错误）
3. **本地测试**：访问 Dev Server，手动交互测试
4. **提交代码**：`git add . && git commit -m "..."`
5. **推送**：`git push origin main`

---

## 🎯 九、下一步行动计划

### Phase 1: MVP 功能完成（当前）

- [x] 核心 UI 布局
- [x] TaskUnit 系统
- [x] 打卡功能
- [ ] **Supabase 数据持久化**（优先级最高）
- [ ] **Calendar 功能**

### Phase 2: 增强功能

- [ ] 访客模式和学伴模式
- [ ] 复杂课程编辑（多时间段）
- [ ] 日记高级功能（标签、搜索）

### Phase 3: 社交和分析

- [ ] 成就系统
- [ ] 学习统计分析
- [ ] 社群分享功能

### Phase 4: 产品化

- [ ] 移动端适配
- [ ] PWA 离线支持
- [ ] 多语言国际化

---

## 📝 十、AI 助手快速参考

### 常见任务清单

**添加新功能**：

1. 更新数据模型（如有需要）
2. 在 Supabase 创建/修改表结构
3. 更新 App.tsx 中的 state 和类型
4. 实现 UI 组件
5. 添加 TODO 或 handler 逻辑
6. 验证编译和运行
7. 提交 commit

**修复 UI 问题**：

1. 定位问题代码位置（使用 grep_search 或 read_file）
2. 理解当前样式和逻辑
3. 使用 `replace_string_in_file` 修改
4. 在浏览器中验证
5. 提交 commit

**性能优化**：

1. 检查冗余 state 更新
2. 考虑 useMemo/useCallback（如果需要）
3. 优化 Supabase 查询
4. 测试构建大小和加载时间

---

## 📞 联系与支持

**主要开发者**：@AnotherGo-code  
**项目仓库**：<https://github.com/AnotherGo-code/My_State_Manager>
**最后更新**：2026 年 3 月 29 日

---

**🚀 祝 AI 助手开发愉快！**
at

---

## 三、页面结构

### 1️⃣ 顶部 Header

Copilot Prompt：

```javascript
// 创建一个顶部导航栏组件，包括：
// 左侧：学校名称（可点击）、用户头像（可修改）、用户名（可编辑）
// 中间：当前周数（Week N）和日期范围
// 右侧：Calendar按钮（点击展开日期选择器）
```

---

### 2️⃣ 中上区域（课程 + 任务）

```javascript
// 创建一个双栏区域：
// 左侧：课程列表（带颜色标识）
// - 点击课程可编辑（名称、颜色、时间等）
// - 支持新增课程
//
// 中间：任务列表
// - 显示任务名称
// - 显示进度条（progress / total）
// - 支持点击编辑
```

---

### 3️⃣ 核心：时间表（Timetable）

```javascript
// 创建一个周课表组件：
// - 列：周一到周五
// - 行：时间段（如8:00-22:00）
// - 使用CSS Grid实现
//
// 每个格子可以包含：
// 1. 课程背景块（颜色区分）
// 2. 任务单元标签（如 "Reading +3"）
```

---

### 4️⃣ 任务单元交互（关键逻辑）

```javascript
// 实现任务单元点击逻辑：
// - 点击后，在右侧Edit Zone打开详情面板
// - 显示：任务名称、计划进度、实际完成进度
// - 允许用户修改完成进度（包括设为0）
// - 点击“打卡”按钮：
//   → 将完成进度加到任务总进度
//   → 更新任务单元状态为完成
```

---

### 5️⃣ 右侧 Edit Zone

```javascript
// 创建一个右侧编辑面板（Edit Zone）：
// 功能包括：
// - 编辑课程
// - 编辑任务
// - 编辑任务单元
// - 显示“打卡”按钮
// - 支持新增/删除
```

---

### 6️⃣ 左侧 Diary / Log 区域

```javascript
// 创建一个日志系统：
// - 显示选定日期的日志
// - 支持添加多条记录
// - 每条记录带时间戳
// - 可编辑历史记录（保留时间顺序）
```

---

### 7️⃣ Calendar 功能

```javascript
// 创建一个日期选择器：
// - 类似Windows日历
// - 点击日期后：
//   → 更新时间表显示的周
//   → 更新日志区域内容
```

---

## 四、用户系统（分权限）

```javascript
// 实现三种登录模式：

// 1. 正常登录：
// - 邮箱 + 密码
// - 拥有全部权限

// 2. 访客模式：
// - 输入用户ID
// - 只读访问（不能编辑）
// - 不可查看Diary

// 3. 学伴模式：
// - 输入自己的账号 + 密码 + 对方ID
// - 权限：
//   - 可修改任务单元
//   - 不可修改课程/任务本体
//   - 不可访问日志
```

---

## 五、Supabase 集成（后端）

```javascript
// 使用Supabase实现：
// - 用户认证（Auth）
// - 数据库存储
// - 实时同步（Realtime）

// 需要实现：
// - 获取任务列表
// - 更新任务进度
// - 获取时间表数据
// - 写入日志
```

---

## 六、开发顺序（强制遵守）

```text
1. 页面布局（静态）
2. 任务系统（本地useState）
3. 时间表（静态数据）
4. 任务单元交互
5. 接入Supabase
6. 用户系统
7. Diary系统
```

---

## 七、UI风格要求

```javascript
// 风格要求：
// - 简洁
// - 类似Notion + Google Calendar
// - 使用柔和配色
// - 支持颜色标记（课程/任务）
```

---

## 八、进阶功能（后续）

```javascript
// 可选扩展：
// - 成就系统（徽章）
// - 统计分析（完成率、学习速度）
// - 校历共享
// - 随机“金句”展示
```

---

## 九、最终目标

```text
实现一个可部署的Web应用，支持：
- 多设备同步
- 可视化时间管理
- 游戏化进度追踪
- 社交监督机制
```
