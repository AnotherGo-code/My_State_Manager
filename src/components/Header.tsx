import React, { useState } from "react";

interface HeaderProps {
  userEmail: string;
  userName: string;
  onSignOut: () => void;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, userName, onSignOut, showCalendar, setShowCalendar }) => {
  const today = new Date();
  const [calDate, setCalDate] = useState(new Date());

  // Get week info
  const getWeekInfo = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const startDate = new Date(d.setDate(diff));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4);

    const fmt = (dt: Date) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      return `${y}.${m}.${dd}`;
    };

    const jan1 = new Date(date.getFullYear(), 0, 1);
    const daysDiff = Math.floor((date.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
    const weekNum = Math.ceil((daysDiff + jan1.getDay()) / 7);

    return { weekNum: Math.max(1, weekNum), start: fmt(startDate), end: fmt(endDate) };
  };

  const weekInfo = getWeekInfo(today);

  // Date Picker
  const renderDatePicker = () => {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (number | null)[] = Array(startingDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const dayNames = ["日", "一", "二", "三", "四", "五", "六"];
    const todayDate = new Date();

    return (
      <div style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 1000,
        backgroundColor: "#2a2a2a",
        border: "1px solid #3a3a3a",
        borderRadius: "8px",
        padding: "10px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <button onClick={() => setCalDate(new Date(year, month - 1, 15))} style={{ background: "none", border: "none", color: "#b0b0b0", cursor: "pointer", fontSize: "14px" }}>◀</button>
          <span style={{ fontSize: "13px", color: "#fff", fontWeight: "500" }}>{year}年{month + 1}月</span>
          <button onClick={() => setCalDate(new Date(year, month + 1, 15))} style={{ background: "none", border: "none", color: "#b0b0b0", cursor: "pointer", fontSize: "14px" }}>▶</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", marginBottom: "6px" }}>
          {dayNames.map(d => <div key={d} style={{ textAlign: "center", fontSize: "10px", color: "#888", padding: "3px" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px" }}>
          {days.map((day, idx) => {
            const isSelected = day === calDate.getDate() && month === calDate.getMonth();
            const isToday = day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();
            return (
              <button key={idx} onClick={() => day !== null && setCalDate(new Date(year, month, day))} style={{
                width: "32px", height: "32px", border: "none", borderRadius: "4px",
                backgroundColor: isSelected ? "#3B82F6" : isToday ? "#333" : day ? "#1a1a1a" : "transparent",
                color: isSelected ? "#fff" : "#b0b0b0",
                cursor: day ? "pointer" : "default", fontSize: "11px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center"
              }}>{day}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
          <button onClick={() => setCalDate(new Date())} style={{ flex: 1, padding: "5px", backgroundColor: "#3B82F6", border: "none", borderRadius: "4px", color: "#fff", fontSize: "10px", cursor: "pointer" }}>今天</button>
          <button onClick={() => setShowCalendar(false)} style={{ flex: 1, padding: "5px", backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a", borderRadius: "4px", color: "#b0b0b0", fontSize: "10px", cursor: "pointer" }}>关闭</button>
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

      {/* Right: Calendar + date display */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        gap: "8px",
        position: "relative"
      }}>
        <div style={{ fontSize: "11px", color: "#666" }}>
          {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
        </div>
        
        {/* Calendar container - aligned with Edit Zone */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            style={{
              padding: "6px 16px",
              backgroundColor: showCalendar ? "#2563EB" : "#3B82F6",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              color: "#fff"
            }}
          >
            📅 日历
          </button>
          
          {showCalendar && renderDatePicker()}
        </div>
      </div>
    </header>
  );
};

export default Header;
