import React, { useState } from "react";

interface HeaderProps {
  userEmail: string;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ userEmail, showCalendar, setShowCalendar }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 30)); // March 30, 2026
  
  // 获取当前周信息
  const getWeekInfo = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const startDate = new Date(d.setDate(diff));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4); // Mon-Fri
    
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}.${m}.${d}`;
    };
    
    const weekNum = Math.ceil((selectedDate.getDate() - selectedDate.getDay() + 1) / 7);
    return { weekNum, start: formatDate(startDate), end: formatDate(endDate) };
  };

  const weekInfo = getWeekInfo(selectedDate);
  
  // 渲染日期选择器（打开状态的日历）
  const renderDatePicker = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = Array(startingDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const monthYear = `${year}年${month + 1}月`;
    
    return (
      <div style={{
        backgroundColor: "#2a2a2a",
        border: "1px solid #3a3a3a",
        borderRadius: "8px",
        padding: "12px",
        width: "280px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
      }}>
        {/* 月份导航 */}
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
        
        {/* 星期行 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
          {dayNames.map(day => (
            <div key={day} style={{ textAlign: "center", fontSize: "11px", color: "#888", fontWeight: "500", padding: "4px" }}>
              {day}
            </div>
          ))}
        </div>
        
        {/* 日期网格 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
          {days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => day !== null && setSelectedDate(new Date(year, month, day))}
              style={{
                width: "36px",
                height: "36px",
                border: day === null ? "none" : "1px solid #3a3a3a",
                borderRadius: "4px",
                backgroundColor: day === selectedDate.getDate() && month === selectedDate.getMonth() ? "#3B82F6" : day ? "#1a1a1a" : "transparent",
                color: day === null ? "transparent" : day === selectedDate.getDate() && month === selectedDate.getMonth() ? "#fff" : "#b0b0b0",
                cursor: day ? "pointer" : "default",
                fontSize: "12px",
                transition: "all 0.2s",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={e => {
                if (day) {
                  e.currentTarget.style.backgroundColor = day === selectedDate.getDate() && month === selectedDate.getMonth() ? "#3B82F6" : "#333";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (day) {
                  e.currentTarget.style.backgroundColor = day === selectedDate.getDate() && month === selectedDate.getMonth() ? "#3B82F6" : "#1a1a1a";
                  e.currentTarget.style.color = day === selectedDate.getDate() && month === selectedDate.getMonth() ? "#fff" : "#b0b0b0";
                }
              }}
            >
              {day}
            </button>
          ))}
        </div>
        
        {/* 快速按钮 */}
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
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2563EB"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3B82F6"}
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
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#333";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#2a2a2a";
              e.currentTarget.style.color = "#b0b0b0";
            }}
          >
            关闭
          </button>
        </div>
      </div>
    );
  };

  return (
    <header style={{
      height: "160px",
      backgroundColor: "#1a1a1a",
      borderBottom: "2px solid #3a3a3a",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      boxShadow: "none",
      position: "relative",
      flexShrink: 0
    }}>
      {/* 左侧：学校名称、用户头像、用户名 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
        {/* 学校信息行 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            fontSize: "14px",
            color: "#d32f2f",
            fontWeight: "600",
            letterSpacing: "0.5px"
          }}>
            XXX Univ.
          </div>
        </div>
        
        {/* 用户信息行 */}
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
            <span style={{ color: "#fff", fontSize: "20px", fontWeight: "600" }}>
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>Greatest Me</div>
            <div style={{ fontSize: "12px", color: "#888" }}>{userEmail}</div>
          </div>
        </div>
      </div>

      {/* 中间：周数和日期范围 */}
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

      {/* 右侧：日历 */}
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
            backgroundColor: "#3B82F6",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            color: "#fff",
            fontWeight: "500",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2563EB"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3B82F6"}
        >
          📅 Calendar
        </button>
        
        {/* 日期选择器弹层 */}
        {showCalendar && (
          <div style={{
            position: "absolute",
            top: "48px",
            right: "0",
            zIndex: 1000
          }}>
            {renderDatePicker()}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
