import { useState } from "react";
import { NavLink } from "react-router-dom";
import { theme } from "../styles/theme";

const NAV_ITEMS = [
  ["/search", "Search"],
  ["/sweet-spots", "Sweet Spots"],
  ["/devaluations", "Devaluations"],
  ["/tools", "Tools"],
];

export function Nav() {
  const s = theme;
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinkStyle = ({ isActive }) => ({
    background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Manrope',sans-serif",
    transition: "all 0.2s",
    textDecoration: "none",
  });

  return (
    <nav
      className={menuOpen ? "jv-nav-open" : ""}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: s.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
        fontFamily: "'Manrope',sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <NavLink to="/search" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", color: "inherit" }}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="14" fill={s.teal} />
            <text x="14" y="18" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="'Manrope'">
              J
            </text>
          </svg>
          <span style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>Jovair</span>
          <span style={{ background: "rgba(0,180,160,0.2)", color: s.teal, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, marginLeft: 2 }}>AI</span>
        </NavLink>
      </div>
      <div className="jv-nav-links" style={{ display: "flex", gap: 4 }}>
        {NAV_ITEMS.map(([path, label]) => (
          <NavLink key={path} to={path} style={navLinkStyle} onClick={() => setMenuOpen(false)}>
            {label}
          </NavLink>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          className="jv-nav-hamburger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            display: "none",
            width: 40,
            height: 40,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
        <button
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "7px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          Sign In
        </button>
      </div>
    </nav>
  );
}
