# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:5173)
pnpm build            # Type-check + production build (tsc -b && vite build)
pnpm preview          # Preview production build locally
pnpm lint             # Run ESLint
```

## Architecture Overview

This is a **gamified time management SPA** for university students — React 19 + TypeScript + Vite 8, backed by **Supabase** (Postgres + Auth). All styling is inline CSS-in-JS; there is no CSS framework or component library.

### Data flow: Props drilling (no context/store)

`App.tsx` owns all state and CRUD logic. It passes data + callbacks down to 5 child components via props. There is no router, no context, no Redux — just pure props drilling. This works because the component tree is only 2 levels deep.

```
App.tsx (state + CRUD + auth)
├── Header          — user info, week number, calendar popover
├── Sidebar         — diary textarea + entry list
├── CoursesAndTasks — course list (left 50%) + task cards with progress bars (right 50%)
├── Timetable       — 15-hour × 7-day grid (8:00–22:00, Mon–Sun)
└── EditZone        — conditional forms for course/task/task-unit edit & check-in
```

### Layout: 3-column, 100vh flexbox

- **Left 18%**: `Sidebar` (diary area)
- **Center 64%**: `CoursesAndTasks` (top, max 280px) + `Timetable` (flex: 1, fills remaining space)
- **Right 18%**: `EditZone` (conditionally renders forms based on what was clicked)

### Component responsibilities

| Component | Responsibility | Key details |
| --------- | -------------- | ----------- |
| **Header** (160px) | Top bar: school name, user avatar+info, week number, date range, calendar | School name switches university calendar; avatar/name are customizable; calendar popover aligns vertically with EditZone |
| **Sidebar** | Diary / log area | Top edge flush with timetable; title "Diary / Log Area"; textarea + add button + date selector |
| **CoursesAndTasks** (~200px) | Left 50%: course list (colored dot + name). Right 50%: task cards (name + ratio + progress bar) | No divider between halves; compact items ~28px high |
| **Timetable** | 15h × 5d grid (8:00–22:00, Mon–Fri) | 45px time column + 5 day columns. Courses paint cell backgrounds (0.3 opacity). TaskUnits render as 16px rounded labels (e.g. "R+3") floating on top, offset by `idx * 18px` |
| **EditZone** | Conditional edit/check-in forms | Priority: `editingTaskUnit` > `selectedTaskUnit` > `editingCourse` > `editingTask` > default prompt |

## Design Rationale (from product spec)

### Course–Task relationship (方案A)

Courses represent real university classes (including "水课" / less-important lectures). Tasks can be scheduled **on top of** course time slots — a student may work on a task during a lecture. The timetable shows both: course background blocks + task labels floating on top. This is intentional, not a bug.

### TaskUnit labels on the timetable

Each TaskUnit label displays the task name's first character(s) + planned progress amount (e.g. **"R+3"** = Reading task, +3 planned progress). The planned amount is set during planning. At check-in time, the user can **adjust the actual completed amount** (including setting it to 0 if the task wasn't actually done).

### Check-in flow

1. User clicks a TaskUnit label on the timetable
2. EditZone shows the TaskUnit detail + a **"打卡" (check-in) button** in the top-right
3. User can adjust the actual completed amount freely
4. Clicking check-in calls `onCheckIn(taskUnit)` → updates `task_units.status = 'done'` AND `tasks.progress += planned_amount` via `Promise.all`
5. The label turns gray + strikethrough on the timetable

### Diary: digital notebook with revision history

The diary is NOT a single text field per day. The vision is a full log where users can add multiple timestamped entries throughout the day and later review the edit timeline (e.g., "what did I record at lunch vs. dinner?"). Currently implemented as a simple textarea; revision history is a **future feature**.

### Drag-and-drop

NOT planned for MVP. Deferred until core functionality is stable.

## Data Models

### Course

```typescript
interface Course {
  id: string;
  user_id: string;
  name: string;               // e.g. "Linear Algebra"
  color: string;              // hex color e.g. "#2a6dd3"
  schedule: Array<{
    day_of_week: number;      // 0–4 (Mon–Fri)
    start_time: string;       // "09:00"
    end_time: string;         // "10:00"
  }>;
  is_optional: boolean;       // true = "水课" (can be overlaid by tasks)
  note: string;
  created_at: string;
}
```

`schedule` is a JSONB column — Supabase may return it as a string OR already-parsed array. Always normalize via `parseCourse()`.

### Task

```typescript
interface Task {
  id: string;
  user_id: string;
  name: string;               // e.g. "Reading"
  progress: number;           // current accumulated progress
  total: number;              // target total (e.g. 100)
  color: string;
  created_at: string;
}
```

Progress increases when a TaskUnit is checked in. The progress bar in CoursesAndTasks shows: thick line (3px) for completed portion, thin line (1px) for remaining.

### TaskUnit

```typescript
interface TaskUnit {
  id: string;
  task_id: string;            // FK → Task.id (CASCADE delete)
  user_id: string;            // denormalized for direct RLS checks
  day_of_week: number;        // 0–4 (Mon–Fri)
  start_time: string;         // "09:00"
  end_time: string;           // "10:00"
  planned_amount: number;     // planned progress increment (e.g. +3)
  completed_amount: number;   // actual completed amount
  status: 'pending' | 'done';
}
```

Lifecycle: `pending` → (user clicks check-in) → `done`. The `planned_amount` is added to `Task.progress` on check-in. `user_id` is denormalized to allow direct RLS policies without JOINs.

## UI Design Specs

### Color scheme (dark theme)

| Usage | Color | HEX |
| ----- | ----- | --- |
| Background | Deep black | `#0f0f0f` |
| Container | Dark gray-black | `#1a1a1a` |
| Card | Dark gray | `#2a2a2a` |
| Hover | Mid-dark gray | `#333` |
| Primary text | White | `#fff` |
| Secondary text | Light gray | `#e5e5e5` |
| Muted text | Mid gray | `#b0b0b0` |
| Accent | Blue | `#2a6dd3` |
| Success | Green | `#28a745` |
| Warning | Orange | `#fb923c` |
| Emphasis | Pink | `#fda4af` |
| Week title | Gold | `#c9a961` |
| School name | Red | (red) |

