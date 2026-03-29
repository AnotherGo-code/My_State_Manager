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
  // const [taskUnits, setTaskUnits] = useState<TaskUnit[]>([]);
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
      const { error } = await supabase.from("task_units").select("*");
      if (error) console.error("Error fetching task units:", error);
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
      fetchTaskUnits();
      fetchDiaries();
      fetchDiaryEntries();
    }
  }, [user]);

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
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          {/* 顶部 Header */}
          <header style={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <h1 style={{ margin: 0, color: "#1f2937", fontSize: "24px", fontWeight: "600" }}>
                时间管理器
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img
                  src="https://via.placeholder.com/32"
                  alt="头像"
                  style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                />
                <span style={{ color: "#6b7280" }}>{user.email}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ color: "#6b7280" }}>第 1 周</span>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                📅 Calendar
              </button>
              <button
                onClick={signOut}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                登出
              </button>
            </div>
          </header>

          {/* 主内容区域 */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* 左侧 Diary 区域 */}
            <div style={{
              width: "300px",
              backgroundColor: "#f9fafb",
              borderRight: "1px solid #e5e7eb",
              padding: "20px",
              overflowY: "auto"
            }}>
              <h3 style={{ marginTop: 0, color: "#1f2937" }}>📝 日志</h3>
              <div style={{ marginBottom: "20px" }}>
                <textarea
                  placeholder="添加日志条目..."
                  value={newDiaryEntry}
                  onChange={(e) => setNewDiaryEntry(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    resize: "vertical"
                  }}
                />
                <button
                  onClick={() => {/* TODO: 添加日志条目 */}}
                  style={{
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  添加
                </button>
              </div>

              <div>
                <h4 style={{ marginBottom: "10px", color: "#374151" }}>
                  {new Date().toLocaleDateString('zh-CN')}
                </h4>
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {[] /* diaryEntries */.map((entry: any) => (
                    <div key={entry.id} style={{
                      backgroundColor: "white",
                      padding: "12px",
                      marginBottom: "8px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        {new Date(entry.created_at).toLocaleTimeString('zh-CN')}
                      </div>
                      <div>{entry.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 中间主要区域 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {/* 中上区域：课程 + 任务 */}
              <div style={{
                padding: "20px",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: "#fff"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* 左侧：课程列表 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0, color: "#1f2937" }}>📚 课程</h3>
                      <button
                        onClick={() => setEditingCourse({} as Course)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        + 添加课程
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {courses.map(course => (
                        <div
                          key={course.id}
                          onClick={() => setEditingCourse(course)}
                          style={{
                            backgroundColor: course.color,
                            color: "white",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          {course.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 右侧：任务列表 */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0, color: "#1f2937" }}>✅ 任务</h3>
                      <button
                        onClick={() => setEditingTask({} as Task)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        + 添加任务
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => setEditingTask(task)}
                          style={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            padding: "12px",
                            cursor: "pointer",
                            marginBottom: "8px"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontWeight: "500", color: task.color }}>{task.name}</span>
                            <span style={{ fontSize: "12px", color: "#6b7280" }}>
                              {task.progress}/{task.total}
                            </span>
                          </div>
                          <div style={{
                            width: "100%",
                            height: "6px",
                            backgroundColor: "#e5e7eb",
                            borderRadius: "3px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${(task.progress / task.total) * 100}%`,
                              height: "100%",
                              backgroundColor: task.color
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 核心时间表 */}
              <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#1f2937" }}>📅 时间表</h3>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "60px repeat(5, 1fr)",
                  gap: "1px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  {/* 时间列标题 */}
                  <div style={{ backgroundColor: "#f9fafb", padding: "8px", fontWeight: "600", color: "#374151" }}>
                    时间
                  </div>
                  {/* 星期列标题 */}
                  {['周一', '周二', '周三', '周四', '周五'].map(day => (
                    <div key={day} style={{ backgroundColor: "#f9fafb", padding: "8px", fontWeight: "600", color: "#374151", textAlign: "center" }}>
                      {day}
                    </div>
                  ))}

                  {/* 时间行 */}
                  {Array.from({ length: 15 }, (_, i) => {
                    const hour = 8 + i;
                    return (
                      <div key={hour} style={{ display: "contents" }}>
                        <div style={{
                          backgroundColor: "#f9fafb",
                          padding: "12px 8px",
                          fontSize: "12px",
                          color: "#6b7280",
                          borderTop: "1px solid #e5e7eb"
                        }}>
                          {hour}:00
                        </div>
                        {/* 每个时间段的格子 */}
                        {[0, 1, 2, 3, 4].map(dayIndex => (
                          <div
                            key={`${hour}-${dayIndex}`}
                            style={{
                              backgroundColor: "white",
                              minHeight: "60px",
                              padding: "4px",
                              borderTop: "1px solid #e5e7eb",
                              cursor: "pointer"
                            }}
                            onClick={() => {/* TODO: 处理时间格子点击 */}}
                          >
                            {/* 这里会显示课程和任务单元 */}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 右侧 Edit Zone */}
            <div style={{
              width: "350px",
              backgroundColor: "#f9fafb",
              borderLeft: "1px solid #e5e7eb",
              padding: "20px",
              overflowY: "auto"
            }}>
              <h3 style={{ marginTop: 0, color: "#1f2937" }}>⚙️ 编辑面板</h3>

              {selectedTaskUnit && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ color: "#374151", marginBottom: "12px" }}>任务单元详情</h4>
                  <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <strong>任务：</strong>
                      {tasks.find(t => t.id === selectedTaskUnit.task_id)?.name}
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <strong>计划进度：</strong>{selectedTaskUnit.planned_amount}
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <strong>完成进度：</strong>
                      <input
                        type="number"
                        value={selectedTaskUnit.completed_amount}
                        onChange={(e) => setSelectedTaskUnit({...selectedTaskUnit, completed_amount: parseInt(e.target.value) || 0})}
                        style={{ width: "60px", padding: "4px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    </div>
                    <button
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      打卡完成
                    </button>
                  </div>
                </div>
              )}

              {editingCourse && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ color: "#374151", marginBottom: "12px" }}>
                    {editingCourse.id ? '编辑课程' : '添加课程'}
                  </h4>
                  <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>课程名称</label>
                      <input
                        type="text"
                        value={editingCourse.name || ""}
                        onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                        style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>颜色</label>
                      <input
                        type="color"
                        value={editingCourse.color || "#3B82F6"}
                        onChange={(e) => setEditingCourse({...editingCourse, color: e.target.value})}
                        style={{ width: "100%", height: "40px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {/* TODO: 保存课程 */}}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingCourse(null)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#6b7280",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editingTask && (
                <div>
                  <h4 style={{ color: "#374151", marginBottom: "12px" }}>
                    {editingTask.id ? '编辑任务' : '添加任务'}
                  </h4>
                  <div style={{ backgroundColor: "white", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>任务名称</label>
                      <input
                        type="text"
                        value={editingTask.name || ""}
                        onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
                        style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>总进度</label>
                      <input
                        type="number"
                        value={editingTask.total || 100}
                        onChange={(e) => setEditingTask({...editingTask, total: parseInt(e.target.value) || 100})}
                        style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>颜色</label>
                      <input
                        type="color"
                        value={editingTask.color || "#10B981"}
                        onChange={(e) => setEditingTask({...editingTask, color: e.target.value})}
                        style={{ width: "100%", height: "40px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {/* TODO: 保存任务 */}}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingTask(null)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#6b7280",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
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
