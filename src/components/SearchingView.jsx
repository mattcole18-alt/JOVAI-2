import { theme } from "../styles/theme";

export function SearchingView({ parsed }) {
  const s = theme;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, animation: "jv-fadein 0.3s ease" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: s.teal, animation: `jv-dot${i} 1.4s infinite ease-in-out both` }} />
        ))}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: s.navy }}>Searching 18 programs...</div>
      {parsed?.summary && <div style={{ fontSize: 13, color: s.muted, marginTop: 8, maxWidth: 480, textAlign: "center" }}>{parsed.summary}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32, width: "100%", maxWidth: 640 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 80, borderRadius: 12, background: "linear-gradient(90deg, #e8eaef 25%, #f3f4f6 50%, #e8eaef 75%)", backgroundSize: "800px", animation: "jv-shimmer 1.5s infinite linear" }} />
        ))}
      </div>
    </div>
  );
}
