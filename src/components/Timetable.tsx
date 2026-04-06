import React from "react";
import type { TaskUnit, Task, Course } from "../App";

interface TimetableProps {
  taskUnits: TaskUnit[];
  tasks: Task[];
  courses: Course[];
  setSelectedTaskUnit: (tu: TaskUnit | null) => void;
}

const HOURS_START = 8;
const HOURS_END = 22;
const DAYS = 5; // Mon-Fri
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const Timetable: React.FC<TimetableProps> = ({ taskUnits, tasks, courses, setSelectedTaskUnit }) => {
  const totalHours = HOURS_END - HOURS_START;

  // Group task units by day and hour for quick lookup
  const taskUnitsBySlot = React.useMemo(() => {
    const map = new Map<string, TaskUnit[]>();
    taskUnits.forEach(tu => {
      const hour = parseInt(tu.start_time.split(":")[0]);
      if (hour >= HOURS_START && hour < HOURS_END) {
        const key = `${tu.day_of_week}-${hour}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(tu);
      }
    });
    return map;
  }, [taskUnits]);

  // Group courses by day and hour for background coloring
  const coursesBySlot = React.useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach(course => {
      const schedule = course.schedule || [];
      schedule.forEach(slot => {
        const startHour = parseInt(slot.start_time.split(":")[0]);
        for (let h = startHour; h < HOURS_END && h < parseInt(slot.end_time.split(":")[0]); h++) {
          if (slot.day_of_week >= 0 && slot.day_of_week < DAYS) {
            const key = `${slot.day_of_week}-${h}`;
            if (!map.has(key)) map.set(key, course);
          }
        }
      });
    });
    return map;
  }, [courses]);

  const today = new Date().toLocaleDateString("zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ flex: 1, padding: "12px 16px", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#0f0f0f" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, color: "#b0b0b0", fontSize: "12px", fontWeight: "400", letterSpacing: "0.5px" }}>
          Time Table
        </h3>
        <div style={{ fontSize: "10px", color: "#666" }}>{today}</div>
      </div>

      {/* Timetable grid */}
      <div style={{
        padding: "2px",
        border: "1px solid #2a2a2a",
        borderRadius: "4px",
        backgroundColor: "transparent",
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `40px repeat(${DAYS}, 1fr)`,
          gap: "1px",
          backgroundColor: "#1a1a2e",
          borderRadius: "3px",
          flex: 1,
          overflow: "auto",
          padding: "2px"
        }}>
          {/* Time column header */}
          <div style={{
            backgroundColor: "#252a3a",
            padding: "6px 3px",
            fontWeight: "500",
            color: "#666",
            fontSize: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            Time
          </div>

          {/* Day headers */}
          {DAY_NAMES.map(day => (
            <div key={day} style={{
              backgroundColor: "#252a3a",
              padding: "6px 3px",
              fontWeight: "400",
              color: "#666",
              textAlign: "center",
              fontSize: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {day}
            </div>
          ))}

          {/* Time rows */}
          {Array.from({ length: totalHours }, (_, i) => {
            const hour = HOURS_START + i;
            return (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div style={{
                  backgroundColor: "#252a3a",
                  padding: "6px 3px",
                  fontSize: "9px",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {String(hour).padStart(2, "0")}:00
                </div>

                {/* Day cells */}
                {Array.from({ length: DAYS }, (_, dayIndex) => {
                  const slotKey = `${dayIndex}-${hour}`;
                  const bgCourse = coursesBySlot.get(slotKey);
                  const slotTaskUnits = taskUnitsBySlot.get(slotKey) || [];

                  return (
                    <div
                      key={slotKey}
                      style={{
                        backgroundColor: bgCourse ? bgCourse.color : "#1f2435",
                        minHeight: "40px",
                        padding: "3px",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "visible",
                        borderBottom: "1px solid #2a3040",
                        opacity: bgCourse ? 0.3 : 1,
                        transition: "opacity 0.2s"
                      }}
                      onMouseEnter={e => {
                        if (bgCourse) e.currentTarget.style.opacity = "0.5";
                      }}
                      onMouseLeave={e => {
                        if (bgCourse) e.currentTarget.style.opacity = "0.3";
                      }}
                    >
                      {/* Task unit labels */}
                      {slotTaskUnits.map((tu, idx) => {
                        const task = tasks.find(t => t.id === tu.task_id);
                        const taskInitial = task?.name?.charAt(0) || "?";

                        return (
                          <div
                            key={tu.id}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTaskUnit(tu);
                            }}
                            style={{
                              position: "absolute",
                              top: `${20 + idx * 18}px`,
                              left: "2px",
                              right: "2px",
                              height: "16px",
                              backgroundColor: task?.color || "#2a6dd3",
                              color: "white",
                              borderRadius: "3px",
                              padding: "1px 3px",
                              fontSize: "7px",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 500,
                              opacity: tu.status === "done" ? 0.5 : 1,
                              cursor: "pointer",
                              textDecoration: tu.status === "done" ? "line-through" : "none",
                              zIndex: 3,
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = "scale(1.05)";
                              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.6)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.5)";
                            }}
                          >
                            {taskInitial}+{tu.planned_amount}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
