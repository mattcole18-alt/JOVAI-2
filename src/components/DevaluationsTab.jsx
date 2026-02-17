import { theme } from "../styles/theme";
import { DEVALUATIONS, airlineByCode } from "../data";

export function DevaluationsTab() {
  const s = theme;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 64px", animation: "jv-fadein 0.4s ease" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: s.navy, margin: 0 }}>Devaluation Tracker</h1>
      <p style={{ fontSize: 14, color: s.muted, marginTop: 6, marginBottom: 28 }}>Recent changes to loyalty program award charts and pricing. Stay informed so your miles don't lose value.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {DEVALUATIONS.map((d, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "18px 20px",
              border: "1px solid #e8eaef",
              borderLeft: `4px solid ${d.color}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {d.airline &&
                  (() => {
                    const al = airlineByCode(d.airline);
                    return al ? (
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: al.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>
                        {al.code}
                      </div>
                    ) : null;
                  })()}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.navy }}>{d.program}</div>
                  <div style={{ fontSize: 12, color: s.muted }}>{d.date}</div>
                </div>
              </div>
              <span style={{ background: d.color + "18", color: d.color, fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 4, letterSpacing: "0.5px" }}>{d.severity}</span>
            </div>
            <p style={{ fontSize: 13, color: s.text, lineHeight: 1.6, margin: 0 }}>{d.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#f0fdfb", border: `1px solid ${s.teal}30`, borderRadius: 14, padding: 24, marginTop: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: s.navy, marginBottom: 10 }}>🛡️ How to Protect Yourself</div>
        <div style={{ fontSize: 13, color: s.text, lineHeight: 1.7 }}>
          <strong>Earn and burn.</strong> Don't hoard miles — programs devalue constantly. Use your miles within 6-12 months of earning them when possible.
          <br />
          <br />
          <strong>Diversify your portfolio.</strong> Don't keep all your points in one program. Transferable currencies (Chase UR, Amex MR) give you flexibility to move to whichever program offers the best value.
          <br />
          <br />
          <strong>Watch for the 90-day rule.</strong> Many US programs are legally required to give ~90 days notice before major devaluations. Follow points blogs and set alerts for programs you use.
          <br />
          <br />
          <strong>Book sweet spots now.</strong> When you see a great redemption rate, book it. These deals don't last forever.
        </div>
      </div>
    </div>
  );
}
