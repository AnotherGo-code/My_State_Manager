import { useState, useEffect } from "react";
import { supabase, getSessionWithTimeout } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CoursesAndTasks from "./components/CoursesAndTasks";
import Timetable from "./components/Timetable";
import EditZone from "./components/EditZone";

export interface Course {
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

export interface Task {
  id: string;
  user_id: string;
  name: string;
  progress: number;
  total: number;
  color: string;
  created_at: string;
}

export interface TaskUnit {
  id: string;
  task_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  planned_amount: number;
  completed_amount: number;
  status: 'pending' | 'done';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // 数据状态
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskUnits, setTaskUnits] = useState<TaskUnit[]>([]);

  // UI状态
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTaskUnit, setSelectedTaskUnit] = useState<TaskUnit | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 表单状态
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
      day_of_week: 0,
      start_time: '09:00',
      end_time: '10:00',
      planned_amount: 3,
      completed_amount: 0,
      status: 'pending'
    },
    {
      id: 'tu2',
      task_id: 'task1',
      day_of_week: 2,
      start_time: '14:00',
      end_time: '15:00',
      planned_amount: 2,
      completed_amount: 0,
      status: 'pending'
    },
    {
      id: 'tu3',
      task_id: 'task2',
      day_of_week: 1,
      start_time: '10:00',
      end_time: '12:00',
      planned_amount: 5,
      completed_amount: 0,
      status: 'pending'
    },
    {
      id: 'tu4',
      task_id: 'task2',
      day_of_week: 3,
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
          setSessionError(false);
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
        setSessionError(false);
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
    } else {
      // 未登录时使用示例数据
      initializeSampleData();
    }
  }, [user]);

  // 初始化示例数据
  function initializeSampleData() {
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

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", width: "100%", overflow: "hidden", backgroundColor: "#0f0f0f" }}>
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
                onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "16px", boxSizing: "border-box" }}
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
          {/* 顶部 Header 组件 */}
          <Header 
            userEmail={user.email || ""} 
            showCalendar={showCalendar} 
            setShowCalendar={setShowCalendar} 
          />

          {/* 主内容区域：3列布局 */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden", width: "100%" }}>
            {/* 左侧边栏 - Diary */}
            <Sidebar 
              newDiaryEntry={newDiaryEntry} 
              setNewDiaryEntry={setNewDiaryEntry} 
            />

            {/* 中间区域 - 课程、任务、时间表 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#0f0f0f", minWidth: 0 }}>
              {/* 课程和任务卡片组件 - 固定高度或比例 */}
              <CoursesAndTasks
                courses={courses}
                tasks={tasks}
                taskUnits={taskUnits}
                setEditingCourse={setEditingCourse}
                setEditingTask={setEditingTask}
              />
              
              {/* 时间表组件 - 占用剩余空间 */}
              <Timetable 
                taskUnits={taskUnits} 
                tasks={tasks} 
                setSelectedTaskUnit={setSelectedTaskUnit} 
                exampleEvents={exampleEvents}
                courses={courses}
              />
            </div>

            {/* 右侧编辑面板 */}
            <EditZone
              selectedTaskUnit={selectedTaskUnit}
              setSelectedTaskUnit={setSelectedTaskUnit}
              editingCourse={editingCourse}
              setEditingCourse={setEditingCourse}
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              tasks={tasks}
              setTasks={setTasks}
              taskUnits={taskUnits}
              setTaskUnits={setTaskUnits}
            />
          </div>
        </div>
      )}
    </div>
  );
}
