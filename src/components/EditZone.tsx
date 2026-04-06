import React from "react";
import type { Task, TaskUnit, Course } from "../App";

interface EditZoneProps {
  selectedTaskUnit: TaskUnit | null;
  editingCourse: Course | null;
  setEditingCourse: (c: Course | null) => void;
  editingTask: Task | null;
  setEditingTask: (t: Task | null) => void;
  tasks: Task[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
  onSaveTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onCheckIn: (taskUnit: TaskUnit) => void;
}

const EditZone: React.FC<EditZoneProps> = ({
  selectedTaskUnit,
  editingCourse,
  setEditingCourse,
  editingTask,
  setEditingTask,
  tasks,
  onSaveCourse,
  onDeleteCourse,
  onSaveTask,
  onDeleteTask,
  onCheckIn
}) => {
  // =============================================
  // Task Unit Detail
  // =============================================

  const renderTaskUnitDetail = () => {
    if (!selectedTaskUnit) return null;
    const targetTask = tasks.find(t => t.id === selectedTaskUnit.task_id);

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
            <span style={{ color: "#e5e5e5", marginLeft: "4px" }}>周{["一", "二", "三", "四", "五"][selectedTaskUnit.day_of_week]} {selectedTaskUnit.start_time} ~ {selectedTaskUnit.end_time}</span>
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
          <button
            onClick={() => onCheckIn(selectedTaskUnit)}
            disabled={selectedTaskUnit.status === "done"}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: selectedTaskUnit.status === "done" ? "#555" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: selectedTaskUnit.status === "done" ? "not-allowed" : "pointer",
              fontSize: "12px",
              transition: "all 0.2s"
            }}
          >
            {selectedTaskUnit.status === "done" ? "✅ 已打卡" : "✅ 打卡完成"}
          </button>
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
          {/* Name */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>课程名称</label>
            <input
              type="text"
              value={editingCourse.name || ""}
              onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", boxSizing: "border-box" }}
            />
          </div>

          {/* Color */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>颜色</label>
            <input
              type="color"
              value={editingCourse.color || "#3B82F6"}
              onChange={e => setEditingCourse({ ...editingCourse, color: e.target.value })}
              style={{ width: "100%", height: "32px", border: "1px solid #3a3a3a", borderRadius: "4px", cursor: "pointer" }}
            />
          </div>

          {/* Schedule */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>上课时间</label>
            <ScheduleEditor
              schedule={editingCourse.schedule || []}
              onChange={schedule => setEditingCourse({ ...editingCourse, schedule })}
            />
          </div>

          {/* Optional */}
          <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="checkbox"
              checked={editingCourse.is_optional || false}
              onChange={e => setEditingCourse({ ...editingCourse, is_optional: e.target.checked })}
              style={{ cursor: "pointer" }}
            />
            <label style={{ color: "#b0b0b0", fontSize: "11px", cursor: "pointer" }}>选修课程</label>
          </div>

          {/* Note */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>备注</label>
            <textarea
              value={editingCourse.note || ""}
              onChange={e => setEditingCourse({ ...editingCourse, note: e.target.value })}
              rows={2}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => onSaveCourse(editingCourse)}
              disabled={!editingCourse.name?.trim()}
              style={{
                flex: 1,
                padding: "6px",
                backgroundColor: !editingCourse.name?.trim() ? "#555" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: !editingCourse.name?.trim() ? "not-allowed" : "pointer",
                fontSize: "12px"
              }}
            >
              {isEdit ? "保存" : "添加"}
            </button>
            {isEdit && (
              <button
                onClick={() => onDeleteCourse(editingCourse.id)}
                style={{
                  padding: "6px 12px",
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
            )}
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
          {/* Name */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>任务名称</label>
            <input
              type="text"
              value={editingTask.name || ""}
              onChange={e => setEditingTask({ ...editingTask, name: e.target.value })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", boxSizing: "border-box" }}
            />
          </div>

          {/* Total */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>总进度</label>
            <input
              type="number"
              min={0}
              value={editingTask.total || 100}
              onChange={e => setEditingTask({ ...editingTask, total: parseInt(e.target.value) || 100 })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", boxSizing: "border-box" }}
            />
          </div>

          {/* Progress */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>当前进度</label>
            <input
              type="number"
              min={0}
              max={editingTask.total}
              value={editingTask.progress || 0}
              onChange={e => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) || 0 })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px", boxSizing: "border-box" }}
            />
          </div>

          {/* Color */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", color: "#b0b0b0", fontSize: "11px" }}>颜色</label>
            <input
              type="color"
              value={editingTask.color || "#10B981"}
              onChange={e => setEditingTask({ ...editingTask, color: e.target.value })}
              style={{ width: "100%", height: "32px", border: "1px solid #3a3a3a", borderRadius: "4px", cursor: "pointer" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => onSaveTask(editingTask)}
              disabled={!editingTask.name?.trim()}
              style={{
                flex: 1,
                padding: "6px",
                backgroundColor: !editingTask.name?.trim() ? "#555" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: !editingTask.name?.trim() ? "not-allowed" : "pointer",
                fontSize: "12px"
              }}
            >
              {isEdit ? "保存" : "添加"}
            </button>
            {isEdit && (
              <button
                onClick={() => onDeleteTask(editingTask.id)}
                style={{
                  padding: "6px 12px",
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
            )}
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
      <h3 style={{ marginTop: 0, color: "#2a6dd3", fontSize: "32px", textAlign: "center", lineHeight: 1.0, fontWeight: 400 }}>
        Edit<br />Zone
      </h3>

      {!selectedTaskUnit && !editingCourse && !editingTask && (
        <div style={{ color: "#666", fontSize: "12px", textAlign: "center", marginTop: "20px" }}>
          点击左侧的项目进行编辑
        </div>
      )}

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
  const days = ["周一", "周二", "周三", "周四", "周五"];

  const addSlot = () => {
    onChange([...schedule, { day_of_week: 0, start_time: "09:00", end_time: "10:00" }]);
  };

  const removeSlot = (index: number) => {
    onChange(schedule.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: number | string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {schedule.map((slot, idx) => (
        <div key={idx} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <select
            value={slot.day_of_week}
            onChange={e => updateSlot(idx, "day_of_week", parseInt(e.target.value))}
            style={{ flex: 1, padding: "3px", backgroundColor: "#333", color: "#e5e5e5", border: "1px solid #3a3a3a", borderRadius: "3px", fontSize: "11px" }}
          >
            {days.map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
          <input
            type="time"
            value={slot.start_time}
            onChange={e => updateSlot(idx, "start_time", e.target.value)}
            style={{ width: "70px", padding: "3px", backgroundColor: "#333", color: "#e5e5e5", border: "1px solid #3a3a3a", borderRadius: "3px", fontSize: "11px" }}
          />
          <span style={{ color: "#666", fontSize: "10px" }}>~</span>
          <input
            type="time"
            value={slot.end_time}
            onChange={e => updateSlot(idx, "end_time", e.target.value)}
            style={{ width: "70px", padding: "3px", backgroundColor: "#333", color: "#e5e5e5", border: "1px solid #3a3a3a", borderRadius: "3px", fontSize: "11px" }}
          />
          <button
            onClick={() => removeSlot(idx)}
            style={{ padding: "2px 6px", backgroundColor: "#555", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "10px" }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addSlot}
        style={{ padding: "4px", backgroundColor: "#333", color: "#b0b0b0", border: "1px dashed #555", borderRadius: "3px", cursor: "pointer", fontSize: "11px" }}
      >
        + 添加时间段
      </button>
    </div>
  );
};

export default EditZone;
