// Inject global styles once at module load so re-renders never re-run this
(function injectGlobalStylesOnce() {
  const fontLink = document.createElement("link");
  fontLink.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap";
  fontLink.rel = "stylesheet";
  if (!document.head.querySelector('link[href*="Manrope"]')) document.head.appendChild(fontLink);

  const styleEl = document.createElement("style");
  styleEl.textContent = `
@keyframes jv-fadein { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes jv-pulse { 0%,100% { opacity:.4; } 50% { opacity:1; } }
@keyframes jv-shimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
@keyframes jv-spin { to { transform:rotate(360deg); } }
@keyframes jv-glow { 0%,100% { box-shadow:0 0 8px rgba(0,180,160,.25); } 50% { box-shadow:0 0 20px rgba(0,180,160,.45); } }
@keyframes jv-dot1 { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
@keyframes jv-dot2 { 0%,80%,100% { transform:scale(0); } 50% { transform:scale(1); } }
@keyframes jv-dot3 { 0%,80%,100% { transform:scale(0); } 60% { transform:scale(1); } }
* { box-sizing:border-box; }
body { margin:0; font-family:'Manrope',sans-serif; background:#f6f7f9; }
.jv-mono { font-family:'IBM Plex Mono',monospace; }

@media (max-width: 767px) {
  .jv-results-wrap { padding: 16px 16px 64px !important; }
  .jv-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .jv-filter-bar {
    overflow-x: auto;
    overflow-y: hidden;
    flex-wrap: nowrap !important;
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }
  .jv-filter-bar-inner {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 8px;
    align-items: center;
    min-width: min-content;
  }
  .jv-flight-card-main {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  .jv-flight-card-main .jv-flight-card-route { max-width: none; }
  .jv-flight-card-main .jv-flight-card-prices { justify-content: flex-start; flex-wrap: wrap; }
  .jv-flight-card-main .jv-flight-card-meta { align-items: flex-start; }
  .jv-nav-links {
    display: none;
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    background: #0b1d3a;
    flex-direction: column;
    padding: 12px;
    gap: 4px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
  .jv-nav-open .jv-nav-links { display: flex !important; }
  .jv-nav-open .jv-nav-links a { padding: 12px 16px; border-radius: 8px; }
  .jv-nav-hamburger { display: flex !important; align-items: center; justify-content: center; }
}
@media (min-width: 768px) {
  .jv-nav-hamburger { display: none !important; }
}
`;
  if (!document.head.querySelector("style[data-jv]")) {
    styleEl.setAttribute("data-jv", "1");
    document.head.appendChild(styleEl);
  }
})();
