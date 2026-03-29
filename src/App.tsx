import { useState, useEffect } from "react";
import { supabase, getSessionWithTimeout } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

interface Course {
  id: string;
  user_id: string;
  name: string;
  color: string;
  schedule: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>;
  is_optional: boolean;
  note: string;
  created_at: string;
}

interface Task {
  id: string;
  user_id: string;
  name: string;
  progress: number;
  total: number;
  color: string;
  created_at: string;
}

interface TaskUnit {
  id: string;
  task_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  planned_amount: number;
  completed_amount: number;
  status: 'pending' | 'done';
}

// TODO: 暂时注释掉未使用的接口，避免编译错误
/*
interface Diary {
  id: string;
  user_id: string;
  date: string;
}

interface DiaryEntry {
  id: string;
  diary_id: string;
  content: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  university: string;
  calendar_config: any;
}
*/

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  // const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // 数据状态
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskUnits, setTaskUnits] = useState<TaskUnit[]>([]);
  // const [diaries, setDiaries] = useState<Diary[]>([]);
  // const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  // UI状态
  // const [currentWeek, setCurrentWeek] = useState(1);
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTaskUnit, setSelectedTaskUnit] = useState<TaskUnit | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 表单状态
  // const [newCourseName, setNewCourseName] = useState("");
  // const [newCourseColor, setNewCourseColor] = useState("#3B82F6");
  // const [newTaskName, setNewTaskName] = useState("");
  // const [newTaskTotal, setNewTaskTotal] = useState(100);
  // const [newTaskColor, setNewTaskColor] = useState("#10B981");
  const [newDiaryEntry, setNewDiaryEntry] = useState("");

  // 示例事件（仅用于界面演示）
  const exampleEvents = [
    { id: 'e1', dayIndex: 0, startHour: 9, duration: 1, color: '#fb923c', title: 'Math', sub: 'Reading +3' },
    { id: 'e2', dayIndex: 2, startHour: 10, duration: 2, color: '#fda4af', title: 'Physics', sub: '' },
    { id: 'e3', dayIndex: 2, startHour: 12, duration: 1, color: '#fb923c', title: 'Math', sub: '' },
  ];

  // 示例任务单元数据（与前两个任务关联）
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
    {
      id: 'tu2',
      task_id: 'task1',
      day_of_week: 3,
      start_time: '14:00',
      end_time: '15:00',
      planned_amount: 2,
      completed_amount: 0,
      status: 'pending'
    },
    {
      id: 'tu3',
      task_id: 'task2',
      day_of_week: 2,
      start_time: '10:00',
      end_time: '12:00',
      planned_amount: 5,
      completed_amount: 0,
      status: 'pending'
    },
    {
      id: 'tu4',
      task_id: 'task2',
      day_of_week: 4,
      start_time: '15:00',
      end_time: '16:00',
      planned_amount: 2,
      completed_amount: 0,
      status: 'pending'
    }
  ];

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

  async function fetchTaskUnits() {
    try {
      // 暂时使用示例数据直到Supabase配置完毕
      setTaskUnits(exampleTaskUnits);
    } catch (err) {
      console.error("Fetch task units failed:", err);
    }
  }

  async function fetchDiaries() {
    try {
      const { error } = await supabase.from("diaries").select("*");
      if (error) console.error("Error fetching diaries:", error);
    } catch (err) {
      console.error("Fetch diaries failed:", err);
    }
  }

  async function fetchDiaryEntries() {
    try {
      const { error } = await supabase.from("diary_entries").select("*");
      if (error) console.error("Error fetching diary entries:", error);
    } catch (err) {
      console.error("Fetch diary entries failed:", err);
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

  // async function signOut() {
  //   try {
  //     const { error } = await supabase.auth.signOut();
  //     if (error) alert(error.message);
  //   } catch (err) {
  //     console.error("Sign out failed:", err);
  //   }
  // }

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
      fetchTaskUnits();
      fetchDiaries();
      fetchDiaryEntries();
    } else {
      // 未登录时使用示例数据
      initializeSampleData();
    }
  }, [user]);

  // 初始化示例数据
  function initializeSampleData() {
    // 示例任务
    const sampleTasks: Task[] = [
      {
        id: 'task1',
        user_id: 'demo',
        name: 'Reading',
        progress: 0,
        total: 100,
        color: '#fb923c',
        created_at: new Date().toISOString()
      },
      {
        id: 'task2',
        user_id: 'demo',
        name: 'Programming',
        progress: 0,
        total: 150,
        color: '#fda4af',
        created_at: new Date().toISOString()
      }
    ];
    setTasks(sampleTasks);
    setTaskUnits(exampleTaskUnits);
  }

  // TODO: 暂时注释掉未使用的函数，避免编译错误
  /*
  async function addCourse() {
    if (!newCourseName.trim()) return;
    const { error } = await supabase.from("courses").insert([{
      name: newCourseName,
      color: newCourseColor,
      schedule: [],
      is_optional: false,
      note: "",
      user_id: user?.id
    }]);
    if (error) console.error("Error adding course:", error);
    else {
      setNewCourseName("");
      setNewCourseColor("#3B82F6");
      fetchCourses();
    }
  }

  async function addTask() {
    if (!newTaskName.trim()) return;
    console.log("Adding task:", newTaskName);
    const { data, error } = await supabase.from("tasks").insert([{
      name: newTaskName,
      progress: 0,
      total: newTaskTotal,
      color: newTaskColor,
      user_id: user?.id
    }]);
    console.log("Add task result:", { data, error });
    if (error) {
      console.error("Error adding task:", error);
      alert(`添加任务失败: ${error.message}`);
    } else {
      setNewTaskName("");
      fetchTasks();
    }
  }

  async function updateTaskProgress(id: string, progress: number) {
    const { error } = await supabase.from("tasks").update({ progress }).eq("id", id);
    if (error) console.error("Error updating progress:", error);
    else fetchTasks();
  }

  async function testDatabaseConnection() {
    console.log("Testing database connection...");
    
    try {
      // Test tasks table
      const { data: tasksData, error: tasksError } = await supabase.from("tasks").select("*").limit(1);
      console.log("Tasks table test:", { data: tasksData, error: tasksError });
      
      // Test logs table
      const { data: logsData, error: logsError } = await supabase.from("logs").select("*").limit(1);
      console.log("Logs table test:", { data: logsData, error: logsError });
      
      // Test schedule table
      const { data: scheduleData, error: scheduleError } = await supabase.from("schedule").select("*").limit(1);
      console.log("Schedule table test:", { data: scheduleData, error: scheduleError });
      
      // Test auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log("Auth test:", { session: authData?.session, error: authError });
      
    } catch (err) {
      console.error("Database test failed:", err);
    }
  }
  */

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif" }}>
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <div style={{ textAlign: "center" }}>
            <h2>⏳ 加载中...</h2>
            <p>正在初始化应用，请稍候...</p>
            <p style={{ fontSize: "14px", color: "#666" }}>（或打开浏览器控制台查看详情）</p>
          </div>
        </div>
      ) : !user ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <h1 style={{ textAlign: "center", marginBottom: "30px" }}>登录到时间管理器</h1>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px" }}
              />
            </div>
            <button
              onClick={isLogin ? signIn : signUp}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#3B82F6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "10px"
              }}
            >
              {isLogin ? "登录" : "注册"}
            </button>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "transparent",
                color: "#3B82F6",
                border: "1px solid #3B82F6",
                borderRadius: "6px",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
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
        </div>
      ) : (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#0f0f0f", color: "#fff" }}>
          {/* 顶部 Header */}
          <header style={{
            height: "60px",
            backgroundColor: "#1a1a1a",
            borderBottom: "1px solid #2a2a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxShadow: "none"
          }}>
            {/* 左侧：学校名称、用户头像、用户名 */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <h1 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: "500", cursor: "pointer" }}>
                时间管理器
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <img
                  src="https://via.placeholder.com/28"
                  alt="头像"
                  style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                />
                <span style={{ color: "#b0b0b0", cursor: "pointer" }}>{user.email}</span>
              </div>
            </div>

            {/* 中间：周数和日期范围 */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "500", color: "#fff" }}>Week 1</div>
              <div style={{ fontSize: "12px", color: "#888" }}>2026.03.23 〜 2026.03.29</div>
            </div>

            {/* 右侧：Calendar按钮 */}
            <div>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #3a3a3a",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#b0b0b0",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#333";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2a2a2a";
                  e.currentTarget.style.color = "#b0b0b0";
                }}
              >
                📅 Calendar
              </button>
            </div>
          </header>

          {/* 主内容区域：3列布局 */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* 左侧边栏：课程 + Diary */}
            <div style={{
              width: "18%",
              backgroundColor: "#1a1a1a",
              borderRight: "1px solid #2a2a2a",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              {/* 课程区域 */}
              <div style={{ padding: "16px", borderBottom: "1px solid #2a2a2a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "14px", fontWeight: "500" }}>📚 Courses</h3>
                  <button
                    onClick={() => setEditingCourse({} as Course)}
                    style={{
                      padding: "4px 10px",
                      backgroundColor: "#2a6dd3",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "11px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3275dd"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2a6dd3"}
                  >
                    +
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {courses.map(course => (
                    <div
                      key={course.id}
                      onClick={() => setEditingCourse(course)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#2a2a2a",
                        border: "none",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#333"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2a2a2a"}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: course.color
                        }}
                      />
                      <span style={{ fontSize: "12px", color: "#e5e5e5" }}>{course.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diary区域 */}
              <div style={{ flex: 1, padding: "16px", overflow: "hidden", display: "flex", flexDirection: "column", position: 'relative' }}>
                <h3 style={{ margin: 0, marginBottom: "12px", color: "#fff", fontSize: "14px", fontWeight: "500" }}>📝 Diary</h3>
                <div style={{ marginBottom: "12px" }}>
                  <textarea
                    placeholder="添加日志条目..."
                    value={newDiaryEntry}
                    onChange={(e) => setNewDiaryEntry(e.target.value)}
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "6px",
                      border: "1px solid #3a3a3a",
                      borderRadius: "4px",
                      resize: "vertical",
                      fontSize: "11px",
                      backgroundColor: "#2a2a2a",
                      color: "#e5e5e5"
                    }}
                  />
                  <button
                    onClick={() => {/* TODO: 添加日志条目 */}}
                    style={{
                      marginTop: "6px",
                      padding: "4px 8px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "11px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#32b14a"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#28a745"}
                  >
                    添加
                  </button>
                </div>

                <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>
                  {new Date().toLocaleDateString('zh-CN')}
                </div>

                <div style={{ flex: 1, overflowY: "auto", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: '#4a5a6a', fontSize: 48, fontWeight: 300, opacity: 0.4, textAlign: 'center', lineHeight: 1.1 }}>
                    Dairy /<br/>Log Area
                  </div>
                </div>
              </div>
            </div>

            {/* 中间主要区域 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#0f0f0f" }}>
              {/* 上部区域：任务进度 (20% 高度) */}
              <div style={{
                height: "20%",
                padding: "16px",
                borderBottom: "1px solid #2a2a2a",
                backgroundColor: "#0f0f0f",
                overflowY: "auto"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "14px", fontWeight: "500" }}>✅ 任务进度</h3>
                  <button
                    onClick={() => setEditingTask({} as Task)}
                    style={{
                      padding: "4px 10px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "11px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#32b14a"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#28a745"}
                  >
                    + 添加任务
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                  {tasks.map(task => {
                    const relatedUnits = taskUnits.filter(tu => tu.task_id === task.id);
                    const completedUnits = relatedUnits.filter(tu => tu.status === 'done').length;
                    return (
                      <div
                        key={task.id}
                        onClick={() => setEditingTask(task)}
                        style={{
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #2a2a2a",
                          borderRadius: "6px",
                          padding: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#222";
                          e.currentTarget.style.borderColor = "#3a3a3a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#1a1a1a";
                          e.currentTarget.style.borderColor = "#2a2a2a";
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontWeight: "500", color: task.color, fontSize: "13px" }}>{task.name}</span>
                          <span style={{ fontSize: "11px", color: "#888", fontWeight: "400" }}>
                            {task.progress}/{task.total}
                          </span>
                        </div>
                        <div style={{
                          width: "100%",
                          height: "4px",
                          backgroundColor: "#2a2a2a",
                          borderRadius: "2px",
                          overflow: "hidden",
                          marginBottom: "6px"
                        }}>
                          <div style={{
                            width: `${(task.progress / task.total) * 100}%`,
                            height: "100%",
                            backgroundColor: task.color,
                            transition: "width 0.3s ease"
                          }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "#666", marginBottom: "6px" }}>
                          {Math.round((task.progress / task.total) * 100)}% 完成
                        </div>
                        {relatedUnits.length > 0 && (
                          <div style={{ fontSize: "10px", color: "#888", borderTop: "1px solid #2a2a2a", paddingTop: "6px" }}>
                            📋 {completedUnits}/{relatedUnits.length} 任务单元完成
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 下部区域：时间表网格 (80% 高度) */}
              <div style={{ height: "80%", padding: "16px", overflow: "auto", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, color: "#fff", fontSize: "14px", fontWeight: "500" }}>📅 时间表</h3>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div style={{
                  padding: "4px",
                  border: "2px solid #333",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  height: "calc(100% - 40px)",
                  overflow: "hidden",
                  flex: 1
                }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "50px repeat(5, 1fr)",
                    gap: "2px",
                    backgroundColor: "#1a1a2e",
                    borderRadius: "6px",
                    height: "100%",
                    overflow: "auto",
                    padding: "2px"
                  }}>
                  {/* 时间列标题 */}
                  <div style={{ backgroundColor: "#252a3a", padding: "8px 4px", fontWeight: "500", color: "#888", fontSize: "11px", display: "flex", alignItems: "center" }}>
                    时间
                  </div>
                  {/* 星期列标题 */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                    <div key={day} style={{ backgroundColor: "#252a3a", padding: "8px 4px", fontWeight: "500", color: "#888", textAlign: "center", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {day}
                    </div>
                  ))}

                  {/* 时间行 */}
                  {Array.from({ length: 15 }, (_, i) => {
                    const hour = 8 + i;
                    return (
                      <div key={hour} style={{ display: "contents" }}>
                        <div style={{
                          backgroundColor: "#252a3a",
                          padding: "8px 4px",
                          fontSize: "10px",
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {hour}:00
                        </div>
                        {/* 每个时间段的格子 */}
                        {[0, 1, 2, 3, 4].map(dayIndex => (
                          <div
                            key={`${hour}-${dayIndex}`}
                            style={{
                              backgroundColor: "#1f2435",
                              minHeight: "50px",
                              padding: "4px",
                              cursor: "pointer",
                              position: "relative",
                              overflow: 'visible',
                              borderBottom: "1px solid #2a3040"
                            }}
                            onClick={() => {/* TODO: 处理时间格子点击 */}}
                          >
                            {/* 渲染示例事件（如果匹配） */}
                            {exampleEvents.filter(ev => ev.dayIndex === dayIndex && ev.startHour === hour).map(ev => (
                              <div key={ev.id} style={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                                right: 4,
                                height: 28,
                                backgroundColor: ev.color,
                                color: 'white',
                                borderRadius: 4,
                                padding: '3px 6px',
                                fontSize: 10,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                              }}>
                                <div style={{ fontWeight: 600, lineHeight: 1, fontSize: 10 }}>{ev.title}</div>
                                {ev.sub && <div style={{ fontSize: 8, opacity: 0.9 }}>{ev.sub}</div>}
                              </div>
                            ))}

                            {/* 渲染任务单元 */}
                            {taskUnits.filter(tu => {
                              const tuHour = parseInt(tu.start_time.split(':')[0]);
                              return tu.day_of_week === dayIndex && tuHour === hour;
                            }).map(tu => {
                              const task = tasks.find(t => t.id === tu.task_id);
                              return (
                                <div 
                                  key={tu.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTaskUnit(tu);
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: 34,
                                    left: 4,
                                    right: 4,
                                    height: 24,
                                    backgroundColor: task?.color || '#2a6dd3',
                                    color: 'white',
                                    borderRadius: 3,
                                    padding: '2px 4px',
                                    fontSize: 8,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 500,
                                    opacity: tu.status === 'done' ? 0.6 : 1,
                                    cursor: 'pointer',
                                    textDecoration: tu.status === 'done' ? 'line-through' : 'none'
                                  }}
                                >
                                  {task?.name} +{tu.planned_amount}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧编辑面板 */}
            <div style={{
              width: "18%",
              backgroundColor: "#1a1a1a",
              borderLeft: "1px solid #2a2a2a",
              padding: "16px",
              overflowY: "auto",
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ marginTop: 0, color: "#2a6dd3", fontSize: "32px", textAlign: 'center', lineHeight: 1.0, fontWeight: 400 }}>Edit<br/>Zone</h3>

              {!selectedTaskUnit && !editingCourse && !editingTask && (
                <div style={{ color: "#666", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>
                  点击左侧的项目进行编辑
                </div>
              )}

              {selectedTaskUnit && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ color: "#e5e5e5", marginBottom: "12px", fontSize: "13px", fontWeight: "500" }}>任务单元详情</h4>
                  <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #3a3a3a" }}>
                    <div style={{ marginBottom: "10px", fontSize: "12px" }}>
                      <strong style={{ color: "#b0b0b0" }}>任务：</strong>
                      <span style={{ color: "#e5e5e5", marginLeft: "4px" }}>{tasks.find(t => t.id === selectedTaskUnit.task_id)?.name}</span>
                    </div>
                    <div style={{ marginBottom: "10px", fontSize: "12px" }}>
                      <strong style={{ color: "#b0b0b0" }}>时间：</strong>
                      <span style={{ color: "#e5e5e5", marginLeft: "4px" }}>周{['一', '二', '三', '四', '五'][selectedTaskUnit.day_of_week]} {selectedTaskUnit.start_time}</span>
                    </div>
                    <div style={{ marginBottom: "10px", fontSize: "12px" }}>
                      <strong style={{ color: "#b0b0b0" }}>计划进度：</strong>
                      <span style={{ color: "#e5e5e5", marginLeft: "4px" }}>{selectedTaskUnit.planned_amount}</span>
                    </div>
                    <div style={{ marginBottom: "10px", fontSize: "12px" }}>
                      <strong style={{ color: "#b0b0b0" }}>实际进度：</strong>
                      <input
                        type="number"
                        value={selectedTaskUnit.completed_amount}
                        onChange={(e) => setSelectedTaskUnit({...selectedTaskUnit, completed_amount: parseInt(e.target.value) || 0})}
                        style={{ width: "50px", padding: "4px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", marginLeft: "4px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px", fontSize: "12px" }}>
                      <strong style={{ color: "#b0b0b0" }}>状态：</strong>
                      <span style={{ color: selectedTaskUnit.status === 'done' ? '#28a745' : '#f59e0b', marginLeft: "4px" }}>
                        {selectedTaskUnit.status === 'done' ? '已完成 ✓' : '进行中'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const targetTask = tasks.find(t => t.id === selectedTaskUnit.task_id);
                        if (!targetTask) return;
                        
                        // 更新任务单元状态为完成
                        const updatedTaskUnit = { ...selectedTaskUnit, completed_amount: selectedTaskUnit.planned_amount, status: 'done' as const };
                        setTaskUnits(taskUnits.map(tu => tu.id === selectedTaskUnit.id ? updatedTaskUnit : tu));
                        setSelectedTaskUnit(updatedTaskUnit);
                        
                        // 更新任务进度
                        const newProgress = Math.min(targetTask.progress + updatedTaskUnit.completed_amount, targetTask.total);
                        const updatedTask = { ...targetTask, progress: newProgress };
                        setTasks(tasks.map(t => t.id === selectedTaskUnit.task_id ? updatedTask : t));
                      }}
                      disabled={selectedTaskUnit.status === 'done'}
                      style={{
                        width: "100%",
                        padding: "6px",
                        backgroundColor: selectedTaskUnit.status === 'done' ? "#555" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: selectedTaskUnit.status === 'done' ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTaskUnit.status !== 'done') {
                          e.currentTarget.style.backgroundColor = "#32b14a";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTaskUnit.status !== 'done') {
                          e.currentTarget.style.backgroundColor = "#28a745";
                        }
                      }}
                    >
                      {selectedTaskUnit.status === 'done' ? '✅ 已打卡' : '✅ 打卡完成'}
                    </button>
                  </div>
                </div>
              )}

              {editingCourse && (
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ color: "#e5e5e5", marginBottom: "12px", fontSize: "13px", fontWeight: "500" }}>
                    {editingCourse.id ? '编辑课程' : '添加课程'}
                  </h4>
                  <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #3a3a3a" }}>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "400", color: "#b0b0b0", fontSize: "11px" }}>课程名称</label>
                      <input
                        type="text"
                        value={editingCourse.name || ""}
                        onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                        style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "400", color: "#b0b0b0", fontSize: "11px" }}>颜色</label>
                      <input
                        type="color"
                        value={editingCourse.color || "#3B82F6"}
                        onChange={(e) => setEditingCourse({...editingCourse, color: e.target.value})}
                        style={{ width: "100%", height: "30px", border: "1px solid #3a3a3a", borderRadius: "4px" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => {/* TODO: 保存课程 */}}
                        style={{
                          flex: 1,
                          padding: "6px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#32b14a"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#28a745"}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingCourse(null)}
                        style={{
                          flex: 1,
                          padding: "6px",
                          backgroundColor: "#555",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#666"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#555"}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editingTask && (
                <div>
                  <h4 style={{ color: "#e5e5e5", marginBottom: "12px", fontSize: "13px", fontWeight: "500" }}>
                    {editingTask.id ? '编辑任务' : '添加任务'}
                  </h4>
                  <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #3a3a3a" }}>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "400", color: "#b0b0b0", fontSize: "11px" }}>任务名称</label>
                      <input
                        type="text"
                        value={editingTask.name || ""}
                        onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
                        style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "400", color: "#b0b0b0", fontSize: "11px" }}>总进度</label>
                      <input
                        type="number"
                        value={editingTask.total || 100}
                        onChange={(e) => setEditingTask({...editingTask, total: parseInt(e.target.value) || 100})}
                        style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "400", color: "#b0b0b0", fontSize: "11px" }}>颜色</label>
                      <input
                        type="color"
                        value={editingTask.color || "#10B981"}
                        onChange={(e) => setEditingTask({...editingTask, color: e.target.value})}
                        style={{ width: "100%", height: "30px", border: "1px solid #3a3a3a", borderRadius: "4px" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => {/* TODO: 保存任务 */}}
                        style={{
                          flex: 1,
                          padding: "6px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#32b14a"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#28a745"}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingTask(null)}
                        style={{
                          flex: 1,
                          padding: "6px",
                          backgroundColor: "#555",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#666"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#555"}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
