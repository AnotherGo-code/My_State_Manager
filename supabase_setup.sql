-- Create tables for the time management app

-- Courses table (existing)
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table (existing, add progress if not exists)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Logs table (existing)

-- Schedule table (new)
CREATE TABLE IF NOT EXISTS schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  taskId UUID REFERENCES tasks(id) ON DELETE SET NULL,
  progressIncrement INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if needed
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own courses" ON courses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert their own courses" ON courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own courses" ON courses FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own courses" ON courses FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert their own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own logs" ON logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert their own logs" ON logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own logs" ON logs FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own logs" ON logs FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own schedule" ON schedule FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can insert their own schedule" ON schedule FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own schedule" ON schedule FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own schedule" ON schedule FOR DELETE USING (auth.uid() IS NOT NULL);