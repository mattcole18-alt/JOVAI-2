import { useState } from "react";
import { theme } from "../styles/theme";
import { SearchBar } from "./SearchBar";
import { SWEET_SPOTS, EXAMPLE_QUERIES, WHY_JOVAIR_ITEMS, airlineByCode } from "../data";

const WAITLIST_KEY = "jovair-waitlist";

function loadWaitlist() {
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToWaitlist(email) {
  const list = loadWaitlist();
  list.push(email.trim().toLowerCase());
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(list));
}

export function HomeView({ query, setQuery, runSearch, searchHistory = [], removeFromHistory }) {
  const s = theme;
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    setWaitlistError("");
    const email = waitlistEmail.trim();
    if (!email) {
      setWaitlistError("Enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setWaitlistError("Enter a valid email");
      return;
    }
    saveToWaitlist(email);
    setWaitlistEmail("");
    setWaitlistSubmitted(true);
  };

  return (
    <div style={{ animation: "jv-fadein 0.5s ease", paddingBottom: 88 }}>
      <div style={{ textAlign: "center", padding: "64px 24px 40px" }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: s.navy, margin: 0, lineHeight: 1.15, letterSpacing: "-1px" }}>Search flights like you think.</h1>
        <p style={{ fontSize: 17, color: s.muted, marginTop: 12, maxWidth: 540, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
          Type what you want in plain English. Jovair's AI compares miles vs. cash across 18 loyalty programs — so you always know the best deal.
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <SearchBar query={query} setQuery={setQuery} runSearch={runSearch} big history={searchHistory} removeFromHistory={removeFromHistory} />
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 40px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: s.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Try a search</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EXAMPLE_QUERIES.map((eq, i) => (
            <button
              key={i}
              onClick={() => runSearch(eq)}
              style={{
                background: "#fff",
                border: "1px solid #e2e5ea",
                borderRadius: 20,
                padding: "8px 16px",
                fontSize: 13,
                color: s.text,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = s.teal;
                e.target.style.background = "#f0fdfb";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#e2e5ea";
                e.target.style.background = "#fff";
              }}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 48px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: s.navy, marginBottom: 4 }}>Award Sweet Spots</h2>
        <p style={{ fontSize: 14, color: s.muted, marginBottom: 20 }}>Curated routes where miles deliver outsized value</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {SWEET_SPOTS.slice(0, 4).map((sp) => {
            const al = airlineByCode(sp.airline);
            return (
              <div
                key={sp.id}
                onClick={() => runSearch(sp.query)}
                style={{ background: "#fff", borderRadius: 12, padding: 20, cursor: "pointer", border: "1px solid #e8eaef", transition: "all 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: al?.color || "#888", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>{sp.airline}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.navy }}>{sp.route}</div>
                    <div style={{ fontSize: 11, color: s.muted }}>{sp.program} · {sp.cabin}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 20, fontWeight: 700, color: s.teal }}>
                  {sp.miles.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: s.muted }}>miles</span>
                </div>
                <p style={{ fontSize: 12, color: s.muted, marginTop: 8, lineHeight: 1.5 }}>{sp.desc.slice(0, 100)}...</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px 64px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: s.navy, marginBottom: 4 }}>Why Jovair Exists</h2>
        <p style={{ fontSize: 14, color: s.muted, marginBottom: 20 }}>The points & miles industry has real problems. We're fixing them.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {WHY_JOVAIR_ITEMS.map((c, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e8eaef" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.navy, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: s.muted, lineHeight: 1.55 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: s.navy,
          padding: "14px 24px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
          fontFamily: "'Manrope',sans-serif",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, flex: "1 1 200px" }}>
            Join the waitlist — get early access to real award data
          </span>
          {waitlistSubmitted ? (
            <span style={{ color: s.teal, fontSize: 14, fontWeight: 600 }}>You're on the list!</span>
          ) : (
            <form onSubmit={handleWaitlistSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  fontFamily: "'Manrope',sans-serif",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  width: 220,
                  outline: "none",
                }}
                aria-label="Email for waitlist"
                onFocus={(e) => (e.target.style.borderColor = s.teal)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "'Manrope',sans-serif",
                  background: s.teal,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Join
              </button>
              {waitlistError && <span style={{ color: s.gold, fontSize: 12, width: "100%" }}>{waitlistError}</span>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