### Header layout (160px height, 3 zones)

- **Left**: School name (clickable, switches university calendar) + user avatar (48×48px blue circle, clickable for custom image) + user display name (clickable to edit) + email + logout button
- **Center**: "Week N" title (32px gold `#c9a961`) + date range (`yyyy.mm.dd ~ yyyy.mm.dd`). Future: random "golden quote" below date range.
- **Right**: Date display + Calendar button (📅). Calendar popover: absolute positioned below button, 280px wide dark card, 7×7 grid, month navigation, "Today"/"Close" quick buttons.

### Progress bar design (Tasks in CoursesAndTasks)

- Completed portion: thick line (3px height)
- Remaining portion: thin line (1px height)
- Shows completion percentage + task unit statistics

### Timetable rendering

```typescript
// O(1) lookup maps, keyed by "day-hour"
const coursesBySlot: Map<string, Course>  // useMemo
const taskUnitsBySlot: Map<string, TaskUnit[]>  // useMemo

// for each hour (8:00–22:00, 15 rows):
//   for each day (Mon–Fri, 5 columns):
//     if course at [day][hour] → render Course Block (full cell background, 0.3 opacity, 0.5 on hover)
//     if taskUnits at [day][hour] → render TaskUnit Labels (16px rounded rects, stacked at idx * 18px offset)
```

## Supabase: relative URLs + proxy pattern

`supabaseClient.ts` creates the client with `window.location.origin` as the Supabase URL — no hardcoded project URL at runtime. This works because:

- **Dev**: `vite.config.ts` proxies `/rest/v1`, `/auth/v1`, `/storage/v1` to the real Supabase project
- **Prod**: `vercel.json` rewrites those same paths to Supabase

This avoids CORS/"Failed to fetch" issues and keeps the Supabase project URL out of client bundles. The anon key still comes from `VITE_SUPABASE_ANON_KEY`.

## Auth flow

`App.tsx` has three render branches:
1. `loading === true` → spinner
2. `user === null` (unauthenticated) → login/register form. Special error for missing `VITE_SUPABASE_ANON_KEY`.
3. `user` present → main 3-column UI

Session is checked on mount via `getSessionWithTimeout(5000)` and an `onAuthStateChange` listener. Sign-up uses `emailRedirectTo: window.location.origin` so confirmation links point to the correct deployment.

## Database: RLS everywhere

`supabase_setup.sql` is the canonical schema. Every table has RLS enabled with per-user SELECT/INSERT/UPDATE/DELETE policies using `auth.uid() = user_id`. The script is idempotent (DROP IF EXISTS first). The `task_units` table has a `user_id` column (denormalized) in addition to the FK to tasks — this allows direct RLS checks without JOINs.

## Demo/offline data

When no user is logged in, demo `Course`/`Task`/`TaskUnit` data is shown. Demo IDs are prefixed `demo-`; CRUD operations check for this prefix and handle demo data in-memory (no DB calls). This lets users explore the UI before signing up.

