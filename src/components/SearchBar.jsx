import { useState, useRef, useEffect } from "react";
import { theme } from "../styles/theme";

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.6 }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export function SearchBar({ query, setQuery, runSearch, big, history = [], removeFromHistory = () => {} }) {
  const s = theme;
  const [inputValue, setInputValue] = useState(query);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleSubmit = () => {
    const trimmed = (inputValue || "").trim();
    if (trimmed) {
      setQuery(trimmed);
      runSearch(trimmed);
    }
  };

  const handleHistorySelect = (item) => {
    setInputValue(item);
    setQuery(item);
    runSearch(item);
    setDropdownOpen(false);
  };

  return (
    <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: big ? 720 : 640 }}>
      <div ref={containerRef} style={{ flex: 1, position: "relative" }}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          onFocus={(e) => {
            e.target.style.borderColor = s.teal;
            setDropdownOpen(true);
          }}
          onBlur={(e) => (e.target.style.borderColor = "#e2e5ea")}
          placeholder='e.g. "Cheapest business class out of NYC on Star Alliance miles..."'
          style={{
            width: "100%",
            padding: big ? "16px 20px 16px 44px" : "12px 16px 12px 40px",
            fontSize: big ? 16 : 14,
            fontFamily: "'Manrope',sans-serif",
            fontWeight: 500,
            border: "2px solid #e2e5ea",
            borderRadius: 12,
            outline: "none",
            background: "#fff",
            color: s.text,
            transition: "border-color 0.2s",
          }}
        />
        <svg style={{ position: "absolute", left: big ? 16 : 14, top: "50%", transform: "translateY(-50%)", opacity: 0.4, pointerEvents: "none" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        {dropdownOpen && history.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 6,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e8eaef",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {history.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  cursor: "pointer",
                  borderBottom: index < history.length - 1 ? "1px solid #f0f1f3" : "none",
                  fontFamily: "'Manrope',sans-serif",
                  fontSize: 13,
                  color: s.text,
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleHistorySelect(item)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f7f9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <ClockIcon />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item}</span>
                <button
                  type="button"
                  aria-label="Remove from history"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    color: s.muted,
                    cursor: "pointer",
                    borderRadius: 6,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f1f3";
                    e.currentTarget.style.color = s.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = s.muted;
                  }}
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleSubmit}
        style={{
          background: s.teal,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: big ? "0 28px" : "0 20px",
          fontSize: big ? 15 : 14,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Manrope',sans-serif",
          whiteSpace: "nowrap",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-1px)";
          e.target.style.boxShadow = "0 4px 12px rgba(0,180,160,0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "none";
          e.target.style.boxShadow = "none";
        }}
      >
        Search Flights
      </button>
    </div>
  );
}
