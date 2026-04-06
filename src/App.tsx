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
// Demo data - used as default for ALL users (logged in or not)
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
  },
  {
    id: "demo-tu2",
    task_id: "demo-t1",
    day_of_week: 2,
    start_time: "14:00",
    end_time: "15:00",
    planned_amount: 2,
    completed_amount: 0,
    status: "pending"
  },
  {
    id: "demo-tu3",
    task_id: "demo-t2",
    day_of_week: 1,
    start_time: "10:00",
    end_time: "12:00",
    planned_amount: 5,
    completed_amount: 0,
    status: "pending"
  },
  {
    id: "demo-tu4",
    task_id: "demo-t2",
    day_of_week: 3,
    start_time: "15:00",
    end_time: "16:00",
    planned_amount: 2,
    completed_amount: 0,
    status: "pending"
  }
];

// =============================================
// Helper: Parse course from Supabase (handle JSONB schedule)
// =============================================

function parseCourse(raw: any): Course {
  let schedule: Course["schedule"] = [];
  try {
    if (typeof raw.schedule === "string") {
      schedule = JSON.parse(raw.schedule);
    } else if (Array.isArray(raw.schedule)) {
      schedule = raw.schedule;
    }
  } catch {
    schedule = [];
  }
  return {
    ...raw,
    schedule,
    is_optional: raw.is_optional ?? false,
    note: raw.note ?? ""
  };
}

