import { theme } from "../styles/theme";

export function ParsingView() {
  const s = theme;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, animation: "jv-fadein 0.3s ease" }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${s.teal}`, borderTopColor: "transparent", borderRadius: "50%", animation: "jv-spin 0.8s linear infinite", marginBottom: 24 }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: s.navy }}>AI is parsing your search...</div>
      <div style={{ fontSize: 13, color: s.muted, marginTop: 6 }}>Understanding route, dates, cabin, alliance & program preferences</div>
    </div>
  );
}
