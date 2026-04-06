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

// Helpers moved to CoursesAndTasks.tsx to avoid duplication

// =============================================
// Demo data for logged-out state
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
// Main App Component
// =============================================

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  // Data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskUnits, setTaskUnits] = useState<TaskUnit[]>([]);
  const [diaries, setDiaries] = useState<Diary[]>([]);

  // UI states
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTaskUnit, setSelectedTaskUnit] = useState<TaskUnit | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newDiaryEntry, setNewDiaryEntry] = useState("");

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
        if (isMounted) {
          setLoading(false);
        }
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

    try {
      const [coursesRes, tasksRes, taskUnitsRes, diariesRes] = await Promise.all([
        supabase.from("courses").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("task_units").select("*").eq("user_id", userId).order("day_of_week", { ascending: true }).order("start_time", { ascending: true }),
        supabase.from("diaries").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      ]);

      if (coursesRes.error) console.error("Error fetching courses:", coursesRes.error);
      else setCourses(coursesRes.data?.map(parseCourse) || []);

      if (tasksRes.error) console.error("Error fetching tasks:", tasksRes.error);
      else setTasks(tasksRes.data || []);

      if (taskUnitsRes.error) console.error("Error fetching task units:", taskUnitsRes.error);
      else setTaskUnits(taskUnitsRes.data || []);

      if (diariesRes.error) console.error("Error fetching diaries:", diariesRes.error);
      else setDiaries(diariesRes.data || []);
    } catch (err) {
      console.error("Fetch all data failed:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      // Demo data when logged out
      setCourses(demoCourses);
      setTasks(demoTasks);
      setTaskUnits(demoTaskUnits);
      setDiaries([]);
    }
  }, [user, fetchAllData]);

  // =============================================
  // CRUD: Courses
  // =============================================

  const saveCourse = useCallback(async (course: Course) => {
    if (!user) return;

    const courseData = { ...course, user_id: user.id };

    if (course.id && course.id !== "") {
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
      // Insert new
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
    if (!user || !courseId) return;
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

    if (task.id && task.id !== "") {
      // Update existing
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
      // Insert new
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
    if (!user || !taskId) return;
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
    if (!user) return;

    const targetTask = tasks.find(t => t.id === taskUnit.task_id);
    if (!targetTask) return;

    // Update task unit
    const updatedTaskUnit = {
      ...taskUnit,
      completed_amount: taskUnit.planned_amount,
      status: "done" as const
    };

    const { error: tuError } = await supabase.from("task_units").update({
      completed_amount: updatedTaskUnit.completed_amount,
      status: updatedTaskUnit.status
    }).eq("id", taskUnit.id);

    if (tuError) {
      console.error("Update task unit error:", tuError);
      alert("打卡失败：" + tuError.message);
      return;
    }

    // Update task progress
    const newProgress = Math.min(targetTask.progress + taskUnit.planned_amount, targetTask.total);
    const { error: taskError } = await supabase.from("tasks").update({
      progress: newProgress
    }).eq("id", targetTask.id);

    if (taskError) {
      console.error("Update task progress error:", taskError);
    }

    // Update local state
    setTaskUnits(prev => prev.map(tu => tu.id === taskUnit.id ? updatedTaskUnit : tu));
    setTasks(prev => prev.map(t => t.id === targetTask.id ? { ...t, progress: newProgress } : t));
    setSelectedTaskUnit(updatedTaskUnit);
  }, [user, tasks]);

  // =============================================
  // CRUD: Diaries
  // =============================================

  const saveDiary = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

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
    if (!user || !diaryId) return;
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
      setCourses([]);
      setTasks([]);
      setTaskUnits([]);
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
          <p style={{ color: "#b0b0b0" }}>正在初始化应用，请稍候...</p>
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
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#2a6dd3",
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
              color: "#2a6dd3",
              border: "1px solid #2a6dd3",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            {isLogin ? "没有账户？注册" : "已有账户？登录"}
          </button>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#666" }}>
            提示：不登录也可以查看演示数据
          </p>
        </div>
      </div>
    );
  }

  // Main app layout
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", width: "100%", overflow: "hidden", backgroundColor: "#0f0f0f" }}>
      {/* Header */}
      <Header
        userEmail={user.email || ""}
        userName={user.user_metadata?.name || user.email?.split("@")[0] || "User"}
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
        onSignOut={handleSignOut}
      />

      {/* Main content: 3-column flex layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", width: "100%" }}>
        {/* Left sidebar (18%) - Diary */}
        <Sidebar
          newDiaryEntry={newDiaryEntry}
          setNewDiaryEntry={setNewDiaryEntry}
          diaries={diaries}
          onSaveDiary={saveDiary}
          onDeleteDiary={deleteDiary}
        />

        {/* Center column (64%) - Courses/Tasks + Timetable */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: "#0f0f0f", minWidth: 0 }}>
          {/* Upper: Courses and Tasks */}
          <CoursesAndTasks
            courses={courses}
            tasks={tasks}
            setEditingCourse={setEditingCourse}
            setEditingTask={setEditingTask}
          />

          {/* Lower: Timetable */}
          <Timetable
            taskUnits={taskUnits}
            tasks={tasks}
            courses={courses}
            setSelectedTaskUnit={setSelectedTaskUnit}
          />
        </div>

        {/* Right panel (18%) - Edit Zone */}
        <EditZone
          selectedTaskUnit={selectedTaskUnit}
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