// =============================================
// Main App Component
// =============================================

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // Data states - initialized with demo data to avoid flash
  const [courses, setCourses] = useState<Course[]>(demoCourses);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [taskUnits, setTaskUnits] = useState<TaskUnit[]>(demoTaskUnits);
  const [diaries, setDiaries] = useState<Diary[]>([]);

  // UI states
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTaskUnit, setSelectedTaskUnit] = useState<TaskUnit | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newDiaryEntry, setNewDiaryEntry] = useState("");

  // Track if we've loaded real data (state instead of ref so UI updates)
  const [hasLoadedRealData, setHasLoadedRealData] = useState(false);

  // =============================================
  // Auth initialization
  // =============================================

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const initializeSession = async () => {
      try {
        const result = await getSessionWithTimeout(8000);
        if (!isMounted) return;
        const { data, error } = result;
        if (error) {
          console.error("Get session error:", error);
          setUser(null);
        } else {
          const currentUser = data?.session?.user ?? null;
          setUser(currentUser);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Session initialization failed:", err);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });
    unsubscribe = data?.subscription?.unsubscribe;
    initializeSession();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // =============================================
  // Data fetching (when user changes)
  // =============================================

  const fetchAllData = useCallback(async () => {
    if (!user) return;

    const userId = user.id;
    console.log("[App] Fetching data for user:", userId);

    let anyDataLoaded = false;

    try {
      const [coursesRes, tasksRes, taskUnitsRes, diariesRes] = await Promise.all([
        supabase.from("courses").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("task_units").select("*").eq("user_id", userId).order("day_of_week", { ascending: true }).order("start_time", { ascending: true }),
        supabase.from("diaries").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      ]);

      // Only mark as loaded if at least one table has actual data
      if (!coursesRes.error && coursesRes.data && coursesRes.data.length > 0) {
        const parsed = coursesRes.data.map(parseCourse);
        console.log(`[App] Loaded ${parsed.length} courses`);
        setCourses(parsed);
        anyDataLoaded = true;
      } else if (!coursesRes.error) {
        console.log("[App] Courses query succeeded but returned 0 rows (using demo courses)");
      } else {
        console.error("[App] Error fetching courses:", coursesRes.error);
      }

      if (!tasksRes.error && tasksRes.data && tasksRes.data.length > 0) {
        console.log(`[App] Loaded ${tasksRes.data.length} tasks`);
        setTasks(tasksRes.data);
        anyDataLoaded = true;
      } else if (!tasksRes.error) {
        console.log("[App] Tasks query succeeded but returned 0 rows (using demo tasks)");
      } else {
        console.error("[App] Error fetching tasks:", tasksRes.error);
      }

      if (!taskUnitsRes.error && taskUnitsRes.data && taskUnitsRes.data.length > 0) {
        console.log(`[App] Loaded ${taskUnitsRes.data.length} task_units`);
        setTaskUnits(taskUnitsRes.data);
        anyDataLoaded = true;
      } else if (!taskUnitsRes.error) {
        console.log("[App] Task units query succeeded but returned 0 rows (using demo task_units)");
      } else {
        console.error("[App] Error fetching task_units:", taskUnitsRes.error);
      }

      if (!diariesRes.error) {
        setDiaries(diariesRes.data || []);
      } else {
        console.error("[App] Error fetching diaries:", diariesRes.error);
      }

      setHasLoadedRealData(anyDataLoaded);
    } catch (err) {
      console.error("[App] Fetch all data failed:", err);
      console.warn("[App] Keeping demo data as fallback");
      setHasLoadedRealData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      // Reset to demo data when logged out
      setCourses(demoCourses);
      setTasks(demoTasks);
      setTaskUnits(demoTaskUnits);
      setDiaries([]);
      setHasLoadedRealData(false);
    }
  }, [user, fetchAllData]);

  // =============================================
  // Initialize sample data for current user (one-time setup)
  // =============================================

  const initializeSampleData = useCallback(async () => {
    if (!user) return;
    if (!confirm("这将向你的账户添加示例数据（课程、任务、任务单元）。确定？")) return;

    const userId = user.id;

    try {
      // Insert demo tasks first
      const { data: insertedTasks, error: taskErr } = await supabase
        .from("tasks")
        .insert([
          { user_id: userId, name: "Reading", progress: 147, total: 194, color: "#eab308" },
          { user_id: userId, name: "Exercising", progress: 37, total: 121, color: "#60a5fa" }
        ])
        .select();

      if (taskErr) throw taskErr;

      const taskMap: Record<string, string> = {
        "demo-t1": insertedTasks[0].id,
        "demo-t2": insertedTasks[1].id
      };

      // Insert demo courses
      const { error: courseErr } = await supabase
        .from("courses")
        .insert([
          { user_id: userId, name: "Maths", color: "#fb923c", schedule: JSON.stringify([{ day_of_week: 0, start_time: "09:00", end_time: "10:30" }, { day_of_week: 2, start_time: "13:00", end_time: "14:30" }]), is_optional: false },
          { user_id: userId, name: "Physics", color: "#fda4af", schedule: JSON.stringify([{ day_of_week: 1, start_time: "10:00", end_time: "11:30" }, { day_of_week: 3, start_time: "10:00", end_time: "11:30" }]), is_optional: true }
        ]);

      if (courseErr) throw courseErr;

      // Insert demo task units
      const { error: tuErr } = await supabase
        .from("task_units")
        .insert([
          { user_id: userId, task_id: taskMap["demo-t1"], day_of_week: 0, start_time: "09:00", end_time: "10:00", planned_amount: 3 },
          { user_id: userId, task_id: taskMap["demo-t1"], day_of_week: 2, start_time: "14:00", end_time: "15:00", planned_amount: 2 },
          { user_id: userId, task_id: taskMap["demo-t2"], day_of_week: 1, start_time: "10:00", end_time: "12:00", planned_amount: 5 },
          { user_id: userId, task_id: taskMap["demo-t2"], day_of_week: 3, start_time: "15:00", end_time: "16:00", planned_amount: 2 }
        ]);

      if (tuErr) throw tuErr;

      alert("✅ 示例数据已添加！");
      await fetchAllData();
    } catch (err: any) {
      console.error("Init sample data error:", err);
      alert("初始化失败：" + (err.message || err));
    }
  }, [user, fetchAllData]);

  // =============================================
  // CRUD: Courses
  // =============================================

  const saveCourse = useCallback(async (course: Course) => {
    if (!user) return;

    const courseData = { ...course, user_id: user.id };

    if (course.id && course.id !== "" && !course.id.startsWith("demo-")) {
      // Update existing
      const { error } = await supabase.from("courses").update({
        name: courseData.name,
        color: courseData.color,
        schedule: courseData.schedule,
        is_optional: courseData.is_optional,
        note: courseData.note
      }).eq("id", course.id);

      if (error) {
        console.error("Update course error:", error);
        alert("更新课程失败：" + error.message);
        return;
      }
    } else {
      // Insert new (or re-insert demo course)
      const { data, error } = await supabase.from("courses").insert(courseData).select();
      if (error) {
        console.error("Insert course error:", error);
        alert("添加课程失败：" + error.message);
        return;
      }
      if (data && data.length > 0) {
        courseData.id = data[0].id;
      }
    }

    await fetchAllData();
    setEditingCourse(null);
  }, [user, fetchAllData]);

  const deleteCourse = useCallback(async (courseId: string) => {
    if (!courseId) return;
    if (courseId.startsWith("demo-")) {
      // Demo courses can be removed from local state only
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setEditingCourse(null);
      return;
    }
    if (!user) return;
    if (!confirm("确定要删除这门课程吗？")) return;

    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      console.error("Delete course error:", error);
      alert("删除课程失败：" + error.message);
      return;
    }

    await fetchAllData();
    setEditingCourse(null);
  }, [user, fetchAllData]);

  // =============================================
  // CRUD: Tasks
  // =============================================

  const saveTask = useCallback(async (task: Task) => {
    if (!user) return;

    const taskData = { ...task, user_id: user.id };

    if (task.id && task.id !== "" && !task.id.startsWith("demo-")) {
      const { error } = await supabase.from("tasks").update({
        name: taskData.name,
        progress: taskData.progress,
        total: taskData.total,
        color: taskData.color
      }).eq("id", task.id);

      if (error) {
        console.error("Update task error:", error);
        alert("更新任务失败：" + error.message);
        return;
      }
    } else {
      const { data, error } = await supabase.from("tasks").insert(taskData).select();
      if (error) {
        console.error("Insert task error:", error);
        alert("添加任务失败：" + error.message);
        return;
      }
      if (data && data.length > 0) {
        taskData.id = data[0].id;
      }
    }

    await fetchAllData();
    setEditingTask(null);
  }, [user, fetchAllData]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!taskId) return;
    if (taskId.startsWith("demo-")) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setTaskUnits(prev => prev.filter(tu => tu.task_id !== taskId));
      setEditingTask(null);
      return;
    }
    if (!user) return;
    if (!confirm("确定要删除这个任务吗？相关的任务单元也会被删除。")) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      console.error("Delete task error:", error);
      alert("删除任务失败：" + error.message);
      return;
    }

    await fetchAllData();
    setEditingTask(null);
  }, [user, fetchAllData]);

  // =============================================
  // CRUD: TaskUnits (打卡)
  // =============================================

  const checkInTaskUnit = useCallback(async (taskUnit: TaskUnit) => {
    // Update local state immediately for responsive UI
    const targetTask = tasks.find(t => t.id === taskUnit.task_id);
    if (!targetTask) return;

    const updatedTaskUnit = {
      ...taskUnit,
      completed_amount: taskUnit.planned_amount,
      status: "done" as const
    };
    const newProgress = Math.min(targetTask.progress + taskUnit.planned_amount, targetTask.total);

    // Optimistic update
    setTaskUnits(prev => prev.map(tu => tu.id === taskUnit.id ? updatedTaskUnit : tu));
    setTasks(prev => prev.map(t => t.id === targetTask.id ? { ...t, progress: newProgress } : t));
    setSelectedTaskUnit(updatedTaskUnit);

    // Sync to Supabase (only for non-demo data)
    if (taskUnit.id.startsWith("demo-") || !user) {
      console.log("[App] Demo task unit checked in (local only)");
      return;
    }

    try {
      const [{ error: tuError }, { error: taskError }] = await Promise.all([
        supabase.from("task_units").update({ completed_amount: updatedTaskUnit.completed_amount, status: "done" }).eq("id", taskUnit.id),
        supabase.from("tasks").update({ progress: newProgress }).eq("id", targetTask.id)
      ]);

      if (tuError) {
        console.error("Sync task_unit error:", tuError);
        // Revert optimistic update
        setTaskUnits(prev => prev.map(tu => tu.id === taskUnit.id ? taskUnit : tu));
      }
      if (taskError) {
        console.error("Sync task error:", taskError);
      }
    } catch (err) {
      console.error("Check-in sync failed:", err);
    }
  }, [user, tasks]);

  // =============================================
  // CRUD: Diaries
  // =============================================

  const saveDiary = useCallback(async (content: string) => {
    if (!content.trim()) return;

    if (!user) {
      // Demo mode: add to local state only
      const newDiary: Diary = {
        id: `demo-d-${Date.now()}`,
        user_id: "demo",
        content: content.trim(),
        date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString()
      };
      setDiaries(prev => [newDiary, ...prev]);
      setNewDiaryEntry("");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("diaries").insert({
      user_id: user.id,
      content: content.trim(),
      date: today
    });

    if (error) {
      console.error("Insert diary error:", error);
      alert("保存日记失败：" + error.message);
      return;
    }

    await fetchAllData();
    setNewDiaryEntry("");
  }, [user, fetchAllData]);

  const deleteDiary = useCallback(async (diaryId: string) => {
    if (!diaryId) return;
    if (diaryId.startsWith("demo-")) {
      setDiaries(prev => prev.filter(d => d.id !== diaryId));
      return;
    }
    if (!user) return;
    if (!confirm("确定要删除这条日记吗？")) return;

    const { error } = await supabase.from("diaries").delete().eq("id", diaryId);
    if (error) {
      console.error("Delete diary error:", error);
      alert("删除日记失败：" + error.message);
      return;
    }

    await fetchAllData();
  }, [user, fetchAllData]);

  // =============================================
  // Auth actions
  // =============================================

  const signIn = useCallback(async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      setEmail("");
      setPassword("");
    }
  }, [email, password]);

  const signUp = useCallback(async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else {
      alert("注册成功！请检查邮箱进行确认。");
      setEmail("");
      setPassword("");
    }
  }, [email, password]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
      setCourses(demoCourses);
      setTasks(demoTasks);
      setTaskUnits(demoTaskUnits);
      setDiaries([]);
      setSelectedTaskUnit(null);
      setEditingCourse(null);
      setEditingTask(null);
    } catch (err) {
      console.error("Sign out error:", err);
      alert("登出失败");
    }
  }, []);

  // =============================================
  // Render
  // =============================================

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#0f0f0f" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#fff" }}>⏳ 加载中...</h2>
          <p style={{ color: "#b0b0b0" }}>正在初始化应用...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", padding: "20px", backgroundColor: "#0f0f0f" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#fff" }}>🎯 时间管理器</h1>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #3a3a3a", borderRadius: "6px", fontSize: "16px", boxSizing: "border-box", backgroundColor: "#1a1a1a", color: "#fff" }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #3a3a3a", borderRadius: "6px", fontSize: "16px", boxSizing: "border-box", backgroundColor: "#1a1a1a", color: "#fff" }}
            />
          </div>
          <button
            onClick={isLogin ? signIn : signUp}
            style={{ width: "100%", padding: "12px", backgroundColor: "#2a6dd3", color: "white", border: "none", borderRadius: "6px", fontSize: "16px", cursor: "pointer", marginBottom: "10px" }}
          >
            {isLogin ? "登录" : "注册"}
          </button>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ width: "100%", padding: "12px", backgroundColor: "transparent", color: "#2a6dd3", border: "1px solid #2a6dd3", borderRadius: "6px", fontSize: "16px", cursor: "pointer" }}
          >
            {isLogin ? "没有账户？注册" : "已有账户？登录"}
          </button>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#666" }}>提示：不登录也可以查看演示数据</p>
        </div>
      </div>
    );
  }

  // Main app layout
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", width: "100%", overflow: "hidden", backgroundColor: "#0f0f0f" }}>
      <Header
        userEmail={user.email || ""}
        userName={user.user_metadata?.name || user.email?.split("@")[0] || "User"}
        onSignOut={handleSignOut}
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
      />

      {/* Data status bar */}
      {!hasLoadedRealData && user && (
        <div style={{
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #2a2a2a",
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0
        }}>
          <span style={{ fontSize: "12px", color: "#fb923c" }}>
            ℹ️ 当前显示演示数据
          </span>
          <button
            onClick={initializeSampleData}
            style={{
              padding: "4px 16px",
              backgroundColor: "#2a6dd3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            📦 初始化示例数据到数据库
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden", width: "100%" }}>
        <Sidebar
          newDiaryEntry={newDiaryEntry}
          setNewDiaryEntry={setNewDiaryEntry}
          diaries={diaries}
          onSaveDiary={saveDiary}
          onDeleteDiary={deleteDiary}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#0f0f0f", minWidth: 0 }}>
          <CoursesAndTasks
            courses={courses}
            tasks={tasks}
            setEditingCourse={setEditingCourse}
            setEditingTask={setEditingTask}
          />

          <Timetable
            taskUnits={taskUnits}
            tasks={tasks}
            courses={courses}
            setSelectedTaskUnit={setSelectedTaskUnit}
          />
        </div>

        <EditZone
          selectedTaskUnit={selectedTaskUnit}
          setSelectedTaskUnit={setSelectedTaskUnit}
          editingCourse={editingCourse}
          setEditingCourse={setEditingCourse}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          tasks={tasks}
          onSaveCourse={saveCourse}
          onDeleteCourse={deleteCourse}
          onSaveTask={saveTask}
          onDeleteTask={deleteTask}
          onCheckIn={checkInTaskUnit}
        />
      </div>
    </div>
  );
}
