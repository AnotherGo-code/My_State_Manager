import React from "react";
import type { Course, Task, TaskUnit } from "../App";

interface CoursesAndTasksProps {
  courses: Course[];
  tasks: Task[];
  taskUnits: TaskUnit[];
  setEditingCourse: (course: Course | null) => void;
  setEditingTask: (task: Task | null) => void;
}

const CoursesAndTasks: React.FC<CoursesAndTasksProps> = ({
  courses,
  tasks,
  taskUnits,
  setEditingCourse,
  setEditingTask
}) => (
  <div style={{
    flex: "0 0 auto",
    height: "210px",
    padding: "12px 16px",
    borderBottom: "1px solid #2a2a2a",
    backgroundColor: "#0f0f0f",
    display: "flex",
    gap: "0",
    overflow: "hidden"
  }}>
    {/* 左侧：课程列表 */}
    <div style={{
      flex: "0 0 50%",
      display: "flex",
      flexDirection: "column",
      borderRight: "none",
      paddingRight: "12px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, color: "#b0b0b0", fontSize: "12px", fontWeight: "400", letterSpacing: "0.5px" }}>
          Courses:
        </h3>
        <button
          onClick={() => setEditingCourse({} as Course)}
          style={{
            padding: "3px 8px",
            backgroundColor: "#2a6dd3",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "10px",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#3275dd"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#2a6dd3"}
        >
          +
        </button>
      </div>
      {/* 课程堆栈 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", overflow: "auto", flex: 1 }}>
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
                padding: "6px 8px",
                borderRadius: "3px",
                cursor: "pointer",
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                transition: "all 0.2s",
                minHeight: "28px"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "#1f1f1f";
                e.currentTarget.style.borderColor = "#3a3a3a";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "#1a1a1a";
                e.currentTarget.style.borderColor = "#2a2a2a";
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: course.color,
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: "11px", color: "#b0b0b0" }}>{course.name}</span>
            </div>
          ))
        )}
      </div>
    </div>

    {/* 右侧：任务卡片 */}
    <div style={{
      flex: "0 0 50%",
      display: "flex",
      flexDirection: "column",
      borderLeft: "none",
      paddingLeft: "12px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, color: "#b0b0b0", fontSize: "12px", fontWeight: "400", letterSpacing: "0.5px" }}>
          Tasks:
        </h3>
        <button
          onClick={() => setEditingTask({} as Task)}
          style={{
            padding: "3px 8px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "10px",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#32b14a"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#28a745"}
        >
          +
        </button>
      </div>
      {/* 任务堆栈 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", overflow: "auto", flex: 1 }}>
        {tasks.length === 0 ? (
          <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>No tasks</div>
        ) : (
          tasks.map(task => {
            const relatedUnits = taskUnits.filter(tu => tu.task_id === task.id);
            const completedUnits = relatedUnits.filter(tu => tu.status === 'done').length;
            const completionPercent = task.total > 0 ? (task.progress / task.total) * 100 : 0;
            const completedPercent = Math.min(completionPercent, 100);
            
            return (
              <div
                key={task.id}
                onClick={() => setEditingTask(task)}
                style={{
                  padding: "6px 8px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  transition: "all 0.2s",
                  minHeight: "50px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "#1f1f1f";
                  e.currentTarget.style.borderColor = "#3a3a3a";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                  e.currentTarget.style.borderColor = "#2a2a2a";
                }}
              >
                {/* 任务名 + 比例 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", color: task.color, fontWeight: "500" }}>{task.name}</span>
                  <span style={{ fontSize: "10px", color: "#666" }}>({task.progress}/{task.total})</span>
                </div>

                {/* 简约线条进度条：粗线代表已完成，细线代表未完成 */}
                <div style={{ display: "flex", gap: "1px", height: "8px", alignItems: "center" }}>
                  {/* 已完成部分 - 粗线 */}
                  <div style={{
                    flex: `0 0 ${completedPercent}%`,
                    height: "3px",
                    backgroundColor: task.color,
                    borderRadius: "1.5px",
                    transition: "flex 0.3s ease"
                  }} />
                  {/* 未完成部分 - 细线 */}
                  <div style={{
                    flex: `0 0 ${100 - completedPercent}%`,
                    height: "1px",
                    backgroundColor: "#444",
                    borderRadius: "0.5px",
                    transition: "flex 0.3s ease"
                  }} />
                </div>

                {/* 百分比 + 任务单元统计 */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#666", marginTop: "3px" }}>
                  <span>{Math.round(completedPercent)}%</span>
                  {relatedUnits.length > 0 && (
                    <span>{completedUnits}/{relatedUnits.length} units</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

export default CoursesAndTasks;