## Key patterns

- **CRUD always calls `fetchAllData()` after mutation** — a single function that re-fetches all 4 tables in parallel and replaces state. No optimistic updates.
- **`parseCourse()`** handles the `schedule` JSONB column — Supabase may return it as a string or already-parsed array, so it normalizes both cases.
- **Timetable rendering**: `useMemo`-ized maps (`coursesBySlot`, `taskUnitsBySlot`) keyed by `"day-hour"` for O(1) lookup per cell. Courses paint the cell background; TaskUnits render as absolutely-positioned labels stacked vertically (offset by `idx * 18px`).
- **EditZone is priority-ordered**: `editingTaskUnit` > `selectedTaskUnit` > `editingCourse` > `editingTask` > default "click to edit" prompt. Only one form shows at a time.
- **Check-in**: calls `onCheckIn(taskUnit)` which updates both `task_units.status = 'done'` and `tasks.progress += planned_amount` in a `Promise.all`.
- **TypeScript strict mode** with `noUnusedLocals` and `noUnusedParameters` enabled.

## How to add a new feature

1. **Define/update interfaces** in `App.tsx`
2. **Add DB table** in `supabase_setup.sql` (if needed), with RLS policies
3. **Add state + fetch function** in `App.tsx`: `const [data, setData] = useState<Entity[]>([])` + `fetchEntity()` called from `fetchAllData()`
4. **Create component** in `src/components/`, receiving data + callbacks as props
5. **Wire into App.tsx** return JSX

### Common modification points

| Change | Where | How |
| ------ | ----- | --- |
| Modify a color | Component `style` prop | `backgroundColor: "#2a6dd3"` |
| Adjust layout width | Header/Sidebar/Timetable | `width: "18%"` |
| Add a button | Any component | `<button onClick={handler}>...</button>` |
| Change grid rows | Timetable | `Array.from({ length: 15 })` (8:00–22:00) |
| Change grid columns | Timetable | `[0,1,2,3,4].map()` (Mon–Fri) |
| Temporarily disable a feature | Component return | Return `null` or a placeholder early |

## Future Roadmap

These are features from the product spec that are **not yet implemented** but should guide design decisions:

### User system expansion
- **Guest login**: View another user's public data (courses, tasks, timetable) read-only. Diary is excluded from guest view.
- **学伴 (Study Partner) login**: A designated partner logs in with their own credentials + target user ID. Full access EXCEPT: cannot edit diaries, cannot modify courses/tasks, but CAN modify/add/delete TaskUnits.

### University calendar
- School name in Header is clickable → switches between university calendars
- Custom holiday schedules per university (no classes during holidays on timetable)
- Eventually: upload calendars to server for other users to reuse

### Diary revision history
- Track timestamped edits per day
- Users can see what was recorded at what time (e.g. lunch entry vs. dinner entry)
- Currently: single textarea per day — this is the MVP version

### Achievement & statistics system
- Auto-track completion rates, average study pace
- "Speedrun badge" for fast task completions
- UI placement not yet decided — keep EditZone or a new panel as options

### Quality-of-life
- **Golden quotes (金句)**: Random motivational quote below the date range in Header
- **Custom avatar**: Click avatar to upload custom image
- **Custom display name**: Click name to edit in-place

### When implementing new features
- Favor the existing props-drilling pattern unless the tree exceeds 3 levels
- If state management becomes unwieldy, consider React Context (not Redux) as the next step
- For styling, stay with inline CSS-in-JS — do not introduce CSS modules or Tailwind without explicit approval
- All new DB tables must have RLS policies

## Common Issues & Debugging

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| Check-in doesn't update progress | EditZone handler not calling `setTasks` correctly | Ensure `tasks.map(t => t.id === task.id ? updatedTask : t)` |
| Timetable shows wrong day | `day_of_week` off-by-one | 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri |
| Env vars not loading | Missing `VITE_` prefix | Must be `VITE_SUPABASE_URL`, not `SUPABASE_URL` |
| "Failed to fetch" in prod | Supabase URL hardcoded | Use `window.location.origin`, ensure Vercel rewrites are configured |
| Course schedule JSON parse error | JSONB returned as string | Always use `parseCourse()` to normalize |

## File notes

- `TaskProgress.tsx` is listed in README as deprecated — it's still in `src/components/` but not imported by App.tsx.
- There's a `data/` directory and `pnpm-store/` at the project root (not part of the source build).
- `build_output.txt` at root contains previous build output for reference.
- `UI Prompts For GPT.txt` at root is the original product spec document (Chinese) — read it for full design context when making significant UI changes.
