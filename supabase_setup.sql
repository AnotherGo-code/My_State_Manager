-- =============================================
-- My State Manager - Supabase Database Setup
-- =============================================
-- Run this SQL in your Supabase SQL Editor to create all tables and policies.
-- This schema matches the TypeScript interfaces in App.tsx.
-- =============================================

-- 1. 扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 2. Courses 表
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  schedule JSONB DEFAULT '[]'::jsonb,  -- [{day_of_week: number, start_time: string, end_time: string}]
  is_optional BOOLEAN DEFAULT false,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);

-- =============================================
-- 3. Tasks 表
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  total INTEGER DEFAULT 100,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- =============================================
-- 4. TaskUnits 表（核心 - 任务的时间片段）
-- =============================================
CREATE TABLE IF NOT EXISTS task_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 4),  -- 0=Mon, 4=Fri
  start_time TEXT NOT NULL,   -- "09:00"
  end_time TEXT NOT NULL,     -- "10:00"
  planned_amount INTEGER DEFAULT 0,
  completed_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_units_user_id ON task_units(user_id);
CREATE INDEX IF NOT EXISTS idx_task_units_task_id ON task_units(task_id);

-- =============================================
-- 5. Diaries 表（学习日记）
-- =============================================
CREATE TABLE IF NOT EXISTS diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  date TEXT,  -- "YYYY-MM-DD" format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);

-- =============================================
-- 6. 开启行级安全（RLS）
-- =============================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. Policies - Courses
-- =============================================
DROP POLICY IF EXISTS "Users can view own courses" ON courses;
CREATE POLICY "Users can view own courses"
  ON courses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own courses" ON courses;
CREATE POLICY "Users can insert own courses"
  ON courses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own courses" ON courses;
CREATE POLICY "Users can update own courses"
  ON courses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own courses" ON courses;
CREATE POLICY "Users can delete own courses"
  ON courses FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 8. Policies - Tasks
-- =============================================
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 9. Policies - TaskUnits
-- =============================================
DROP POLICY IF EXISTS "Users can view own task_units" ON task_units;
CREATE POLICY "Users can view own task_units"
  ON task_units FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own task_units" ON task_units;
CREATE POLICY "Users can insert own task_units"
  ON task_units FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own task_units" ON task_units;
CREATE POLICY "Users can update own task_units"
  ON task_units FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own task_units" ON task_units;
CREATE POLICY "Users can delete own task_units"
  ON task_units FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 10. Policies - Diaries
-- =============================================
DROP POLICY IF EXISTS "Users can view own diaries" ON diaries;
CREATE POLICY "Users can view own diaries"
  ON diaries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own diaries" ON diaries;
CREATE POLICY "Users can insert own diaries"
  ON diaries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own diaries" ON diaries;
CREATE POLICY "Users can update own diaries"
  ON diaries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own diaries" ON diaries;
CREATE POLICY "Users can delete own diaries"
  ON diaries FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 完成提示
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ My State Manager 数据库表已创建完成！';
  RAISE NOTICE '📋 创建的表: courses, tasks, task_units, diaries';
  RAISE NOTICE '🔒 行级安全策略已启用';
END $$;
