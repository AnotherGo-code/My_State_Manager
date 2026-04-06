import React from "react";
import type { TaskUnit, Task, Course } from "../App";

interface TimetableProps {
  taskUnits: TaskUnit[];
  tasks: Task[];
  setSelectedTaskUnit: (tu: TaskUnit) => void;
  exampleEvents: Array<any>;
  courses: Course[];
}

const Timetable: React.FC<TimetableProps> = ({ taskUnits, tasks, setSelectedTaskUnit, exampleEvents, courses }) => (
  <div style={{ flex: 1, padding: "12px 16px", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "#0f0f0f" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <h3 style={{ margin: 0, color: "#b0b0b0", fontSize: "12px", fontWeight: "400", letterSpacing: "0.5px" }}>
        Time Table
      </h3>
      <div style={{ fontSize: "10px", color: "#666" }}>
        {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
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
        gridTemplateColumns: "40px repeat(7, 1fr)",
        gap: "1px",
        backgroundColor: "#1a1a2e",
        borderRadius: "3px",
        flex: 1,
        overflow: "auto",
        padding: "2px"
      }}>
        {/* 时间列标题 */}
        <div style={{ backgroundColor: "#252a3a", padding: "6px 3px", fontWeight: "500", color: "#666", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          Time
        </div>
        {/* 星期列标题 */}
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
          <div key={day} style={{ backgroundColor: "#252a3a", padding: "6px 3px", fontWeight: "400", color: "#666", textAlign: "center", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {day}
          </div>
        ))}
        {/* 时间行 */}
        {Array.from({ length: 15 }, (_, i) => {
          const hour = 8 + i;
          return (
            <React.Fragment key={hour}>
              <div style={{ backgroundColor: "#252a3a", padding: "6px 3px", fontSize: "9px", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>{hour}:00</div>
              {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                // 查找该时间段内的课程
                const matchingCourses = courses.filter(course => {
                  const schedule = course.schedule || [];
                  return schedule.some(s => 
                    s.day_of_week === dayIndex && 
                    parseInt(s.start_time.split(':')[0]) === hour
                  );
                });

                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    style={{
                      backgroundColor: matchingCourses.length > 0 ? matchingCourses[0].color : "#1f2435",
                      minHeight: "40px",
                      padding: "3px",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "visible",
                      borderBottom: "1px solid #2a3040",
                      opacity: matchingCourses.length > 0 ? 0.3 : 1,
                      transition: "opacity 0.2s"
                    }}
                    onClick={() => {/* TODO: 处理时间格子点击 */}}
                    onMouseEnter={e => {
                      if (matchingCourses.length > 0) {
                        e.currentTarget.style.opacity = "0.5";
                      }
                    }}
                    onMouseLeave={e => {
                      if (matchingCourses.length > 0) {
                        e.currentTarget.style.opacity = "0.3";
                      }
                    }}
                  >
                    {/* 渲染示例事件（如果匹配） */}
                    {exampleEvents.filter(ev => ev.dayIndex === dayIndex && ev.startHour === hour).map(ev => (
                      <div key={ev.id} style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        right: 2,
                        height: "18px",
                        backgroundColor: ev.color,
                        color: 'white',
                        borderRadius: "2px",
                        padding: '1px 3px',
                        fontSize: "7px",
                        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        fontWeight: 600,
                        lineHeight: 1,
                        zIndex: 2
                      }}>
                        {ev.title}
                      </div>
                    ))}
                    {/* 渲染任务单元 - 圆角矩形 */}
                    {taskUnits.filter(tu => {
                      const tuHour = parseInt(tu.start_time.split(':')[0]);
                      return tu.day_of_week === dayIndex && tuHour === hour;
                    }).map((tu, idx) => {
                      const task = tasks.find(t => t.id === tu.task_id);
                      return (
                        <div
                          key={tu.id}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTaskUnit(tu);
                          }}
                          style={{
                            position: 'absolute',
                            top: `${20 + idx * 18}px`,
                            left: "2px",
                            right: "2px",
                            height: "16px",
                            backgroundColor: task?.color || '#2a6dd3',
                            color: 'white',
                            borderRadius: "3px",
                            padding: '1px 3px',
                            fontSize: "7px",
                            boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 500,
                            opacity: tu.status === 'done' ? 0.5 : 1,
                            cursor: 'pointer',
                            textDecoration: tu.status === 'done' ? 'line-through' : 'none',
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
                          {task?.name.charAt(0)}+{tu.planned_amount}
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

export default Timetable;
