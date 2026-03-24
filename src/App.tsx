import { useState, useEffect } from "react";
import { supabase, getSessionWithTimeout } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

interface Course {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  created_at: string;
}

interface Log {
  id: string;
  content: string;
  created_at: string;
}

interface ScheduleItem {
  id: string;
  day: string; // 'Monday', 'Tuesday', etc.
  startTime: string; // '13:00'
  endTime: string; // '15:00'
  taskId: string | null;
  progressIncrement: number; // 推进进度的小节数
}

export default function App() {
  const [time, setTime] = useState<number>(10);
  const [energy, setEnergy] = useState<number>(100);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newLogContent, setNewLogContent] = useState("");
  const [newScheduleDay, setNewScheduleDay] = useState("Monday");
  const [newScheduleStart, setNewScheduleStart] = useState("");
  const [newScheduleEnd, setNewScheduleEnd] = useState("");
  const [newScheduleTaskId, setNewScheduleTaskId] = useState("");
  const [newScheduleProgress, setNewScheduleProgress] = useState(0);

  async function fetchCourses() {
    try {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) console.error("Error fetching courses:", error);
      else setCourses(data || []);
    } catch (err) {
      console.error("Fetch courses failed:", err);
    }
  }

  async function fetchTasks() {
    try {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) console.error("Error fetching tasks:", error);
      else setTasks(data || []);
    } catch (err) {
      console.error("Fetch tasks failed:", err);
    }
  }

  async function fetchLogs() {
    try {
      const { data, error } = await supabase.from("logs").select("*");
      if (error) console.error("Error fetching logs:", error);
      else setLogs(data || []);
    } catch (err) {
      console.error("Fetch logs failed:", err);
    }
  }

  async function fetchSchedule() {
    try {
      const { data, error } = await supabase.from("schedule").select("*");
      if (error) console.error("Error fetching schedule:", error);
      else setSchedule(data || []);
    } catch (err) {
      console.error("Fetch schedule failed:", err);
    }
  }

  async function signIn() {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else {
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Sign in failed:", err);
      alert("登录失败，请检查网络连接");
    }
  }

  async function signUp() {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else {
        alert("Check your email for confirmation!");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Sign up failed:", err);
      alert("注册失败，请检查网络连接");
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) alert(error.message);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  }

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    console.log('App mounted, initializing session...');

    const initializeSession = async () => {
      try {
        console.log('Calling getSessionWithTimeout...');
        const result = await getSessionWithTimeout(8000);
        
        if (!isMounted) {
          console.log('Component unmounted, skipping state update');
          return;
        }
        
        const { data, error } = result;
        console.log('Session result:', { hasData: !!data, hasError: !!error });
        
        if (error) {
          console.error("Get session error:", error);
          setSessionError(false); // Don't show error for missing session
          setUser(null);
        } else {
          const user = data?.session?.user ?? null;
          console.log('User from session:', { hasUser: !!user });
          setUser(user);
          setSessionError(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Session initialization failed:", err);
        setSessionError(false); // Don't show error for network issues
        setUser(null);
      } finally {
        if (isMounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener FIRST
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, hasSession: !!session });
      if (isMounted) {
        setUser(session?.user ?? null);
        setSessionError(false);
        setLoading(false);
      }
    });
    unsubscribe = data?.subscription?.unsubscribe;

    // Then try to get initial session
    initializeSession();

    // Cleanup
    return () => {
      console.log('Cleaning up auth effect');
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchTasks();
      fetchLogs();
      fetchSchedule();
    }
  }, [user]);

  async function addCourse() {
    if (!newCourseName.trim()) return;
    const { error } = await supabase.from("courses").insert([{ name: newCourseName, description: newCourseDesc }]);
    if (error) console.error("Error adding course:", error);
    else {
      setNewCourseName("");
      setNewCourseDesc("");
      fetchCourses();
    }
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return;
    const { error } = await supabase.from("tasks").insert([{ title: newTaskTitle }]);
    if (error) console.error("Error adding task:", error);
    else {
      setNewTaskTitle("");
      fetchTasks();
    }
  }

  async function toggleTask(id: string, completed: boolean) {
    const { error } = await supabase.from("tasks").update({ completed: !completed }).eq("id", id);
    if (error) console.error("Error updating task:", error);
    else fetchTasks();
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) console.error("Error deleting task:", error);
    else fetchTasks();
  }

  async function updateTaskProgress(id: string, progress: number) {
    const { error } = await supabase.from("tasks").update({ progress }).eq("id", id);
    if (error) console.error("Error updating progress:", error);
    else fetchTasks();
  }

  async function addLog() {
    if (!newLogContent.trim()) return;
    const { error } = await supabase.from("logs").insert([{ content: newLogContent }]);
    if (error) console.error("Error adding log:", error);
    else {
      setNewLogContent("");
      fetchLogs();
    }
  }

  async function completeScheduleTask(taskId: string, increment: number) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newProgress = Math.min(100, task.progress + increment);
    await updateTaskProgress(taskId, newProgress);
    // Optionally mark as completed if progress reaches 100
    if (newProgress >= 100) {
      await toggleTask(taskId, false);
    }
  }

  async function addSchedule() {
    if (!newScheduleStart.trim() || !newScheduleEnd.trim()) return;
    const { error } = await supabase.from("schedule").insert([{
      day: newScheduleDay,
      startTime: newScheduleStart,
      endTime: newScheduleEnd,
      taskId: newScheduleTaskId || null,
      progressIncrement: newScheduleProgress
    }]);
    if (error) console.error("Error adding schedule:", error);
    else {
      setNewScheduleStart("");
      setNewScheduleEnd("");
      setNewScheduleTaskId("");
      setNewScheduleProgress(0);
      fetchSchedule();
    }
  }

  function study() {
    if (time <= 0 || energy <= 0) return;
    setTime((prev) => Math.max(0, prev - 1));
    setEnergy((prev) => Math.max(0, prev - 10));
  }

  function rest() {
    if (time <= 0) return;
    setTime((prev) => Math.max(0, prev - 1));
    setEnergy((prev) => Math.min(100, prev + 20));
  }

  function reset() {
    setTime(10);
    setEnergy(100);
  }

  return (
    <div style={{ padding: "40px", fontSize: "20px" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>⏳ 加载中...</h2>
          <p>正在初始化应用，请稍候...</p>
          <p style={{ fontSize: "14px", color: "#666" }}>（或打开浏览器控制台查看详情）</p>
        </div>
      ) : !user ? (
        <div>
          <h1>登录到时间管理器</h1>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "10px", width: "200px" }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: "10px", width: "200px" }}
            />
          </div>
          <button onClick={isLogin ? signIn : signUp} style={{ padding: "10px 20px", marginRight: "10px" }}>
            {isLogin ? "登录" : "注册"}
          </button>
          <button onClick={() => setIsLogin(!isLogin)} style={{ padding: "10px 20px" }}>
            {isLogin ? "需要注册？" : "已有账户？"}
          </button>
          {sessionError && (
            <div style={{ color: "red", padding: "20px", marginTop: "20px", border: "1px solid red", borderRadius: "4px" }}>
              <p><strong>连接错误：</strong></p>
              <p>无法连接到服务器，请检查：</p>
              <ul>
                <li>网络连接是否正常</li>
                <li>.env.local 文件中的 Supabase 凭证是否正确</li>
                <li>Supabase 服务是否在线</li>
              </ul>
              <button onClick={() => window.location.reload()}>重新加载</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>起居注 My State Manager</h1>
            <button onClick={signOut}>登出</button>
          </div>

          <p>⏰ 时间：{time}</p>
          <p>⚡ 精力：{energy}</p>

          <button onClick={study} disabled={time <= 0 || energy <= 0}>
            学习
          </button>
          <button onClick={rest} disabled={time <= 0} style={{ marginLeft: "10px" }}>
            休息
          </button>
          <button onClick={reset} style={{ marginLeft: "10px" }}>
            重置
          </button>

          {time <= 0 && <p style={{ color: "red", marginTop: "16px" }}>时间耗尽，请重置</p>}

          <hr style={{ margin: "40px 0" }} />

          <h2>课程表</h2>
      <input
        type="text"
        placeholder="课程名称"
        value={newCourseName}
        onChange={(e) => setNewCourseName(e.target.value)}
      />
      <input
        type="text"
        placeholder="描述"
        value={newCourseDesc}
        onChange={(e) => setNewCourseDesc(e.target.value)}
        style={{ marginLeft: "10px" }}
      />
      <button onClick={addCourse} style={{ marginLeft: "10px" }}>添加课程</button>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <strong>{course.name}</strong>: {course.description}
          </li>
        ))}
      </ul>

      <h2>任务列表</h2>
      <input
        type="text"
        placeholder="任务标题"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
      />
      <button onClick={addTask} style={{ marginLeft: "10px" }}>添加任务</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id, task.completed)}
            />
            <strong>{task.title}</strong> - 进度: {task.progress}%
            <input
              type="range"
              min="0"
              max="100"
              value={task.progress}
              onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
              style={{ marginLeft: "10px" }}
            />
            <button onClick={() => deleteTask(task.id)} style={{ marginLeft: "10px" }}>删除</button>
          </li>
        ))}
      </ul>

      <h2>日程表</h2>
      <select value={newScheduleDay} onChange={(e) => setNewScheduleDay(e.target.value)}>
        {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
      </select>
      <input
        type="time"
        placeholder="开始时间"
        value={newScheduleStart}
        onChange={(e) => setNewScheduleStart(e.target.value)}
        style={{ marginLeft: "10px" }}
      />
      <input
        type="time"
        placeholder="结束时间"
        value={newScheduleEnd}
        onChange={(e) => setNewScheduleEnd(e.target.value)}
        style={{ marginLeft: "10px" }}
      />
      <select value={newScheduleTaskId} onChange={(e) => setNewScheduleTaskId(e.target.value)} style={{ marginLeft: "10px" }}>
        <option value="">选择任务</option>
        {tasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}
      </select>
      <input
        type="number"
        placeholder="进度增量"
        value={newScheduleProgress}
        onChange={(e) => setNewScheduleProgress(parseInt(e.target.value) || 0)}
        style={{ marginLeft: "10px", width: "80px" }}
      />
      <button onClick={addSchedule} style={{ marginLeft: "10px" }}>添加日程</button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '20px' }}>
        {daysOfWeek.map(day => (
          <div key={day}>
            <h3>{day}</h3>
            <ul>
              {schedule.filter(item => item.day === day).map(item => {
                const task = tasks.find(t => t.id === item.taskId);
                return (
                  <li key={item.id} style={{ marginBottom: '5px' }}>
                    <button
                      onClick={() => item.taskId && completeScheduleTask(item.taskId, item.progressIncrement)}
                      disabled={!item.taskId}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      {item.startTime} - {item.endTime}: {task ? task.title : '无任务'} (推进 {item.progressIncrement} 小节)
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <h2>文字日志</h2>
      <textarea
        placeholder="日志内容"
        value={newLogContent}
        onChange={(e) => setNewLogContent(e.target.value)}
        rows={3}
      />
      <button onClick={addLog} style={{ marginTop: "10px" }}>添加日志</button>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {log.created_at}: {log.content}
          </li>
        ))}
      </ul>
        </>
      )}
    </div>
  );
}
