import { useState, useEffect, useCallback } from "react";
import { supabase, getSessionWithTimeout, signOut } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CoursesAndTasks from "./components/CoursesAndTasks";
import Timetable from "./components/Timetable";
import EditZone from "./components/EditZone";

// =============================================
// TypeScript Interfaces
// =============================================

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
  created_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  name: string;
  progress: number;
  total: number;
  color: string;
  created_at?: string;
}

export interface TaskUnit {
  id: string;
  task_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  planned_amount: number;
  completed_amount: number;
  status: "pending" | "done";
  created_at?: string;
}

export interface Diary {
  id: string;
  user_id: string;
  content: string;
  date: string;
  created_at: string;
}

// =============================================
// Demo data
// =============================================

const demoCourses: Course[] = [
  {
    id: "demo-c1",
    user_id: "demo",
    name: "Maths",
    color: "#fb923c",
    schedule: [
      { day_of_week: 0, start_time: "09:00", end_time: "10:30" },
      { day_of_week: 2, start_time: "13:00", end_time: "14:30" }
    ],
    is_optional: false,
    note: "",
    created_at: new Date().toISOString()
  },
  {
    id: "demo-c2",
    user_id: "demo",
    name: "Physics",
    color: "#fda4af",
    schedule: [
      { day_of_week: 1, start_time: "10:00", end_time: "11:30" },
      { day_of_week: 3, start_time: "10:00", end_time: "11:30" }
    ],
    is_optional: true,
    note: "Elective course",
    created_at: new Date().toISOString()
  }
];

const demoTasks: Task[] = [
  {
    id: "demo-t1",
    user_id: "demo",
    name: "Reading",
    progress: 147,
    total: 194,
    color: "#eab308",
    created_at: new Date().toISOString()
  },
  {
    id: "demo-t2",
    user_id: "demo",
    name: "Exercising",
    progress: 37,
    total: 121,
    color: "#60a5fa",
    created_at: new Date().toISOString()
  }
];

const demoTaskUnits: TaskUnit[] = [
  {
    id: "demo-tu1",
    task_id: "demo-t1",
    day_of_week: 0,
    start_time: "09:00",
    end_time: "10:00",
    planned_amount: 3,
    completed_amount: 0,
    status: "pending"
  }
];

// =============================================
// Helper: Parse course from Supabase
// =============================================

function parseCourse(raw: any): Course {
  let schedule: Course["schedule"] = [];
  try {
    if (raw.schedule) {
      if (typeof raw.schedule === "string") {
        schedule = JSON.parse(raw.schedule);
      } else if (Array.isArray(raw.schedule)) {
        schedule = raw.schedule;
      }
    }
  } catch (err) {
    console.error("Error parsing course schedule:", err);
    schedule = [];
  }

  if (!Array.isArray(schedule)) {
    schedule = [];
  }

  return {
    ...raw,
    schedule,
    is_optional: !!raw.is_optional,
    note: raw.note || ""
  };
}

// =============================================
// Main App Component
// =============================================

