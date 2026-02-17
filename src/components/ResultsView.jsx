import { useEffect } from "react";
import { theme } from "../styles/theme";
import { SearchBar } from "./SearchBar";
import { FlightCard } from "./FlightCard";
import { useCountUp } from "../hooks/useCountUp";
import { ALLIANCE_COLORS, TRANSFER_PARTNERS } from "../data";

export function ResultsView({
  query,
  setQuery,
  runSearch,
  searchHistory = [],
  removeFromHistory,
  parsed,
  stats,
  sortBy,
  setSortBy,
  filterAlliance,
  setFilterAlliance,
  filterTransfer,
  setFilterTransfer,
  filterNonstop,
  setFilterNonstop,
  filteredFlights,
  expandedId,
  setExpandedId,
  dataSource,
}) {
  const s = theme;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const bestMilesAnimated = useCountUp(stats?.bestMiles ?? 0, 700);
  const bestCashAnimated = useCountUp(stats?.bestCash ?? 0, 700);
  const bestCpmAnimated = useCountUp(stats?.bestCpm ?? 0, 700, 1);
  const avgCpmAnimated = useCountUp(stats?.avgCpm ?? 0, 700, 1);
  const nonstopsAnimated = useCountUp(stats?.nonstops ?? 0, 700);

  return (
    <div className="jv-results-wrap" style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 24px 64px", animation: "jv-fadein 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <SearchBar query={query} setQuery={setQuery} runSearch={runSearch} history={searchHistory} removeFromHistory={removeFromHistory} />
      </div>

      {parsed && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 16, border: "1px solid #e8eaef", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ background: "#f0fdfb", color: s.teal, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6 }}>🤖 AI Understood</span>
          {dataSource === "amadeus" && <span style={{ background: "#eef6ff", color: "#1a6eff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, border: "1px solid #1a6eff20", letterSpacing: "0.3px" }}>✈ LIVE DATA</span>}
          <span style={{ fontSize: 14, color: s.navy, fontWeight: 600 }}>{parsed.summary}</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" }}>
            {parsed.origins?.slice(0, 3).map((o) => (
              <span key={o} className="jv-mono" style={{ fontSize: 11, color: s.muted, background: "#f3f4f6", padding: "3px 8px", borderRadius: 4 }}>{o}</span>
            ))}
            <span style={{ fontSize: 11, color: s.muted }}>→</span>
            {parsed.destinations?.slice(0, 3).map((d) => (
              <span key={d} className="jv-mono" style={{ fontSize: 11, color: s.muted, background: "#f3f4f6", padding: "3px 8px", borderRadius: 4 }}>{d}</span>
            ))}
            <span style={{ background: "#f3f4f6", fontSize: 11, padding: "3px 8px", borderRadius: 4, color: s.muted }}>{parsed.cabin}</span>
          </div>
        </div>
      )}

      {stats && (
        <div className="jv-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eaef", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: s.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Best Miles</div>
            <div className="jv-mono" style={{ fontSize: 22, fontWeight: 700, color: s.teal, marginTop: 4 }}>{bestMilesAnimated.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: s.muted }}>miles</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eaef", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: s.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Best Cash</div>
            <div className="jv-mono" style={{ fontSize: 22, fontWeight: 700, color: s.blue, marginTop: 4 }}>${bestCashAnimated.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: s.muted }}>fare</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eaef", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: s.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Best ¢/mi</div>
            <div className="jv-mono" style={{ fontSize: 22, fontWeight: 700, color: "#3b9e3b", marginTop: 4 }}>{bestCpmAnimated}¢</div>
            <div style={{ fontSize: 10, color: s.muted }}>per mile</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eaef", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: s.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Avg Value</div>
            <div className="jv-mono" style={{ fontSize: 22, fontWeight: 700, color: s.gold, marginTop: 4 }}>{avgCpmAnimated}¢</div>
            <div style={{ fontSize: 10, color: s.muted }}>per mile</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", border: "1px solid #e8eaef", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: s.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Nonstop</div>
            <div className="jv-mono" style={{ fontSize: 22, fontWeight: 700, color: s.navy, marginTop: 4 }}>{nonstopsAnimated}</div>
            <div style={{ fontSize: 10, color: s.muted }}>flights</div>
          </div>
        </div>
      )}

      <div className="jv-filter-bar" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div className="jv-filter-bar-inner" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: s.muted, marginRight: 4, flexShrink: 0 }}>Sort:</span>
          {[
            ["value", "Best Value"],
            ["miles", "Miles ↑"],
            ["cash", "Cash ↑"],
            ["fastest", "Fastest"],
            ["nonstop", "Nonstop"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setSortBy(id)}
              style={{
                background: sortBy === id ? s.navy : "#fff",
                color: sortBy === id ? "#fff" : s.muted,
                border: `1px solid ${sortBy === id ? s.navy : "#e2e5ea"}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
                flexShrink: 0,
              }}
            >
              {label}
            </button>
          ))}

          <div style={{ width: 1, height: 24, background: "#e2e5ea", margin: "0 4px", flexShrink: 0 }} />

          <span style={{ fontSize: 12, fontWeight: 600, color: s.muted, marginRight: 4, flexShrink: 0 }}>Alliance:</span>
          {["All", "Star Alliance", "oneworld", "SkyTeam"].map((a) => (
            <button
              key={a}
              onClick={() => setFilterAlliance(a)}
              style={{
                background: filterAlliance === a ? (ALLIANCE_COLORS[a] || s.navy) : "#fff",
                color: filterAlliance === a ? "#fff" : s.muted,
                border: `1px solid ${filterAlliance === a ? (ALLIANCE_COLORS[a] || s.navy) : "#e2e5ea"}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
                flexShrink: 0,
              }}
            >
              {a}
            </button>
          ))}

          <div style={{ width: 1, height: 24, background: "#e2e5ea", margin: "0 4px", flexShrink: 0 }} />

          <span style={{ fontSize: 12, fontWeight: 600, color: s.muted, marginRight: 4, flexShrink: 0 }}>Transfer:</span>
          {TRANSFER_PARTNERS.map((tp) => (
            <button
              key={tp.name}
              onClick={() => setFilterTransfer(filterTransfer === tp.name ? null : tp.name)}
              style={{
                background: filterTransfer === tp.name ? tp.color : "#fff",
                color: filterTransfer === tp.name ? "#fff" : s.muted,
                border: `1px solid ${filterTransfer === tp.name ? tp.color : "#e2e5ea"}`,
                borderRadius: 20,
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
                flexShrink: 0,
              }}
            >
              {tp.short}
            </button>
          ))}

          <div style={{ width: 1, height: 24, background: "#e2e5ea", margin: "0 4px", flexShrink: 0 }} />

          <button
            onClick={() => setFilterNonstop(!filterNonstop)}
            style={{
              background: filterNonstop ? s.teal : "#fff",
              color: filterNonstop ? "#fff" : s.muted,
              border: `1px solid ${filterNonstop ? s.teal : "#e2e5ea"}`,
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
              flexShrink: 0,
            }}
          >
            Nonstop only
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredFlights.length > 0 ? (
          filteredFlights.map((fl, i) => (
            <FlightCard key={fl.id} fl={fl} rank={i} expandedId={expandedId} setExpandedId={setExpandedId} parsed={parsed} />
          ))
        ) : (
          <div style={{ textAlign: "center", padding: 40, color: s.muted }}>No flights match your filters. Try adjusting your criteria.</div>
        )}
      </div>

      {filteredFlights.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginTop: 24, border: "1px solid #e8eaef" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: s.navy, marginBottom: 10 }}>Value Guide — Cents per Mile</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { min: "2.0¢+", label: "Excellent", color: "#00b4a0" },
              { min: "1.5–2.0¢", label: "Good", color: "#3b9e3b" },
              { min: "1.0–1.5¢", label: "Fair", color: "#f5a623" },
              { min: "<1.0¢", label: "Pay Cash", color: "#e5384f" },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} />
                <span className="jv-mono" style={{ fontSize: 12, color: s.text, fontWeight: 600 }}>
                  {r.min}
                </span>
                <span style={{ fontSize: 12, color: s.muted }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
