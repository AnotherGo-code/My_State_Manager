import React from "react";
import type { Task, TaskUnit, Course } from "../App";

interface EditZoneProps {
  selectedTaskUnit: TaskUnit | null;
  setSelectedTaskUnit: (tu: TaskUnit | null) => void;
  editingCourse: Course | null;
  setEditingCourse: (c: Course | null) => void;
  editingTask: Task | null;
  setEditingTask: (t: Task | null) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  taskUnits: TaskUnit[];
  setTaskUnits: (units: TaskUnit[]) => void;
}

const EditZone: React.FC<EditZoneProps> = ({
  selectedTaskUnit,
  setSelectedTaskUnit,
  editingCourse,
  setEditingCourse,
  editingTask,
  setEditingTask,
  tasks,
  setTasks,
  taskUnits,
  setTaskUnits
}) => (
  <div style={{
    width: "18%",
    backgroundColor: "#1a1a1a",
    borderLeft: "1px solid #2a2a2a",
    padding: "16px",
    overflowY: "auto",
    display: 'flex',
    flexDirection: 'column',
    height: "100%",
    minWidth: "200px"
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
              onChange={e => setSelectedTaskUnit({ ...selectedTaskUnit, completed_amount: parseInt(e.target.value) || 0 })}
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
            onMouseEnter={e => {
              if (selectedTaskUnit.status !== 'done') {
                e.currentTarget.style.backgroundColor = "#32b14a";
              }
            }}
            onMouseLeave={e => {
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
              onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "400", color: "#b0b0b0", fontSize: "11px" }}>颜色</label>
            <input
              type="color"
              value={editingCourse.color || "#3B82F6"}
              onChange={e => setEditingCourse({ ...editingCourse, color: e.target.value })}
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
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#32b14a"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#28a745"}
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
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#666"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#555"}
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
              onChange={e => setEditingTask({ ...editingTask, name: e.target.value })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "400", color: "#b0b0b0", fontSize: "11px" }}>总进度</label>
            <input
              type="number"
              value={editingTask.total || 100}
              onChange={e => setEditingTask({ ...editingTask, total: parseInt(e.target.value) || 100 })}
              style={{ width: "100%", padding: "6px", border: "1px solid #3a3a3a", borderRadius: "4px", backgroundColor: "#333", color: "#e5e5e5", fontSize: "12px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "400", color: "#b0b0b0", fontSize: "11px" }}>颜色</label>
            <input
              type="color"
              value={editingTask.color || "#10B981"}
              onChange={e => setEditingTask({ ...editingTask, color: e.target.value })}
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
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#32b14a"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#28a745"}
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
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#666"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#555"}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default EditZone;
