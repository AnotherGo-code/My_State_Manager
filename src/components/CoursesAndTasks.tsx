import React from "react";
import type { Course, Task } from "../App";

interface CoursesAndTasksProps {
  courses: Course[];
  tasks: Task[];
  setEditingCourse: (course: Course) => void;
  setEditingTask: (task: Task) => void;
}

const CoursesAndTasks: React.FC<CoursesAndTasksProps> = ({
  courses,
  tasks,
  setEditingCourse,
  setEditingTask
}) => (
  <div style={{
    height: "auto",
    maxHeight: "280px",
    padding: "12px 16px",
    borderBottom: "1px solid #2a2a2a",
    backgroundColor: "#0f0f0f",
    display: "flex",
    gap: "0",
    overflow: "auto",
    flexShrink: 0
  }}>
    {/* Left: Courses panel (33.33%) */}
    <div style={{ flex: "0 0 33.33%", display: "flex", flexDirection: "column", paddingRight: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, color: "#b0b0b0", fontSize: "12px", fontWeight: "400", letterSpacing: "0.5px" }}>
          Courses:
        </h3>
        <button
          onClick={() => setEditingCourse(createEmptyCourse())}
          style={{
            padding: "3px 8px",
            backgroundColor: "#2a6dd3",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "10px"
          }}
        >
          +
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "auto", flex: 1 }}>
        {courses.length === 0 ? (
          <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>No courses</div>
        ) : (
          courses.map(course => (
            <div
              key={course.id}
              onClick={() => setEditingCourse(course)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 0",
                cursor: "pointer",
                minHeight: "24px"
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: course.color || "#666",
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: "11px", color: "#b0b0b0", fontWeight: "400" }}>{course.name}</span>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Right: Tasks panel (66.66%) */}
    <div style={{ flex: "0 0 66.66%", display: "flex", flexDirection: "column", paddingLeft: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, color: "#b0b0b0", fontSize: "12px", fontWeight: "400", letterSpacing: "0.5px" }}>
          Tasks:
        </h3>
        <button
          onClick={() => setEditingTask(createEmptyTask())}
          style={{
            padding: "3px 8px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "10px"
          }}
        >
          +
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "auto", flex: 1 }}>
        {tasks.length === 0 ? (
          <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>No tasks</div>
        ) : (
          tasks.map(task => {
            const completionPercent = task.total > 0 ? Math.min((task.progress / task.total) * 100, 100) : 0;

            return (
              <div
                key={task.id}
                onClick={() => setEditingTask(task)}
                style={{
                  padding: "4px 0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  width: "100%"
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                {/* Color dot */}
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: task.color || "#666",
                    flexShrink: 0,
                    marginRight: "2px"
                  }}
                />

                {/* Task name */}
                <span style={{
                  fontSize: "11px",
                  color: "#b0b0b0",
                  fontWeight: "400",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: "0 1 auto"
                }}>
                  {task.name}
                </span>

                {/* Percentage */}
                <span style={{
                  fontSize: "9px",
                  color: "#666",
                  whiteSpace: "nowrap",
                  marginLeft: "1px",
                  minWidth: "24px",
                  textAlign: "right"
                }}>
                  {Math.round(completionPercent)}%
                </span>

                {/* Progress bar */}
                <div style={{
                  display: "flex",
                  gap: "0",
                  height: "5px",
                  alignItems: "center",
                  width: "40px",
                  flexShrink: 0,
                  margin: "0 1px"
                }}>
                  {/* Completed part (thick) */}
                  <div style={{
                    flex: `0 0 ${completionPercent}%`,
                    height: "3px",
                    backgroundColor: task.color || "#666",
                    borderRadius: "1.5px"
                  }} />
                  {/* Remaining part (thin) */}
                  {completionPercent < 100 && (
                    <div style={{
                      flex: `0 0 ${100 - completionPercent}%`,
                      height: "1px",
                      backgroundColor: "#444",
                      borderRadius: "0.5px"
                    }} />
                  )}
                </div>

                {/* Progress numbers */}
                <span style={{
                  fontSize: "8px",
                  color: "#555",
                  whiteSpace: "nowrap",
                  marginLeft: "1px",
                  minWidth: "35px",
                  textAlign: "right"
                }}>
                  {task.progress}/{task.total}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

// =============================================
// Helpers: Create empty items (type-safe)
// =============================================

function createEmptyCourse(): Course {
  return {
    id: "",
    user_id: "",
    name: "",
    color: "#3B82F6",
    schedule: [],
    is_optional: false,
    note: "",
    created_at: ""
  };
}

function createEmptyTask(): Task {
  return {
    id: "",
    user_id: "",
    name: "",
    progress: 0,
    total: 100,
    color: "#10B981",
    created_at: ""
  };
}

export default CoursesAndTasks;
