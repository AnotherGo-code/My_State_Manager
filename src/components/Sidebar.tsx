import React from "react";

interface SidebarProps {
  newDiaryEntry: string;
  setNewDiaryEntry: (v: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ newDiaryEntry, setNewDiaryEntry }) => (
  <div style={{
    width: "18%",
    backgroundColor: "#1a1a1a",
    borderRight: "1px solid #2a2a2a",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "100%",
    minWidth: "200px"
  }}>
    {/* Diary 区域 - 与时间表顶部齐平 */}
    <div style={{ flex: 1, padding: "16px", overflow: "hidden", display: "flex", flexDirection: "column", marginTop: 0 }}>
      <h3 style={{ margin: "0 0 12px 0", color: "#b0b0b0", fontSize: "13px", fontWeight: "400", letterSpacing: "1px" }}>
        Diary / Log Area
      </h3>
      <div style={{ marginBottom: "12px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <textarea
          placeholder="添加日志条目..."
          value={newDiaryEntry}
          onChange={e => setNewDiaryEntry(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            border: "1px solid #2a2a2a",
            borderRadius: "4px",
            resize: "none",
            fontSize: "12px",
            backgroundColor: "#0f0f0f",
            color: "#b0b0b0",
            fontFamily: "monospace"
          }}
        />
        <button
          onClick={() => {/* TODO: 添加日志条目 */}}
          style={{
            marginTop: "6px",
            padding: "6px 8px",
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
          添加
        </button>
        <div style={{ fontSize: "10px", color: "#666", marginTop: "6px" }}>
          {new Date().toLocaleDateString('zh-CN')}
        </div>
      </div>
    </div>
  </div>
);

export default Sidebar;
