-- 扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Courses
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs
CREATE TABLE logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedule
CREATE TABLE schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  progress_increment INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 开启 RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

-- Policies（安全写法）
-- Courses
DROP POLICY IF EXISTS courses_select ON courses;
CREATE POLICY courses_select ON courses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS courses_insert ON courses;
CREATE POLICY courses_insert ON courses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tasks
DROP POLICY IF EXISTS tasks_select ON tasks;
CREATE POLICY tasks_select ON tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS tasks_insert ON tasks;
CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Logs
DROP POLICY IF EXISTS logs_select ON logs;
CREATE POLICY logs_select ON logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS logs_insert ON logs;
CREATE POLICY logs_insert ON logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Schedule
DROP POLICY IF EXISTS schedule_select ON schedule;
CREATE POLICY schedule_select ON schedule FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS schedule_insert ON schedule;
CREATE POLICY schedule_insert ON schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
