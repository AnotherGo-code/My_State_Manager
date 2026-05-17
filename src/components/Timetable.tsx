import React from "react";
import type { TaskUnit, Task, Course } from "../App";

interface TimetableProps {
  taskUnits: TaskUnit[];
  tasks: Task[];
  courses: Course[];
  setSelectedTaskUnit: (tu: TaskUnit | null) => void;
  setEditingTaskUnit: (tu: TaskUnit | null) => void;
}

const HOURS_START = 8;
const HOURS_END = 22;
const DAYS = 7; // Mon-Sun
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper: Convert hex color to rgba with given alpha
function hexToRgba(hex: string | undefined | null, alpha: number): string {
  if (!hex) return `rgba(128, 128, 128, ${alpha})`;
  const cleaned = hex.replace("#", "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

// Helper: Determine text contrast
function getContrastColor(hex: string | undefined | null): string {
  if (!hex) return "#ffffff";
  const cleaned = hex.replace("#", "");
  let r: number, g: number, b: number;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  } else {
    return "#ffffff";
  }
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? "#1a1a1a" : "#ffffff";
}

// Helper: Get current day index (0=Mon, 6=Sun) to match day_of_week
function getTodayIndex(): number {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ...
  return jsDay === 0 ? 6 : jsDay - 1;
}

const Timetable: React.FC<TimetableProps> = ({ taskUnits, tasks, courses, setSelectedTaskUnit, setEditingTaskUnit }) => {
  const totalHours = HOURS_END - HOURS_START;
  const todayIndex = getTodayIndex();

  // Group task units by day and hour
  const taskUnitsBySlot = React.useMemo(() => {
    const map = new Map<string, TaskUnit[]>();
    if (!Array.isArray(taskUnits)) return map;

    taskUnits.forEach(tu => {
      if (!tu || !tu.start_time) return;
      const hourPart = tu.start_time.split(":")[0];
      if (!hourPart) return;
      const hour = parseInt(hourPart);
      if (isNaN(hour)) return;

      if (hour >= HOURS_START && hour < HOURS_END) {
        const key = `${tu.day_of_week}-${hour}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(tu);
      }
    });
    return map;
  }, [taskUnits]);

  // Group courses by day and hour (0-6, Mon-Sun)
  const coursesBySlot = React.useMemo(() => {
    const map = new Map<string, { course: Course; startsHere: boolean }>();
    if (!Array.isArray(courses)) return map;

    courses.forEach(course => {
      if (!course) return;
      const schedule = Array.isArray(course.schedule) ? course.schedule : [];
      schedule.forEach(slot => {
        if (!slot || !slot.start_time || !slot.end_time) return;
        
        const startHourPart = slot.start_time.split(":")[0];
        const endHourPart = slot.end_time.split(":")[0];
        if (!startHourPart || !endHourPart) return;

        const startHour = parseInt(startHourPart);
        const endHour = parseInt(endHourPart);
        if (isNaN(startHour) || isNaN(endHour)) return;

        for (let h = startHour; h < HOURS_END && h < endHour; h++) {
          if (slot.day_of_week >= 0 && slot.day_of_week < DAYS) {
            const key = `${slot.day_of_week}-${h}`;
            map.set(key, { course, startsHere: h === startHour });
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
            justifyContent: "center",
            position: "sticky",
            left: 0,
            zIndex: 10
          }}>
            Time
          </div>

          {/* Day headers (highlight today) */}
          {DAY_NAMES.map((day, idx) => (
            <div key={day} style={{
              backgroundColor: idx === todayIndex ? "#2a3a5a" : "#252a3a",
              padding: "6px 3px",
              fontWeight: idx === todayIndex ? "700" : "400",
              color: idx === todayIndex ? "#fff" : "#666",
              textAlign: "center",
              fontSize: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: idx === todayIndex ? "2px solid #3B82F6" : "none",
              position: "sticky",
              top: 0,
              zIndex: 5
            }}>
              {day}{idx === todayIndex ? " 🔵" : ""}
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
                  justifyContent: "center",
                  position: "sticky",
                  left: 0,
                  zIndex: 10
                }}>
                  {String(hour).padStart(2, "0")}:00
                </div>

                {/* Day cells */}
                {Array.from({ length: DAYS }, (_, dayIndex) => {
                  const slotKey = `${dayIndex}-${hour}`;
                  const slotInfo = coursesBySlot.get(slotKey);
                  const bgCourse = slotInfo?.course;
                  const slotTaskUnits = taskUnitsBySlot.get(slotKey) || [];
                  const isToday = dayIndex === todayIndex;

                  // Course background: 0.5 alpha
                  const cellBg = bgCourse ? hexToRgba(bgCourse.color, 0.5) : (isToday ? "#252a40" : "#1f2435");
                  const hoverBg = bgCourse ? hexToRgba(bgCourse.color, 0.7) : undefined;
                  const textColor = bgCourse ? getContrastColor(bgCourse.color) : (isToday ? "#888" : "#666");

                  return (
                    <div
                      key={slotKey}
                      onClick={() => {
                        const startTime = `${String(hour).padStart(2, "0")}:00`;
                        const endTime = `${String(hour + 1).padStart(2, "0")}:00`;
                        setEditingTaskUnit({
                          id: "",
                          task_id: tasks[0]?.id || "",
                          day_of_week: dayIndex,
                          start_time: startTime,
                          end_time: endTime,
                          planned_amount: 1,
                          completed_amount: 0,
                          status: "pending"
                        });
                      }}
                      style={{
                        backgroundColor: cellBg,
                        minHeight: "40px",
                        padding: "3px",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "visible",
                        borderBottom: "1px solid #2a3040",
                        // Today column highlight border
                        borderLeft: isToday ? "2px solid #3B82F6" : "none",
                        borderRight: isToday ? "2px solid #3B82F6" : "none",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={e => {
                        if (hoverBg) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = hoverBg;
                        }
                      }}
                      onMouseLeave={e => {
                        if (hoverBg) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = cellBg;
                        }
                      }}
                    >
                      {/* Course name (shown on first slot of each course block) */}
                      {bgCourse && slotInfo?.startsHere && (
                        <div style={{
                          position: "absolute",
                          top: "2px",
                          left: "2px",
                          right: "2px",
                          fontSize: "8px",
                          fontWeight: 600,
                          color: textColor,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          zIndex: 1,
                          pointerEvents: "none"
                        }}>
                          {bgCourse.name}
                        </div>
                      )}

                      {/* Task unit labels */}
                      {slotTaskUnits.map((tu, idx) => {
                        const task = tasks.find(t => t.id === tu.task_id);
                        const taskName = task?.name || "?";

                        return (
                          <div
                            key={tu.id}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTaskUnit(tu);
                            }}
                            style={{
                              position: "absolute",
                              top: `${18 + idx * 18}px`,
                              left: "2px",
                              right: "2px",
                              height: "16px",
                              backgroundColor: task?.color || "#2a6dd3",
                              color: task ? getContrastColor(task.color) : "#fff",
                              borderRadius: "3px",
                              padding: "1px 4px",
                              fontSize: "8px",
                              fontWeight: 600,
                              boxShadow: "0 1px 3px rgba(0,0,0,0.6)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: tu.status === "done" ? 0.4 : 1,
                              cursor: "pointer",
                              textDecoration: tu.status === "done" ? "line-through" : "none",
                              zIndex: 3,
                              transition: "all 0.15s",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              letterSpacing: "0.2px"
                            }}
                            onMouseEnter={e => {
                              const el = e.currentTarget as HTMLElement;
                              el.style.transform = "scale(1.05)";
                              el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.7)";
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget as HTMLElement;
                              el.style.transform = "scale(1)";
                              el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.6)";
                            }}
                            title={`${taskName} (+${tu.planned_amount})`}
                          >
                            {taskName}
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
