import React from "react";
import type { Task, TaskUnit } from "../App";

interface TaskProgressProps {
  tasks: Task[];
  taskUnits: TaskUnit[];
  setEditingTask: (task: Task | null) => void;
}

const TaskProgress: React.FC<TaskProgressProps> = ({ tasks, taskUnits, setEditingTask }) => (
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
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#32b14a"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#28a745"}
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
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#222";
              e.currentTarget.style.borderColor = "#3a3a3a";
            }}
            onMouseLeave={e => {
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
);

export default TaskProgress;
