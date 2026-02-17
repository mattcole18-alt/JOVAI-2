import { theme } from "../styles/theme";
import { TOOLS_COMING_SOON } from "../data";

export function ToolsTab() {
  const s = theme;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 64px", animation: "jv-fadein 0.4s ease" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: s.navy, margin: 0 }}>Tools</h1>
      <p style={{ fontSize: 14, color: s.muted, marginTop: 6, marginBottom: 28 }}>Powerful utilities coming soon to help you maximize your points & miles.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {TOOLS_COMING_SOON.map((t, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #e8eaef",
              opacity: 0.7,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 12, right: 12, background: "#f3f4f6", color: s.muted, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>COMING SOON</div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: s.navy, marginBottom: 6 }}>{t.title}</div>
            <div style={{ fontSize: 13, color: s.muted, lineHeight: 1.5 }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
