-- =============================================
-- My State Manager - Supabase Database Setup
-- =============================================
-- Run this in your Supabase SQL Editor.
-- This script is idempotent (DROP IF EXISTS + CREATE IF NOT EXISTS).
-- =============================================

-- =============================================
-- 1. Drop old tables (if exist) - BE CAREFUL: this clears all data
-- =============================================
DROP TABLE IF EXISTS diaries CASCADE;
DROP TABLE IF EXISTS task_units CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- =============================================
-- 2. Courses Table
-- =============================================
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  schedule JSONB DEFAULT '[]'::jsonb,
  is_optional BOOLEAN DEFAULT false,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_user_id ON courses(user_id);

-- =============================================
-- 3. Tasks Table
-- =============================================
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  total INTEGER DEFAULT 100,
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- =============================================
-- 4. TaskUnits Table (Task segments)
-- =============================================
CREATE TABLE task_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  planned_amount INTEGER DEFAULT 0,
  completed_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_task_units_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_units_user_id ON task_units(user_id);
CREATE INDEX idx_task_units_task_id ON task_units(task_id);

-- =============================================
-- 5. Diaries Table
-- =============================================
CREATE TABLE diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diaries_user_id ON diaries(user_id);

-- =============================================
-- 6. Enable Row Level Security (RLS)
-- =============================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. Policies - Courses
-- =============================================
DROP POLICY IF EXISTS "courses_select" ON courses;
CREATE POLICY "courses_select" ON courses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "courses_insert" ON courses;
CREATE POLICY "courses_insert" ON courses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "courses_update" ON courses;
CREATE POLICY "courses_update" ON courses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "courses_delete" ON courses;
CREATE POLICY "courses_delete" ON courses FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 8. Policies - Tasks
-- =============================================
DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_insert" ON tasks;
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_update" ON tasks;
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tasks_delete" ON tasks;
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 9. Policies - TaskUnits
-- =============================================
DROP POLICY IF EXISTS "task_units_select" ON task_units;
CREATE POLICY "task_units_select" ON task_units FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "task_units_insert" ON task_units;
CREATE POLICY "task_units_insert" ON task_units FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "task_units_update" ON task_units;
CREATE POLICY "task_units_update" ON task_units FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "task_units_delete" ON task_units;
CREATE POLICY "task_units_delete" ON task_units FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 10. Policies - Diaries
-- =============================================
DROP POLICY IF EXISTS "diaries_select" ON diaries;
CREATE POLICY "diaries_select" ON diaries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "diaries_insert" ON diaries;
CREATE POLICY "diaries_insert" ON diaries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "diaries_update" ON diaries;
CREATE POLICY "diaries_update" ON diaries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "diaries_delete" ON diaries;
CREATE POLICY "diaries_delete" ON diaries FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Completion Notice
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ My State Manager database initialization complete!';
  RAISE NOTICE '📋 Tables: courses, tasks, task_units, diaries';
  RAISE NOTICE '🔒 RLS policies enabled';
END $$;
