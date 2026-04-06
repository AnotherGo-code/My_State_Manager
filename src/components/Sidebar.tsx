import React from "react";
import type { Diary } from "../App";

interface SidebarProps {
  newDiaryEntry: string;
  setNewDiaryEntry: (v: string) => void;
  diaries: Diary[];
  onSaveDiary: (content: string) => void;
  onDeleteDiary: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ newDiaryEntry, setNewDiaryEntry, diaries, onSaveDiary, onDeleteDiary }) => {
  const today = new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });

  return (
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
      {/* Diary input area */}
      <div style={{ flex: 1, padding: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#b0b0b0", fontSize: "13px", fontWeight: "400", letterSpacing: "1px" }}>
          Diary / Log
        </h3>

        {/* Input */}
        <textarea
          placeholder="记录今天的学习心得..."
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

        {/* Submit row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <button
            onClick={() => onSaveDiary(newDiaryEntry)}
            disabled={!newDiaryEntry.trim()}
            style={{
              padding: "6px 12px",
              backgroundColor: newDiaryEntry.trim() ? "#28a745" : "#555",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: newDiaryEntry.trim() ? "pointer" : "not-allowed",
              fontSize: "11px"
            }}
          >
            添加
          </button>
          <span style={{ fontSize: "10px", color: "#666" }}>{today}</span>
        </div>
      </div>

      {/* Diary list */}
      <div style={{ maxHeight: "40%", borderTop: "1px solid #2a2a2a", overflowY: "auto", padding: "12px 16px" }}>
        <h4 style={{ margin: "0 0 8px 0", color: "#888", fontSize: "11px", fontWeight: "400" }}>
          历史记录 ({diaries.length})
        </h4>
        {diaries.length === 0 ? (
          <div style={{ fontSize: "11px", color: "#555", fontStyle: "italic" }}>暂无日记</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {diaries.map(diary => (
              <div
                key={diary.id}
                style={{
                  backgroundColor: "#0f0f0f",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #2a2a2a",
                  position: "relative"
                }}
              >
                <div style={{ fontSize: "9px", color: "#666", marginBottom: "4px" }}>
                  {diary.date || new Date(diary.created_at).toLocaleDateString("zh-CN")}
                </div>
                <div style={{ fontSize: "11px", color: "#b0b0b0", lineHeight: 1.4, wordBreak: "break-word" }}>
                  {diary.content.length > 80 ? diary.content.substring(0, 80) + "..." : diary.content}
                </div>
                <button
                  onClick={() => onDeleteDiary(diary.id)}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    padding: "2px 6px",
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "10px"
                  }}
                  title="删除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
