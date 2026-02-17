import { theme } from "../styles/theme";
import { SWEET_SPOTS, airlineByCode, ALLIANCE_COLORS, TRANSFER_PARTNERS } from "../data";

export function SweetSpotsTab({ runSearch }) {
  const s = theme;
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 64px", animation: "jv-fadein 0.4s ease" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: s.navy, margin: 0 }}>Award Sweet Spots</h1>
      <p style={{ fontSize: 14, color: s.muted, marginTop: 6, marginBottom: 28 }}>The best-value award redemptions across all major loyalty programs. Click any card to search.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {SWEET_SPOTS.map((sp) => {
          const al = airlineByCode(sp.airline);
          return (
            <div
              key={sp.id}
              onClick={() => runSearch(sp.query)}
              style={{ background: "#fff", borderRadius: 14, padding: 24, cursor: "pointer", border: "1px solid #e8eaef", transition: "all 0.25s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: al?.color || "#888", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{sp.airline}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.navy }}>{sp.route}</div>
                    <div style={{ fontSize: 12, color: s.muted }}>{sp.program}</div>
                  </div>
                </div>
                <span style={{ background: ALLIANCE_COLORS[sp.alliance] + "20", color: ALLIANCE_COLORS[sp.alliance], fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>{sp.alliance}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                <span className="jv-mono" style={{ fontSize: 28, fontWeight: 700, color: s.teal }}>
                  {sp.miles.toLocaleString()}
                </span>
                <span style={{ fontSize: 13, color: s.muted }}>miles · {sp.cabin}</span>
              </div>
              <p style={{ fontSize: 13, color: s.muted, lineHeight: 1.6, margin: "0 0 14px" }}>{sp.desc}</p>
              {sp.transfers.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {sp.transfers.map((tp) => {
                    const tpData = TRANSFER_PARTNERS.find((t) => t.name === tp);
                    return (
                      <span key={tp} style={{ background: tpData?.color + "12", color: tpData?.color, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, border: `1px solid ${tpData?.color}25` }}>
                        {tp}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
