import React from "react";
import type { Task, TaskUnit, Course } from "../App";

interface EditZoneProps {
  selectedTaskUnit: TaskUnit | null;
  setSelectedTaskUnit: (tu: TaskUnit | null) => void;
  editingCourse: Course | null;
  setEditingCourse: (c: Course | null) => void;
  editingTask: Task | null;
  setEditingTask: (t: Task | null) => void;
  editingTaskUnit: TaskUnit | null;
  setEditingTaskUnit: (tu: TaskUnit | null) => void;
  tasks: Task[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onSaveTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onSaveTaskUnit: (tu: TaskUnit) => void;
  onDeleteTaskUnit: (id: string) => void;
  onCheckIn: (taskUnit: TaskUnit) => void;
}

const EditZone: React.FC<EditZoneProps> = ({
  selectedTaskUnit,
  setSelectedTaskUnit,
  editingCourse,
  setEditingCourse,
  editingTask,
  setEditingTask,
  editingTaskUnit,
  setEditingTaskUnit,
  tasks,
  onSaveCourse,
  onDeleteCourse,
  onSaveTask,
  onDeleteTask,
  onSaveTaskUnit,
  onDeleteTaskUnit,
  onCheckIn
}) => {
  // =============================================
  // Task Unit Edit Form
  // =============================================

  const renderTaskUnitForm = () => {
    if (!editingTaskUnit) return null;
    const isEdit = !!editingTaskUnit.id;
    const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    return (
      <div style={{ marginBottom: "16px" }}>
        <h4 style={{ color: "#e5e5e5", marginBottom: "12px", fontSize: "13px", fontWeight: "500" }}>
          {isEdit ? "编辑任务单元" : "添加任务单元"}
        </h4>
        <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #3a3a3a" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>所属任务</label>
            <select
              value={editingTaskUnit.task_id}
              onChange={e => setEditingTaskUnit({ ...editingTaskUnit, task_id: e.target.value })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }}
            >
              <option value="">-- 选择任务 --</option>
              {safeTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>星期</label>
            <select
              value={editingTaskUnit.day_of_week}
              onChange={e => setEditingTaskUnit({ ...editingTaskUnit, day_of_week: parseInt(e.target.value) })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }}
            >
              {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>开始时间</label>
              <input type="time" value={editingTaskUnit.start_time || "09:00"} onChange={e => setEditingTaskUnit({ ...editingTaskUnit, start_time: e.target.value })} style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>结束时间</label>
              <input type="time" value={editingTaskUnit.end_time || "10:00"} onChange={e => setEditingTaskUnit({ ...editingTaskUnit, end_time: e.target.value })} style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }} />
            </div>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>计划进度 (+)</label>
            <input type="number" min={1} value={editingTaskUnit.planned_amount || 1} onChange={e => setEditingTaskUnit({ ...editingTaskUnit, planned_amount: parseInt(e.target.value) || 1 })} style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }} />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => onSaveTaskUnit(editingTaskUnit)} disabled={!editingTaskUnit.task_id} style={{ flex: 1, padding: "6px", backgroundColor: !editingTaskUnit.task_id ? "#555" : "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: !editingTaskUnit.task_id ? "not-allowed" : "pointer", fontSize: "12px" }}>{isEdit ? "保存" : "添加"}</button>
            {isEdit && <button onClick={() => onDeleteTaskUnit(editingTaskUnit.id)} style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>删除</button>}
            <button onClick={() => setEditingTaskUnit(null)} style={{ flex: 1, padding: "6px", backgroundColor: "#555", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>取消</button>
          </div>
        </div>
      </div>
    );
  };

  // =============================================
  // Task Unit Detail
  // =============================================

  const renderTaskUnitDetail = () => {
    if (!selectedTaskUnit) return null;
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const targetTask = safeTasks.find(t => t.id === selectedTaskUnit.task_id);

    return (
      <div style={{ marginBottom: "16px" }}>
        <h4 style={{ color: "#e5e5e5", marginBottom: "12px", fontSize: "13px", fontWeight: "500" }}>任务单元详情</h4>
        <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #3a3a3a" }}>
          <div style={{ marginBottom: "10px", fontSize: "12px" }}>
            <strong style={{ color: "#b0b0b0" }}>任务：</strong>
            <span style={{ color: "#e5e5e5", marginLeft: "4px" }}>{targetTask?.name || "未知"}</span>
          </div>
          <div style={{ marginBottom: "10px", fontSize: "12px" }}>
            <strong style={{ color: "#b0b0b0" }}>时间：</strong>
            <span style={{ color: "#e5e5e5", marginLeft: "4px" }}>周{["一", "二", "三", "四", "五", "六", "日"][selectedTaskUnit.day_of_week] || "?"} {selectedTaskUnit.start_time} ~ {selectedTaskUnit.end_time}</span>
          </div>
          <div style={{ marginBottom: "10px", fontSize: "12px" }}>
            <strong style={{ color: "#b0b0b0" }}>计划进度：</strong>
            <span style={{ color: "#e5e5e5", marginLeft: "4px" }}>+{selectedTaskUnit.planned_amount}</span>
          </div>
          <div style={{ marginBottom: "10px", fontSize: "12px" }}>
            <strong style={{ color: "#b0b0b0" }}>状态：</strong>
            <span style={{ color: selectedTaskUnit.status === "done" ? "#28a745" : "#f59e0b", marginLeft: "4px" }}>
              {selectedTaskUnit.status === "done" ? "已完成 ✓" : "进行中"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
            <button
              onClick={() => onCheckIn(selectedTaskUnit)}
              disabled={selectedTaskUnit.status === "done"}
              style={{
                flex: 1,
                padding: "8px",
                backgroundColor: selectedTaskUnit.status === "done" ? "#555" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: selectedTaskUnit.status === "done" ? "not-allowed" : "pointer",
                fontSize: "12px"
              }}
            >
              {selectedTaskUnit.status === "done" ? "✅ 已打卡" : "✅ 打卡完成"}
            </button>
            <button
              onClick={() => {
                setEditingTaskUnit(selectedTaskUnit);
                setSelectedTaskUnit(null);
              }}
              style={{
                padding: "8px 12px",
                backgroundColor: "#2a6dd3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              编辑
            </button>
            <button
              onClick={() => onDeleteTaskUnit(selectedTaskUnit.id)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              删除
            </button>
            <button
              onClick={() => setSelectedTaskUnit(null)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#555",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =============================================
  // Course Edit Form
  // =============================================

  const renderCourseForm = () => {
    if (!editingCourse) return null;
    const isEdit = !!editingCourse.id;
    return (
      <div style={{ marginBottom: "16px" }}>
        <h4 style={{ color: "#e5e5e5", marginBottom: "12px", fontSize: "13px", fontWeight: "500" }}>
          {isEdit ? "编辑课程" : "添加课程"}
        </h4>
        <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #3a3a3a" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>课程名称</label>
            <input type="text" value={editingCourse.name || ""} onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })} style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>颜色</label>
            <input type="color" value={editingCourse.color || "#3B82F6"} onChange={e => setEditingCourse({ ...editingCourse, color: e.target.value })} style={{ width: "100%", height: "32px", border: "1px solid #3a3a3a", borderRadius: "4px", cursor: "pointer" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>上课时间</label>
            <ScheduleEditor schedule={editingCourse.schedule || []} onChange={schedule => setEditingCourse({ ...editingCourse, schedule })} />
          </div>
          <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <input type="checkbox" checked={editingCourse.is_optional || false} onChange={e => setEditingCourse({ ...editingCourse, is_optional: e.target.checked })} style={{ cursor: "pointer" }} />
            <label style={{ color: "#b0b0b0", fontSize: "11px", cursor: "pointer" }}>选修课程</label>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>备注</label>
            <textarea value={editingCourse.note || ""} onChange={e => setEditingCourse({ ...editingCourse, note: e.target.value })} rows={2} style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => onSaveCourse(editingCourse)} disabled={!editingCourse.name?.trim()} style={{ flex: 1, padding: "6px", backgroundColor: !editingCourse.name?.trim() ? "#555" : "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: !editingCourse.name?.trim() ? "not-allowed" : "pointer", fontSize: "12px" }}>{isEdit ? "保存" : "添加"}</button>
            {isEdit && <button onClick={() => onDeleteCourse(editingCourse.id)} style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>删除</button>}
            <button onClick={() => setEditingCourse(null)} style={{ flex: 1, padding: "6px", backgroundColor: "#555", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>取消</button>
          </div>
        </div>
      </div>
    );
  };

  // =============================================
  // Task Edit Form
  // =============================================

  const renderTaskForm = () => {
    if (!editingTask) return null;
    const isEdit = !!editingTask.id;
    return (
      <div>
        <h4 style={{ color: "#e5e5e5", marginBottom: "12px", fontSize: "13px", fontWeight: "500" }}>
          {isEdit ? "编辑任务" : "添加任务"}
        </h4>
        <div style={{ backgroundColor: "#2a2a2a", padding: "12px", borderRadius: "6px", border: "1px solid #3a3a3a" }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>任务名称</label>
            <input type="text" value={editingTask.name || ""} onChange={e => setEditingTask({ ...editingTask, name: e.target.value })} style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>总进度</label>
            <input type="number" min={0} value={editingTask.total || 100} onChange={e => setEditingTask({ ...editingTask, total: parseInt(e.target.value) || 100 })} style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>当前进度</label>
            <input type="number" min={0} max={editingTask.total} value={editingTask.progress || 0} onChange={e => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>颜色</label>
            <input type="color" value={editingTask.color || "#10B981"} onChange={e => setEditingTask({ ...editingTask, color: e.target.value })} style={{ width: "100%", height: "32px", border: "1px solid #3a3a3a", borderRadius: "4px", cursor: "pointer" }} />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => onSaveTask(editingTask)} disabled={!editingTask.name?.trim()} style={{ flex: 1, padding: "6px", backgroundColor: !editingTask.name?.trim() ? "#555" : "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: !editingTask.name?.trim() ? "not-allowed" : "pointer", fontSize: "12px" }}>{isEdit ? "保存" : "添加"}</button>
            {isEdit && <button onClick={() => onDeleteTask(editingTask.id)} style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>删除</button>}
            <button onClick={() => setEditingTask(null)} style={{ flex: 1, padding: "6px", backgroundColor: "#555", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>取消</button>
          </div>
        </div>
      </div>
    );
  };

  // =============================================
  // Main render
  // =============================================

  return (
    <div style={{
      width: "18%",
      backgroundColor: "#1a1a1a",
      borderLeft: "1px solid #2a2a2a",
      padding: "16px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minWidth: "200px"
    }}>
      <h3 style={{ marginTop: 0, color: "#2a6dd3", fontSize: "32px", textAlign: "center", lineHeight: 1.0, fontWeight: 400, paddingTop: "24px" }}>
        Edit Zone
      </h3>

      {!selectedTaskUnit && !editingCourse && !editingTask && !editingTaskUnit && (
        <>
          <div style={{ color: "#666", fontSize: "12px", textAlign: "center", marginTop: "20px", marginBottom: "30px" }}>
            点击左侧的项目或课程表空白处进行编辑
          </div>

          {/* App Introduction */}
          <div style={{
            backgroundColor: "#222",
            padding: "12px",
            borderRadius: "6px",
            border: "1px solid #333",
            fontSize: "12px",
            lineHeight: "1.6",
            color: "#aaa"
          }}>
            <h4 style={{ color: "#2a6dd3", marginTop: 0, marginBottom: "8px", fontSize: "13px" }}>💡 使用指南</h4>
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>1. 课程与任务：</strong> 左侧管理长期课程和任务目标。
            </p>
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>2. 选修课程 (Elective)：</strong> 标记为“选修”的课程通常是指非必修、兴趣类或可灵活安排的课程。在课程表中会以半透明色显示，方便你区分核心学业与兴趣活动。
            </p>
            <p style={{ margin: "0 0 8px 0" }}>
              <strong>3. 任务单元：</strong> 点击 <strong>课程表空白处</strong> 即可在指定时间创建“任务单元”。你可以将具体任务（如：阅读、锻炼）关联到时间段。
            </p>
            <p style={{ margin: 0 }}>
              <strong>4. 打卡：</strong> 点击课程表中的任务块，在右侧点击“打卡完成”即可同步更新任务总进度。
            </p>
          </div>
        </>
      )}

      {renderTaskUnitForm()}
      {renderTaskUnitDetail()}
      {renderCourseForm()}
      {renderTaskForm()}
    </div>
  );
};

// =============================================
// Sub-component: Schedule Editor
// =============================================

interface ScheduleEditorProps {
  schedule: Array<{ day_of_week: number; start_time: string; end_time: string }>;
  onChange: (schedule: Array<{ day_of_week: number; start_time: string; end_time: string }>) => void;
}

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ schedule, onChange }) => {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  const addSlot = () => onChange([...schedule, { day_of_week: 0, start_time: "09:00", end_time: "10:00" }]);
  const removeSlot = (index: number) => onChange(schedule.filter((_, i) => i !== index));
  const updateSlot = (index: number, field: string, value: number | string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {schedule.map((slot, idx) => (
        <div key={idx} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <select value={slot.day_of_week} onChange={e => updateSlot(idx, "day_of_week", parseInt(e.target.value))} style={{ flex: 1, padding: "3px", backgroundColor: "#333", color: "#e5e5e5", border: "1px solid #3a3a3a", borderRadius: "3px", fontSize: "11px" }}>
            {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
          <input type="time" value={slot.start_time} onChange={e => updateSlot(idx, "start_time", e.target.value)} style={{ width: "70px", padding: "3px", backgroundColor: "#333", color: "#e5e5e5", border: "1px solid #3a3a3a", borderRadius: "3px", fontSize: "11px" }} />
          <span style={{ color: "#666", fontSize: "10px" }}>~</span>
          <input type="time" value={slot.end_time} onChange={e => updateSlot(idx, "end_time", e.target.value)} style={{ width: "70px", padding: "3px", backgroundColor: "#333", color: "#e5e5e5", border: "1px solid #3a3a3a", borderRadius: "3px", fontSize: "11px" }} />
          <button onClick={() => removeSlot(idx)} style={{ padding: "2px 6px", backgroundColor: "#555", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "10px" }}>×</button>
        </div>
      ))}
      <button onClick={addSlot} style={{ padding: "4px", backgroundColor: "#333", color: "#b0b0b0", border: "1px dashed #555", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}>+ 添加时间段</button>
    </div>
  );
};

export default EditZone;