export default function App() {
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [courses, setCourses] = useState<Course[]>(demoCourses);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [taskUnits, setTaskUnits] = useState<TaskUnit[]>(demoTaskUnits);
  const [diaries, setDiaries] = useState<Diary[]>([]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTaskUnit, setSelectedTaskUnit] = useState<TaskUnit | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskUnit, setEditingTaskUnit] = useState<TaskUnit | null>(null);
  const [newDiaryEntry, setNewDiaryEntry] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  console.log("[App] Rendering state:", { loading, hasUser: !!user, coursesCount: courses.length });

  // =============================================
  // CRUD Methods
  // =============================================

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    const userId = user.id;
    console.log("[App] Fetching data for user:", userId);

    try {
      const [coursesRes, tasksRes, taskUnitsRes, diariesRes] = await Promise.all([
        supabase.from("courses").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("task_units").select("*").eq("user_id", userId).order("day_of_week", { ascending: true }).order("start_time", { ascending: true }),
        supabase.from("diaries").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      ]);

      if (!coursesRes.error && coursesRes.data && coursesRes.data.length > 0) {
        setCourses(coursesRes.data.map(parseCourse));
      }
      if (!tasksRes.error && tasksRes.data && tasksRes.data.length > 0) {
        setTasks(tasksRes.data);
      }
      if (!taskUnitsRes.error && taskUnitsRes.data && taskUnitsRes.data.length > 0) {
        setTaskUnits(taskUnitsRes.data);
      }
      if (!diariesRes.error) {
        setDiaries(diariesRes.data || []);
      }
    } catch (err) {
      console.error("[App] Fetch all data failed:", err);
    }
  }, [user]);

  const saveCourse = useCallback(async (course: Course) => {
    if (!user) return;
    try {
      if (course.id && course.id !== "" && !course.id.startsWith("demo-")) {
        await supabase.from("courses").update({
          name: course.name,
          color: course.color,
          schedule: course.schedule,
          is_optional: course.is_optional,
          note: course.note
        }).eq("id", course.id);
      } else {
        const insertData = {
          user_id: user.id,
          name: course.name,
          color: course.color,
          schedule: course.schedule,
          is_optional: course.is_optional,
          note: course.note
        };
        await supabase.from("courses").insert(insertData);
      }
      await fetchAllData();
      setEditingCourse(null);
    } catch (err: any) {
      alert("保存失败: " + err.message);
    }
  }, [user, fetchAllData]);

  const deleteCourse = useCallback(async (id: string) => {
    if (!user || id.startsWith("demo-")) return;
    if (!confirm("确定删除？")) return;
    await supabase.from("courses").delete().eq("id", id);
    await fetchAllData();
    setEditingCourse(null);
  }, [user, fetchAllData]);

  const saveTask = useCallback(async (task: Task) => {
    if (!user) return;
    try {
      if (task.id && task.id !== "" && !task.id.startsWith("demo-")) {
        await supabase.from("tasks").update({
          name: task.name,
          progress: task.progress,
          total: task.total,
          color: task.color
        }).eq("id", task.id);
      } else {
        const insertData = {
          user_id: user.id,
          name: task.name,
          progress: task.progress,
          total: task.total,
          color: task.color
        };
        await supabase.from("tasks").insert(insertData);
      }
      await fetchAllData();
      setEditingTask(null);
    } catch (err: any) {
      alert("保存失败: " + err.message);
    }
  }, [user, fetchAllData]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user || id.startsWith("demo-")) return;
    if (!confirm("确定删除？")) return;
    await supabase.from("tasks").delete().eq("id", id);
    await fetchAllData();
    setEditingTask(null);
  }, [user, fetchAllData]);

  const saveTaskUnit = useCallback(async (tu: TaskUnit) => {
    if (!user) return;
    try {
      if (tu.id && tu.id !== "" && !tu.id.startsWith("demo-")) {
        await supabase.from("task_units").update({
          task_id: tu.task_id,
          day_of_week: tu.day_of_week,
          start_time: tu.start_time,
          end_time: tu.end_time,
          planned_amount: tu.planned_amount,
          completed_amount: tu.completed_amount,
          status: tu.status
        }).eq("id", tu.id);
      } else {
        const insertData = {
          user_id: user.id,
          task_id: tu.task_id,
          day_of_week: tu.day_of_week,
          start_time: tu.start_time,
          end_time: tu.end_time,
          planned_amount: tu.planned_amount,
          completed_amount: tu.completed_amount,
          status: tu.status
        };
        await supabase.from("task_units").insert(insertData);
      }
      await fetchAllData();
      setEditingTaskUnit(null);
      setSelectedTaskUnit(null);
    } catch (err: any) {
      alert("保存失败: " + err.message);
    }
  }, [user, fetchAllData]);

  const deleteTaskUnit = useCallback(async (id: string) => {
    if (id.startsWith("demo-") || !user) {
      if (!confirm("确定删除示例数据？")) return;
      setTaskUnits(prev => prev.filter(tu => tu.id !== id));
      setEditingTaskUnit(null);
      setSelectedTaskUnit(null);
      return;
    }
    if (!confirm("确定删除？")) return;
    await supabase.from("task_units").delete().eq("id", id);
    await fetchAllData();
    setEditingTaskUnit(null);
    setSelectedTaskUnit(null);
  }, [user, fetchAllData]);

  const checkInTaskUnit = useCallback(async (taskUnit: TaskUnit) => {
    const targetTask = tasks.find(t => t.id === taskUnit.task_id);
    if (!targetTask) return;

    const newProgress = Math.min(targetTask.progress + taskUnit.planned_amount, targetTask.total);

    if (taskUnit.id.startsWith("demo-") || !user) {
      setTaskUnits(prev => prev.map(tu => tu.id === taskUnit.id ? { ...tu, status: "done" } : tu));
      setTasks(prev => prev.map(t => t.id === targetTask.id ? { ...t, progress: newProgress } : t));
      return;
    }

    try {
      await Promise.all([
        supabase.from("task_units").update({ completed_amount: taskUnit.planned_amount, status: "done" }).eq("id", taskUnit.id),
        supabase.from("tasks").update({ progress: newProgress }).eq("id", targetTask.id)
      ]);
      await fetchAllData();
    } catch (err) {
      console.error("Check-in failed:", err);
    }
  }, [user, tasks, fetchAllData]);

  const saveDiary = useCallback(async (content: string) => {
    if (!content.trim()) return;
    if (!user) {
      setDiaries(prev => [{ id: "demo-d-" + Date.now(), user_id: "demo", content: content.trim(), date: new Date().toISOString().split("T")[0], created_at: new Date().toISOString() }, ...prev]);
      setNewDiaryEntry("");
      return;
    }
    await supabase.from("diaries").insert({ user_id: user.id, content: content.trim(), date: new Date().toISOString().split("T")[0] });
    await fetchAllData();
    setNewDiaryEntry("");
  }, [user, fetchAllData]);

  const deleteDiary = useCallback(async (id: string) => {
    if (!user || id.startsWith("demo-")) return;
    await supabase.from("diaries").delete().eq("id", id);
    await fetchAllData();
  }, [user, fetchAllData]);

  // =============================================
  // Lifecycle
  // =============================================

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        console.log("[App] Initializing session...");
        const { data, error } = await getSessionWithTimeout(5000);
        if (isMounted) {
          if (error) console.error("[App] Session error:", error);
          setUser(data?.session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("[App] Init crash:", err);
        if (isMounted) setLoading(false);
      }
    };
    init();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) fetchAllData();
    else {
      setCourses(demoCourses);
      setTasks(demoTasks);
      setTaskUnits(demoTaskUnits);
      setDiaries([]);
    }
  }, [user, fetchAllData]);

  // =============================================
  // Render Helpers
  // =============================================

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const handleAuth = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setAuthError(error.message);
        } else if (!data.session) {
          setAuthError("登录失败，请检查邮箱和密码。");
        }
        // session 创建后 onAuthStateChange 会自动设置 user
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setAuthError(error.message);
        } else if (data.session) {
          // 注册成功，session 已创建，onAuthStateChange 会自动设置 user
        } else {
          // 注册成功但需要邮箱验证
          setAuthError("注册成功！请检查邮箱并点击确认链接。");
        }
      }
    } catch (err: any) {
      console.error("[App] Auth error:", err);
      setAuthError(err?.message || "认证失败，请检查网络连接。");
    } finally {
      setAuthLoading(false);
    }
  }, [email, password, isLogin]);

  if (renderError) {
    return (
      <div style={{ padding: "40px", backgroundColor: "#1a1a1a", color: "white", height: "100vh" }}>
        <h1>❌ 应用崩溃 (Render Crash)</h1>
        <pre style={{ backgroundColor: "#333", padding: "20px", borderRadius: "8px", overflow: "auto" }}>
          {renderError.message}
          {"\n"}
          {renderError.stack}
        </pre>
        <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}>
          刷新页面
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f0f0f", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <h2>⏳ 正在加载...</h2>
          <p>若长时间无响应，请刷新或检查网络。</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f0f0f", color: "#fff" }}>
        <div style={{ width: "100%", maxWidth: "400px", padding: "20px" }}>
          <h1 style={{ textAlign: "center" }}>🎯 时间管理器</h1>

          {/* Error message */}
          {authError && (
            <div style={{
              backgroundColor: "rgba(220, 53, 69, 0.15)",
              border: "1px solid rgba(220, 53, 69, 0.4)",
              borderRadius: "6px",
              padding: "10px 12px",
              marginBottom: "12px",
              color: "#f87171",
              fontSize: "13px",
              lineHeight: 1.5
            }}>
              ⚠️ {authError}
            </div>
          )}

          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={e => { setEmail(e.target.value); setAuthError(null); }}
            onKeyDown={e => { if (e.key === "Enter") handleAuth(); }}
            disabled={authLoading}
            style={{ width: "100%", padding: "12px", marginBottom: "10px", backgroundColor: "#1a1a1a", color: "#fff", border: "1px solid #333", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box", opacity: authLoading ? 0.5 : 1 }}
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={e => { setPassword(e.target.value); setAuthError(null); }}
            onKeyDown={e => { if (e.key === "Enter") handleAuth(); }}
            disabled={authLoading}
            style={{ width: "100%", padding: "12px", marginBottom: "20px", backgroundColor: "#1a1a1a", color: "#fff", border: "1px solid #333", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box", opacity: authLoading ? 0.5 : 1 }}
          />
          <button
            onClick={handleAuth}
            disabled={authLoading || !email.trim() || !password.trim()}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: authLoading || !email.trim() || !password.trim() ? "#555" : "#2a6dd3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: authLoading || !email.trim() || !password.trim() ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            {authLoading ? "⏳ 处理中..." : isLogin ? "登录" : "注册"}
          </button>
          <button
            onClick={() => { setIsLogin(!isLogin); setAuthError(null); }}
            disabled={authLoading}
            style={{ width: "100%", background: "none", color: authLoading ? "#555" : "#2a6dd3", border: "none", marginTop: "10px", cursor: authLoading ? "not-allowed" : "pointer", fontSize: "13px" }}
          >
            {isLogin ? "没有账号？去注册" : "已有账号？去登录"}
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif", backgroundColor: "#0f0f0f", color: "#fff" }}>
        <Header userEmail={user.email || ""} userName={user.user_metadata?.name || user.email?.split("@")[0] || "User"} onSignOut={handleSignOut} showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
        
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <Sidebar newDiaryEntry={newDiaryEntry} setNewDiaryEntry={setNewDiaryEntry} diaries={diaries} onSaveDiary={saveDiary} onDeleteDiary={deleteDiary} />
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <CoursesAndTasks courses={courses} tasks={tasks} setEditingCourse={setEditingCourse} setEditingTask={setEditingTask} />
            <Timetable taskUnits={taskUnits} tasks={tasks} courses={courses} setSelectedTaskUnit={setSelectedTaskUnit} setEditingTaskUnit={setEditingTaskUnit} />
          </div>

          <EditZone
            selectedTaskUnit={selectedTaskUnit} setSelectedTaskUnit={setSelectedTaskUnit}
            editingCourse={editingCourse} setEditingCourse={setEditingCourse}
            editingTask={editingTask} setEditingTask={setEditingTask}
            editingTaskUnit={editingTaskUnit} setEditingTaskUnit={setEditingTaskUnit}
            tasks={tasks}
            onSaveCourse={saveCourse} onDeleteCourse={deleteCourse}
            onSaveTask={saveTask} onDeleteTask={deleteTask}
            onSaveTaskUnit={saveTaskUnit} onDeleteTaskUnit={deleteTaskUnit}
            onCheckIn={checkInTaskUnit}
          />
        </div>
      </div>
    );
  } catch (err: any) {
    setRenderError(err);
    return null;
  }
}
