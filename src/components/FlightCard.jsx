import { theme } from "../styles/theme";
import { cpmRating, aiRecommendation } from "../utils/cpmUtils";
import { airportByCode, ALLIANCE_COLORS, TRANSFER_PARTNERS } from "../data";
import { getBookingUrl } from "../data/airlines";

export function FlightCard({ fl, rank, expandedId, setExpandedId, parsed }) {
  const s = theme;
  const isExpanded = expandedId === fl.id;
  const isBest = rank === 0;
  const rating = cpmRating(fl.cpm);
  const origAp = airportByCode(fl.origin);
  const destAp = airportByCode(fl.destination);

  return (
    <div
      onClick={() => setExpandedId(isExpanded ? null : fl.id)}
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: 0,
        cursor: "pointer",
        border: isBest ? `2px solid ${s.teal}` : "1px solid #e8eaef",
        animation: `jv-fadein 0.5s ease ${rank * 0.12}s both`,
        transition: "all 0.2s",
        ...(isBest ? { animation: `jv-fadein 0.5s ease 0s both, jv-glow 3s ease infinite` } : {}),
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!isBest) e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        if (!isBest) e.currentTarget.style.boxShadow = "none";
      }}
    >
      {isBest && (
        <div style={{ background: s.teal, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", textAlign: "center", letterSpacing: "0.5px" }}>
          🏆 BEST VALUE — Save ${(fl.cash - fl.fees).toLocaleString()} vs. cash by using miles
        </div>
      )}

      <div style={{ padding: "16px 20px" }}>
        <div className="jv-flight-card-main" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: fl.airline.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'IBM Plex Mono',monospace",
                flexShrink: 0,
              }}
            >
              {fl.airline.code}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.navy }}>{fl.airline.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: s.muted }}>{fl.depDate ? `${fl.depDate} · ` : ""}{fl.aircraft}</span>
              </div>
            </div>
          </div>

          <div className="jv-flight-card-route" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 240, justifyContent: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div className="jv-mono" style={{ fontSize: 18, fontWeight: 700, color: s.navy }}>
                {fl.depTime}
              </div>
              <div className="jv-mono" style={{ fontSize: 12, color: s.muted }}>
                {fl.origin}
              </div>
            </div>
            <div style={{ flex: 1, maxWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 11, color: s.muted }}>{fl.duration}</div>
              <div style={{ width: "100%", height: 2, background: "#e2e5ea", position: "relative", borderRadius: 1 }}>
                <div style={{ position: "absolute", left: 0, top: "-3px", width: 8, height: 8, borderRadius: "50%", background: s.teal }} />
                {fl.stops > 0 &&
                  Array.from({ length: fl.stops }).map((_, i) => (
                    <div key={i} style={{ position: "absolute", left: `${((i + 1) * 100) / (fl.stops + 1)}%`, top: "-2px", width: 6, height: 6, borderRadius: "50%", background: "#d1d5db" }} />
                  ))}
                <div style={{ position: "absolute", right: 0, top: "-3px", width: 8, height: 8, borderRadius: "50%", background: s.teal }} />
              </div>
              <div style={{ fontSize: 11, color: fl.nonstop ? s.teal : s.muted, fontWeight: fl.nonstop ? 600 : 400 }}>
                {fl.nonstop ? "Nonstop" : `${fl.stops} stop${fl.stops > 1 ? "s" : ""}`}
              </div>
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="jv-mono" style={{ fontSize: 18, fontWeight: 700, color: s.navy }}>
                {fl.arrTime}
              </div>
              <div className="jv-mono" style={{ fontSize: 12, color: s.muted }}>
                {fl.destination}
              </div>
            </div>
          </div>

          <div className="jv-flight-card-prices" style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            {fl.miles ? (
              <div style={{ background: "#f0fdfb", border: `1px solid ${s.teal}33`, borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 110 }}>
                <div className="jv-mono" style={{ fontSize: 18, fontWeight: 700, color: s.teal }}>
                  {fl.miles.toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: s.muted }}>miles + ${fl.fees} fees</div>
                <div className="jv-mono" style={{ fontSize: 10, color: s.muted, marginTop: 2 }}>
                  {fl.fareClass} class
                </div>
              </div>
            ) : null}
            <div style={{ background: "#eff6ff", border: `1px solid ${s.blue}33`, borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 90 }}>
              <div className="jv-mono" style={{ fontSize: 18, fontWeight: 700, color: s.blue }}>
                ${fl.cash.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: s.muted }}>{fl.source === "amadeus" ? "real price" : "cash fare"}</div>
            </div>
            {fl.cpm ? (
              <div style={{ background: rating.bg, borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 75 }}>
                <div className="jv-mono" style={{ fontSize: 18, fontWeight: 700, color: rating.color }}>
                  {fl.cpm}¢
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: rating.color }}>{rating.label}</div>
              </div>
            ) : null}
          </div>

          <div className="jv-flight-card-meta" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, minWidth: 80 }}>
            <span style={{ background: ALLIANCE_COLORS[fl.airline.alliance] + "20", color: ALLIANCE_COLORS[fl.airline.alliance], fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>{fl.airline.alliance}</span>
            <span style={{ fontSize: 11, color: fl.seats <= 3 ? s.red : s.muted, fontWeight: fl.seats <= 3 ? 600 : 400 }}>
              {fl.seats <= 3 ? "🔥 " : ""}
              {fl.seats} seat{fl.seats > 1 ? "s" : ""}
            </span>
            {fl.hasDevaluation && <span style={{ fontSize: 10, color: s.gold, fontWeight: 600 }}>⚠️ Devalued</span>}
          </div>
        </div>

        {isExpanded && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e8eaef", animation: "jv-fadein 0.3s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Book Via</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: s.navy }}>{fl.airline.program}</div>
                <div style={{ fontSize: 12, color: s.muted }}>
                  {origAp?.city} → {destAp?.city} · {fl.cabin} · {parsed?.dateRange || "Flexible"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Value Math</div>
                <div className="jv-mono" style={{ fontSize: 13, color: s.text, lineHeight: 1.7 }}>
                  Cash ${fl.cash.toLocaleString()} − Fees ${fl.fees} = ${(fl.cash - fl.fees).toLocaleString()}
                  <br />${(fl.cash - fl.fees).toLocaleString()} ÷ {fl.miles.toLocaleString()} mi = <span style={{ color: rating.color, fontWeight: 700 }}>{fl.cpm}¢/mi</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Transfer Partners</div>
                {fl.airline.transfers.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {fl.airline.transfers.map((tp) => {
                      const tpData = TRANSFER_PARTNERS.find((t) => t.name === tp);
                      return (
                        <span key={tp} style={{ background: tpData?.color + "15", color: tpData?.color, border: `1px solid ${tpData?.color}30`, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>
                          {tp}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: s.muted }}>No major transfer partners — earn directly</div>
                )}
              </div>
            </div>

            {fl.hasDevaluation && fl.devaluation && (
              <div style={{ background: "#fef6e6", border: `1px solid ${s.gold}40`, borderRadius: 10, padding: 14, marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.gold }}>
                  ⚠️ Devaluation Alert — {fl.devaluation.program} ({fl.devaluation.date})
                </div>
                <div style={{ fontSize: 12, color: s.text, marginTop: 4 }}>{fl.devaluation.desc}</div>
              </div>
            )}

            <div style={{ background: "#f0fdfb", border: `1px solid ${s.teal}30`, borderRadius: 10, padding: 14, marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.teal, marginBottom: 4 }}>🤖 AI Recommendation</div>
              <div style={{ fontSize: 13, color: s.text, lineHeight: 1.5 }}>{aiRecommendation(fl.cpm)}</div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button onClick={(e) => { e.stopPropagation(); window.open(getBookingUrl(fl.airline.code, fl.origin, fl.destination, fl.depDateObj), "_blank"); }}
                style={{ background: s.teal, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope',sans-serif", transition: "transform 0.15s" }}
                onMouseEnter={e=>e.target.style.transform="translateY(-1px)"} onMouseLeave={e=>e.target.style.transform="none"}>
                {fl.miles ? "Book with Miles →" : "Book Now →"}
              </button>
              <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.${fl.airline.website || fl.airline.name.toLowerCase().replace(/[^a-z]/g,"") + ".com"}`, "_blank"); }}
                style={{ background: s.blue, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope',sans-serif", transition: "transform 0.15s" }}
                onMouseEnter={e=>e.target.style.transform="translateY(-1px)"} onMouseLeave={e=>e.target.style.transform="none"}>
                Visit {fl.airline.name} →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
