import React, { useState } from "react";

interface HeaderProps {
  userEmail: string;
  userName: string;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, userName, showCalendar, setShowCalendar, onSignOut }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get week info for the selected date
  const getWeekInfo = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    // ISO week: Monday = 1, Sunday = 7
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const startDate = new Date(d.setDate(diff));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4); // Mon-Fri

    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${y}.${m}.${dd}`;
    };

    // Calculate week number (simple: days from Jan 1 / 7)
    const jan1 = new Date(date.getFullYear(), 0, 1);
    const daysDiff = Math.floor((date.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
    const weekNum = Math.ceil((daysDiff + jan1.getDay()) / 7);

    return { weekNum: Math.max(1, weekNum), start: formatDate(startDate), end: formatDate(endDate) };
  };

  const weekInfo = getWeekInfo(selectedDate);

  // Render date picker popup
  const renderDatePicker = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0=Sun

    const days: (number | null)[] = Array(startingDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
    const monthYear = `${year}年${month + 1}月`;
    const today = new Date();

    return (
      <div style={{
        backgroundColor: "#2a2a2a",
        border: "1px solid #3a3a3a",
        borderRadius: "8px",
        padding: "12px",
        width: "280px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
      }}>
        {/* Month navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <button
            onClick={() => setSelectedDate(new Date(year, month - 1, 15))}
            style={{ background: "none", border: "none", color: "#b0b0b0", cursor: "pointer", fontSize: "16px" }}
          >
            ◀
          </button>
          <span style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>{monthYear}</span>
          <button
            onClick={() => setSelectedDate(new Date(year, month + 1, 15))}
            style={{ background: "none", border: "none", color: "#b0b0b0", cursor: "pointer", fontSize: "16px" }}
          >
            ▶
          </button>
        </div>

        {/* Day names row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
          {dayNames.map(day => (
            <div key={day} style={{ textAlign: "center", fontSize: "11px", color: "#888", fontWeight: "500", padding: "4px" }}>
              {day}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
          {days.map((day, idx) => {
            const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            return (
              <button
                key={idx}
                onClick={() => day !== null && setSelectedDate(new Date(year, month, day))}
                style={{
                  width: "36px",
                  height: "36px",
                  border: day === null ? "none" : "1px solid #3a3a3a",
                  borderRadius: "4px",
                  backgroundColor: isSelected ? "#3B82F6" : isToday ? "#333" : day ? "#1a1a1a" : "transparent",
                  color: day === null ? "transparent" : isSelected ? "#fff" : "#b0b0b0",
                  cursor: day ? "pointer" : "default",
                  fontSize: "12px",
                  transition: "all 0.2s",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: isToday && !isSelected ? "600" : "400"
                }}
                onMouseEnter={e => {
                  if (day && !isSelected) {
                    e.currentTarget.style.backgroundColor = "#333";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={e => {
                  if (day && !isSelected) {
                    e.currentTarget.style.backgroundColor = isToday ? "#333" : "#1a1a1a";
                    e.currentTarget.style.color = "#b0b0b0";
                  }
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Quick buttons */}
        <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
          <button
            onClick={() => setSelectedDate(new Date())}
            style={{
              flex: 1,
              padding: "6px 8px",
              backgroundColor: "#3B82F6",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            今天
          </button>
          <button
            onClick={() => setShowCalendar(false)}
            style={{
              flex: 1,
              padding: "6px 8px",
              backgroundColor: "#2a2a2a",
              border: "1px solid #3a3a3a",
              borderRadius: "4px",
              color: "#b0b0b0",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            关闭
          </button>
        </div>
      </div>
    );
  };

  // Get user initials
  const initials = userName
    .split(" ")
    .map(w => w.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header style={{
      height: "160px",
      backgroundColor: "#1a1a1a",
      borderBottom: "2px solid #3a3a3a",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "relative",
      flexShrink: 0
    }}>
      {/* Left: School + User info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
        {/* School name */}
        <div style={{ fontSize: "14px", color: "#d32f2f", fontWeight: "600", letterSpacing: "0.5px" }}>
          XXX Univ.
        </div>

        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#3B82F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <span style={{ color: "#fff", fontSize: "18px", fontWeight: "600" }}>{initials}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>{userName}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{userEmail}</div>
          </div>
          <button
            onClick={onSignOut}
            style={{
              marginLeft: "12px",
              padding: "4px 12px",
              backgroundColor: "transparent",
              border: "1px solid #555",
              borderRadius: "4px",
              color: "#b0b0b0",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            登出
          </button>
        </div>
      </div>

      {/* Center: Week info */}
      <div style={{
        textAlign: "center",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "8px"
      }}>
        <div style={{ fontSize: "32px", fontWeight: "600", color: "#c9a961" }}>
          Week {weekInfo.weekNum}
        </div>
        <div style={{ fontSize: "13px", color: "#888", letterSpacing: "0.5px" }}>
          ({weekInfo.start} ~ {weekInfo.end})
        </div>
      </div>

      {/* Right: Calendar button + popup */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "12px",
        position: "relative"
      }}>
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          style={{
            padding: "8px 16px",
            backgroundColor: showCalendar ? "#2563EB" : "#3B82F6",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            color: "#fff",
            fontWeight: "500"
          }}
        >
          📅 Calendar
        </button>

        {showCalendar && (
          <div style={{ position: "absolute", top: "48px", right: "0", zIndex: 1000 }}>
            {renderDatePicker()}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
