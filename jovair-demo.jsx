import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// JOVAIR — AI-Powered Flight Search Engine (Enhanced Demo)
// ═══════════════════════════════════════════════════════════════

const _jvInit = (() => {
  if (typeof document === "undefined") return;
  document.documentElement.style.backgroundColor = "#f6f7f9";
  document.body.style.backgroundColor = "#f6f7f9";
  document.body.style.margin = "0";

  if (!document.head.querySelector('link[href*="Manrope"]')) {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }
  if (!document.head.querySelector("style[data-jv2]")) {
    const s = document.createElement("style");
    s.setAttribute("data-jv2", "1");
    s.textContent = `
@keyframes jv-fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes jv-fadeinleft { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
@keyframes jv-pulse { 0%,100%{opacity:.35} 50%{opacity:1} }
@keyframes jv-shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
@keyframes jv-spin { to{transform:rotate(360deg)} }
@keyframes jv-glow { 0%,100%{box-shadow:0 0 8px rgba(0,180,160,.2)} 50%{box-shadow:0 0 24px rgba(0,180,160,.5)} }
@keyframes jv-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes jv-float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes jv-typing { 0%{width:0} 100%{width:100%} }
@keyframes jv-blink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes jv-countup { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes jv-scanline { 0%{left:0} 100%{left:calc(100% - 60px)} }
@keyframes jv-progress { from{width:0%} to{width:100%} }
@keyframes jv-dot1 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
@keyframes jv-dot2 { 0%,80%,100%{transform:scale(0)} 50%{transform:scale(1)} }
@keyframes jv-dot3 { 0%,80%,100%{transform:scale(0)} 60%{transform:scale(1)} }
@keyframes jv-ribbon { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:translateY(0)} }
@keyframes jv-slidedown { from{max-height:0;opacity:0} to{max-height:800px;opacity:1} }
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html, body { background:#f6f7f9; }
body { font-family:'Manrope',system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
.jv-mono { font-family:'IBM Plex Mono',monospace; }
input:focus { outline:none; }
button { font-family:'Manrope',system-ui,sans-serif; }
::selection { background:rgba(0,180,160,.2); }
`;
    document.head.appendChild(s);
  }
})();

// ═══════════════════════════════════════════════════════════════
// AIRLINES (Original 17 + Expanded)
// ═══════════════════════════════════════════════════════════════

// Route type constants for realistic airline-route matching
const US=1,EU=2,AS=4,ME=8,AF=16,SA=32,OC=64,CA=128; // bitmask regions
const DOM_US=256,DOM_EU=512,DOM_AS=1024; // domestic route flags

const AIRLINES = [
  // ═══ US BIG 3 — fly everywhere from their hubs, exempt from hub-spoke check ═══
  { code:"UA", name:"United Airlines", program:"MileagePlus", alliance:"Star Alliance", color:"#0032A0", transfers:["Chase UR","Bilt"], routes:US|EU|AS|ME|SA|CA|OC|DOM_US, type:"full-service", hubs:["EWR","IAD","IAH","SFO","ORD","DEN","LAX"] },
  { code:"AA", name:"American Airlines", program:"AAdvantage", alliance:"oneworld", color:"#0078D2", transfers:["Citi TYP","Bilt"], routes:US|EU|AS|SA|CA|DOM_US, type:"full-service", hubs:["DFW","CLT","MIA","PHL","ORD","PHX","JFK","LAX"] },
  { code:"DL", name:"Delta Air Lines", program:"SkyMiles", alliance:"SkyTeam", color:"#003A70", transfers:["Amex MR"], routes:US|EU|AS|ME|SA|CA|AF|OC|DOM_US, type:"full-service", hubs:["ATL","MSP","DTW","SLC","SEA","JFK","BOS","LAX"] },

  // ═══ US CARRIERS — domestic + limited international ═══
  // Alaska: NEW 2026 transatlantic from SEA only (LHR, KEF, FCO seasonal)
  { code:"AS", name:"Alaska Airlines", program:"Mileage Plan", alliance:"oneworld", color:"#003580", transfers:["Chase UR","Bilt"], routes:US|EU|CA|AS|DOM_US, type:"full-service", hubs:["SEA","SFO","LAX","PDX","ANC"], usGates:["SEA"], euGates:["LHR","KEF","FCO"] },
  // JetBlue: JFK/BOS to specific EU cities only
  { code:"B6", name:"JetBlue", program:"TrueBlue", alliance:"Independent", color:"#003DA5", transfers:["Amex MR","Chase UR"], routes:US|EU|CA|DOM_US, type:"full-service", hubs:["JFK","BOS"], usGates:["JFK","BOS"], euGates:["LHR","LGW","CDG","DUB","EDI","AMS","BCN","MXP"] },
  // Hawaiian: HNL hub — Japan + Australia only for international
  { code:"HA", name:"Hawaiian Airlines", program:"HawaiianMiles", alliance:"Independent", color:"#00A0DF", transfers:["Amex MR","Chase UR"], routes:US|OC|AS|DOM_US, type:"full-service", hubs:["HNL","OGG","KOA","LIH"], usGates:["HNL"], euGates:[] },

  // ═══ CANADIAN ═══
  { code:"AC", name:"Air Canada", program:"Aeroplan", alliance:"Star Alliance", color:"#d81e05", transfers:["Chase UR","Amex MR","Capital One","Bilt"], routes:US|EU|AS|SA|CA|DOM_US, type:"full-service", hubs:["YYZ","YVR","YUL"] },

  // ═══ EUROPEAN LEGACY — fly from their EU hub to specific US gateways ═══
  // Lufthansa: FRA/MUC → many US cities
  { code:"LH", name:"Lufthansa", program:"Miles & More", alliance:"Star Alliance", color:"#05164d", transfers:["Amex MR"], routes:US|EU|AS|ME|AF|SA|DOM_EU, type:"full-service", hubs:["FRA","MUC"], usGates:["JFK","EWR","IAD","ORD","SFO","LAX","MIA","BOS","CLT","DEN","IAH","MSP","MCO","PHL","PHX","SAN","SEA","LAS"] },
  // BA: LHR → tons of US cities
  { code:"BA", name:"British Airways", program:"Avios", alliance:"oneworld", color:"#075AAA", transfers:["Chase UR","Amex MR","Capital One"], routes:US|EU|AS|ME|AF|SA|CA|DOM_EU, type:"full-service", hubs:["LHR","LGW"], usGates:["JFK","EWR","BOS","PHL","IAD","ORD","MIA","DFW","IAH","SFO","LAX","SEA","ATL","CLT","PHX","DEN","AUS","BNA","TPA","DTW","LAS","SAN","MCO","STL"] },
  // Air France CDG + KLM AMS → US cities
  { code:"AF", name:"Air France/KLM", program:"Flying Blue", alliance:"SkyTeam", color:"#002157", transfers:["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], routes:US|EU|AS|ME|AF|SA|CA|DOM_EU, type:"full-service", hubs:["CDG","AMS"], usGates:["JFK","BOS","ORD","DFW","DEN","DTW","IAH","LAS","LAX","MIA","MSP","MSY","EWR","MCO","PHX","RDU","SAN","SFO","SEA","IAD","ATL","PHL"] },
  // Virgin Atlantic: LHR/MAN → US cities
  { code:"VS", name:"Virgin Atlantic", program:"Flying Club", alliance:"SkyTeam", color:"#E01224", transfers:["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], routes:US|EU|DOM_EU, type:"full-service", hubs:["LHR","MAN"], usGates:["JFK","BOS","ATL","MIA","LAX","SFO","IAD","SEA","MCO","TPA","LAS"] },
  // Swiss: ZRH/GVA → US cities
  { code:"LX", name:"Swiss International", program:"SWISS Miles & More", alliance:"Star Alliance", color:"#DC143C", transfers:["Amex MR","Chase UR"], routes:US|EU|AS|ME|AF|DOM_EU, type:"full-service", hubs:["ZRH","GVA"], usGates:["JFK","BOS","ORD","LAX","MIA","SFO","IAD"] },
  // SAS: CPH → US cities
  { code:"SK", name:"SAS", program:"EuroBonus", alliance:"Star Alliance", color:"#003580", transfers:["Amex MR"], routes:US|EU|AS|DOM_EU, type:"full-service", hubs:["CPH","ARN","OSL"], usGates:["JFK","ATL","BOS","ORD","MIA","LAX","SFO","SEA","IAD"] },
  // Iberia: MAD → US cities ONLY (not London!)
  { code:"IB", name:"Iberia", program:"Avios", alliance:"oneworld", color:"#FFC72C", transfers:["Amex MR","Chase UR","Citi TYP"], routes:US|EU|SA|DOM_EU, type:"full-service", hubs:["MAD"], usGates:["JFK","EWR","BOS","ORD","DFW","LAX","MIA","SFO","IAD","MCO"] },
  // Finnair: HEL → JFK and MIA ONLY
  { code:"AY", name:"Finnair", program:"Finnair Plus", alliance:"oneworld", color:"#003580", transfers:["Amex MR"], routes:US|EU|AS|DOM_EU, type:"full-service", hubs:["HEL"], usGates:["JFK","MIA"] },

  // ═══ TURKISH — huge network from IST ═══
  { code:"TK", name:"Turkish Airlines", program:"Miles&Smiles", alliance:"Star Alliance", color:"#C8102E", transfers:["Citi TYP","Capital One","Bilt"], routes:US|EU|AS|ME|AF|SA|CA|DOM_EU, type:"full-service", hubs:["IST"], usGates:["JFK","EWR","IAD","ORD","LAX","SFO","MIA","ATL","IAH","BOS","DFW","SEA","DEN","DTW"] },

  // ═══ ASIAN CARRIERS — fly from their Asian hub to specific US/EU gateways ═══
  // Singapore: SIN → 5 US cities
  { code:"SQ", name:"Singapore Airlines", program:"KrisFlyer", alliance:"Star Alliance", color:"#F0AB00", transfers:["Chase UR","Amex MR","Citi TYP","Capital One"], routes:US|EU|AS|OC|ME|DOM_AS, type:"full-service", hubs:["SIN"], usGates:["JFK","EWR","LAX","SFO","SEA"], euGates:["LHR","FRA","AMS","FCO","BCN","CDG","MUC","ZRH","MXP"] },
  // ANA: NRT/HND → 8 US cities
  { code:"NH", name:"ANA", program:"Mileage Club", alliance:"Star Alliance", color:"#00467F", transfers:["Amex MR"], routes:US|EU|AS|DOM_AS, type:"full-service", hubs:["NRT","HND"], usGates:["JFK","ORD","LAX","SFO","IAH","SEA","IAD","HNL","BOS","SAN"], euGates:["LHR","FRA","CDG","MUC","BRU","VIE"] },
  // Cathay Pacific: HKG → 7 US cities
  { code:"CX", name:"Cathay Pacific", program:"Asia Miles", alliance:"oneworld", color:"#005D63", transfers:["Amex MR","Citi TYP","Capital One","Bilt"], routes:US|EU|AS|OC|ME|DOM_AS, type:"full-service", hubs:["HKG"], usGates:["JFK","BOS","LAX","SFO","ORD","DFW","SEA"], euGates:["LHR","FRA","AMS","CDG","MXP","MAD","BCN","FCO"] },
  // JAL: NRT/HND → 8 US cities
  { code:"JL", name:"Japan Airlines", program:"Mileage Bank", alliance:"oneworld", color:"#C8102E", transfers:["Chase UR","Citi TYP"], routes:US|EU|AS|OC|DOM_AS, type:"full-service", hubs:["NRT","HND"], usGates:["JFK","ORD","LAX","SFO","SEA","BOS","HNL","SAN"], euGates:["LHR","CDG","FRA","HEL"] },
  // Korean Air: ICN → 11 US cities (NOT London/Europe direct from US!)
  { code:"KE", name:"Korean Air", program:"SKYPASS", alliance:"SkyTeam", color:"#003D82", transfers:["Amex MR"], routes:US|EU|AS|OC|DOM_AS, type:"full-service", hubs:["ICN"], usGates:["JFK","LAX","SFO","ATL","SEA","DFW","ORD","IAD","HNL","LAS","BOS"], euGates:["LHR","CDG","FRA","AMS","FCO","PRG","MAD","ZRH","VIE"] },
  // EVA Air: TPE → 8 US cities
  { code:"BR", name:"EVA Air", program:"Infinity MileageLands", alliance:"Star Alliance", color:"#0066CC", transfers:["Amex MR"], routes:US|EU|AS|OC|DOM_AS, type:"full-service", hubs:["TPE"], usGates:["JFK","LAX","SFO","SEA","ORD","IAH","DFW","IAD"], euGates:["LHR","CDG","AMS","VIE","MUC"] },
  // China Airlines: TPE → 6 US cities (very limited EU)
  { code:"CI", name:"China Airlines", program:"Dynasty Flyer", alliance:"SkyTeam", color:"#0066CC", transfers:[], routes:US|AS|OC|DOM_AS, type:"full-service", hubs:["TPE"], usGates:["JFK","LAX","SFO","SEA","ONT","HNL"] },
  // Air China: VERY limited US service — basically JFK only in 2026
  { code:"CA", name:"Air China", program:"Frequent Flyer", alliance:"Star Alliance", color:"#FF0000", transfers:[], routes:US|EU|AS|DOM_AS, type:"full-service", hubs:["PEK","PVG"], usGates:["JFK"], euGates:["LHR","FRA","CDG","FCO","MAD"] },
  // Air India: DEL → 4 US cities
  { code:"AI", name:"Air India", program:"Flying Returns", alliance:"Star Alliance", color:"#0033CC", transfers:[], routes:US|EU|AS|DOM_AS, type:"full-service", hubs:["DEL","BOM"], usGates:["JFK","EWR","ORD","SFO"], euGates:["LHR","CDG","FRA","BRU","MXP","VIE","BER","AMS"] },
  // Malaysia Airlines: NO US routes — EU/AS/OC only
  { code:"MH", name:"Malaysia Airlines", program:"Enrich", alliance:"oneworld", color:"#003C71", transfers:[], routes:EU|AS|OC|DOM_AS, type:"full-service", hubs:["KUL"], euGates:["LHR"] },

  // ═══ MIDDLE EAST MEGA-CARRIERS ═══
  // Emirates: DXB → 14+ US cities
  { code:"EK", name:"Emirates", program:"Skywards", alliance:"Independent", color:"#D71921", transfers:["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], routes:US|EU|AS|ME|AF|SA|OC, type:"full-service", hubs:["DXB"], usGates:["JFK","EWR","IAD","BOS","ORD","DFW","IAH","SFO","LAX","SEA","MIA","ATL","MCO","PHX","SAN"], euGates:["LHR","LGW","MAN","GLA","EDI","BER","FRA","MUC","DUS","HAM","CDG","LYS","AMS","FCO","MXP","VCE","BCN","MAD","AGP","ATH","IST","CPH","OSL","ARN","ZRH","GVA","VIE","PRG","BUD","WAW","DUB","LIS"] },
  // Qatar: DOH → 11 US cities
  { code:"QR", name:"Qatar Airways", program:"Privilege Club", alliance:"oneworld", color:"#5C0632", transfers:["Citi TYP"], routes:US|EU|AS|ME|AF|SA|OC, type:"full-service", hubs:["DOH"], usGates:["JFK","IAD","ORD","MIA","DFW","IAH","LAX","SFO","ATL","BOS","SEA"], euGates:["LHR","MAN","EDI","BER","FRA","MUC","CDG","AMS","FCO","MXP","VCE","BCN","MAD","ATH","IST","CPH","OSL","ARN","ZRH","GVA","VIE","PRG","BUD","WAW","DUB","HEL"] },

  // ═══ AFRICAN ═══
  // Ethiopian: ADD → 13 US cities (massive US network!)
  { code:"ET", name:"Ethiopian Airlines", program:"ShebaMiles", alliance:"Star Alliance", color:"#078930", transfers:[], routes:US|EU|AS|ME|AF, type:"full-service", hubs:["ADD"], usGates:["JFK","EWR","IAD","ORD","IAH","LAX","ATL","BOS","DEN","DTW","MIA","MSP","SFO"], euGates:["LHR","CDG","FRA","FCO","MAD","BRU"] },

  // ═══ SOUTH AMERICAN ═══
  // LATAM: SCL/GRU → MIA only for US (no NYC, no London!)
  { code:"LA", name:"LATAM", program:"LATAM Pass", alliance:"Independent", color:"#000000", transfers:["Chase UR","Citi TYP"], routes:US|EU|SA, type:"full-service", hubs:["SCL","GRU","LIM","BOG"], usGates:["MIA"], euGates:["MAD","BCN","LHR","CDG","FRA","FCO","LIS"] },

  // ═══ OCEANIA ═══
  // Qantas: SYD/MEL → LAX/SFO/DFW/HNL only
  { code:"QF", name:"Qantas", program:"Frequent Flyer", alliance:"oneworld", color:"#E0002A", transfers:[], routes:US|EU|AS|OC|DOM_AS, type:"full-service", hubs:["SYD","MEL"], usGates:["LAX","SFO","DFW","HNL"], euGates:["LHR"] },

  // ═══ LOW-COST LONG-HAUL ═══
  // Air Premia: ICN → LAX/SFO/EWR/HNL/IAD
  { code:"YP", name:"Air Premia", program:null, alliance:"Budget", color:"#003D82", transfers:[], routes:US|AS|DOM_AS, type:"lowcost-longhaul", hubs:["ICN"], usGates:["LAX","SFO","EWR","HNL","IAD"] },
  // ZIPAIR: NRT → SJC/IAH/HNL (NOT LAX/SFO — those are wrong!)
  { code:"ZG", name:"ZIPAIR", program:null, alliance:"Budget", color:"#000000", transfers:[], routes:US|AS|DOM_AS, type:"lowcost-longhaul", hubs:["NRT"], usGates:["SJC","IAH","HNL"] },
  // French Bee: ORY → EWR/SFO/LAX/MIA
  { code:"BF", name:"French Bee", program:null, alliance:"Budget", color:"#FF6B00", transfers:[], routes:US|EU, type:"lowcost-longhaul", hubs:["ORY"], usGates:["EWR","SFO","LAX","MIA"] },
  // Condor: FRA → JFK/BOS/LAX/SFO/SEA/LAS
  { code:"DE", name:"Condor", program:null, alliance:"Budget", color:"#FFD700", transfers:[], routes:US|EU, type:"lowcost-longhaul", hubs:["FRA"], usGates:["JFK","BOS","LAX","SFO","SEA","LAS"] },
  // Norse Atlantic: Reduced 2026 — JFK/MCO to LGW/FCO/ATH only
  { code:"Z0", name:"Norse Atlantic", program:null, alliance:"Budget", color:"#FF0000", transfers:[], routes:US|EU, type:"lowcost-longhaul", hubs:["LGW"], usGates:["JFK","MCO"], euGates:["LGW","FCO","ATH"] },

  // ═══ BUDGET — US DOMESTIC ═══
  { code:"NK", name:"Spirit Airlines", program:null, alliance:"Budget", color:"#FFD700", transfers:[], routes:DOM_US|CA, type:"budget" },
  { code:"F9", name:"Frontier Airlines", program:null, alliance:"Budget", color:"#003D82", transfers:[], routes:DOM_US|CA, type:"budget" },
  { code:"WN", name:"Southwest Airlines", program:null, alliance:"Budget", color:"#0066CC", transfers:["Chase UR"], routes:DOM_US|CA, type:"budget" },
  { code:"MX", name:"Breeze Airways", program:null, alliance:"Budget", color:"#0066CC", transfers:[], routes:DOM_US, type:"budget" },

  // ═══ BUDGET — EUROPE DOMESTIC ═══
  { code:"FR", name:"Ryanair", program:null, alliance:"Budget", color:"#003DA5", transfers:[], routes:DOM_EU|AF, type:"budget" },
  { code:"U2", name:"easyJet", program:null, alliance:"Budget", color:"#FFC72C", transfers:[], routes:DOM_EU|AF, type:"budget" },
  { code:"W6", name:"Wizz Air", program:null, alliance:"Budget", color:"#003D82", transfers:[], routes:DOM_EU|ME, type:"budget" },
  { code:"VY", name:"Vueling", program:null, alliance:"Budget", color:"#003DA5", transfers:[], routes:DOM_EU, type:"budget" },

  // ═══ BUDGET — CANADA ═══
  { code:"WS", name:"WestJet", program:null, alliance:"Budget", color:"#003D82", transfers:[], routes:DOM_US|CA|US, type:"budget" },
];

// ═══════════════════════════════════════════════════════════════
// BOOKING URL — direct links to airline booking pages
// ═══════════════════════════════════════════════════════════════

const AIRLINE_WEBSITES = {
  UA: "united.com", AA: "aa.com", DL: "delta.com", AS: "alaskaair.com",
  B6: "jetblue.com", HA: "hawaiianairlines.com", AC: "aircanada.com",
  LH: "lufthansa.com", BA: "britishairways.com", AF: "airfrance.us",
  VS: "virginatlantic.com", LX: "swiss.com", SK: "flysas.com",
  IB: "iberia.com", AY: "finnair.com", TK: "turkishairlines.com",
  SQ: "singaporeair.com", NH: "ana.co.jp", CX: "cathaypacific.com",
  JL: "jal.co.jp", KE: "koreanair.com", BR: "evaair.com",
  CI: "china-airlines.com", CA: "airchina.com", AI: "airindia.com",
  MH: "malaysiaairlines.com", EK: "emirates.com", QR: "qatarairways.com",
  ET: "ethiopianairlines.com", LA: "latamairlines.com", QF: "qantas.com",
  NK: "spirit.com", F9: "flyfrontier.com", WN: "southwest.com",
  FR: "ryanair.com", U2: "easyjet.com", W6: "wizzair.com",
  VY: "vueling.com", WS: "westjet.com",
  MX: "flybreeze.com",
  YP: "airpremia.com", ZG: "zipair.net", BF: "frenchbee.com",
  DE: "condor.com", Z0: "flynorse.com",
};

function getBookingUrl(airlineCode, origin, dest) {
  const site = AIRLINE_WEBSITES[airlineCode];
  if (site) return `https://www.${site}`;
  // Fallback for unknown airlines
  const al = AIRLINES.find(a => a.code === airlineCode);
  return `https://www.${(al?.name||"").toLowerCase().replace(/[^a-z]/g,"")}.com`;
}

// ═══════════════════════════════════════════════════════════════
// AIRPORTS (Original + Expanded, deduped)
// ═══════════════════════════════════════════════════════════════

const AIRPORTS = [
  // US
  { code:"JFK", city:"New York", name:"John F. Kennedy Intl", country:"US", region:"NYC", lat:40.64, lon:-73.78 },
  { code:"EWR", city:"Newark", name:"Newark Liberty Intl", country:"US", region:"NYC", lat:40.69, lon:-74.18 },
  { code:"LGA", city:"New York", name:"LaGuardia", country:"US", region:"NYC", lat:40.78, lon:-73.87 },
  { code:"LAX", city:"Los Angeles", name:"Los Angeles Intl", country:"US", region:"LAX", lat:33.94, lon:-118.41 },
  { code:"SFO", city:"San Francisco", name:"San Francisco Intl", country:"US", region:"SFO", lat:37.62, lon:-122.38 },
  { code:"ORD", city:"Chicago", name:"O'Hare Intl", country:"US", region:"CHI", lat:41.98, lon:-87.91 },
  { code:"MIA", city:"Miami", name:"Miami Intl", country:"US", region:"MIA", lat:25.80, lon:-80.29 },
  { code:"BOS", city:"Boston", name:"Boston Logan Intl", country:"US", region:"BOS", lat:42.37, lon:-71.02 },
  { code:"ATL", city:"Atlanta", name:"Hartsfield-Jackson Intl", country:"US", region:"ATL", lat:33.64, lon:-84.43 },
  { code:"SEA", city:"Seattle", name:"Seattle-Tacoma Intl", country:"US", region:"SEA", lat:47.45, lon:-122.31 },
  { code:"DFW", city:"Dallas", name:"Dallas/Fort Worth Intl", country:"US", region:"DFW", lat:32.90, lon:-97.04 },
  { code:"IAD", city:"Washington", name:"Dulles Intl", country:"US", region:"WAS", lat:38.95, lon:-77.46 },
  { code:"DCA", city:"Washington", name:"Reagan National", country:"US", region:"WAS", lat:38.85, lon:-77.04 },
  { code:"IAH", city:"Houston", name:"George Bush Intl", country:"US", region:"IAH", lat:29.98, lon:-95.34 },
  { code:"DEN", city:"Denver", name:"Denver Intl", country:"US", region:"DEN", lat:39.86, lon:-104.67 },
  { code:"PHX", city:"Phoenix", name:"Phoenix Sky Harbor", country:"US", region:"PHX", lat:33.44, lon:-112.01 },
  { code:"HNL", city:"Honolulu", name:"Daniel K. Inouye Intl", country:"US", region:"HNL", lat:21.32, lon:-157.93 },
  { code:"LAS", city:"Las Vegas", name:"Harry Reid Intl", country:"US", region:"LAS", lat:36.08, lon:-115.15 },
  { code:"MSP", city:"Minneapolis", name:"Minneapolis-St Paul Intl", country:"US", region:"MSP", lat:44.88, lon:-93.22 },
  { code:"DTW", city:"Detroit", name:"Detroit Metro", country:"US", region:"DTW", lat:42.21, lon:-83.35 },
  { code:"CLT", city:"Charlotte", name:"Charlotte Douglas Intl", country:"US", region:"CLT", lat:35.21, lon:-80.94 },
  { code:"PHL", city:"Philadelphia", name:"Philadelphia Intl", country:"US", region:"PHL", lat:39.87, lon:-75.24 },
  { code:"BWI", city:"Baltimore", name:"Baltimore/Washington Intl", country:"US", region:"BWI", lat:39.18, lon:-76.67 },
  { code:"SAN", city:"San Diego", name:"San Diego Intl", country:"US", region:"SAN", lat:32.73, lon:-117.19 },
  // Europe
  { code:"LHR", city:"London", name:"Heathrow", country:"UK", region:"LON", lat:51.47, lon:-0.46 },
  { code:"CDG", city:"Paris", name:"Charles de Gaulle", country:"France", region:"PAR", lat:49.01, lon:2.55 },
  { code:"FRA", city:"Frankfurt", name:"Frankfurt", country:"Germany", region:"FRA", lat:50.04, lon:8.57 },
  { code:"AMS", city:"Amsterdam", name:"Schiphol", country:"Netherlands", region:"AMS", lat:52.31, lon:4.76 },
  { code:"FCO", city:"Rome", name:"Fiumicino", country:"Italy", region:"ROM", lat:41.80, lon:12.25 },
  { code:"BCN", city:"Barcelona", name:"El Prat", country:"Spain", region:"BCN", lat:41.30, lon:2.08 },
  { code:"LIS", city:"Lisbon", name:"Humberto Delgado", country:"Portugal", region:"LIS", lat:38.78, lon:-9.14 },
  { code:"IST", city:"Istanbul", name:"Istanbul", country:"Turkey", region:"IST", lat:41.28, lon:28.75 },
  { code:"ATH", city:"Athens", name:"Eleftherios Venizelos", country:"Greece", region:"ATH", lat:37.94, lon:23.95 },
  { code:"ZRH", city:"Zurich", name:"Zurich", country:"Switzerland", region:"ZRH", lat:47.46, lon:8.55 },
  { code:"GVA", city:"Geneva", name:"Geneva", country:"Switzerland", region:"GVA", lat:46.24, lon:6.11 },
  { code:"MAD", city:"Madrid", name:"Adolfo Suárez Madrid-Barajas", country:"Spain", region:"MAD", lat:40.42, lon:-3.60 },
  { code:"MUC", city:"Munich", name:"Munich Airport", country:"Germany", region:"MUC", lat:48.35, lon:11.79 },
  { code:"BRU", city:"Brussels", name:"Brussels-Zaventem", country:"Belgium", region:"BRU", lat:50.90, lon:4.48 },
  { code:"VIE", city:"Vienna", name:"Vienna Intl", country:"Austria", region:"VIE", lat:48.11, lon:16.57 },
  { code:"DUB", city:"Dublin", name:"Dublin", country:"Ireland", region:"DUB", lat:53.43, lon:-6.25 },
  { code:"LGW", city:"London", name:"Gatwick", country:"UK", region:"LGW", lat:51.15, lon:-0.18 },
  { code:"STN", city:"London", name:"Stansted", country:"UK", region:"STN", lat:51.89, lon:0.37 },
  { code:"WAW", city:"Warsaw", name:"Warsaw Chopin", country:"Poland", region:"WAW", lat:52.17, lon:21.02 },
  { code:"KRK", city:"Krakow", name:"John Paul II Intl", country:"Poland", region:"KRK", lat:50.08, lon:19.79 },
  { code:"ARN", city:"Stockholm", name:"Stockholm Arlanda", country:"Sweden", region:"ARN", lat:59.65, lon:17.93 },
  { code:"CPH", city:"Copenhagen", name:"Copenhagen", country:"Denmark", region:"CPH", lat:55.62, lon:12.66 },
  { code:"OSL", city:"Oslo", name:"Oslo Airport", country:"Norway", region:"OSL", lat:60.20, lon:11.09 },
  { code:"HEL", city:"Helsinki", name:"Helsinki-Vantaa", country:"Finland", region:"HEL", lat:60.32, lon:25.25 },
  // Asia
  { code:"NRT", city:"Tokyo", name:"Narita Intl", country:"Japan", region:"TYO", lat:35.77, lon:140.39 },
  { code:"HND", city:"Tokyo", name:"Haneda", country:"Japan", region:"TYO", lat:35.55, lon:139.78 },
  { code:"SIN", city:"Singapore", name:"Changi", country:"Singapore", region:"SIN", lat:1.36, lon:103.99 },
  { code:"HKG", city:"Hong Kong", name:"Hong Kong Intl", country:"Hong Kong", region:"HKG", lat:22.31, lon:113.92 },
  { code:"ICN", city:"Seoul", name:"Incheon Intl", country:"South Korea", region:"ICN", lat:37.46, lon:126.44 },
  { code:"BKK", city:"Bangkok", name:"Suvarnabhumi", country:"Thailand", region:"BKK", lat:13.69, lon:100.75 },
  { code:"DXB", city:"Dubai", name:"Dubai Intl", country:"UAE", region:"DXB", lat:25.25, lon:55.36 },
  { code:"DOH", city:"Doha", name:"Hamad Intl", country:"Qatar", region:"DOH", lat:25.27, lon:51.61 },
  { code:"SYD", city:"Sydney", name:"Kingsford Smith", country:"Australia", region:"SYD", lat:-33.95, lon:151.18 },
  { code:"DEL", city:"Delhi", name:"Indira Gandhi Intl", country:"India", region:"DEL", lat:28.56, lon:77.10 },
  { code:"CPT", city:"Cape Town", name:"Cape Town Intl", country:"South Africa", region:"CPT", lat:-33.97, lon:18.60 },
  { code:"GRU", city:"São Paulo", name:"Guarulhos Intl", country:"Brazil", region:"GRU", lat:-23.44, lon:-46.47 },
  { code:"MEX", city:"Mexico City", name:"Benito Juárez Intl", country:"Mexico", region:"MEX", lat:19.44, lon:-99.07 },
  { code:"CUN", city:"Cancún", name:"Cancún Intl", country:"Mexico", region:"CUN", lat:21.04, lon:-86.88 },
  { code:"TPE", city:"Taipei", name:"Taiwan Taoyuan Intl", country:"Taiwan", region:"TPE", lat:25.08, lon:121.23 },
  { code:"PVG", city:"Shanghai", name:"Shanghai Pudong", country:"China", region:"PVG", lat:31.14, lon:121.81 },
  { code:"PEK", city:"Beijing", name:"Beijing Capital", country:"China", region:"PEK", lat:40.08, lon:116.58 },
  { code:"BOM", city:"Mumbai", name:"Bombay High", country:"India", region:"BOM", lat:19.08, lon:72.88 },
  { code:"BLR", city:"Bangalore", name:"Kempegowda Intl", country:"India", region:"BLR", lat:13.20, lon:77.71 },
  { code:"KUL", city:"Kuala Lumpur", name:"KL Intl", country:"Malaysia", region:"KUL", lat:2.73, lon:101.71 },
  { code:"CGK", city:"Jakarta", name:"Soekarno-Hatta", country:"Indonesia", region:"CGK", lat:-6.13, lon:106.66 },
  { code:"KIX", city:"Osaka", name:"Kansai Intl", country:"Japan", region:"KIX", lat:34.43, lon:135.24 },
  { code:"AUH", city:"Abu Dhabi", name:"Abu Dhabi Intl", country:"UAE", region:"AUH", lat:24.43, lon:54.65 },
  { code:"MNL", city:"Manila", name:"Ninoy Aquino Intl", country:"Philippines", region:"MNL", lat:14.11, lon:121.02 },
  { code:"DPS", city:"Bali", name:"Ngurah Rai Intl", country:"Indonesia", region:"DPS", lat:-8.77, lon:115.17 },
  { code:"SGN", city:"Ho Chi Minh City", name:"Tan Son Nhat Intl", country:"Vietnam", region:"SGN", lat:10.82, lon:106.65 },
  { code:"HAN", city:"Hanoi", name:"Noi Bai Intl", country:"Vietnam", region:"HAN", lat:21.20, lon:105.80 },
  { code:"CTU", city:"Chengdu", name:"Chengdu Shuangliu Intl", country:"China", region:"CTU", lat:30.57, lon:104.01 },
  { code:"CAN", city:"Guangzhou", name:"Guangzhou Baiyun Intl", country:"China", region:"CAN", lat:23.39, lon:113.31 },
  { code:"PUS", city:"Busan", name:"Gimhae Intl", country:"South Korea", region:"PUS", lat:35.18, lon:128.94 },
  { code:"CMB", city:"Colombo", name:"Bandaranayake Intl", country:"Sri Lanka", region:"CMB", lat:7.18, lon:80.78 },
  { code:"MLE", city:"Male", name:"Velana Intl", country:"Maldives", region:"MLE", lat:4.19, lon:73.53 },
  { code:"CTG", city:"Cartagena", name:"Rafael Nunez Intl", country:"Colombia", region:"CTG", lat:10.44, lon:-75.51 },
  { code:"BGW", city:"Baghdad", name:"Baghdad Intl", country:"Iraq", region:"BGW", lat:33.26, lon:44.23 },
  { code:"MHT", city:"Manchester", name:"Manchester-Boston Regional", country:"US", region:"MHT", lat:42.93, lon:-71.44 },
  { code:"CRW", city:"Charleston", name:"Yeager Airport", country:"US", region:"CRW", lat:38.37, lon:-81.59 },
  { code:"JAN", city:"Jackson", name:"Jackson-Medgar Wiley Evers Intl", country:"US", region:"JAN", lat:32.31, lon:-90.08 },
  { code:"DAC", city:"Dhaka", name:"Hazrat Shahjalal Intl", country:"Bangladesh", region:"DAC", lat:23.81, lon:90.33 },
  { code:"TAS", city:"Tashkent", name:"Tashkent Intl", country:"Uzbekistan", region:"TAS", lat:41.26, lon:69.28 },
  // Europe (additional)
  { code:"PRG", city:"Prague", name:"Václav Havel Airport", country:"Czech Republic", region:"PRG", lat:50.10, lon:14.27 },
  { code:"BUD", city:"Budapest", name:"Ferenc Liszt Intl", country:"Hungary", region:"BUD", lat:47.43, lon:19.26 },
  { code:"OTP", city:"Bucharest", name:"Henri Coandă Intl", country:"Romania", region:"OTP", lat:44.57, lon:26.10 },
  { code:"BER", city:"Berlin", name:"Berlin Brandenburg", country:"Germany", region:"BER", lat:52.37, lon:13.50 },
  { code:"DUS", city:"Düsseldorf", name:"Düsseldorf Intl", country:"Germany", region:"DUS", lat:51.29, lon:6.77 },
  { code:"HAM", city:"Hamburg", name:"Hamburg Airport", country:"Germany", region:"HAM", lat:53.63, lon:10.01 },
  { code:"MXP", city:"Milan", name:"Milan Malpensa", country:"Italy", region:"MXP", lat:45.63, lon:8.73 },
  { code:"NAP", city:"Naples", name:"Naples Intl", country:"Italy", region:"NAP", lat:40.89, lon:14.29 },
  { code:"VCE", city:"Venice", name:"Marco Polo Airport", country:"Italy", region:"VCE", lat:45.51, lon:12.35 },
  { code:"ORY", city:"Paris", name:"Paris Orly", country:"France", region:"PAR", lat:48.72, lon:2.38 },
  { code:"NCE", city:"Nice", name:"Nice Côte d'Azur", country:"France", region:"NCE", lat:43.66, lon:7.22 },
  { code:"EDI", city:"Edinburgh", name:"Edinburgh Airport", country:"UK", region:"EDI", lat:55.95, lon:-3.37 },
  { code:"MAN", city:"Manchester", name:"Manchester Airport", country:"UK", region:"MAN", lat:53.36, lon:-2.27 },
  { code:"LTN", city:"London", name:"London Luton", country:"UK", region:"LTN", lat:51.87, lon:-0.36 },
  { code:"PMI", city:"Palma", name:"Palma de Mallorca", country:"Spain", region:"PMI", lat:39.55, lon:2.74 },
  { code:"AGP", city:"Málaga", name:"Málaga-Costa del Sol", country:"Spain", region:"AGP", lat:36.67, lon:-3.75 },
  { code:"GOT", city:"Gothenburg", name:"Gothenburg Landvetter", country:"Sweden", region:"GOT", lat:57.66, lon:12.28 },
  { code:"SOF", city:"Sofia", name:"Sofia Airport", country:"Bulgaria", region:"SOF", lat:42.70, lon:23.41 },
  { code:"ZAG", city:"Zagreb", name:"Zagreb Airport", country:"Croatia", region:"ZAG", lat:45.22, lon:16.07 },
  { code:"BEG", city:"Belgrade", name:"Nikola Tesla Airport", country:"Serbia", region:"BEG", lat:44.82, lon:20.28 },
  // Middle East & Africa (additional)
  { code:"DWC", city:"Dubai", name:"Al Maktoum Intl", country:"UAE", region:"DWC", lat:24.94, lon:55.22 },
  { code:"BAH", city:"Manama", name:"Bahrain Intl", country:"Bahrain", region:"BAH", lat:26.13, lon:50.36 },
  { code:"KWI", city:"Kuwait City", name:"Kuwait Intl", country:"Kuwait", region:"KWI", lat:29.24, lon:47.97 },
  { code:"MCT", city:"Muscat", name:"Muscat Intl", country:"Oman", region:"MCT", lat:23.59, lon:58.28 },
  { code:"AMM", city:"Amman", name:"Queen Alia Intl", country:"Jordan", region:"AMM", lat:31.75, lon:35.93 },
  { code:"TLV", city:"Tel Aviv", name:"Ben Gurion Airport", country:"Israel", region:"TLV", lat:31.95, lon:35.34 },
  { code:"JED", city:"Jeddah", name:"King Abdulaziz Intl", country:"Saudi Arabia", region:"JED", lat:21.67, lon:39.16 },
  { code:"RUH", city:"Riyadh", name:"King Khalid Intl", country:"Saudi Arabia", region:"RUH", lat:24.96, lon:46.70 },
  { code:"CAI", city:"Cairo", name:"Cairo Intl", country:"Egypt", region:"CAI", lat:30.12, lon:31.41 },
  { code:"ADD", city:"Addis Ababa", name:"Bole Intl", country:"Ethiopia", region:"ADD", lat:9.03, lon:38.75 },
  { code:"NBO", city:"Nairobi", name:"Jomo Kenyatta Intl", country:"Kenya", region:"NBO", lat:-1.32, lon:36.92 },
  { code:"JNB", city:"Johannesburg", name:"O.R. Tambo Intl", country:"South Africa", region:"JNB", lat:-26.14, lon:28.24 },
  { code:"LOS", city:"Lagos", name:"Murtala Muhammed Intl", country:"Nigeria", region:"LOS", lat:6.58, lon:3.32 },
  { code:"CMN", city:"Casablanca", name:"Casablanca-Anfa", country:"Morocco", region:"CMN", lat:33.37, lon:-7.59 },
  { code:"ACC", city:"Accra", name:"Kotoka Intl", country:"Ghana", region:"ACC", lat:5.61, lon:-0.17 },
  // Americas (additional)
  { code:"YYZ", city:"Toronto", name:"Toronto Pearson Intl", country:"Canada", region:"YYZ", lat:43.68, lon:-79.62 },
  { code:"YVR", city:"Vancouver", name:"Vancouver Intl", country:"Canada", region:"YVR", lat:49.20, lon:-123.18 },
  { code:"YUL", city:"Montreal", name:"Montréal-Trudeau", country:"Canada", region:"YUL", lat:45.47, lon:-73.74 },
  { code:"BOG", city:"Bogotá", name:"El Dorado Intl", country:"Colombia", region:"BOG", lat:4.70, lon:-74.15 },
  { code:"LIM", city:"Lima", name:"Jorge Chávez Intl", country:"Peru", region:"LIM", lat:-12.02, lon:-77.11 },
  { code:"SCL", city:"Santiago", name:"Santiago Intl", country:"Chile", region:"SCL", lat:-33.40, lon:-70.79 },
  { code:"GIG", city:"Rio de Janeiro", name:"Tom Jobim Intl", country:"Brazil", region:"GIG", lat:-22.81, lon:-43.16 },
  { code:"EZE", city:"Buenos Aires", name:"Ministro Pistarini Intl", country:"Argentina", region:"EZE", lat:-34.82, lon:-58.54 },
  { code:"PTY", city:"Panama City", name:"Tocumén Intl", country:"Panama", region:"PTY", lat:8.98, lon:-79.52 },
  { code:"SJO", city:"San José", name:"San José Intl", country:"Costa Rica", region:"SJO", lat:10.01, lon:-84.21 },
  { code:"HAV", city:"Havana", name:"José Martí Intl", country:"Cuba", region:"HAV", lat:22.97, lon:-82.41 },
  { code:"PUJ", city:"Punta Cana", name:"Punta Cana Intl", country:"Dominican Republic", region:"PUJ", lat:18.57, lon:-68.36 },
  { code:"MBJ", city:"Montego Bay", name:"Sangster Intl", country:"Jamaica", region:"MBJ", lat:18.50, lon:-77.92 },
  { code:"MTY", city:"Monterrey", name:"Monterrey Intl", country:"Mexico", region:"MTY", lat:25.69, lon:-100.22 },
  // US Medium (additional)
  { code:"MCO", city:"Orlando", name:"Orlando Intl", country:"US", region:"MCO", lat:28.43, lon:-81.31 },
  { code:"FLL", city:"Fort Lauderdale", name:"Fort Lauderdale-Hollywood Intl", country:"US", region:"FLL", lat:26.07, lon:-80.15 },
  { code:"TPA", city:"Tampa", name:"Tampa Intl", country:"US", region:"TPA", lat:27.97, lon:-82.53 },
  { code:"SLC", city:"Salt Lake City", name:"Salt Lake City Intl", country:"US", region:"SLC", lat:40.79, lon:-111.88 },
  { code:"PDX", city:"Portland", name:"Portland Intl", country:"US", region:"PDX", lat:45.59, lon:-122.60 },
  { code:"AUS", city:"Austin", name:"Austin-Bergstrom Intl", country:"US", region:"AUS", lat:30.22, lon:-97.84 },
  { code:"BNA", city:"Nashville", name:"Nashville Intl", country:"US", region:"BNA", lat:36.12, lon:-86.68 },
  { code:"RDU", city:"Raleigh-Durham", name:"Raleigh-Durham Intl", country:"US", region:"RDU", lat:35.88, lon:-78.79 },
  { code:"ANC", city:"Anchorage", name:"Ted Stevens Anchorage Intl", country:"US", region:"ANC", lat:61.17, lon:-149.99 },
  // Oceania (additional)
  { code:"MEL", city:"Melbourne", name:"Melbourne Airport", country:"Australia", region:"MEL", lat:-37.67, lon:144.84 },
  { code:"BNE", city:"Brisbane", name:"Brisbane Airport", country:"Australia", region:"BNE", lat:-27.38, lon:153.12 },
  { code:"PER", city:"Perth", name:"Perth Airport", country:"Australia", region:"PER", lat:-31.95, lon:115.86 },
  { code:"AKL", city:"Auckland", name:"Auckland Airport", country:"New Zealand", region:"AKL", lat:-37.21, lon:174.79 },
  { code:"NAN", city:"Nadi", name:"Nadi Intl", country:"Fiji", region:"NAN", lat:-17.75, lon:177.44 },
  { code:"CHC", city:"Christchurch", name:"Christchurch Intl", country:"New Zealand", region:"CHC", lat:-43.49, lon:172.53 },
  { code:"WLG", city:"Wellington", name:"Wellington Intl", country:"New Zealand", region:"WLG", lat:-41.33, lon:174.89 },
  { code:"ZQN", city:"Queenstown", name:"Queenstown Airport", country:"New Zealand", region:"ZQN", lat:-45.02, lon:168.74 },
  { code:"ADL", city:"Adelaide", name:"Adelaide Airport", country:"Australia", region:"ADL", lat:-34.94, lon:138.53 },
  { code:"OOL", city:"Gold Coast", name:"Gold Coast Airport", country:"Australia", region:"OOL", lat:-28.16, lon:153.50 },
  { code:"PPT", city:"Papeete", name:"Faa'a Intl", country:"French Polynesia", region:"PPT", lat:-17.56, lon:-149.61 },
  // US (additional tier-2)
  { code:"MSY", city:"New Orleans", name:"Louis Armstrong Intl", country:"US", region:"MSY", lat:29.99, lon:-90.26 },
  { code:"STL", city:"St. Louis", name:"Lambert Intl", country:"US", region:"STL", lat:38.75, lon:-90.37 },
  { code:"MDW", city:"Chicago", name:"Midway Intl", country:"US", region:"CHI", lat:41.79, lon:-87.75 },
  { code:"DAL", city:"Dallas", name:"Love Field", country:"US", region:"DFW", lat:32.85, lon:-96.85 },
  { code:"HOU", city:"Houston", name:"Hobby Airport", country:"US", region:"IAH", lat:29.65, lon:-95.28 },
  { code:"OAK", city:"Oakland", name:"Oakland Intl", country:"US", region:"SFO", lat:37.72, lon:-122.22 },
  { code:"SJC", city:"San Jose", name:"Mineta San Jose Intl", country:"US", region:"SFO", lat:37.36, lon:-121.93 },
  { code:"SMF", city:"Sacramento", name:"Sacramento Intl", country:"US", region:"SMF", lat:38.70, lon:-121.59 },
  { code:"OGG", city:"Maui", name:"Kahului Airport", country:"US", region:"HNL", lat:20.90, lon:-156.43 },
  { code:"KOA", city:"Kona", name:"Kona Intl", country:"US", region:"HNL", lat:19.74, lon:-156.05 },
  { code:"RSW", city:"Fort Myers", name:"Southwest Florida Intl", country:"US", region:"RSW", lat:26.54, lon:-81.76 },
  { code:"PBI", city:"West Palm Beach", name:"Palm Beach Intl", country:"US", region:"PBI", lat:26.68, lon:-80.10 },
  { code:"CVG", city:"Cincinnati", name:"Cincinnati/N. Kentucky Intl", country:"US", region:"CVG", lat:39.05, lon:-84.67 },
  { code:"CLE", city:"Cleveland", name:"Cleveland Hopkins Intl", country:"US", region:"CLE", lat:41.41, lon:-81.85 },
  { code:"CMH", city:"Columbus", name:"John Glenn Columbus Intl", country:"US", region:"CMH", lat:40.00, lon:-82.89 },
  { code:"IND", city:"Indianapolis", name:"Indianapolis Intl", country:"US", region:"IND", lat:39.72, lon:-86.29 },
  { code:"MKE", city:"Milwaukee", name:"Mitchell Intl", country:"US", region:"MKE", lat:42.95, lon:-87.90 },
  { code:"PIT", city:"Pittsburgh", name:"Pittsburgh Intl", country:"US", region:"PIT", lat:40.49, lon:-80.23 },
  { code:"MEM", city:"Memphis", name:"Memphis Intl", country:"US", region:"MEM", lat:35.04, lon:-89.98 },
  { code:"JAX", city:"Jacksonville", name:"Jacksonville Intl", country:"US", region:"JAX", lat:30.50, lon:-81.69 },
  { code:"ABQ", city:"Albuquerque", name:"Albuquerque Intl", country:"US", region:"ABQ", lat:35.04, lon:-106.61 },
  { code:"BOI", city:"Boise", name:"Boise Airport", country:"US", region:"BOI", lat:43.56, lon:-116.22 },
  { code:"ONT", city:"Ontario", name:"Ontario Intl", country:"US", region:"LAX", lat:34.06, lon:-117.60 },
  { code:"BUR", city:"Burbank", name:"Hollywood Burbank Airport", country:"US", region:"LAX", lat:34.20, lon:-118.36 },
  { code:"SNA", city:"Santa Ana", name:"John Wayne Airport", country:"US", region:"LAX", lat:33.68, lon:-117.87 },
  { code:"SAT", city:"San Antonio", name:"San Antonio Intl", country:"US", region:"SAT", lat:29.53, lon:-98.47 },
  // US — secondary/regional airports
  { code:"SAV", city:"Savannah", name:"Savannah/Hilton Head Intl", country:"US", region:"SAV", lat:32.13, lon:-81.20 },
  { code:"CHS", city:"Charleston", name:"Charleston Intl", country:"US", region:"CHS", lat:32.90, lon:-80.04 },
  { code:"MYR", city:"Myrtle Beach", name:"Myrtle Beach Intl", country:"US", region:"MYR", lat:33.68, lon:-78.93 },
  { code:"EYW", city:"Key West", name:"Key West Intl", country:"US", region:"EYW", lat:24.56, lon:-81.76 },
  { code:"PNS", city:"Pensacola", name:"Pensacola Intl", country:"US", region:"PNS", lat:30.47, lon:-87.19 },
  { code:"VPS", city:"Destin", name:"Destin-Fort Walton Beach", country:"US", region:"VPS", lat:30.48, lon:-86.53 },
  { code:"ECP", city:"Panama City Beach", name:"Northwest Florida Beaches Intl", country:"US", region:"ECP", lat:30.36, lon:-85.80 },
  { code:"SRQ", city:"Sarasota", name:"Sarasota-Bradenton Intl", country:"US", region:"SRQ", lat:27.40, lon:-82.55 },
  { code:"DAB", city:"Daytona Beach", name:"Daytona Beach Intl", country:"US", region:"DAB", lat:29.18, lon:-81.06 },
  { code:"AVL", city:"Asheville", name:"Asheville Regional", country:"US", region:"AVL", lat:35.44, lon:-82.54 },
  { code:"TYS", city:"Knoxville", name:"McGhee Tyson Airport", country:"US", region:"TYS", lat:35.81, lon:-83.99 },
  { code:"LEX", city:"Lexington", name:"Blue Grass Airport", country:"US", region:"LEX", lat:38.04, lon:-84.61 },
  { code:"SDF", city:"Louisville", name:"Louisville Intl", country:"US", region:"SDF", lat:38.17, lon:-85.74 },
  { code:"RIC", city:"Richmond", name:"Richmond Intl", country:"US", region:"RIC", lat:37.51, lon:-77.32 },
  { code:"ORF", city:"Norfolk", name:"Norfolk Intl", country:"US", region:"ORF", lat:36.89, lon:-76.20 },
  { code:"BUF", city:"Buffalo", name:"Buffalo Niagara Intl", country:"US", region:"BUF", lat:42.94, lon:-78.73 },
  { code:"ROC", city:"Rochester", name:"Rochester Intl", country:"US", region:"ROC", lat:43.12, lon:-77.67 },
  { code:"SYR", city:"Syracuse", name:"Syracuse Hancock Intl", country:"US", region:"SYR", lat:43.11, lon:-76.11 },
  { code:"ALB", city:"Albany", name:"Albany Intl", country:"US", region:"ALB", lat:42.75, lon:-73.80 },
  { code:"BDL", city:"Hartford", name:"Bradley Intl", country:"US", region:"BDL", lat:41.94, lon:-72.68 },
  { code:"PVD", city:"Providence", name:"T.F. Green Intl", country:"US", region:"PVD", lat:41.73, lon:-71.43 },
  { code:"PWM", city:"Portland", name:"Portland Intl Jetport", country:"US", region:"PWM", lat:43.65, lon:-70.31 },
  { code:"BTV", city:"Burlington", name:"Burlington Intl", country:"US", region:"BTV", lat:44.47, lon:-73.15 },
  { code:"OMA", city:"Omaha", name:"Eppley Airfield", country:"US", region:"OMA", lat:41.30, lon:-95.89 },
  { code:"MCI", city:"Kansas City", name:"Kansas City Intl", country:"US", region:"MCI", lat:39.30, lon:-94.71 },
  { code:"DSM", city:"Des Moines", name:"Des Moines Intl", country:"US", region:"DSM", lat:41.53, lon:-93.66 },
  { code:"MSN", city:"Madison", name:"Dane County Regional", country:"US", region:"MSN", lat:43.14, lon:-89.34 },
  { code:"GRR", city:"Grand Rapids", name:"Gerald R. Ford Intl", country:"US", region:"GRR", lat:42.88, lon:-85.52 },
  { code:"TUS", city:"Tucson", name:"Tucson Intl", country:"US", region:"TUS", lat:32.12, lon:-110.94 },
  { code:"ELP", city:"El Paso", name:"El Paso Intl", country:"US", region:"ELP", lat:31.81, lon:-106.38 },
  { code:"RNO", city:"Reno", name:"Reno-Tahoe Intl", country:"US", region:"RNO", lat:39.50, lon:-119.77 },
  { code:"GEG", city:"Spokane", name:"Spokane Intl", country:"US", region:"GEG", lat:47.62, lon:-117.53 },
  { code:"BZN", city:"Bozeman", name:"Bozeman Yellowstone Intl", country:"US", region:"BZN", lat:45.78, lon:-111.15 },
  { code:"JAC", city:"Jackson Hole", name:"Jackson Hole Airport", country:"US", region:"JAC", lat:43.61, lon:-110.74 },
  { code:"ASE", city:"Aspen", name:"Aspen-Pitkin County", country:"US", region:"ASE", lat:39.22, lon:-106.87 },
  { code:"EGE", city:"Vail", name:"Eagle County Regional", country:"US", region:"EGE", lat:39.64, lon:-106.92 },
  { code:"PSP", city:"Palm Springs", name:"Palm Springs Intl", country:"US", region:"PSP", lat:33.83, lon:-116.51 },
  { code:"SBA", city:"Santa Barbara", name:"Santa Barbara Airport", country:"US", region:"SBA", lat:34.43, lon:-119.84 },
  { code:"MRY", city:"Monterey", name:"Monterey Regional", country:"US", region:"MRY", lat:36.59, lon:-121.84 },
  { code:"LIT", city:"Little Rock", name:"Clinton National", country:"US", region:"LIT", lat:34.73, lon:-92.22 },
  { code:"OKC", city:"Oklahoma City", name:"Will Rogers World", country:"US", region:"OKC", lat:35.39, lon:-97.60 },
  { code:"TUL", city:"Tulsa", name:"Tulsa Intl", country:"US", region:"TUL", lat:36.20, lon:-95.89 },
  { code:"ICT", city:"Wichita", name:"Wichita Eisenhower Natl", country:"US", region:"ICT", lat:37.65, lon:-97.43 },
  { code:"BHM", city:"Birmingham", name:"Birmingham-Shuttlesworth Intl", country:"US", region:"BHM", lat:33.56, lon:-86.75 },
  { code:"HSV", city:"Huntsville", name:"Huntsville Intl", country:"US", region:"HSV", lat:34.64, lon:-86.77 },
  { code:"MOB", city:"Mobile", name:"Mobile Regional", country:"US", region:"MOB", lat:30.69, lon:-88.24 },
  { code:"GSP", city:"Greenville", name:"Greenville-Spartanburg Intl", country:"US", region:"GSP", lat:34.90, lon:-82.22 },
  { code:"CAE", city:"Columbia", name:"Columbia Metropolitan", country:"US", region:"CAE", lat:33.94, lon:-81.12 },
  { code:"ILM", city:"Wilmington", name:"Wilmington Intl", country:"US", region:"ILM", lat:34.27, lon:-77.90 },
  { code:"XNA", city:"Fayetteville", name:"Northwest Arkansas Natl", country:"US", region:"XNA", lat:36.28, lon:-94.31 },
  { code:"MDT", city:"Harrisburg", name:"Harrisburg Intl", country:"US", region:"MDT", lat:40.19, lon:-76.76 },
  { code:"COS", city:"Colorado Springs", name:"Colorado Springs Airport", country:"US", region:"COS", lat:38.81, lon:-104.70 },
  { code:"FAR", city:"Fargo", name:"Hector Intl", country:"US", region:"FAR", lat:46.92, lon:-96.82 },
  { code:"FSD", city:"Sioux Falls", name:"Sioux Falls Regional", country:"US", region:"FSD", lat:43.58, lon:-96.74 },
  { code:"RAP", city:"Rapid City", name:"Rapid City Regional", country:"US", region:"RAP", lat:44.05, lon:-103.05 },
  { code:"MSO", city:"Missoula", name:"Missoula Montana Airport", country:"US", region:"MSO", lat:46.92, lon:-114.09 },
  { code:"BIL", city:"Billings", name:"Billings Logan Intl", country:"US", region:"BIL", lat:45.81, lon:-108.54 },
  { code:"EUG", city:"Eugene", name:"Mahlon Sweet Field", country:"US", region:"EUG", lat:44.12, lon:-123.21 },
  { code:"RDM", city:"Redmond", name:"Redmond Municipal", country:"US", region:"RDM", lat:44.25, lon:-121.15 },
  // Europe (additional)
  { code:"BGO", city:"Bergen", name:"Bergen Flesland", country:"Norway", region:"BGO", lat:60.29, lon:5.22 },
  { code:"KEF", city:"Reykjavik", name:"Keflavik Intl", country:"Iceland", region:"KEF", lat:63.99, lon:-22.62 },
  { code:"LYS", city:"Lyon", name:"Lyon-Saint Exupéry", country:"France", region:"LYS", lat:45.73, lon:5.08 },
  { code:"MRS", city:"Marseille", name:"Marseille Provence", country:"France", region:"MRS", lat:43.44, lon:5.21 },
  { code:"TLS", city:"Toulouse", name:"Toulouse-Blagnac", country:"France", region:"TLS", lat:43.63, lon:1.37 },
  { code:"BGY", city:"Milan", name:"Milan Bergamo", country:"Italy", region:"MXP", lat:45.67, lon:9.70 },
  { code:"CTA", city:"Catania", name:"Catania-Fontanarossa", country:"Italy", region:"CTA", lat:37.47, lon:15.07 },
  { code:"PMO", city:"Palermo", name:"Palermo Falcone-Borsellino", country:"Italy", region:"PMO", lat:38.18, lon:13.10 },
  { code:"SPU", city:"Split", name:"Split Airport", country:"Croatia", region:"SPU", lat:43.54, lon:16.30 },
  { code:"DBV", city:"Dubrovnik", name:"Dubrovnik Airport", country:"Croatia", region:"DBV", lat:42.56, lon:18.27 },
  { code:"RIX", city:"Riga", name:"Riga Intl", country:"Latvia", region:"RIX", lat:56.92, lon:23.97 },
  { code:"VNO", city:"Vilnius", name:"Vilnius Intl", country:"Lithuania", region:"VNO", lat:54.63, lon:25.29 },
  { code:"TLL", city:"Tallinn", name:"Tallinn Airport", country:"Estonia", region:"TLL", lat:59.41, lon:24.83 },
  { code:"GLA", city:"Glasgow", name:"Glasgow Airport", country:"UK", region:"GLA", lat:55.87, lon:-4.43 },
  { code:"BFS", city:"Belfast", name:"Belfast Intl", country:"UK", region:"BFS", lat:54.66, lon:-6.22 },
  { code:"SAW", city:"Istanbul", name:"Sabiha Gökçen", country:"Turkey", region:"IST", lat:40.90, lon:29.31 },
  { code:"AYT", city:"Antalya", name:"Antalya Airport", country:"Turkey", region:"AYT", lat:36.90, lon:30.80 },
  { code:"GDN", city:"Gdańsk", name:"Lech Wałęsa Airport", country:"Poland", region:"GDN", lat:54.38, lon:18.47 },
  { code:"WRO", city:"Wrocław", name:"Copernicus Airport", country:"Poland", region:"WRO", lat:51.10, lon:16.89 },
  { code:"SZG", city:"Salzburg", name:"Salzburg Airport", country:"Austria", region:"SZG", lat:47.79, lon:13.00 },
  { code:"TFS", city:"Tenerife", name:"Tenerife South", country:"Spain", region:"TFS", lat:28.04, lon:-16.57 },
  { code:"SVQ", city:"Seville", name:"Seville Airport", country:"Spain", region:"SVQ", lat:37.42, lon:-5.90 },
  { code:"OPO", city:"Porto", name:"Francisco Sá Carneiro", country:"Portugal", region:"OPO", lat:41.24, lon:-8.68 },
  { code:"BSL", city:"Basel", name:"EuroAirport Basel-Mulhouse", country:"Switzerland", region:"BSL", lat:47.60, lon:7.53 },
  { code:"SKG", city:"Thessaloniki", name:"Thessaloniki Airport", country:"Greece", region:"SKG", lat:40.52, lon:22.97 },
  { code:"JTR", city:"Santorini", name:"Santorini Airport", country:"Greece", region:"JTR", lat:36.40, lon:25.48 },
  { code:"JMK", city:"Mykonos", name:"Mykonos Airport", country:"Greece", region:"JMK", lat:37.44, lon:25.35 },
  { code:"RHO", city:"Rhodes", name:"Rhodes Airport", country:"Greece", region:"RHO", lat:36.41, lon:28.09 },
  { code:"CFU", city:"Corfu", name:"Ioannis Kapodistrias Intl", country:"Greece", region:"CFU", lat:39.60, lon:19.91 },
  { code:"HER", city:"Heraklion", name:"Heraklion Airport", country:"Greece", region:"HER", lat:35.34, lon:25.18 },
  // Asia (additional)
  { code:"SHA", city:"Shanghai", name:"Shanghai Hongqiao", country:"China", region:"PVG", lat:31.20, lon:121.34 },
  { code:"SZX", city:"Shenzhen", name:"Shenzhen Bao'an Intl", country:"China", region:"SZX", lat:22.64, lon:113.81 },
  { code:"HGH", city:"Hangzhou", name:"Hangzhou Xiaoshan Intl", country:"China", region:"HGH", lat:30.23, lon:120.43 },
  { code:"WUH", city:"Wuhan", name:"Wuhan Tianhe Intl", country:"China", region:"WUH", lat:30.78, lon:114.21 },
  { code:"CKG", city:"Chongqing", name:"Chongqing Jiangbei Intl", country:"China", region:"CKG", lat:29.72, lon:106.64 },
  { code:"XIY", city:"Xi'an", name:"Xi'an Xianyang Intl", country:"China", region:"XIY", lat:34.45, lon:108.75 },
  { code:"NKG", city:"Nanjing", name:"Nanjing Lukou Intl", country:"China", region:"NKG", lat:31.74, lon:118.86 },
  { code:"FUK", city:"Fukuoka", name:"Fukuoka Airport", country:"Japan", region:"FUK", lat:33.59, lon:130.45 },
  { code:"CTS", city:"Sapporo", name:"New Chitose Airport", country:"Japan", region:"CTS", lat:42.78, lon:141.69 },
  { code:"HYD", city:"Hyderabad", name:"Rajiv Gandhi Intl", country:"India", region:"HYD", lat:17.24, lon:78.43 },
  { code:"MAA", city:"Chennai", name:"Chennai Intl", country:"India", region:"MAA", lat:12.99, lon:80.17 },
  { code:"COK", city:"Kochi", name:"Cochin Intl", country:"India", region:"COK", lat:10.15, lon:76.40 },
  { code:"CEB", city:"Cebu", name:"Mactan-Cebu Intl", country:"Philippines", region:"CEB", lat:10.31, lon:123.99 },
  { code:"DAD", city:"Da Nang", name:"Da Nang Intl", country:"Vietnam", region:"DAD", lat:16.04, lon:108.20 },
  { code:"CNX", city:"Chiang Mai", name:"Chiang Mai Intl", country:"Thailand", region:"CNX", lat:18.77, lon:98.96 },
  { code:"HKT", city:"Phuket", name:"Phuket Intl", country:"Thailand", region:"HKT", lat:8.11, lon:98.32 },
  { code:"PNH", city:"Phnom Penh", name:"Phnom Penh Intl", country:"Cambodia", region:"PNH", lat:11.55, lon:104.84 },
  { code:"REP", city:"Siem Reap", name:"Siem Reap Intl", country:"Cambodia", region:"REP", lat:13.41, lon:103.81 },
  { code:"RGN", city:"Yangon", name:"Yangon Intl", country:"Myanmar", region:"RGN", lat:16.91, lon:96.13 },
  { code:"KTM", city:"Kathmandu", name:"Tribhuvan Intl", country:"Nepal", region:"KTM", lat:27.70, lon:85.36 },
  { code:"ISB", city:"Islamabad", name:"Islamabad Intl", country:"Pakistan", region:"ISB", lat:33.62, lon:72.83 },
  { code:"KHI", city:"Karachi", name:"Jinnah Intl", country:"Pakistan", region:"KHI", lat:24.91, lon:67.16 },
  { code:"LHE", city:"Lahore", name:"Allama Iqbal Intl", country:"Pakistan", region:"LHE", lat:31.52, lon:74.40 },
  { code:"PEN", city:"Penang", name:"Penang Intl", country:"Malaysia", region:"PEN", lat:5.30, lon:100.26 },
  { code:"SUB", city:"Surabaya", name:"Juanda Intl", country:"Indonesia", region:"SUB", lat:-7.38, lon:112.79 },
  // Middle East (additional)
  { code:"BEY", city:"Beirut", name:"Rafic Hariri Intl", country:"Lebanon", region:"BEY", lat:33.82, lon:35.49 },
  { code:"DMM", city:"Dammam", name:"King Fahd Intl", country:"Saudi Arabia", region:"DMM", lat:26.47, lon:49.80 },
  { code:"MED", city:"Medina", name:"Prince Mohammad Intl", country:"Saudi Arabia", region:"MED", lat:24.55, lon:39.70 },
  // Africa (additional)
  { code:"ABV", city:"Abuja", name:"Nnamdi Azikiwe Intl", country:"Nigeria", region:"ABV", lat:9.01, lon:7.26 },
  { code:"DAR", city:"Dar es Salaam", name:"Julius Nyerere Intl", country:"Tanzania", region:"DAR", lat:-6.88, lon:39.20 },
  { code:"JRO", city:"Kilimanjaro", name:"Kilimanjaro Intl", country:"Tanzania", region:"JRO", lat:-3.43, lon:37.07 },
  { code:"DSS", city:"Dakar", name:"Blaise Diagne Intl", country:"Senegal", region:"DSS", lat:14.67, lon:-17.07 },
  { code:"MRU", city:"Mauritius", name:"SSR Intl Airport", country:"Mauritius", region:"MRU", lat:-20.43, lon:57.68 },
  { code:"TUN", city:"Tunis", name:"Tunis-Carthage", country:"Tunisia", region:"TUN", lat:36.85, lon:10.23 },
  { code:"ALG", city:"Algiers", name:"Houari Boumediene", country:"Algeria", region:"ALG", lat:36.69, lon:3.22 },
  { code:"DUR", city:"Durban", name:"King Shaka Intl", country:"South Africa", region:"DUR", lat:-29.61, lon:31.12 },
  { code:"FIH", city:"Kinshasa", name:"N'djili Intl", country:"DR Congo", region:"FIH", lat:-4.39, lon:15.44 },
  // Americas (additional)
  { code:"YYC", city:"Calgary", name:"Calgary Intl", country:"Canada", region:"YYC", lat:51.11, lon:-114.02 },
  { code:"YEG", city:"Edmonton", name:"Edmonton Intl", country:"Canada", region:"YEG", lat:53.31, lon:-113.58 },
  { code:"YHZ", city:"Halifax", name:"Halifax Stanfield Intl", country:"Canada", region:"YHZ", lat:44.88, lon:-63.51 },
  { code:"YOW", city:"Ottawa", name:"Ottawa Macdonald-Cartier Intl", country:"Canada", region:"YOW", lat:45.32, lon:-75.67 },
  { code:"SJU", city:"San Juan", name:"Luis Muñoz Marín Intl", country:"Puerto Rico", region:"SJU", lat:18.44, lon:-66.00 },
  { code:"NAS", city:"Nassau", name:"Lynden Pindling Intl", country:"Bahamas", region:"NAS", lat:25.04, lon:-77.47 },
  { code:"AUA", city:"Oranjestad", name:"Queen Beatrix Intl", country:"Aruba", region:"AUA", lat:12.50, lon:-70.01 },
  { code:"SXM", city:"Philipsburg", name:"Princess Juliana Intl", country:"Sint Maarten", region:"SXM", lat:18.04, lon:-63.11 },
  { code:"GCM", city:"Grand Cayman", name:"Owen Roberts Intl", country:"Cayman Islands", region:"GCM", lat:19.29, lon:-81.36 },
  { code:"PVR", city:"Puerto Vallarta", name:"Gustavo Díaz Ordaz Intl", country:"Mexico", region:"PVR", lat:20.68, lon:-105.25 },
  { code:"SJD", city:"Los Cabos", name:"Los Cabos Intl", country:"Mexico", region:"SJD", lat:23.15, lon:-109.72 },
  { code:"GDL", city:"Guadalajara", name:"Miguel Hidalgo y Costilla Intl", country:"Mexico", region:"GDL", lat:20.52, lon:-103.31 },
  { code:"GUA", city:"Guatemala City", name:"La Aurora Intl", country:"Guatemala", region:"GUA", lat:14.58, lon:-90.53 },
  { code:"SAL", city:"San Salvador", name:"Óscar Arnulfo Romero Intl", country:"El Salvador", region:"SAL", lat:13.44, lon:-89.06 },
  { code:"MDE", city:"Medellín", name:"José María Córdova Intl", country:"Colombia", region:"MDE", lat:6.16, lon:-75.43 },
  { code:"UIO", city:"Quito", name:"Mariscal Sucre Intl", country:"Ecuador", region:"UIO", lat:-0.13, lon:-78.49 },
  { code:"CCS", city:"Caracas", name:"Simón Bolívar Intl", country:"Venezuela", region:"CCS", lat:10.60, lon:-66.99 },
  { code:"MVD", city:"Montevideo", name:"Carrasco Intl", country:"Uruguay", region:"MVD", lat:-34.84, lon:-56.03 },
  { code:"CUZ", city:"Cusco", name:"Alejandro Velasco Astete Intl", country:"Peru", region:"CUZ", lat:-13.54, lon:-71.94 },
  { code:"BSB", city:"Brasília", name:"Brasília Intl", country:"Brazil", region:"BSB", lat:-15.87, lon:-47.92 },
  { code:"REC", city:"Recife", name:"Guararapes Intl", country:"Brazil", region:"REC", lat:-8.13, lon:-34.92 },
  { code:"SSA", city:"Salvador", name:"Deputado Luís Eduardo Magalhães Intl", country:"Brazil", region:"SSA", lat:-12.91, lon:-38.33 },
  { code:"FOR", city:"Fortaleza", name:"Pinto Martins Intl", country:"Brazil", region:"FOR", lat:-3.78, lon:-38.53 },
  { code:"LPB", city:"La Paz", name:"El Alto Intl", country:"Bolivia", region:"LPB", lat:-16.51, lon:-68.19 },
  { code:"ASU", city:"Asunción", name:"Silvio Pettirossi Intl", country:"Paraguay", region:"ASU", lat:-25.24, lon:-57.52 },
];

const TRANSFER_PARTNERS = [
  { name:"Chase UR", color:"#0c4a6e", short:"Chase" },
  { name:"Amex MR", color:"#006FCF", short:"Amex" },
  { name:"Citi TYP", color:"#003B70", short:"Citi" },
  { name:"Capital One", color:"#D03027", short:"CapOne" },
  { name:"Bilt", color:"#1a1a1a", short:"Bilt" },
];

const SWEET_SPOTS = [
  { id:1, route:"US → Europe", program:"Miles&Smiles", airline:"TK", miles:45000, cabin:"Business", alliance:"Star Alliance", desc:"Turkish Miles&Smiles charges just 45K miles for Star Alliance business class to Europe — one of the lowest redemption rates available.", transfers:["Citi TYP","Capital One","Bilt"], query:"Business class from NYC to Istanbul on Turkish Miles&Smiles", savings:"Save ~$3,500 vs cash" },
  { id:2, route:"US → Japan", program:"Flying Club", airline:"VS", miles:60000, cabin:"First", alliance:"Star Alliance", desc:"Virgin Atlantic lets you book ANA First Class for 60K miles — the cheapest way into the world's best first class cabin.", transfers:["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], query:"First class from NYC to Tokyo on ANA using Virgin Atlantic miles", savings:"Save ~$12,000 vs cash" },
  { id:3, route:"US → Asia", program:"Aeroplan", airline:"AC", miles:75000, cabin:"Business", alliance:"Star Alliance", desc:"Aeroplan offers business class to Asia with flexible stopovers. Add a free stopover in Europe on the way.", transfers:["Chase UR","Amex MR","Capital One","Bilt"], query:"Business class from NYC to Asia on Aeroplan", savings:"Save ~$4,200 vs cash" },
  { id:4, route:"US → Europe", program:"Avios", airline:"BA", miles:13000, cabin:"Economy", alliance:"oneworld", desc:"British Airways Avios offers off-peak short-haul economy from 13K miles — great for quick European hops.", transfers:["Chase UR","Amex MR","Capital One"], query:"Economy flights from NYC to London using Avios", savings:"Save ~$400 vs cash" },
  { id:5, route:"US → Middle East", program:"AAdvantage", airline:"AA", miles:70000, cabin:"Business", alliance:"oneworld", desc:"Book Qatar Qsuites (the world's best business class) using AAdvantage miles for 70K — exceptional value.", transfers:["Citi TYP","Bilt"], query:"Business class from NYC to Doha on Qatar Qsuites using AAdvantage miles", savings:"Save ~$5,800 vs cash" },
  { id:6, route:"US → South America", program:"Flying Blue", airline:"AF", miles:53000, cabin:"Business", alliance:"SkyTeam", desc:"Flying Blue promo awards offer business class to South America from 53K — watch for monthly deals.", transfers:["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], query:"Business class from Miami to São Paulo using Flying Blue miles", savings:"Save ~$2,900 vs cash" },
  { id:7, route:"US → Hawaii", program:"Flying Club", airline:"VS", miles:15000, cabin:"Economy", alliance:"SkyTeam", desc:"Virgin Atlantic lets you book Delta economy to Hawaii for just 15K miles round trip — a steal.", transfers:["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], query:"Economy flights from LAX to Honolulu using Virgin Atlantic miles", savings:"Save ~$450 vs cash" },
  { id:8, route:"US → Australia", program:"Frequent Flyer", airline:"QF", miles:72000, cabin:"Business", alliance:"oneworld", desc:"Qantas classic reward seats offer business class to Australia for 72K miles — book early for availability.", transfers:[], query:"Business class from LAX to Sydney on Qantas", savings:"Save ~$5,100 vs cash" },
];

const DEVALUATIONS = [
  { program:"Flying Blue", airline:"AF", date:"January 2026", desc:"Business class awards to Europe increased ~20%. Economy also saw 10-15% increases on popular transatlantic routes.", severity:"HIGH", color:"#e5384f" },
  { program:"MileagePlus", airline:"UA", date:"December 2025", desc:"United eliminated the Excursionist Perk for new bookings and moved to fully dynamic upgrade pricing.", severity:"HIGH", color:"#e5384f" },
  { program:"SkyMiles", airline:"DL", date:"Ongoing", desc:"Delta operates fully dynamic pricing with no published award chart. Prices fluctuate wildly based on demand.", severity:"HIGH", color:"#e5384f" },
  { program:"Hilton Honors", airline:null, date:"2025", desc:"Top-tier properties jumped from 120K to 250K+ points per night. Standard room redemptions up 30-50%.", severity:"MODERATE", color:"#f5a623" },
  { program:"Flying Club", airline:"VS", date:"2025", desc:"Surcharges on European redemptions increased significantly. Fuel surcharges on BA metal now rival cash fares.", severity:"MODERATE", color:"#f5a623" },
  { program:"AAdvantage", airline:"AA", date:"2025", desc:'Web specials removed. Partner charts show "starting at" pricing — effectively dynamic pricing.', severity:"MODERATE", color:"#f5a623" },
];

const ALLIANCE_COLORS = { "Star Alliance":"#cfb53b", "oneworld":"#e5384f", "SkyTeam":"#003A70", "Independent":"#888", "Budget":"#FF8C00" };

// Airline logo URL — uses pics.avs.io (free, reliable, used by major travel sites)
// Returns a square PNG logo for any IATA airline code
function airlineLogo(code, size=80) {
  return `https://pics.avs.io/${size}/${size}/${code}@2x.png`;
}

// Logo component with fallback to colored code box if image fails
function AirlineLogo({code, color, size=42}) {
  return (
    <div style={{width:size,height:size,borderRadius:size>36?10:8,background:"#f8f9fa",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",border:"1px solid #e8eaef"}}>
      <img
        src={airlineLogo(code, size*2)}
        alt={code}
        style={{width:size-4,height:size-4,objectFit:"contain"}}
        onError={(e)=>{e.target.style.display="none";e.target.parentElement.style.background=color||"#666";e.target.parentElement.style.border="none";e.target.parentElement.innerHTML=`<span style="color:#fff;font-size:${Math.round(size*0.3)}px;font-weight:700;font-family:'IBM Plex Mono',monospace">${code}</span>`;}}
      />
    </div>
  );
}
const AIRCRAFT = ["Boeing 777-300ER","Boeing 787-9 Dreamliner","Airbus A350-900","Airbus A380-800","Boeing 777-200LR","Airbus A330-900neo","Boeing 787-10","Airbus A350-1000"];
const FARE_CLASSES = { Economy:["Y","B","M","H","Q","V","W"], "Premium Economy":["W","P","E","N"], Business:["J","C","D","Z","I"], First:["F","A","P"] };

const EXAMPLE_QUERIES = [
  { text:"Cheapest business class out of NYC on Star Alliance miles" },
  { text:"JFK to Lisbon in business class in April 2026" },
  { text:"Best first class to Tokyo using Amex MR points" },
  { text:"NYC to Doha on Qatar Qsuites using AAdvantage miles" },
  { text:"Cheap economy flights from SFO to Europe" },
  { text:"Business class from LAX to Singapore on any alliance" },
  { text:"First class from Miami to London under 80,000 miles" },
  { text:"Best oneworld business class from Chicago to Asia" },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS & FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const apByCode = c => AIRPORTS.find(a=>a.code===c);
const alByCode = c => AIRLINES.find(a=>a.code===c);

function distMi(a,b) {
  const ap1 = apByCode(a), ap2 = apByCode(b);
  if (!ap1||!ap2) return 4000;
  const R=3959, toR=Math.PI/180;
  const dLat=(ap2.lat-ap1.lat)*toR, dLon=(ap2.lon-ap1.lon)*toR;
  const x = Math.sin(dLat/2)**2 + Math.cos(ap1.lat*toR)*Math.cos(ap2.lat*toR)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

function cpmRating(cpm) {
  if (cpm>=2.0) return {label:"Great Value",color:"#00b4a0",bg:"#e6faf7"};
  if (cpm>=1.5) return {label:"Strong Redemption",color:"#3b9e3b",bg:"#eaf5ea"};
  if (cpm>=1.0) return {label:"Fair",color:"#f5a623",bg:"#fef6e6"};
  return {label:"Pay Cash",color:"#e5384f",bg:"#fdeaed"};
}

function aiRec(cpm) {
  if (cpm>=2.0) return "Outstanding redemption — you're getting exceptional value. Book immediately before this availability disappears.";
  if (cpm>=1.5) return "Solid value — this is a good use of your miles, especially for a premium cabin. Recommended: redeem.";
  if (cpm>=1.0) return "Marginal value — consider whether your miles could unlock better value on a different route or date.";
  return "Pay cash and save your miles for a higher-value redemption. Your points are worth more elsewhere.";
}

// Determine what region an airport belongs to
function airportRegion(code) {
  const a = apByCode(code);
  if (!a) return 0;
  const c = a.country;
  if (c==="US") return US;
  if (["Canada"].includes(c)) return US; // treat Canada as reachable from US carriers
  if (["UK","France","Germany","Netherlands","Italy","Spain","Portugal","Turkey","Greece","Switzerland",
       "Belgium","Austria","Ireland","Poland","Sweden","Denmark","Norway","Finland","Czech Republic",
       "Hungary","Romania","Bulgaria","Croatia","Serbia","Iceland","Latvia","Lithuania","Estonia",
       "Luxembourg"].includes(c)) return EU;
  if (["Japan","China","Taiwan","South Korea","Singapore","Thailand","Malaysia","Indonesia","Philippines",
       "Vietnam","Cambodia","Myanmar","India","Nepal","Pakistan","Sri Lanka","Bangladesh","Uzbekistan",
       "Mongolia","Hong Kong"].includes(c)) return AS;
  if (["UAE","Qatar","Saudi Arabia","Bahrain","Kuwait","Oman","Jordan","Israel","Lebanon","Iraq"].includes(c)) return ME;
  if (["South Africa","Kenya","Ethiopia","Nigeria","Ghana","Morocco","Tanzania","Senegal","Mauritius",
       "Egypt","Tunisia","Algeria","DR Congo"].includes(c)) return AF;
  if (["Brazil","Argentina","Chile","Colombia","Peru","Ecuador","Venezuela","Uruguay","Bolivia","Paraguay"].includes(c)) return SA;
  if (["Mexico","Panama","Costa Rica","Guatemala","El Salvador","Cuba","Dominican Republic","Jamaica",
       "Bahamas","Aruba","Sint Maarten","Cayman Islands","Puerto Rico"].includes(c)) return CA;
  if (["Australia","New Zealand","Fiji","French Polynesia"].includes(c)) return OC;
  return 0;
}

// Check if an airline can plausibly fly a route between two airports
// STRICT RULE: Non-US/EU airlines must fly THROUGH their hub.
// Korean Air flies JFK→ICN and ICN→LHR, never JFK→LHR.
// European airlines fly their hub to US cities (BA: LHR→JFK, not CDG→JFK).
// US Big 3 can fly anywhere they serve. Budget carriers are point-to-point within their region.
function canFlyRoute(al, origCode, destCode) {
  const oReg = airportRegion(origCode);
  const dReg = airportRegion(destCode);
  if (!oReg || !dReg) return false;

  // Same region = domestic route — airline must have DOM_ flag
  // PLUS non-Big-3 airlines must fly through one of their hubs
  // (Hawaiian only flies from HNL, JetBlue from JFK/BOS, etc.)
  if (oReg === dReg) {
    if (oReg === US) {
      if (!(al.routes & DOM_US)) return false;
      // US Big 3 + budget can fly any US domestic
      if (al.code === "UA" || al.code === "AA" || al.code === "DL") return true;
      if (al.type === "budget") return true;
      // Everyone else: at least one end must be their hub
      if (al.hubs && al.hubs.length > 0) {
        return al.hubs.includes(origCode) || al.hubs.includes(destCode);
      }
      return true;
    }
    if (oReg === EU) {
      if (!(al.routes & DOM_EU)) return false;
      if (al.type === "budget") return true; // Ryanair etc fly point-to-point
      if (al.hubs && al.hubs.length > 0) {
        return al.hubs.includes(origCode) || al.hubs.includes(destCode);
      }
      return true;
    }
    if (oReg === AS) {
      if (!(al.routes & DOM_AS)) return false;
      if (al.hubs && al.hubs.length > 0) {
        return al.hubs.includes(origCode) || al.hubs.includes(destCode);
      }
      return true;
    }
    return (al.routes & oReg) > 0;
  }

  // Cross-region: airline must serve BOTH regions
  if (!((al.routes & oReg) > 0 && (al.routes & dReg) > 0)) return false;

  // US BIG 3 — can fly any cross-region route they serve (huge point-to-point networks)
  if (al.code === "UA" || al.code === "AA" || al.code === "DL") return true;

  // BUDGET carriers — point-to-point, use usGates if defined
  if (al.type === "budget" || al.type === "lowcost-longhaul") {
    if (oReg === US && al.usGates && !al.usGates.includes(origCode)) return false;
    if (dReg === US && al.usGates && !al.usGates.includes(destCode)) return false;
    if (al.hubs) {
      const touchesHub = al.hubs.includes(origCode) || al.hubs.includes(destCode);
      if (!touchesHub) {
        const touchesGate = (al.usGates && (al.usGates.includes(origCode) || al.usGates.includes(destCode)));
        if (!touchesGate) return false;
      }
    }
    return true;
  }

  // ── ALL OTHER AIRLINES: Hub-spoke model ──
  // At least ONE end of the flight must be one of the airline's hubs.
  // The OTHER end must be a valid gate for that region.
  // Example: Korean Air hub=ICN → can fly JFK→ICN (JFK is usGate) or ICN→LHR (LHR is euGate)
  //          but NEVER JFK→LHR (neither end is ICN)
  if (!al.hubs || !al.hubs.length) return true; // no hub data = allow

  const origIsHub = al.hubs.includes(origCode);
  const destIsHub = al.hubs.includes(destCode);

  // At least one end must be a hub
  if (!origIsHub && !destIsHub) {
    // Exception: some airlines operate gateway-to-gateway within their home region
    // E.g., BA flies LHR→JFK and LGW→JFK — both hubs to US gates
    // But BA would never fly CDG→JFK (CDG isn't their hub)
    // For European airlines with multiple hubs, check if origin is a hub for EU→US
    return false;
  }

  // If origin is hub → dest must be a valid gate for its region
  if (origIsHub) {
    if (dReg === US && al.usGates) return al.usGates.includes(destCode);
    if (dReg === EU && al.euGates) return al.euGates.includes(destCode);
    return true; // hub → other region, allow (e.g., ICN → BKK)
  }

  // If dest is hub → origin must be a valid gate for its region
  if (destIsHub) {
    if (oReg === US && al.usGates) return al.usGates.includes(origCode);
    if (oReg === EU && al.euGates) return al.euGates.includes(origCode);
    return true;
  }

  return false;
}

function generateFlights(parsed) {
  const origins = parsed.origins||["JFK"];
  const dests = parsed.destinations||["LHR"];
  const cabin = parsed.cabin||"Economy";
  const alliance = parsed.alliance||"any";
  const maxMiles = parsed.maxMiles||null;
  const includeBudget = parsed.includeBudget!==false;
  // Date window from parser
  const dw = parsed.dateWindow || {};
  const dateStart = dw.start || new Date(Date.now()+7*864e5);
  const dateEnd = dw.end || new Date(Date.now()+90*864e5);
  const dateSpanMs = Math.max(dateEnd.getTime()-dateStart.getTime(), 864e5); // at least 1 day

  let airlines = AIRLINES.filter(a => {
    if (alliance==="any") return true;
    return a.alliance.toLowerCase()===alliance.toLowerCase();
  });
  if (!includeBudget) airlines = airlines.filter(a => a.type!=="budget" && a.type!=="lowcost-longhaul");
  if (parsed.program) {
    const p = parsed.program.toLowerCase();
    const m = AIRLINES.find(a => a.program&&a.program.toLowerCase().includes(p)||a.name.toLowerCase().includes(p));
    if (m) airlines = [m, ...airlines.filter(a=>a.code!==m.code)];
  }
  if (!airlines.length) airlines = AIRLINES.filter(a=>a.type==="full-service");

  const results = [];
  const target = rand(10,16);
  let att = 0;
  while (results.length < target && att < target*8) {
    att++;
    const al = airlines[att % airlines.length];
    const orig = pick(origins);
    const dest = pick(dests);
    if (orig===dest) continue;

    // CORE FIX: Check if this airline realistically flies this route
    if (!canFlyRoute(al, orig, dest)) continue;

    const dist = distMi(orig,dest);
    // Budget airlines: economy only, shorter routes only
    if (al.type==="budget") {
      if (cabin!=="Economy" && cabin!=="Premium Economy") continue;
      if (dist > 3500) continue;
    }
    // Low-cost long-haul: economy + premium economy, longer routes OK
    if (al.type==="lowcost-longhaul") {
      if (cabin==="First") continue;
      if (dist < 2000) continue; // they only fly long-haul
    }

    // REALISTIC deal pricing — competitive but believable
    // Real one-way benchmarks (what you'd actually find on sale):
    //   Economy SFO→Europe: $280-$450 | NYC→London: $250-$400 | Domestic: $49-$180
    //   Business SFO→Europe: $900-$1800 | NYC→London: $700-$1400
    //   LCC one-way: French Bee SFO→Paris $249, Norse JFK→London $129, PLAY $99 to Iceland
    const isDeal = Math.random() < 0.5; // 50% of results are deal-priced
    const isLCC = al.type==="budget" || al.type==="lowcost-longhaul";
    let cash, milesLo, milesHi;
    if (cabin==="Economy") {
      if (isLCC) {
        cash = Math.round(dist * rand(0.03, 0.05));
      } else if (isDeal) {
        cash = Math.round(dist * rand(0.04, 0.06));
      } else {
        cash = Math.round(dist * rand(0.05, 0.075));
      }
      // Realistic minimums by distance
      if (dist < 1000) cash = Math.max(cash, 49);
      else if (dist < 3000) cash = Math.max(cash, 89);
      else if (dist < 5000) cash = Math.max(cash, 199);
      else cash = Math.max(cash, 259);
      // REALISTIC CAPS — economy one-way fares
      // Domestic: $49-$350 | Transatlantic: $200-$600 | Ultra long: $300-$900
      if (dist < 1500) cash = Math.min(cash, 350);
      else if (dist < 3500) cash = Math.min(cash, 450);
      else if (dist < 5500) cash = Math.min(cash, 650);
      else if (dist < 8000) cash = Math.min(cash, 800);
      else cash = Math.min(cash, 950);
    } else if (cabin==="Premium Economy") {
      if (isLCC) {
        cash = Math.round(dist * rand(0.05, 0.07));
      } else if (isDeal) {
        cash = Math.round(dist * rand(0.06, 0.085));
      } else {
        cash = Math.round(dist * rand(0.075, 0.11));
      }
      if (dist < 1000) cash = Math.max(cash, 79);
      else if (dist < 3000) cash = Math.max(cash, 149);
      else if (dist < 5000) cash = Math.max(cash, 299);
      else cash = Math.max(cash, 399);
      // Caps
      if (dist < 1500) cash = Math.min(cash, 500);
      else if (dist < 3500) cash = Math.min(cash, 700);
      else if (dist < 5500) cash = Math.min(cash, 1000);
      else cash = Math.min(cash, 1400);
    } else if (cabin==="Business") {
      if (isLCC) {
        cash = Math.round(dist * rand(0.10, 0.16));
      } else if (isDeal) {
        cash = Math.round(dist * rand(0.12, 0.22));
      } else {
        cash = Math.round(dist * rand(0.18, 0.32));
      }
      // Domestic business: $249+ short, $349+ medium. Intl: $699+ transatlantic, $999+ ultra
      if (dist < 1000) cash = Math.max(cash, 249);
      else if (dist < 2000) cash = Math.max(cash, 349);
      else if (dist < 3500) cash = Math.max(cash, 499);
      else if (dist < 5000) cash = Math.max(cash, 799);
      else if (dist < 7000) cash = Math.max(cash, 999);
      else cash = Math.max(cash, 1199);
      // Caps
      if (dist < 1500) cash = Math.min(cash, 700);
      else if (dist < 3500) cash = Math.min(cash, 1800);
      else if (dist < 6000) cash = Math.min(cash, 3500);
      else cash = Math.min(cash, 5500);
    } else {
      // First class
      if (isDeal) {
        cash = Math.round(dist * rand(0.15, 0.25));
      } else {
        cash = Math.round(dist * rand(0.22, 0.38));
      }
      if (dist < 1000) cash = Math.max(cash, 499);
      else if (dist < 3000) cash = Math.max(cash, 799);
      else if (dist < 5000) cash = Math.max(cash, 1499);
      else cash = Math.max(cash, 1999);
      // Caps
      if (dist < 3000) cash = Math.min(cash, 2500);
      else if (dist < 6000) cash = Math.min(cash, 6000);
      else cash = Math.min(cash, 9000);
    }

    // Miles based on real award charts — skewed toward sweet spots and deals
    // Real deals: ANA 55K J to Japan, Turkish 45K J to Europe, Virgin 30K PE to London
    if (dist < 1500) {
      milesLo = cabin==="Economy"?4500:cabin==="Premium Economy"?7500:cabin==="Business"?8000:15000;
      milesHi = cabin==="Economy"?12500:cabin==="Premium Economy"?15000:cabin==="Business"?20000:35000;
    } else if (dist < 4000) {
      milesLo = cabin==="Economy"?7500:cabin==="Premium Economy"?12500:cabin==="Business"?15000:25000;
      milesHi = cabin==="Economy"?22500:cabin==="Premium Economy"?30000:cabin==="Business"?45000:65000;
    } else if (dist < 7000) {
      // Transatlantic sweet spot — your 35K business PRG→JFK deal lives here
      milesLo = cabin==="Economy"?12500:cabin==="Premium Economy"?18000:cabin==="Business"?22000:35000;
      milesHi = cabin==="Economy"?30000:cabin==="Premium Economy"?40000:cabin==="Business"?55000:80000;
    } else {
      // Ultra long-haul — ANA 55K business to Japan, etc.
      milesLo = cabin==="Economy"?17500:cabin==="Premium Economy"?25000:cabin==="Business"?30000:42000;
      milesHi = cabin==="Economy"?37500:cabin==="Premium Economy"?47500:cabin==="Business"?65000:95000;
    }

    const miles = (al.type==="budget" || al.type==="lowcost-longhaul") ? null : Math.round(rand(milesLo,milesHi)/500)*500;
    if (maxMiles && miles && miles > maxMiles) continue;
    const isLowCost = al.type==="budget" || al.type==="lowcost-longhaul";
    const fees = isLowCost ? 0 : Math.round(rand(22,160));
    if (al.type==="budget") cash = Math.round(rand(Math.max(29,dist*0.03), Math.max(59,dist*0.09)));
    const cpm = miles ? +((cash-fees)/miles*100).toFixed(1) : null;
    if (cpm && cpm < 0.3) continue;
    const stops = dist<1500?rand(0,1):dist<4000?rand(0,2):rand(0,2);
    const hrs = dist/480 + stops*2.2;
    const depH = rand(6,22), depM = pick([0,10,15,20,25,30,35,40,45,50,55]);
    const arrH = (depH+Math.floor(hrs))%24;
    const arrM = Math.round((hrs%1)*60)%60;
    const nextDay = depH+hrs>=24;
    const seats = rand(1,9);
    const fc = FARE_CLASSES[cabin]||FARE_CLASSES.Economy;
    const hasDeval = DEVALUATIONS.some(d=>d.airline===al.code);

    // Generate a departure date within the parsed date window
    const depDate = new Date(dateStart.getTime() + Math.random()*dateSpanMs);
    const arrDate = new Date(depDate.getTime() + Math.round(hrs*3600000));
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const depDateStr = `${DAYS[depDate.getDay()]}, ${MONTHS[depDate.getMonth()]} ${depDate.getDate()}`;
    const arrDateStr = depDate.toDateString()===arrDate.toDateString() ? null : `${DAYS[arrDate.getDay()]}, ${MONTHS[arrDate.getMonth()]} ${arrDate.getDate()}`;

    results.push({
      id:`fl-${results.length}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      airline:al, origin:orig, destination:dest, cabin, miles, fees, cash, cpm, stops,
      duration:`${Math.floor(hrs)}h ${Math.round((hrs%1)*60)}m`,
      durationMin:Math.round(hrs*60),
      depTime:`${String(depH).padStart(2,"0")}:${String(depM).padStart(2,"0")}`,
      arrTime:`${String(arrH).padStart(2,"0")}:${String(arrM).padStart(2,"0")}${nextDay?" +1":""}`,
      depDate: depDateStr, arrDate: arrDateStr, depDateObj: depDate,
      aircraft:pick(AIRCRAFT), fareClass:pick(fc), seats,
      nonstop:stops===0, hasDevaluation:hasDeval,
      devaluation:hasDeval?DEVALUATIONS.find(d=>d.airline===al.code):null,
    });
  }
  // ── SELF-TRANSFER CONNECTIONS ──
  // Generate connecting itineraries: Leg1 airline flies orig→hub, Leg2 airline flies hub→dest
  // Each airline must ACTUALLY serve that hub (it's in their hubs[] or gates[])
  // Minimum 200mi per leg to avoid absurd 3-minute flights
  const CONNECT_HUBS = ["JFK","EWR","ORD","LAX","SFO","ATL","DFW","IAH","MIA","SEA","BOS","IAD","DEN","LHR","CDG","AMS","FRA","IST","DXB","DOH"];

  {
    const selfTransferTarget = results.length < 6 ? Math.max(3, 8 - results.length) : rand(2, 3);
    let stAtt = 0;
    while (results.filter(r=>r.selfTransfer).length < selfTransferTarget && stAtt < selfTransferTarget * 20) {
      stAtt++;
      const orig = pick(origins);
      const dest = pick(dests);
      if (orig === dest) continue;

      const oReg = airportRegion(orig);
      const dReg = airportRegion(dest);
      // For US→EU: connect through a US hub (fly domestic leg then transatlantic leg)
      // For US→US: connect through a US hub
      const possibleHubs = CONNECT_HUBS.filter(h => {
        if (h === orig || h === dest) return false;
        const hReg = airportRegion(h);
        if (oReg === US && dReg === EU) return hReg === US; // US hub for connection
        if (oReg === EU && dReg === US) return hReg === US;
        if (oReg === US && dReg === US) return hReg === US;
        if (oReg === EU && dReg === EU) return hReg === EU;
        if (oReg === US && dReg === AS) return hReg === US;
        if (oReg === US && dReg === ME) return hReg === US;
        return hReg === US || hReg === EU;
      });
      if (!possibleHubs.length) continue;
      const hub = pick(possibleHubs);

      // Each leg must be 200+ miles (no 3-minute flights!)
      const dist1Check = distMi(orig, hub);
      const dist2Check = distMi(hub, dest);
      if (dist1Check < 200 || dist2Check < 200) continue;

      // Find airlines that ACTUALLY serve this route
      // Extra validation: airline must genuinely connect to the hub (not just DOM_EU pass-through)
      const leg1Airlines = airlines.filter(a => {
        if (!canFlyRoute(a, orig, hub)) return false;
        // Airline must actually serve the hub — check hubs[], usGates[], or be US Big 3
        if (a.code === "UA" || a.code === "AA" || a.code === "DL") return true;
        if (a.hubs && a.hubs.includes(hub)) return true;
        if (a.usGates && a.usGates.includes(hub)) return true;
        if (a.usGates && a.usGates.includes(orig)) return true;
        if (a.type === "budget" && airportRegion(orig) === airportRegion(hub)) return true;
        return false;
      });
      const leg2Airlines = airlines.filter(a => {
        if (!canFlyRoute(a, hub, dest)) return false;
        if (a.code === "UA" || a.code === "AA" || a.code === "DL") return true;
        if (a.hubs && a.hubs.includes(hub)) return true;
        if (a.usGates && a.usGates.includes(hub)) return true;
        if (a.usGates && a.usGates.includes(dest)) return true;
        if (a.type === "budget" && airportRegion(hub) === airportRegion(dest)) return true;
        return false;
      });
      if (!leg1Airlines.length || !leg2Airlines.length) continue;

      const al1 = pick(leg1Airlines);
      const al2 = pick(leg2Airlines);

      // Skip if both legs are same airline (that's a normal connection, not self-transfer)
      const isSelfTransfer = al1.code !== al2.code;

      const dist1 = distMi(orig, hub);
      const dist2 = distMi(hub, dest);
      const totalDist = dist1 + dist2;

      // Price each leg independently — self-transfers are cheaper because you're buying 2 separate tickets
      const priceLeg = (dist, al) => {
        const isLCC = al.type === "budget" || al.type === "lowcost-longhaul";
        let c;
        if (cabin === "Economy") {
          c = isLCC ? Math.round(dist * rand(0.025, 0.045)) : Math.round(dist * rand(0.035, 0.06));
          if (dist < 1000) c = Math.max(c, 39);
          else if (dist < 3000) c = Math.max(c, 69);
          else if (dist < 5000) c = Math.max(c, 159);
          else c = Math.max(c, 219);
          // Self-transfer legs should be cheap — that's the whole point
          if (dist < 1500) c = Math.min(c, 250);
          else if (dist < 3500) c = Math.min(c, 400);
          else if (dist < 6000) c = Math.min(c, 550);
          else c = Math.min(c, 700);
        } else if (cabin === "Premium Economy") {
          c = Math.round(dist * rand(0.05, 0.085));
          if (dist < 1000) c = Math.max(c, 69);
          else if (dist < 3000) c = Math.max(c, 119);
          else c = Math.max(c, 279);
          if (dist < 3000) c = Math.min(c, 500);
          else c = Math.min(c, 900);
        } else if (cabin === "Business") {
          c = Math.round(dist * rand(0.10, 0.18));
          if (dist < 1000) c = Math.max(c, 199);
          else if (dist < 3000) c = Math.max(c, 349);
          else c = Math.max(c, 699);
          if (dist < 3000) c = Math.min(c, 1200);
          else c = Math.min(c, 2500);
        } else {
          c = Math.round(dist * rand(0.18, 0.32));
          c = Math.max(c, 499);
          c = Math.min(c, 4000);
        }
        return c;
      };

      const cash1 = priceLeg(dist1, al1);
      const cash2 = priceLeg(dist2, al2);
      const totalCash = cash1 + cash2;

      // Layover time at hub (1.5-4 hours for self-transfer — need to reclaim bags)
      const layoverHrs = rand(1.5, 4);
      const leg1Hrs = dist1 / 480;
      const leg2Hrs = dist2 / 480;
      const totalHrs = leg1Hrs + layoverHrs + leg2Hrs;

      const depH = rand(6, 20);
      const depM = pick([0, 15, 30, 45]);
      const arrTotalMin = Math.round(totalHrs * 60);
      const arrH = (depH + Math.floor(totalHrs)) % 24;
      const arrM = Math.round((totalHrs % 1) * 60) % 60;
      const nextDay = depH + totalHrs >= 24;

      const depDate = new Date(dateStart.getTime() + Math.random() * dateSpanMs);
      const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const depDateStr = `${DAYS[depDate.getDay()]}, ${MONTHS[depDate.getMonth()]} ${depDate.getDate()}`;

      // Miles for self-transfer (sum of both legs if applicable)
      const miles1 = (al1.type === "budget" || al1.type === "lowcost-longhaul") ? null : Math.round(rand(4500, 25000) / 500) * 500;
      const miles2 = (al2.type === "budget" || al2.type === "lowcost-longhaul") ? null : Math.round(rand(4500, 30000) / 500) * 500;
      const totalMiles = (miles1 && miles2) ? miles1 + miles2 : null;
      const fees = totalMiles ? Math.round(rand(22, 120)) : 0;
      const cpm = totalMiles ? +((totalCash - fees) / totalMiles * 100).toFixed(1) : null;

      results.push({
        id: `st-${results.length}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        airline: al1, // primary display airline (first leg)
        airline2: al2, // second leg airline
        origin: orig, destination: dest, cabin,
        miles: totalMiles, fees, cash: totalCash, cpm,
        stops: 1,
        connectingHub: hub,
        leg1: { airline: al1, origin: orig, destination: hub, cash: cash1, dist: dist1, duration: `${Math.floor(leg1Hrs)}h ${Math.round((leg1Hrs % 1) * 60)}m` },
        leg2: { airline: al2, origin: hub, destination: dest, cash: cash2, dist: dist2, duration: `${Math.floor(leg2Hrs)}h ${Math.round((leg2Hrs % 1) * 60)}m` },
        layover: `${Math.floor(layoverHrs)}h ${Math.round((layoverHrs % 1) * 60)}m`,
        selfTransfer: isSelfTransfer,
        duration: `${Math.floor(totalHrs)}h ${Math.round((totalHrs % 1) * 60)}m`,
        durationMin: Math.round(totalHrs * 60),
        depTime: `${String(depH).padStart(2, "0")}:${String(depM).padStart(2, "0")}`,
        arrTime: `${String(arrH).padStart(2, "0")}:${String(arrM).padStart(2, "0")}${nextDay ? " +1" : ""}`,
        depDate: depDateStr, arrDate: null, depDateObj: depDate,
        aircraft: pick(AIRCRAFT), fareClass: pick(FARE_CLASSES[cabin] || FARE_CLASSES.Economy),
        seats: rand(1, 9), nonstop: false,
        hasDevaluation: false, devaluation: null,
      });
    }
  }

  // Sort by price (cash), cheapest first
  results.sort((a, b) => (a.cash || 999999) - (b.cash || 999999));

  // ── ROUND TRIP: Generate return flights ──
  if (parsed.roundTrip && parsed.dateWindow?.returnStart) {
    const returnParsed = {
      ...parsed,
      origins: parsed.destinations,
      destinations: parsed.origins,
      dateWindow: {
        start: parsed.dateWindow.returnStart,
        end: parsed.dateWindow.returnEnd || new Date(parsed.dateWindow.returnStart.getTime() + 2 * 864e5),
      },
      roundTrip: false, // prevent infinite recursion
    };
    const returnFlights = generateFlights(returnParsed);
    // Tag all return flights
    returnFlights.forEach(f => { f.isReturn = true; f.id = "ret-" + f.id; });
    // Tag outbound flights
    results.forEach(f => { f.isReturn = false; });
    return [...results, ...returnFlights];
  }

  results.forEach(f => { f.isReturn = false; });
  return results;
}

// City/region → airport code mappings for smart fallback parsing
const CITY_MAP = {
  // US Origins — major metros
  "nyc":["JFK","EWR","LGA"],"new york":["JFK","EWR","LGA"],"newark":["EWR"],"lax":["LAX"],"los angeles":["LAX"],"sfo":["SFO"],"san francisco":["SFO"],"bay area":["SFO","OAK","SJC"],"ord":["ORD"],"chicago":["ORD","MDW"],"mia":["MIA"],"miami":["MIA"],"bos":["BOS"],"boston":["BOS"],"atl":["ATL"],"atlanta":["ATL"],"sea":["SEA"],"seattle":["SEA"],"dfw":["DFW"],"dallas":["DFW","DAL"],"iad":["IAD"],"dca":["DCA"],"dc":["IAD","DCA"],"washington":["IAD","DCA"],"iah":["IAH"],"houston":["IAH","HOU"],"den":["DEN"],"denver":["DEN"],"phx":["PHX"],"phoenix":["PHX"],"hnl":["HNL"],"honolulu":["HNL"],"hawaii":["HNL","OGG","KOA"],"las":["LAS"],"vegas":["LAS"],"las vegas":["LAS"],"msp":["MSP"],"minneapolis":["MSP"],"dtw":["DTW"],"detroit":["DTW"],"clt":["CLT"],"charlotte":["CLT"],"phl":["PHL"],"philadelphia":["PHL"],"philly":["PHL"],"msy":["MSY"],"new orleans":["MSY"],"nola":["MSY"],"stl":["STL"],"st louis":["STL"],"mco":["MCO"],"orlando":["MCO"],"fll":["FLL"],"fort lauderdale":["FLL"],"tpa":["TPA"],"tampa":["TPA"],"slc":["SLC"],"salt lake":["SLC"],"salt lake city":["SLC"],"pdx":["PDX"],"portland":["PDX"],"aus":["AUS"],"austin":["AUS"],"bna":["BNA"],"nashville":["BNA"],"rdu":["RDU"],"raleigh":["RDU"],"durham":["RDU"],"pit":["PIT"],"pittsburgh":["PIT"],"pittsburg":["PIT"],"san diego":["SAN"],"san antonio":["SAT"],
  // US — secondary cities
  "baltimore":["BWI"],"bwi":["BWI"],"sacramento":["SMF"],"oakland":["OAK"],"san jose":["SJC"],"burbank":["BUR"],"santa ana":["SNA"],"orange county":["SNA"],"john wayne":["SNA"],"ontario":["ONT"],"fort myers":["RSW"],"west palm beach":["PBI"],"palm beach":["PBI"],"jacksonville":["JAX"],"jax":["JAX"],"memphis":["MEM"],"indianapolis":["IND"],"indy":["IND"],"columbus":["CMH"],"cleveland":["CLE"],"cincinnati":["CVG"],"milwaukee":["MKE"],"albuquerque":["ABQ"],"boise":["BOI"],"anchorage":["ANC"],"alaska":["ANC"],"maui":["OGG"],"kona":["KOA"],
  // US — smaller but common destinations
  "savannah":["SAV"],"charleston":["CHS"],"myrtle beach":["MYR"],"key west":["EYW"],"pensacola":["PNS"],"destin":["VPS"],"panama city beach":["ECP"],"sarasota":["SRQ"],"daytona":["DAB"],"hilton head":["HHH"],"asheville":["AVL"],"knoxville":["TYS"],"lexington":["LEX"],"louisville":["SDF"],"richmond":["RIC"],"norfolk":["ORF"],"virginia beach":["ORF"],"buffalo":["BUF"],"rochester":["ROC"],"syracuse":["SYR"],"albany":["ALB"],"hartford":["BDL"],"providence":["PVD"],"portland maine":["PWM"],"burlington":["BTV"],"omaha":["OMA"],"kansas city":["MCI"],"kc":["MCI"],"des moines":["DSM"],"madison":["MSN"],"grand rapids":["GRR"],"tucson":["TUS"],"el paso":["ELP"],"reno":["RNO"],"spokane":["GEG"],"bozeman":["BZN"],"jackson hole":["JAC"],"aspen":["ASE"],"vail":["EGE"],"palm springs":["PSP"],"santa barbara":["SBA"],"monterey":["MRY"],"fresno":["FAT"],"bakersfield":["BFL"],"little rock":["LIT"],"oklahoma city":["OKC"],"tulsa":["TUL"],"wichita":["ICT"],"birmingham":["BHM"],"huntsville":["HSV"],"mobile":["MOB"],"greenville":["GSP"],"columbia":["CAE"],"wilmington":["ILM"],"fayetteville":["XNA"],"northwest arkansas":["XNA"],"bentonville":["XNA"],"harrisburg":["MDT"],"scranton":["AVP"],"pittsfield":["PIT"],"south bend":["SBN"],"sioux falls":["FSD"],"fargo":["FAR"],"bismarck":["BIS"],"rapid city":["RAP"],"missoula":["MSO"],"billings":["BIL"],"eugene":["EUG"],"bend":["RDM"],"redmond":["RDM"],"bellingham":["BLI"],"santa fe":["SAF"],"colorado springs":["COS"],"steamboat springs":["HDN"],"sun valley":["SUN"],"martha's vineyard":["MVY"],"nantucket":["ACK"],"cape cod":["HYA"],
  // US — state names → major airports in that state
  "florida":["MIA","FLL","TPA","MCO","JAX"],"california":["LAX","SFO","SAN","SNA","OAK","SJC","SMF"],"texas":["DFW","IAH","AUS","SAT","HOU","ELP"],"new jersey":["EWR"],"jersey":["EWR"],"connecticut":["BDL"],"massachusetts":["BOS"],"georgia":["ATL"],"illinois":["ORD","MDW"],"pennsylvania":["PHL","PIT"],"ohio":["CLE","CMH","CVG"],"michigan":["DTW","GRR"],"minnesota":["MSP"],"colorado":["DEN","COS","ASE"],"arizona":["PHX","TUS"],"nevada":["LAS","RNO"],"oregon":["PDX","EUG"],"tennessee":["BNA","MEM","TYS"],"north carolina":["CLT","RDU","GSP"],"south carolina":["CHS","MYR","CAE"],"virginia":["IAD","DCA","RIC","ORF"],"maryland":["BWI"],"louisiana":["MSY"],"missouri":["STL","MCI"],"wisconsin":["MKE","MSN"],"indiana":["IND"],"kentucky":["SDF","CVG","LEX"],"alabama":["BHM","HSV","MOB"],"oklahoma":["OKC","TUL"],"arkansas":["LIT","XNA"],"utah":["SLC"],"idaho":["BOI"],"montana":["BZN","MSO","BIL"],"wyoming":["JAC"],"new mexico":["ABQ","SAF"],"north dakota":["FAR","BIS"],"south dakota":["FSD","RAP"],"nebraska":["OMA"],"iowa":["DSM"],"mississippi":["JAN"],"maine":["PWM"],"vermont":["BTV"],"rhode island":["PVD"],"new hampshire":["MHT"],"west virginia":["CRW"],
  // US — common airport name aliases
  "jfk":["JFK"],"kennedy":["JFK"],"laguardia":["LGA"],"la guardia":["LGA"],"ohare":["ORD"],"o'hare":["ORD"],"midway":["MDW"],"dulles":["IAD"],"reagan":["DCA"],"national":["DCA"],"hobby":["HOU"],"love field":["DAL"],"logan":["BOS"],"sky harbor":["PHX"],"hartsfield":["ATL"],"seatac":["SEA"],"sea-tac":["SEA"],
  // US — region/area slang
  "east coast":["JFK","BOS","PHL","DCA","MIA","ATL"],"west coast":["LAX","SFO","SEA","PDX","SAN"],"midwest":["ORD","DTW","MSP","STL","MCI","CLE"],"south":["ATL","MIA","DFW","IAH","BNA","MSY"],"northeast":["JFK","BOS","PHL","DCA","BWI"],"southeast":["ATL","MIA","CLT","TPA","MCO"],"southwest":["PHX","LAS","DEN","AUS","DFW"],"pacific northwest":["SEA","PDX"],"pnw":["SEA","PDX"],"socal":["LAX","SNA","SAN","ONT","BUR"],"norcal":["SFO","OAK","SJC","SMF"],"tri-state":["JFK","EWR","LGA"],"tristate":["JFK","EWR","LGA"],
  // Europe
  "london":["LHR","LGW"],"lhr":["LHR"],"england":["LHR","LGW","MAN"],"uk":["LHR","LGW","MAN","EDI"],"united kingdom":["LHR","LGW","MAN","EDI"],"britain":["LHR","LGW","MAN","EDI"],"paris":["CDG","ORY"],"cdg":["CDG"],"france":["CDG","ORY","LYS","MRS","NCE"],"frankfurt":["FRA"],"germany":["FRA","MUC","BER"],"amsterdam":["AMS"],"netherlands":["AMS"],"holland":["AMS"],"rome":["FCO"],"italy":["FCO","MXP","VCE","NAP"],"barcelona":["BCN"],"spain":["MAD","BCN","AGP","PMI"],"lisbon":["LIS"],"portugal":["LIS","OPO"],"istanbul":["IST","SAW"],"turkey":["IST","SAW","AYT"],"athens":["ATH"],"greece":["ATH","JTR","HER","CFU","SKG"],"zurich":["ZRH"],"switzerland":["ZRH","GVA"],"geneva":["GVA"],"madrid":["MAD"],"munich":["MUC"],"brussels":["BRU"],"belgium":["BRU"],"vienna":["VIE"],"austria":["VIE","SZG"],"dublin":["DUB"],"ireland":["DUB"],"warsaw":["WAW"],"poland":["WAW","KRK","GDN","WRO"],"krakow":["KRK"],"stockholm":["ARN"],"sweden":["ARN"],"copenhagen":["CPH"],"denmark":["CPH"],"oslo":["OSL"],"norway":["OSL","BGO"],"helsinki":["HEL"],"finland":["HEL"],"prague":["PRG"],"czech republic":["PRG"],"czechia":["PRG"],"budapest":["BUD"],"hungary":["BUD"],"bucharest":["OTP"],"romania":["OTP"],"berlin":["BER"],"milan":["MXP","BGY"],"naples":["NAP"],"venice":["VCE"],"nice":["NCE"],"edinburgh":["EDI"],"manchester":["MAN"],"bergen":["BGO"],"reykjavik":["KEF"],"iceland":["KEF"],"scotland":["EDI","GLA"],"lyon":["LYS"],"marseille":["MRS"],"split":["SPU"],"croatia":["ZAG","SPU","DBV"],"dubrovnik":["DBV"],"riga":["RIX"],"latvia":["RIX"],"vilnius":["VNO"],"lithuania":["VNO"],"tallinn":["TLL"],"estonia":["TLL"],"glasgow":["GLA"],"antalya":["AYT"],"salzburg":["SZG"],"tenerife":["TFS"],"seville":["SVQ"],"porto":["OPO"],"thessaloniki":["SKG"],"santorini":["JTR"],"corfu":["CFU"],"crete":["HER"],"heraklion":["HER"],"palma":["PMI"],"mallorca":["PMI"],"malaga":["AGP"],"sicily":["CTA","PMO"],"catania":["CTA"],"palermo":["PMO"],"sofia":["SOF"],"bulgaria":["SOF"],"zagreb":["ZAG"],"belgrade":["BEG"],"serbia":["BEG"],"gdansk":["GDN"],"wroclaw":["WRO"],"mykonos":["JMK"],"mikonos":["JMK"],"rhodes":["RHO"],"europe":["LHR","CDG","FRA","AMS","FCO","BCN","LIS","MAD","MUC","VIE","PRG","BER","DUB"],"western europe":["LHR","CDG","FRA","AMS","FCO","BCN","MAD"],"eastern europe":["PRG","BUD","WAW","OTP","BEG","SOF","ZAG"],"scandinavia":["ARN","CPH","OSL","HEL"],"nordic":["ARN","CPH","OSL","HEL","KEF"],"baltics":["RIX","VNO","TLL"],"balkans":["ATH","BEG","SOF","ZAG","DBV"],
  // Asia — with common typos and alternate names
  "tokyo":["NRT","HND"],"japan":["NRT","HND","KIX"],"osaka":["KIX"],"fukuoka":["FUK"],"sapporo":["CTS"],"singapore":["SIN"],"hong kong":["HKG"],"hongkong":["HKG"],"seoul":["ICN"],"korea":["ICN"],"south korea":["ICN"],"bangkok":["BKK"],"thailand":["BKK","CNX","HKT"],"phuket":["HKT"],"chiang mai":["CNX"],"dubai":["DXB"],"uae":["DXB","AUH"],"emirates":["DXB"],"doha":["DOH"],"qatar":["DOH"],"sydney":["SYD"],"australia":["SYD","MEL","BNE"],"melbourne":["MEL"],"brisbane":["BNE"],"perth":["PER"],"delhi":["DEL"],"new delhi":["DEL"],"india":["DEL","BOM","BLR"],"mumbai":["BOM"],"bombay":["BOM"],"bangalore":["BLR"],"bengaluru":["BLR"],"hyderabad":["HYD"],"chennai":["MAA"],"kochi":["COK"],"taipei":["TPE"],"taiwan":["TPE"],"shanghai":["PVG","SHA"],"beijing":["PEK"],"peking":["PEK"],"china":["PVG","PEK","CAN"],"guangzhou":["CAN"],"shenzhen":["SZX"],"hangzhou":["HGH"],"kuala lumpur":["KUL"],"kl":["KUL"],"malaysia":["KUL","PEN"],"jakarta":["CGK"],"bali":["DPS"],"indonesia":["CGK","DPS"],"manila":["MNL"],"philippines":["MNL","CEB"],"cebu":["CEB"],"ho chi minh":["SGN"],"saigon":["SGN"],"hanoi":["HAN"],"vietnam":["SGN","HAN","DAD"],"da nang":["DAD"],"cambodia":["PNH","REP"],"phnom penh":["PNH"],"siem reap":["REP"],"yangon":["RGN"],"myanmar":["RGN"],"burma":["RGN"],"nepal":["KTM"],"kathmandu":["KTM"],"pakistan":["ISB","KHI","LHE"],"islamabad":["ISB"],"karachi":["KHI"],"lahore":["LHE"],"colombo":["CMB"],"sri lanka":["CMB"],"maldives":["MLE"],"asia":["NRT","HND","SIN","HKG","ICN","BKK","DEL","TPE","KUL"],"southeast asia":["BKK","SIN","KUL","SGN","MNL","CGK","DPS"],"se asia":["BKK","SIN","KUL","SGN","MNL"],
  // Middle East
  "abu dhabi":["AUH"],"bahrain":["BAH"],"kuwait":["KWI"],"muscat":["MCT"],"oman":["MCT"],"amman":["AMM"],"jordan":["AMM"],"tel aviv":["TLV"],"israel":["TLV"],"jeddah":["JED"],"riyadh":["RUH"],"saudi":["JED","RUH"],"saudi arabia":["JED","RUH"],"beirut":["BEY"],"lebanon":["BEY"],"iraq":["BGW"],"baghdad":["BGW"],"middle east":["DXB","DOH","AUH","JED","RUH"],
  // Africa
  "cairo":["CAI"],"egypt":["CAI"],"cape town":["CPT"],"johannesburg":["JNB"],"south africa":["JNB","CPT","DUR"],"nairobi":["NBO"],"kenya":["NBO"],"addis ababa":["ADD"],"ethiopia":["ADD"],"lagos":["LOS"],"nigeria":["LOS","ABV"],"accra":["ACC"],"ghana":["ACC"],"casablanca":["CMN"],"morocco":["CMN"],"dar es salaam":["DAR"],"tanzania":["DAR","JRO"],"kilimanjaro":["JRO"],"dakar":["DSS"],"senegal":["DSS"],"mauritius":["MRU"],"durban":["DUR"],"kinshasa":["FIH"],"tunis":["TUN"],"tunisia":["TUN"],"algiers":["ALG"],"africa":["JNB","NBO","ADD","CAI","LOS","CPT"],
  // Americas
  "toronto":["YYZ"],"vancouver":["YVR"],"montreal":["YUL"],"ottawa":["YOW"],"calgary":["YYC"],"edmonton":["YEG"],"canada":["YYZ","YVR","YUL"],"mexico city":["MEX"],"cancun":["CUN"],"mexico":["MEX","CUN","GDL"],"tulum":["CUN"],"playa del carmen":["CUN"],"puerto vallarta":["PVR"],"los cabos":["SJD"],"cabo":["SJD"],"guadalajara":["GDL"],"bogota":["BOG"],"colombia":["BOG","MDE"],"medellin":["MDE"],"cartagena":["CTG"],"lima":["LIM"],"peru":["LIM","CUZ"],"cusco":["CUZ"],"machu picchu":["CUZ"],"santiago":["SCL"],"chile":["SCL"],"buenos aires":["EZE"],"argentina":["EZE"],"sao paulo":["GRU"],"rio":["GIG"],"rio de janeiro":["GIG"],"brazil":["GRU","GIG","BSB"],"panama":["PTY"],"panama city":["PTY"],"costa rica":["SJO"],"san jose cr":["SJO"],"havana":["HAV"],"cuba":["HAV"],"punta cana":["PUJ"],"dominican republic":["PUJ"],"dominican":["PUJ"],"dr":["PUJ"],"jamaica":["MBJ"],"montego bay":["MBJ"],"puerto rico":["SJU"],"san juan":["SJU"],"nassau":["NAS"],"bahamas":["NAS"],"aruba":["AUA"],"st maarten":["SXM"],"saint maarten":["SXM"],"sint maarten":["SXM"],"cayman":["GCM"],"cayman islands":["GCM"],"grand cayman":["GCM"],"quito":["UIO"],"ecuador":["UIO"],"caracas":["CCS"],"venezuela":["CCS"],"montevideo":["MVD"],"uruguay":["MVD"],"south america":["GRU","GIG","EZE","LIM","SCL","BOG"],"caribbean":["CUN","PUJ","SJU","MBJ","NAS","AUA","SXM"],"central america":["SJO","PTY","CUN"],
  // Oceania
  "auckland":["AKL"],"new zealand":["AKL","CHC","WLG"],"christchurch":["CHC"],"wellington":["WLG"],"queenstown":["ZQN"],"fiji":["NAN"],"tahiti":["PPT"],"adelaide":["ADL"],"gold coast":["OOL"],
  // Events
  "wimbledon":["LHR"],"oktoberfest":["MUC"],"carnival":["GIG","GRU"],"cherry blossom":["NRT","HND"],"f1 monaco":["NCE"],"oktoberfest":["MUC"],"world cup":["DOH"],
};

function findAirports(q, type) {
  // Clean input: trim, lowercase, remove extra spaces, strip special chars
  q = q.toLowerCase().replace(/[^\w\s'-]/g, "").replace(/\s+/g, " ").trim();
  if (!q || q.length < 2) return null;

  // First check for 3-letter airport codes directly in query
  const codeMatch = q.match(/\b([A-Z]{3})\b/gi);
  if (codeMatch) {
    for (const code of codeMatch) {
      const up = code.toUpperCase();
      if (AIRPORTS.find(a=>a.code===up)) return [up];
    }
  }

  // Then check city/region names — try multi-word matches first (longest match wins)
  // This ensures "new york" matches before "new" or "york" individually
  const sortedKeys = Object.keys(CITY_MAP).sort((a,b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (q.includes(key)) return CITY_MAP[key];
  }

  // Fuzzy match: check if query words start with or closely match a CITY_MAP key
  const words = q.split(/\s+/).filter(w=>w.length>=3);
  // Also try 2-word combos for cities like "el paso", "des moines"
  const combos = [];
  for (let i = 0; i < words.length - 1; i++) combos.push(words[i]+" "+words[i+1]);

  for (const combo of combos) {
    for (const key of sortedKeys) {
      if (key.length >= 4 && (key.startsWith(combo) || combo.startsWith(key))) return CITY_MAP[key];
    }
  }
  for (const word of words) {
    for (const key of sortedKeys) {
      if (key.length >= 4 && (key.startsWith(word) || word.startsWith(key))) return CITY_MAP[key];
    }
  }

  // Levenshtein-lite: catch 1-char typos for city names 5+ chars (e.g. "mimai" → "miami")
  for (const word of words) {
    if (word.length < 4) continue;
    for (const key of sortedKeys) {
      if (key.length < 4 || Math.abs(key.length - word.length) > 1) continue;
      let diff = 0;
      const shorter = word.length <= key.length ? word : key;
      const longer = word.length > key.length ? word : key;
      let j = 0;
      for (let i = 0; i < longer.length && diff <= 1; i++) {
        if (shorter[j] === longer[i]) { j++; }
        else { diff++; if (shorter.length === longer.length) j++; }
      }
      if (diff <= 1 && j >= shorter.length - 1) return CITY_MAP[key];
    }
  }

  // Also try matching against AIRPORTS city names directly
  for (const word of words) {
    const match = AIRPORTS.find(a => a.city && a.city.toLowerCase().includes(word));
    if (match) return [match.code];
  }
  return null;
}

async function parseAI(query) {
  try {
    const r = await fetch("/api/parse", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({query}),
    });
    if (!r.ok) throw new Error("API error");
    return await r.json();
  } catch(e) {
    // Clean input: normalize whitespace, handle special chars, lowercase
    let q = query.toLowerCase().replace(/[^\w\s'-]/g, " ").replace(/\s+/g, " ").trim();

    // Handle empty or gibberish queries — show popular routes instead of crashing
    if (!q || q.length < 2) {
      return {origins:["JFK","LAX","SFO"],destinations:["LHR","CDG","NRT","FCO"],cabin:"Economy",alliance:"any",program:null,dateRange:"Flexible",dateWindow:{},maxMiles:null,isExplore:true,summary:"Popular flights"};
    }

    let cabin = /\b(?:business|biz|j class)\b/.test(q)?"Business":/\b(?:first|f class|suites)\b/.test(q)?"First":/\b(?:premium economy|premium eco|pe class)\b/.test(q)?"Premium Economy":"Economy";
    for (const c of ["first","business","premium economy","economy"]) if(q.includes(c)){cabin=c.charAt(0).toUpperCase()+c.slice(1);break;}
    let alliance="any";
    if(q.includes("star alliance"))alliance="Star Alliance"; else if(q.includes("oneworld"))alliance="oneworld"; else if(q.includes("skyteam"))alliance="SkyTeam"; else if(q.includes("budget"))alliance="Budget";

    // Strip noise words BEFORE location detection so they don't interfere
    const noiseWords = /\b(?:find|me|a|an|the|some|any|i want|i need|show|get|search|looking for|look for|can you|please|help|need|want|cheap|cheapest|affordable|expensive|luxury|flight|flights|ticket|tickets|booking|book|best|good|great|deal|deals|round trip|roundtrip|one way|oneway|nonstop|non-stop|direct|january|february|march|april|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun|today|tomorrow|tonight|next week|next month|this weekend|next weekend|\d{1,2}(?:st|nd|rd|th)?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|in \d+ (?:weeks?|months?))\b/g;

    // Smart origin/destination detection
    let origins=null, dests=null;

    // Step 1: Try "from X to Y" pattern first (most explicit)
    const fromTo = q.match(/from\s+(.+?)\s+to\s+(.+?)(?:\s+(?:in|on|using|for|under|around|before|right|just|after|during|next|this|between|by|within|until)\b|\s*$)/);
    if (fromTo) {
      origins = findAirports(fromTo[1].trim(), "origin");
      dests = findAirports(fromTo[2].trim(), "dest");
    }

    // Step 2: Try "X to Y" pattern
    if (!origins || !dests) {
      const xToY = q.match(/(.+?)\s+to\s+(.+?)(?:\s+(?:in|on|using|for|under|around|before|right|just|after|during|next|this|between|by|within|until)\b|\s*$)/);
      if (xToY) {
        if (!origins) origins = findAirports(xToY[1].trim(), "origin");
        if (!dests) dests = findAirports(xToY[2].trim(), "dest");
      }
      if (!dests) {
        const xToYGreedy = q.match(/\bto\s+(.+)$/);
        if (xToYGreedy) dests = findAirports(xToYGreedy[1].trim(), "dest");
      }
    }

    // Step 2.5: Try "X - Y" or "X → Y" or "X > Y" patterns (people use dashes/arrows)
    if (!origins || !dests) {
      const dashPattern = q.match(/(.+?)\s*[-–—>→]\s*(.+?)(?:\s+(?:in|on|using|for)\b|\s*$)/);
      if (dashPattern) {
        if (!origins) origins = findAirports(dashPattern[1].trim(), "origin");
        if (!dests) dests = findAirports(dashPattern[2].trim(), "dest");
      }
    }

    // Step 3: Detect origins from "from X", "out of X", "departing X"
    if (!origins) {
      const outOf = q.match(/(?:out of|from|departing|leaving|flying out of)\s+(\w[\w\s]*?)(?:\s+to|\s+in\b|\s+on\b|\s+before|\s+after|\s*$)/);
      if (outOf) origins = findAirports(outOf[1].trim(), "origin");
    }

    // Step 3.5: Handle "destination from origin" pattern (e.g. "caribbean from nyc")
    if (!origins || !dests) {
      const destFromOrig = q.match(/^(.+?)\s+from\s+(.+?)(?:\s+(?:in|on|using|for|under|around|before|right|just|after|during|next|this|between|by|within|until|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec|\d)\b|\s*$)/);
      if (destFromOrig) {
        const tryDest = findAirports(destFromOrig[1].replace(noiseWords,"").trim(), "dest");
        const tryOrig = findAirports(destFromOrig[2].trim(), "origin");
        if (tryDest && !dests) dests = tryDest;
        if (tryOrig && !origins) origins = tryOrig;
      }
    }

    // Step 4: NO "to" keyword — try to find TWO locations in the query
    // Handles: "miami london", "philly jacksonville", "JFK LAX"
    if (!origins || !dests) {
      const cleanQ = q.replace(noiseWords, " ").replace(/\s+/g, " ").trim();
      const locationWords = cleanQ.split(/\s+/);

      // Try progressively splitting the cleaned query to find two locations
      // Try each split point: first N words = origin, remaining = dest
      for (let split = 1; split < locationWords.length && (!origins || !dests); split++) {
        const leftPart = locationWords.slice(0, split).join(" ");
        const rightPart = locationWords.slice(split).join(" ");
        const tryOrig = findAirports(leftPart, "origin");
        const tryDest = findAirports(rightPart, "dest");
        if (tryOrig && tryDest) {
          // Make sure they're different
          const oSet = new Set(tryOrig);
          const different = tryDest.some(d => !oSet.has(d));
          if (different) {
            if (!origins) origins = tryOrig;
            if (!dests) dests = tryDest;
          }
        }
      }
    }

    // Step 5: Single location — treat as destination, use popular origins
    if (!origins && !dests) {
      const cleanQ = q.replace(noiseWords, " ").replace(/\s+/g, " ").trim();
      const singleLoc = findAirports(cleanQ, "dest");
      if (singleLoc) {
        dests = singleLoc;
        origins = ["JFK","LAX","SFO","ORD"]; // popular US origins
      }
    }
    if (origins && !dests) {
      // Only found origin — show popular international destinations from there
      dests = ["LHR","CDG","FCO","NRT","CUN","SIN"];
    }
    if (!origins && dests) {
      // Only found destination — use popular US origins
      origins = ["JFK","LAX","SFO","ORD"];
    }

    // Step 6: Default fallbacks (truly nothing matched)
    if (!origins) origins = ["JFK","EWR","LGA"];
    if (!dests) dests = ["LHR","CDG","NRT","SIN","BKK","DXB"];
    // Ensure origins and dests don't overlap (prevents NYC→NYC type results)
    if (origins && dests) {
      const origSet = new Set(origins);
      const filtered = dests.filter(d => !origSet.has(d));
      if (filtered.length > 0) dests = filtered;
      else dests = ["LHR","CDG","NRT","SIN","BKK","DXB"]; // reset to defaults if all overlapped
    }
    // Step 6: Parse date/timing hints from query
    const dateRange = parseDateHints(q);

    const originCity = AIRPORTS.find(a=>origins.includes(a.code));
    const destCity = AIRPORTS.find(a=>dests.includes(a.code));
    const dateLabel = dateRange.label || "Flexible";
    const isRT = dateRange.roundTrip || false;
    return {origins,destinations:dests,cabin,alliance,program:null,dateRange:dateLabel,dateWindow:dateRange,maxMiles:null,isExplore:false,roundTrip:isRT,summary:`${isRT?"Round trip":""}${cabin} flights from ${originCity?.city||origins[0]} to ${destCity?.city||dests[0]}${dateLabel!=="Flexible"?` · ${dateLabel}`:""}`};
  }
}

// Parse date/timing hints from a query and return {startDate, endDate, label}
// Also detects round-trip patterns like "april 4th to april 9th" or "mar 20 returning mar 27"
function parseDateHints(q) {
  const now = new Date();
  const y = now.getFullYear();
  const ny = y + 1;

  const MONTH_NAMES_RT = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const SHORT_MONTHS_RT = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

  // ── ROUND TRIP DETECTION ──
  // Pattern: "april 4th to april 9th", "march 20 - march 27", "mar 5 returning mar 12"
  // Also: "april 4 to 9" (same month), "4/4 to 4/9", "apr 4 - apr 9"
  // Key insight: if both dates are specific days (not just month names), it's a round trip

  // Cross-month or same-month with full month names: "april 4th to april 9th", "march 20 to april 5"
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      const pat = new RegExp(
        `(?:${MONTH_NAMES_RT[i]}|${SHORT_MONTHS_RT[i]})\\s+(\\d{1,2})(?:st|nd|rd|th)?` +
        `\\s*(?:to|[-–]|through|thru|returning|return|coming back)\\s*` +
        `(?:${MONTH_NAMES_RT[j]}|${SHORT_MONTHS_RT[j]})\\s+(\\d{1,2})(?:st|nd|rd|th)?`
      );
      const m = q.match(pat);
      if (m) {
        const d1 = parseInt(m[1]), d2 = parseInt(m[2]);
        if (d1 >= 1 && d1 <= 31 && d2 >= 1 && d2 <= 31) {
          let outDate = new Date(y, i, d1);
          let retDate = new Date(j < i ? ny : y, j, d2);
          if (outDate < now) { outDate = new Date(ny, i, d1); retDate = new Date(j < i ? ny + 1 : ny, j, d2); }
          const sf = d => { const dd=d.getDate(); return dd===1||dd===21||dd===31?"st":dd===2||dd===22?"nd":dd===3||dd===23?"rd":"th"; };
          const outLabel = `${MONTH_NAMES_RT[i].charAt(0).toUpperCase()+MONTH_NAMES_RT[i].slice(1)} ${d1}${sf(outDate)}`;
          const retLabel = `${MONTH_NAMES_RT[j].charAt(0).toUpperCase()+MONTH_NAMES_RT[j].slice(1)} ${d2}${sf(retDate)}`;
          return {
            start: outDate, end: new Date(outDate.getTime() + 2 * 864e5), // 2-day window for outbound
            returnStart: retDate, returnEnd: new Date(retDate.getTime() + 2 * 864e5),
            roundTrip: true,
            label: `${outLabel} → ${retLabel} (Round trip)`
          };
        }
      }
    }
  }

  // Same month shorthand: "april 4 to 9", "march 20-27" as round trip
  // BUT only if the gap is 2+ days (1-day gap could be a date range)
  for (let i = 0; i < 12; i++) {
    const pat = new RegExp(
      `(?:${MONTH_NAMES_RT[i]}|${SHORT_MONTHS_RT[i]})\\s+(\\d{1,2})(?:st|nd|rd|th)?` +
      `\\s*(?:to|[-–]|through|thru)\\s*(\\d{1,2})(?:st|nd|rd|th)?(?!\\s*(?:${MONTH_NAMES_RT.join('|')}|${SHORT_MONTHS_RT.join('|')}))`
    );
    const m = q.match(pat);
    if (m) {
      const d1 = parseInt(m[1]), d2 = parseInt(m[2]);
      if (d1 >= 1 && d1 <= 31 && d2 >= 1 && d2 <= 31 && d2 > d1 && (d2 - d1) >= 2) {
        let outDate = new Date(y, i, d1);
        let retDate = new Date(y, i, d2);
        if (outDate < now) { outDate = new Date(ny, i, d1); retDate = new Date(ny, i, d2); }
        const sf = d => { const dd=d.getDate(); return dd===1||dd===21||dd===31?"st":dd===2||dd===22?"nd":dd===3||dd===23?"rd":"th"; };
        const mn = MONTH_NAMES_RT[i].charAt(0).toUpperCase()+MONTH_NAMES_RT[i].slice(1);
        return {
          start: outDate, end: new Date(outDate.getTime() + 2 * 864e5),
          returnStart: retDate, returnEnd: new Date(retDate.getTime() + 2 * 864e5),
          roundTrip: true,
          label: `${mn} ${d1}${sf(outDate)} → ${mn} ${d2}${sf(retDate)} (Round trip)`
        };
      }
    }
  }

  // Numeric round trip: "4/4 to 4/9", "4/4 - 4/9"
  const numRT = q.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*(?:to|[-–]|through|returning)\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (numRT) {
    const m1 = parseInt(numRT[1]) - 1, d1 = parseInt(numRT[2]);
    const m2 = parseInt(numRT[4]) - 1, d2 = parseInt(numRT[5]);
    let y1 = numRT[3] ? parseInt(numRT[3]) : y;
    let y2 = numRT[6] ? parseInt(numRT[6]) : y;
    if (y1 < 100) y1 += 2000;
    if (y2 < 100) y2 += 2000;
    if (m1 >= 0 && m1 <= 11 && m2 >= 0 && m2 <= 11 && d1 >= 1 && d1 <= 31 && d2 >= 1 && d2 <= 31) {
      let outDate = new Date(y1, m1, d1);
      let retDate = new Date(y2, m2, d2);
      if (outDate < now && !numRT[3]) { outDate = new Date(ny, m1, d1); retDate = new Date(ny, m2, d2); }
      const sf = d => { const dd=d.getDate(); return dd===1||dd===21||dd===31?"st":dd===2||dd===22?"nd":dd===3||dd===23?"rd":"th"; };
      const mn1 = MONTH_NAMES_RT[m1].charAt(0).toUpperCase()+MONTH_NAMES_RT[m1].slice(1);
      const mn2 = MONTH_NAMES_RT[m2].charAt(0).toUpperCase()+MONTH_NAMES_RT[m2].slice(1);
      return {
        start: outDate, end: new Date(outDate.getTime() + 2 * 864e5),
        returnStart: retDate, returnEnd: new Date(retDate.getTime() + 2 * 864e5),
        roundTrip: true,
        label: `${mn1} ${d1}${sf(outDate)} → ${mn2} ${d2}${sf(retDate)} (Round trip)`
      };
    }
  }

  // "returning [date]" or "return [date]" or "come back [date]" after a single departure date
  // This catches patterns like "nyc to london march 5 returning march 12"
  const retMatch = q.match(/(?:returning|return|come back|coming back|back)\s+(?:on\s+)?/);
  if (retMatch) {
    // Already handled above in cross-month patterns — this is a fallback
  }

  // Event-based dates (approximate windows people would travel)
  const EVENT_DATES = {
    "wimbledon":{m:6,d:20,m2:7,d2:14,label:"Late Jun – Early Jul"}, // travel before + during
    "oktoberfest":{m:8,d:16,m2:9,d2:6,label:"Mid Sep – Early Oct"},
    "carnival":{m:1,d:20,m2:2,d2:20,label:"Late Feb – Early Mar"},
    "cherry blossom":{m:2,d:20,m2:3,d2:15,label:"Late Mar – Mid Apr"},
    "f1 monaco":{m:4,d:20,m2:5,d2:1,label:"Late May"},
    "world cup":{m:5,d:1,m2:6,d2:30,label:"Jun – Jul"},
    "super bowl":{m:1,d:1,m2:1,d2:15,label:"Early Feb"},
    "thanksgiving":{m:10,d:18,m2:10,d2:28,label:"Late Nov"},
    "christmas":{m:11,d:15,m2:11,d2:30,label:"Mid – Late Dec"},
    "new year":{m:11,d:27,m2:0,d2:5,label:"Late Dec – Early Jan"},
    "spring break":{m:2,d:10,m2:3,d2:10,label:"Mid Mar – Mid Apr"},
    "fourth of july":{m:5,d:28,m2:6,d2:7,label:"Late Jun – Early Jul"},
    "4th of july":{m:5,d:28,m2:6,d2:7,label:"Late Jun – Early Jul"},
    "independence day":{m:5,d:28,m2:6,d2:7,label:"Late Jun – Early Jul"},
    "labor day":{m:7,d:25,m2:8,d2:8,label:"Late Aug – Early Sep"},
    "memorial day":{m:4,d:20,m2:4,d2:31,label:"Late May"},
    "halloween":{m:9,d:25,m2:9,d2:31,label:"Late Oct"},
    "valentine":{m:1,d:10,m2:1,d2:16,label:"Mid Feb"},
    "mardi gras":{m:1,d:20,m2:2,d2:8,label:"Late Feb – Early Mar"},
    "coachella":{m:3,d:8,m2:3,d2:22,label:"Mid Apr"},
    "ski season":{m:11,d:15,m2:2,d2:15,label:"Dec – Mar"},
    "summer olympics":{m:6,d:20,m2:7,d2:15,label:"Late Jul – Mid Aug"},
    "olympics":{m:6,d:20,m2:7,d2:15,label:"Late Jul – Mid Aug"},
    "ramadan":{m:1,d:20,m2:2,d2:25,label:"Late Feb – Late Mar"},
    "eid":{m:2,d:25,m2:3,d2:5,label:"Late Mar – Early Apr"},
    "diwali":{m:9,d:20,m2:10,d2:5,label:"Late Oct – Early Nov"},
    "chinese new year":{m:0,d:20,m2:1,d2:10,label:"Late Jan – Early Feb"},
    "lunar new year":{m:0,d:20,m2:1,d2:10,label:"Late Jan – Early Feb"},
    "golden week":{m:3,d:27,m2:4,d2:7,label:"Late Apr – Early May"},
    "songkran":{m:3,d:10,m2:3,d2:16,label:"Mid Apr"},
  };

  const isBefore = /\bbefore\b|right before|just before/.test(q);
  const isAfter = /\bafter\b|right after|just after/.test(q);
  const isDuring = /\bduring\b/.test(q);

  for (const [event, info] of Object.entries(EVENT_DATES)) {
    if (q.includes(event)) {
      let s = new Date(y, info.m, info.d);
      let e = new Date(info.m2 < info.m ? ny : y, info.m2, info.d2);
      // If the window has already passed this year, push to next year
      if (e < now) { s = new Date(ny, info.m, info.d); e = new Date(info.m2 < info.m ? ny+1 : ny, info.m2, info.d2); }
      // "before X" = 1-2 weeks before the event starts
      if (isBefore) {
        const eventStart = new Date(s);
        e = new Date(eventStart.getTime() - 1*864e5); // day before event
        s = new Date(eventStart.getTime() - 14*864e5); // 2 weeks before
        return {start:s, end:e, label:`Before ${event.charAt(0).toUpperCase()+event.slice(1)}`};
      }
      // "after X" = starts at event end, +2 weeks
      if (isAfter) {
        const eventEnd = new Date(e);
        s = new Date(eventEnd.getTime() + 1*864e5);
        e = new Date(eventEnd.getTime() + 14*864e5);
        return {start:s, end:e, label:`After ${event.charAt(0).toUpperCase()+event.slice(1)}`};
      }
      return {start:s, end:e, label:info.label};
    }
  }

  // Season-based
  const SEASONS = {
    "summer":{m:5,d:1,m2:7,d2:31,label:"Summer (Jun–Aug)"},
    "winter":{m:11,d:1,m2:1,d2:28,label:"Winter (Dec–Feb)"},
    "fall":{m:8,d:1,m2:10,d2:30,label:"Fall (Sep–Nov)"},
    "autumn":{m:8,d:1,m2:10,d2:30,label:"Autumn (Sep–Nov)"},
    "spring":{m:2,d:1,m2:4,d2:31,label:"Spring (Mar–May)"},
  };
  for (const [season, info] of Object.entries(SEASONS)) {
    if (q.includes(season)) {
      let s = new Date(y, info.m, info.d);
      let e = new Date(info.m2 < info.m ? ny : y, info.m2, info.d2);
      if (e < now) { s = new Date(ny, info.m, info.d); e = new Date(info.m2 < info.m ? ny+1 : ny, info.m2, info.d2); }
      return {start:s, end:e, label:info.label};
    }
  }

  // Month names
  const MONTH_NAMES = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const SHORT_MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

  // SPECIFIC DATES: "march 23rd", "march 23", "mar 23", "3/23", "3/23/26", "23 march"
  // Check these BEFORE generic month matching so "march 23rd" doesn't just return all of March
  for (let i=0;i<12;i++) {
    // "march 23rd", "march 23", "mar 23rd", "mar 23"
    const dayAfterMonth = q.match(new RegExp(`(?:${MONTH_NAMES[i]}|${SHORT_MONTHS[i]})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`));
    if (dayAfterMonth) {
      const day = parseInt(dayAfterMonth[1]);
      if (day >= 1 && day <= 31) {
        let s = new Date(y, i, day);
        let e = new Date(y, i, day + 7); // show a week window around that date
        if (s < now) { s = new Date(ny, i, day); e = new Date(ny, i, day + 7); }
        const suffix = day===1||day===21||day===31?"st":day===2||day===22?"nd":day===3||day===23?"rd":"th";
        return {start:s, end:e, label:`${MONTH_NAMES[i].charAt(0).toUpperCase()+MONTH_NAMES[i].slice(1)} ${day}${suffix}`};
      }
    }
    // "23 march", "23rd of march"
    const dayBeforeMonth = q.match(new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(?:${MONTH_NAMES[i]}|${SHORT_MONTHS[i]})`));
    if (dayBeforeMonth) {
      const day = parseInt(dayBeforeMonth[1]);
      if (day >= 1 && day <= 31) {
        let s = new Date(y, i, day);
        let e = new Date(y, i, day + 7);
        if (s < now) { s = new Date(ny, i, day); e = new Date(ny, i, day + 7); }
        const suffix = day===1||day===21||day===31?"st":day===2||day===22?"nd":day===3||day===23?"rd":"th";
        return {start:s, end:e, label:`${MONTH_NAMES[i].charAt(0).toUpperCase()+MONTH_NAMES[i].slice(1)} ${day}${suffix}`};
      }
    }
  }

  // Numeric date formats: "3/23", "03/23", "3/23/26", "3/23/2026"
  const numericDate = q.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (numericDate) {
    const month = parseInt(numericDate[1]) - 1; // 0-indexed
    const day = parseInt(numericDate[2]);
    let dateYear = numericDate[3] ? parseInt(numericDate[3]) : y;
    if (dateYear < 100) dateYear += 2000; // "26" → 2026
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      let s = new Date(dateYear, month, day);
      let e = new Date(dateYear, month, day + 7);
      if (s < now && !numericDate[3]) { s = new Date(ny, month, day); e = new Date(ny, month, day + 7); }
      const suffix = day===1||day===21||day===31?"st":day===2||day===22?"nd":day===3||day===23?"rd":"th";
      return {start:s, end:e, label:`${MONTH_NAMES[month].charAt(0).toUpperCase()+MONTH_NAMES[month].slice(1)} ${day}${suffix}`};
    }
  }

  // Date ranges: "march 20-27", "march 20 to 27", "mar 20 - mar 27"
  for (let i=0;i<12;i++) {
    const dateRange = q.match(new RegExp(`(?:${MONTH_NAMES[i]}|${SHORT_MONTHS[i]})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s*[-–to]+\\s*(?:(?:${MONTH_NAMES[i]}|${SHORT_MONTHS[i]})\\s+)?(\\d{1,2})(?:st|nd|rd|th)?`));
    if (dateRange) {
      const day1 = parseInt(dateRange[1]);
      const day2 = parseInt(dateRange[2]);
      if (day1 >= 1 && day1 <= 31 && day2 >= 1 && day2 <= 31) {
        let s = new Date(y, i, day1);
        let e = new Date(y, i, day2);
        if (s < now) { s = new Date(ny, i, day1); e = new Date(ny, i, day2); }
        return {start:s, end:e, label:`${MONTH_NAMES[i].charAt(0).toUpperCase()+MONTH_NAMES[i].slice(1)} ${day1}–${day2}`};
      }
    }
  }

  // Generic month matching (no specific day)
  for (let i=0;i<12;i++) {
    if (q.includes(MONTH_NAMES[i]) || (q.match(new RegExp(`\\b${SHORT_MONTHS[i]}\\b`)) && SHORT_MONTHS[i]!=="may")) {
      let s = new Date(y, i, 1);
      let e = new Date(y, i+1, 0); // last day of month
      if (e < now) { s = new Date(ny, i, 1); e = new Date(ny, i+1, 0); }
      return {start:s, end:e, label:`${MONTH_NAMES[i].charAt(0).toUpperCase()+MONTH_NAMES[i].slice(1)}`};
    }
  }

  // Relative timing
  if (/\bnext week\b/.test(q)) { const s=new Date(now.getTime()+5*864e5); const e=new Date(now.getTime()+12*864e5); return {start:s,end:e,label:"Next week"}; }
  if (/\bnext month\b/.test(q)) { const s=new Date(y,now.getMonth()+1,1); const e=new Date(y,now.getMonth()+2,0); return {start:s,end:e,label:"Next month"}; }
  if (/\bthis weekend\b/.test(q)) { const dow=now.getDay(); const daysToFri=((5-dow)+7)%7||7; const s=new Date(now.getTime()+daysToFri*864e5); const e=new Date(s.getTime()+2*864e5); return {start:s,end:e,label:"This weekend"}; }
  if (/\btonight\b|\btoday\b/.test(q)) { const s=new Date(now); const e=new Date(now.getTime()+864e5); return {start:s,end:e,label:"Today"}; }
  if (/\btomorrow\b/.test(q)) { const s=new Date(now.getTime()+864e5); const e=new Date(now.getTime()+2*864e5); return {start:s,end:e,label:"Tomorrow"}; }
  if (/\bnext weekend\b/.test(q)) { const dow=now.getDay(); const daysToFri=((5-dow)+7)%7+7; const s=new Date(now.getTime()+daysToFri*864e5); const e=new Date(s.getTime()+2*864e5); return {start:s,end:e,label:"Next weekend"}; }
  if (/\bin (\d+) weeks?\b/.test(q)) { const m=q.match(/in (\d+) weeks?/); const w=parseInt(m[1]); const s=new Date(now.getTime()+w*7*864e5); const e=new Date(s.getTime()+7*864e5); return {start:s,end:e,label:`In ${w} week${w>1?"s":""}`}; }
  if (/\bin (\d+) months?\b/.test(q)) { const m=q.match(/in (\d+) months?/); const mo=parseInt(m[1]); const s=new Date(y,now.getMonth()+mo,1); const e=new Date(y,now.getMonth()+mo+1,0); return {start:s,end:e,label:`In ${mo} month${mo>1?"s":""}`}; }

  // Default: flexible (7-90 days out)
  return {start:new Date(now.getTime()+7*864e5), end:new Date(now.getTime()+90*864e5), label:"Flexible"};
}

function useCountUp(target, duration=800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const t0 = Date.now();
    const step = () => {
      const elapsed = Date.now()-t0;
      const progress = Math.min(elapsed/duration, 1);
      const eased = 1-Math.pow(1-progress, 3);
      setVal(Math.round(target*eased));
      if (progress<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// ═══════════════════════════════════════════════════════════════
// AIRPORT SEARCH DROPDOWN (defined outside Jovair to keep stable identity)
// ═══════════════════════════════════════════════════════════════

const _s = { navy:"#0b1d3a", teal:"#00b4a0", muted:"#6b7280", text:"#1a1a2e" };

function AirportSearchDropdown({value, onChange, open, setOpen, label}) {
  const [search, setSearch] = useState("");
  const filtered = AIRPORTS.filter(a =>
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.city.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  return (
    <div style={{position:"relative",flex:1}}>
      <label style={{fontSize:11,fontWeight:600,color:_s.muted,textTransform:"uppercase",display:"block",marginBottom:6}}>{label}</label>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          onFocus={()=>setOpen(true)}
          onBlur={()=>setTimeout(()=>setOpen(false),200)}
          placeholder="Type code or city"
          style={{flex:1,padding:"10px 12px",border:`1px solid ${open?_s.teal:"#e2e5ea"}`,borderRadius:8,fontSize:13,fontWeight:500,transition:"all 0.2s"}}
        />
        {value && <span style={{background:_s.teal,color:"#fff",padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:600}}>{value}</span>}
      </div>
      {open && filtered.length > 0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:`1px solid ${_s.teal}`,borderRadius:8,marginTop:4,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",zIndex:50,maxHeight:200,overflowY:"auto"}}>
          {filtered.map(ap=>(
            <button key={ap.code} onClick={()=>{onChange(ap.code);setSearch("");setOpen(false);}} style={{width:"100%",padding:"10px 12px",textAlign:"left",border:"none",background:"none",cursor:"pointer",fontSize:13,color:_s.text,transition:"background 0.15s"}}
              onMouseEnter={e=>e.target.style.background="#f3f4f6"} onMouseLeave={e=>e.target.style.background="none"}>
              <strong>{ap.code}</strong> — {ap.city} ({ap.name})
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function Jovair() {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("home");
  const [parsed, setParsed] = useState(null);
  const [flights, setFlights] = useState([]);
  const [sortBy, setSortBy] = useState("value");
  const [sortDir, setSortDir] = useState("asc");
  const [filterAlliance, setFilterAlliance] = useState("All");
  const [filterTransfer, setFilterTransfer] = useState(null);
  const [filterNonstop, setFilterNonstop] = useState(false);
  const [filterSelfTransfer, setFilterSelfTransfer] = useState(false);
  const [tripDirection, setTripDirection] = useState("outbound"); // "outbound" | "return"
  const [filterMaxPrice, setFilterMaxPrice] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [scanIndex, setScanIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [manualFrom, setManualFrom] = useState("");
  const [manualTo, setManualTo] = useState("");
  const [manualCabin, setManualCabin] = useState("Economy");
  const [manualAlliance, setManualAlliance] = useState("Any");
  const [manualBudget, setManualBudget] = useState(true);
  const [manualFromOpen, setManualFromOpen] = useState(false);
  const [manualToOpen, setManualToOpen] = useState(false);
  const inputRef = useRef(null);

  const s = { navy:"#0b1d3a", blue:"#1a6eff", teal:"#00b4a0", gold:"#f5a623", red:"#e5384f", bg:"#f6f7f9", text:"#1a1a2e", muted:"#6b7280" };

  const runSearch = useCallback(async(q) => {
    if (!q.trim()) return;
    setQuery(q);
    setTab("search");
    setPhase("parsing");
    setExpandedId(null);
    setCompareIds([]);
    setSortBy("value");
    setFilterAlliance("All");
    setFilterTransfer(null);
    setFilterNonstop(false);
    setFilterSelfTransfer(false);
    setTripDirection("outbound");
    setFilterMaxPrice(null);
    setShowHistory(false);

    setSearchHistory(prev => {
      const next = [q, ...prev.filter(h=>h!==q)].slice(0,8);
      return next;
    });

    const p = await parseAI(q);
    setParsed(p);
    setPhase("searching");

    for (let i=0; i<Math.min(20, AIRLINES.length); i++) {
      await new Promise(r=>setTimeout(r, 90));
      setScanIndex(i);
    }

    await new Promise(r=>setTimeout(r, 400));

    // Try real Amadeus API first, fall back to simulated data
    let realFlights = null;
    try {
      // Ensure departure date is in the future — Amadeus rejects past dates
      let depDate = p.departureDate || null;
      let retDate = p.returnDate || null;
      const today = new Date();
      const todayStr = today.toISOString().slice(0,10);
      const futureDefault = new Date(Date.now() + 30*864e5).toISOString().slice(0,10);
      if (!depDate || depDate < todayStr) depDate = futureDefault;
      if (retDate && retDate <= depDate) {
        retDate = new Date(new Date(depDate).getTime() + 7*864e5).toISOString().slice(0,10);
      }

      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origins: p.origins,
          destinations: p.destinations,
          departureDate: depDate,
          returnDate: retDate,
          cabin: p.cabin,
          alliance: p.alliance,
          maxResults: 12,
        }),
      });
      const data = await res.json();
      if (data.source === "amadeus" && data.flights?.length > 0) {
        realFlights = data.flights;
        console.log(`[Jovair] Got ${realFlights.length} real flights from Amadeus`);
      }
    } catch (err) {
      console.log("[Jovair] Amadeus unavailable, using simulated data:", err.message);
    }

    // Always generate simulated deal flights, then merge with Amadeus data
    const simulated = generateFlights(p);
    if (realFlights && realFlights.length > 0) {
      // Merge: show Amadeus flights + simulated deals (remove duplicates by airline+route)
      const seen = new Set(realFlights.map(f=>`${f.airline?.code||""}-${f.origin}-${f.destination}`));
      const extra = simulated.filter(f=>!seen.has(`${f.airline.code}-${f.origin}-${f.destination}`)).slice(0, 6);
      setFlights([...realFlights, ...extra].sort((a,b)=>a.cash-b.cash));
    } else {
      setFlights(simulated);
    }
    setPhase("results");
  }, []);

  const runManualSearch = useCallback(async () => {
    if (!manualFrom || !manualTo) return;
    const p = {
      origins: [manualFrom],
      destinations: [manualTo],
      cabin: manualCabin,
      alliance: manualAlliance === "Any" ? "any" : manualAlliance,
      program: null,
      dateRange: "Flexible",
      maxMiles: null,
      includeBudget: manualBudget,
      summary: `${manualCabin} from ${manualFrom} to ${manualTo}`
    };
    setQuery("");
    setTab("search");
    setPhase("searching");
    setExpandedId(null);
    setCompareIds([]);
    setSortBy("value");
    setFilterAlliance("All");
    setFilterTransfer(null);
    setFilterNonstop(false);
    setFilterSelfTransfer(false);
    setTripDirection("outbound");
    setFilterMaxPrice(null);
    setParsed(p);

    // Try Amadeus first
    let realFlights = null;
    try {
      const futureDate = new Date(Date.now() + 30*864e5).toISOString().slice(0,10);
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origins: p.origins,
          destinations: p.destinations,
          departureDate: futureDate,
          cabin: p.cabin,
          alliance: p.alliance,
          maxResults: 12,
        }),
      });
      const data = await res.json();
      if (data.source === "amadeus" && data.flights?.length > 0) {
        realFlights = data.flights;
      }
    } catch (err) {
      // Fall through to simulated
    }

    const simulated = generateFlights(p);
    if (realFlights && realFlights.length > 0) {
      const seen = new Set(realFlights.map(f=>`${f.airline?.code||""}-${f.origin}-${f.destination}`));
      const extra = simulated.filter(f=>!seen.has(`${f.airline.code}-${f.origin}-${f.destination}`)).slice(0, 6);
      setFlights([...realFlights, ...extra].sort((a,b)=>a.cash-b.cash));
    } else {
      setFlights(simulated);
    }
    setPhase("results");
  }, [manualFrom, manualTo, manualCabin, manualAlliance, manualBudget]);

  const filtered = useMemo(() => {
    let f = [...flights];
    // Round trip direction filter
    const hasReturn = flights.some(fl => fl.isReturn);
    if (hasReturn) {
      f = f.filter(fl => tripDirection === "return" ? fl.isReturn : !fl.isReturn);
    }
    if (filterAlliance!=="All") {
      console.log("[Jovair Filter] Alliance:", filterAlliance, "| Before:", f.length, "| Alliances in results:", [...new Set(f.map(fl=>fl.airline?.alliance))]);
      f=f.filter(fl=>fl.airline.alliance===filterAlliance);
      console.log("[Jovair Filter] After:", f.length);
    }
    if (filterTransfer) f=f.filter(fl=>fl.airline.transfers.includes(filterTransfer));
    if (filterNonstop) f=f.filter(fl=>fl.nonstop);
    if (filterSelfTransfer) f=f.filter(fl=>fl.selfTransfer);
    if (filterMaxPrice) f=f.filter(fl=>fl.cash<=filterMaxPrice);
    const dir = sortDir==="asc" ? 1 : -1;
    if (sortBy==="value") f.sort((a,b)=>dir*((b.cpm||0)-(a.cpm||0)));
    else if (sortBy==="miles") f.sort((a,b)=>dir*((a.miles||999999)-(b.miles||999999)));
    else if (sortBy==="cash") f.sort((a,b)=>dir*((a.cash||999999)-(b.cash||999999)));
    else if (sortBy==="fastest") f.sort((a,b)=>dir*((a.durationMin||9999)-(b.durationMin||9999)));
    else if (sortBy==="nonstop") f.sort((a,b)=>dir*((a.stops||99)-(b.stops||99)));
    return f;
  }, [flights,sortBy,sortDir,filterAlliance,filterTransfer,filterNonstop,filterSelfTransfer,filterMaxPrice,tripDirection]);

  const stats = useMemo(()=>{
    // Use direction-filtered flights for stats
    const hasReturn = flights.some(fl => fl.isReturn);
    const dirFlights = hasReturn ? flights.filter(fl => tripDirection === "return" ? fl.isReturn : !fl.isReturn) : flights;
    if (!dirFlights.length) return null;
    const milesFlights = dirFlights.filter(f=>f.miles);
    return {
      bestMiles:milesFlights.length ? Math.min(...milesFlights.map(f=>f.miles)) : 0,
      bestCash:Math.min(...dirFlights.map(f=>f.cash)),
      bestCpm:milesFlights.length ? Math.max(...milesFlights.map(f=>f.cpm||0)) : 0,
      avgCpm:milesFlights.length ? +(milesFlights.reduce((s,f)=>s+(f.cpm||0),0)/milesFlights.length).toFixed(1) : 0,
      nonstops:dirFlights.filter(f=>f.nonstop).length,
      totalResults:dirFlights.length,
    };
  },[flights,tripDirection]);

  const aBestMiles = useCountUp(stats?.bestMiles||0);
  const aBestCash = useCountUp(stats?.bestCash||0);
  const aBestCpm = useCountUp((stats?.bestCpm||0)*10)/10;
  const aAvgCpm = useCountUp((stats?.avgCpm||0)*10)/10;

  // ═══════════ NAV ═══════════
  const Nav = () => (
    <nav style={{position:"sticky",top:0,zIndex:1000,background:s.navy,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:56,backdropFilter:"blur(12px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>{setTab("search");setPhase("home");}}>
        <div style={{width:30,height:30,borderRadius:8,background:s.teal,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:16,fontWeight:800,fontFamily:"'Manrope'"}}>J</span></div>
        <span style={{color:"#fff",fontSize:21,fontWeight:800,letterSpacing:"-0.5px"}}>Jovair</span>
        <span style={{background:"rgba(0,180,160,0.2)",color:s.teal,fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:4,letterSpacing:"0.5px"}}>AI</span>
      </div>
      <div style={{display:"flex",gap:2}}>
        {[["search","Search"],["manual","Manual"],["sweetspots","Sweet Spots"],["devaluations","Devaluations"],["tools","Tools"]].map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id);setPhase("home");}} style={{background:tab===id?"rgba(255,255,255,0.1)":"transparent",color:tab===id?"#fff":"rgba(255,255,255,0.55)",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:tab===id?700:500,cursor:"pointer",transition:"all 0.2s",borderBottom:tab===id?`2px solid ${s.teal}`:"2px solid transparent"}}>{label}</button>
        ))}
      </div>
      <button style={{background:s.teal,color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",fontSize:13,fontWeight:700,cursor:"pointer",transition:"transform 0.15s"}} onMouseEnter={e=>e.target.style.transform="scale(1.03)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}>Sign In</button>
    </nav>
  );

  // ═══════════ SEARCH BAR ═══════════
  const SearchBar = ({big, autoFocus}) => (
    <div style={{position:"relative",width:"100%",maxWidth:big?740:660}}>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1,position:"relative"}}>
          <input ref={big?inputRef:undefined} autoFocus={autoFocus} value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter")runSearch(query);if(e.key==="Escape")setShowHistory(false);}}
            onFocus={e=>{searchHistory.length&&setShowHistory(true);e.target.style.borderColor=s.navy;e.target.style.boxShadow="0 0 0 1px rgba(11,29,58,0.08), 0 2px 8px rgba(0,0,0,0.04)";}}
            onBlur={e=>{setTimeout(()=>setShowHistory(false),200);e.target.style.borderColor="#e2e5ea";e.target.style.boxShadow="none";}}
            placeholder='Search flights... try "business class to Tokyo under 50k miles"'
            style={{width:"100%",padding:big?"18px 20px 18px 48px":"14px 16px 14px 42px",fontSize:big?16:14,fontWeight:500,border:"1px solid #e2e5ea",borderRadius:12,background:"#fff",color:s.text,transition:"all 0.2s",boxShadow:"none"}}
          />
          <svg style={{position:"absolute",left:big?18:14,top:"50%",transform:"translateY(-50%)",opacity:.35}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          {query && <button onClick={()=>setQuery("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",opacity:.4,fontSize:16,lineHeight:1,fontFamily:"inherit"}} aria-label="Clear">×</button>}
        </div>
        <button onClick={()=>runSearch(query)} style={{background:s.teal,color:"#fff",border:"none",borderRadius:10,padding:big?"0 32px":"0 22px",fontSize:big?15:14,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s"}}
          onMouseEnter={e=>{e.target.style.opacity="0.9";}}
          onMouseLeave={e=>{e.target.style.opacity="1";}}
        >Search</button>
      </div>
      {showHistory && searchHistory.length>0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:80,background:"#fff",borderRadius:12,marginTop:6,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:"1px solid #e8eaef",zIndex:50,overflow:"hidden",animation:"jv-fadein 0.2s ease"}}>
          <div style={{padding:"8px 14px",fontSize:11,fontWeight:600,color:s.muted,textTransform:"uppercase",letterSpacing:"0.5px"}}>Recent searches</div>
          {searchHistory.map((h,i)=>(
            <button key={i} onClick={()=>runSearch(h)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",cursor:"pointer",fontSize:13,color:s.text,textAlign:"left",transition:"background 0.15s"}}
              onMouseEnter={e=>e.target.style.background="#f6f7f9"} onMouseLeave={e=>e.target.style.background="none"}>
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ═══════════ HOME ═══════════
  const Home = () => (
    <div style={{animation:"jv-fadein 0.5s ease"}}>
      <div style={{textAlign:"center",padding:"72px 24px 48px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",overflow:"hidden"}}>
          {AIRLINES.slice(0,8).map((al,i)=>(
            <div key={al.code} style={{position:"absolute",width:36,height:36,borderRadius:8,background:al.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'IBM Plex Mono'",opacity:0.08,
              left:`${10+i*12}%`,top:`${20+Math.sin(i*1.3)*30}%`,animation:`jv-float${i%2===0?"":"2"} ${3+i*0.4}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}>{al.code}</div>
          ))}
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(0,180,160,0.08)",padding:"6px 16px",borderRadius:20,marginBottom:20}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:s.teal}} />
          <span style={{fontSize:12,fontWeight:600,color:s.teal}}>Powered by AI · {AIRLINES.filter(a=>a.type==="full-service").length} Loyalty Programs · {AIRPORTS.length} Airports</span>
        </div>
        <h1 style={{fontSize:48,fontWeight:800,color:s.navy,lineHeight:1.1,letterSpacing:"-1.5px",maxWidth:640,margin:"0 auto"}}>Search flights like<br/>you <span style={{color:s.teal}}>think</span>.</h1>
        <p style={{fontSize:17,color:s.muted,marginTop:16,maxWidth:520,marginInline:"auto",lineHeight:1.65}}>
          Type what you want in plain English. Jovair compares miles vs. cash across every major loyalty program — so you always know the best deal.
        </p>
        <div style={{display:"flex",justifyContent:"center",marginTop:36}}>{SearchBar({big:true, autoFocus:true})}</div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20,flexWrap:"wrap"}}>
          {TRANSFER_PARTNERS.map(tp=>(
            <span key={tp.name} style={{fontSize:11,fontWeight:600,color:tp.color,opacity:.5,padding:"4px 10px",border:`1px solid ${tp.color}20`,borderRadius:6}}>{tp.name}</span>
          ))}
        </div>
      </div>

      <div style={{maxWidth:780,margin:"0 auto",padding:"0 24px 44px"}}>
        <p style={{fontSize:11,fontWeight:700,color:s.muted,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:14}}>Try a search</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {EXAMPLE_QUERIES.map((eq,i)=>(
            <button key={i} onClick={()=>runSearch(eq.text)} style={{background:"#fff",border:"1px solid #e2e5ea",borderRadius:22,padding:"9px 16px",fontSize:13,color:s.text,cursor:"pointer",fontWeight:500,transition:"all 0.2s",display:"flex",alignItems:"center"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=s.teal;e.currentTarget.style.background="#f8faf9";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e5ea";e.currentTarget.style.background="#fff";e.currentTarget.style.transform="none";}}>
              {eq.text}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:980,margin:"0 auto",padding:"0 24px 52px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <h2 style={{fontSize:24,fontWeight:800,color:s.navy}}>Award Sweet Spots</h2>
            <p style={{fontSize:14,color:s.muted,marginTop:2}}>Routes where miles deliver outsized value</p>
          </div>
          <button onClick={()=>setTab("sweetspots")} style={{background:"none",border:`1px solid ${s.teal}`,color:s.teal,borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer"}}>View All →</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(290px, 1fr))",gap:16}}>
          {SWEET_SPOTS.slice(0,4).map((sp,idx)=>{
            const al=alByCode(sp.airline);
            return (
              <div key={sp.id} onClick={()=>runSearch(sp.query)} style={{background:"#fff",borderRadius:14,padding:22,cursor:"pointer",border:"1px solid #e8eaef",transition:"all 0.25s",animation:`jv-fadein 0.5s ease ${idx*0.1}s both`}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    {AirlineLogo({code:sp.airline, color:al?.color, size:38})}
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:s.navy}}>{sp.route}</div>
                      <div style={{fontSize:11,color:s.muted}}>{sp.program} · {sp.cabin}</div>
                    </div>
                  </div>
                </div>
                <div className="jv-mono" style={{fontSize:24,fontWeight:700,color:s.teal}}>{sp.miles.toLocaleString()} <span style={{fontSize:12,fontWeight:500,color:s.muted}}>miles</span></div>
                <div style={{fontSize:12,fontWeight:600,color:s.teal,marginTop:4}}>{sp.savings}</div>
                <p style={{fontSize:12,color:s.muted,marginTop:8,lineHeight:1.5}}>{sp.desc.slice(0,90)}...</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{background:s.navy,padding:"52px 24px"}}>
        <div style={{maxWidth:980,margin:"0 auto"}}>
          <h2 style={{fontSize:24,fontWeight:800,color:"#fff",textAlign:"center"}}>Why Jovair Exists</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",textAlign:"center",marginTop:6,marginBottom:36}}>The points & miles industry has real problems. We're fixing them.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))",gap:16}}>
            {[
              {title:"Transparency Crisis",desc:"Airlines hide true point values behind dynamic pricing. Jovair shows the real cents-per-mile on every flight."},
              {title:"Fragmented Search",desc:"Comparing miles vs. cash requires 20+ websites. Jovair unifies everything in one search."},
              {title:"Silent Devaluations",desc:"Programs devalue points with no warning. Jovair tracks changes and alerts you."},
              {title:"AI-First Discovery",desc:"Stop filling out rigid forms. Just type what you want in plain English."},
            ].map((c,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.05)",borderRadius:14,padding:24,border:"1px solid rgba(255,255,255,0.08)",animation:`jv-fadein 0.5s ease ${i*0.1}s both`}}>
                <div style={{fontSize:11,fontWeight:700,color:s.teal,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:12}}>{String.fromCharCode(65+i)}</div>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:8}}>{c.title}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.6}}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:980,margin:"0 auto",padding:"48px 24px 64px",textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",gap:48,flexWrap:"wrap"}}>
          {[[AIRLINES.filter(a=>a.type==="full-service").length,"Loyalty Programs"],[AIRPORTS.length,"Airports"],["5","Transfer Partners"],["$400B+","Points Outstanding"]].map(([n,l],i)=>(
            <div key={i}>
              <div className="jv-mono" style={{fontSize:36,fontWeight:800,color:s.navy}}>{n}</div>
              <div style={{fontSize:13,color:s.muted,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════ MANUAL SEARCH TAB ═══════════
  const ManualSearch = () => (
    <div style={{maxWidth:820,margin:"0 auto",padding:"36px 24px 64px",animation:"jv-fadein 0.4s ease"}}>
      <h1 style={{fontSize:30,fontWeight:800,color:s.navy}}>Manual Search</h1>
      <p style={{fontSize:14,color:s.muted,marginTop:6,marginBottom:32}}>Find flights with structured search parameters.</p>

      <div style={{background:"#fff",borderRadius:16,padding:32,border:"1px solid #e8eaef"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          <AirportSearchDropdown value={manualFrom} onChange={setManualFrom} open={manualFromOpen} setOpen={setManualFromOpen} label="From" />
          <AirportSearchDropdown value={manualTo} onChange={setManualTo} open={manualToOpen} setOpen={setManualToOpen} label="To" />
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          <div>
            <label style={{fontSize:11,fontWeight:600,color:s.muted,textTransform:"uppercase",display:"block",marginBottom:6}}>Cabin Class</label>
            <select value={manualCabin} onChange={e=>setManualCabin(e.target.value)} style={{width:"100%",padding:"10px 12px",border:`1px solid #e2e5ea`,borderRadius:8,fontSize:13,fontWeight:500}}>
              <option>Economy</option>
              <option>Premium Economy</option>
              <option>Business</option>
              <option>First</option>
            </select>
          </div>
          <div>
            <label style={{fontSize:11,fontWeight:600,color:s.muted,textTransform:"uppercase",display:"block",marginBottom:6}}>Alliance Filter</label>
            <select value={manualAlliance} onChange={e=>setManualAlliance(e.target.value)} style={{width:"100%",padding:"10px 12px",border:`1px solid #e2e5ea`,borderRadius:8,fontSize:13,fontWeight:500}}>
              <option>Any</option>
              <option>Star Alliance</option>
              <option>oneworld</option>
              <option>SkyTeam</option>
            </select>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,padding:"14px",background:"#f3f4f6",borderRadius:8}}>
          <input type="checkbox" id="budget-toggle" checked={manualBudget} onChange={e=>setManualBudget(e.target.checked)} style={{cursor:"pointer"}} />
          <label htmlFor="budget-toggle" style={{cursor:"pointer",fontSize:13,fontWeight:500,color:s.text}}>Include budget airlines</label>
        </div>

        <button onClick={runManualSearch} disabled={!manualFrom || !manualTo} style={{width:"100%",background:manualFrom&&manualTo?s.teal:"#ccc",color:"#fff",border:"none",borderRadius:10,padding:"14px 20px",fontSize:15,fontWeight:700,cursor:manualFrom&&manualTo?"pointer":"not-allowed",transition:"all 0.2s"}}>
          Search Flights
        </button>
      </div>
    </div>
  );

  // ═══════════ PARSING ═══════════
  const Parsing = () => (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:420,animation:"jv-fadein 0.3s ease"}}>
      <div style={{width:52,height:52,border:`3px solid ${s.teal}`,borderTopColor:"transparent",borderRadius:"50%",animation:"jv-spin 0.7s linear infinite",marginBottom:28}} />
      <div style={{fontSize:20,fontWeight:700,color:s.navy}}>AI is parsing your search...</div>
      <div style={{fontSize:13,color:s.muted,marginTop:8,maxWidth:400,textAlign:"center"}}>Understanding route, dates, cabin, alliance & program preferences</div>
      <div style={{background:"#fff",borderRadius:12,padding:"12px 20px",marginTop:24,border:"1px solid #e8eaef"}}>
        <span style={{fontSize:13,color:s.text,fontWeight:500}}>"{query}"</span>
      </div>
    </div>
  );

  // ═══════════ SEARCHING ═══════════
  const Searching = () => (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:420,animation:"jv-fadein 0.3s ease"}}>
      {parsed?.summary && (
        <div style={{background:"#fff",borderRadius:12,padding:"12px 20px",marginBottom:28,border:"1px solid #e8eaef",maxWidth:520}}>
          <span style={{fontSize:11,fontWeight:700,color:s.teal,marginRight:8}}>PARSED</span>
          <span style={{fontSize:13,color:s.text}}>{parsed.summary}</span>
        </div>
      )}
      <div style={{fontSize:18,fontWeight:700,color:s.navy,marginBottom:20}}>Scanning top airlines...</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,maxWidth:500,justifyContent:"center",marginBottom:28}}>
        {AIRLINES.slice(0,20).map((al,i)=>(
          <div key={al.code} style={{width:42,height:42,borderRadius:8,background:i<=scanIndex?"#f8f9fa":"#e8eaef",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s",transform:i===scanIndex?"scale(1.15)":"scale(1)",boxShadow:i===scanIndex?`0 4px 16px ${al.color}40`:"none",overflow:"hidden",border:i<=scanIndex?"1px solid #e8eaef":"1px solid #e8eaef",opacity:i<=scanIndex?1:0.4}}>
            <img src={airlineLogo(al.code,80)} alt={al.code} style={{width:34,height:34,objectFit:"contain"}} onError={e=>{e.target.style.display="none";e.target.parentElement.style.background=al.color;e.target.parentElement.innerHTML=`<span style="color:#fff;font-size:10px;font-weight:700;font-family:'IBM Plex Mono',monospace">${al.code}</span>`;}} />
          </div>
        ))}
      </div>
      <div style={{width:300,height:4,background:"#e8eaef",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",background:s.teal,borderRadius:2,transition:"width 0.1s",width:`${(scanIndex/20)*100}%`}} />
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:32,width:"100%",maxWidth:660}}>
        {[1,2,3].map(i=>(
          <div key={i} style={{height:85,borderRadius:14,background:"linear-gradient(90deg, #e8eaef 25%, #f3f4f6 50%, #e8eaef 75%)",backgroundSize:"800px",animation:"jv-shimmer 1.5s infinite linear",opacity:1-i*0.2}} />
        ))}
      </div>
    </div>
  );

  // ═══════════ FLIGHT CARD ═══════════
  const FlightCard = ({fl, rank}) => {
    const expanded = expandedId===fl.id;
    const isBest = rank===0;
    const rating = fl.miles ? cpmRating(fl.cpm) : null;
    const orig = apByCode(fl.origin);
    const dest = apByCode(fl.destination);

    return (
      <div style={{background:"#fff",borderRadius:14,cursor:"pointer",border:isBest?`2px solid ${s.teal}`:"1px solid #e8eaef",animation:`jv-fadein 0.4s ease ${rank*0.05}s both`,transition:"all 0.25s",position:"relative",overflow:"hidden",...(isBest?{boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}:{})}}
        onMouseEnter={e=>{if(!isBest)e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.06)";}}
        onMouseLeave={e=>{if(!isBest)e.currentTarget.style.boxShadow="none";}}>
        {isBest && (
          <div style={{background:s.teal,color:"#fff",fontSize:11,fontWeight:700,padding:"5px 16px",textAlign:"center",letterSpacing:"0.5px",animation:"jv-ribbon 0.5s ease"}}>
            {fl.selfTransfer ? `BEST DEAL — $${fl.cash.toLocaleString()} via self-transfer through ${fl.connectingHub}` : `BEST VALUE — Save $${(fl.cash-fl.fees).toLocaleString()} by using ${fl.miles ? fl.miles.toLocaleString() + " miles" : "cash"}`}
          </div>
        )}
        <div style={{padding:"20px 24px"}} onClick={()=>setExpandedId(expanded?null:fl.id)}>
          <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
            {/* Price first — largest element, left-aligned */}
            <div style={{display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
              {fl.miles ? (
                <>
                  <div style={{textAlign:"left"}}>
                    <div className="jv-mono" style={{fontSize:28,fontWeight:700,color:s.teal,lineHeight:1.1}}>{fl.miles.toLocaleString()}</div>
                    <div style={{fontSize:11,color:s.muted}}>miles + ${fl.fees}</div>
                  </div>
                  <div style={{width:1,height:36,background:"#e8eaef"}} />
                  <div style={{textAlign:"left"}}>
                    <div className="jv-mono" style={{fontSize:22,fontWeight:700,color:s.navy,lineHeight:1.1}}>${fl.cash.toLocaleString()}</div>
                    <div style={{fontSize:11,color:s.muted}}>cash</div>
                  </div>
                  <span style={{background:rating.bg,color:rating.color,fontSize:10,fontWeight:600,padding:"4px 10px",borderRadius:6,marginLeft:4}}>{rating.label}</span>
                </>
              ) : (
                <>
                  <div style={{textAlign:"left"}}>
                    <div className="jv-mono" style={{fontSize:28,fontWeight:700,color:s.navy,lineHeight:1.1}}>${fl.cash.toLocaleString()}</div>
                    <div style={{fontSize:11,color:s.muted}}>cash only</div>
                  </div>
                </>
              )}
            </div>

            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:140}}>
              {fl.selfTransfer ? (
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {AirlineLogo({code:fl.airline.code, color:fl.airline.color, size:28})}
                  <span style={{fontSize:10,color:s.muted,fontWeight:600}}>+</span>
                  {AirlineLogo({code:fl.airline2.code, color:fl.airline2.color, size:28})}
                </div>
              ) : AirlineLogo({code:fl.airline.code, color:fl.airline.color, size:36})}
              <div>
                <div style={{fontSize:13,fontWeight:600,color:s.navy}}>{fl.selfTransfer ? `${fl.airline.name} + ${fl.airline2.name}` : fl.airline.name}</div>
                <div style={{fontSize:11,color:s.muted}}>{fl.depDate}</div>
              </div>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:14,flex:1,minWidth:220,justifyContent:"center"}}>
              <div style={{textAlign:"right"}}>
                <div className="jv-mono" style={{fontSize:16,fontWeight:700,color:s.navy}}>{fl.depTime}</div>
                <div className="jv-mono" style={{fontSize:11,fontWeight:600,color:s.muted}}>{fl.origin}</div>
              </div>
              <div style={{flex:1,maxWidth:150,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{fontSize:11,color:s.muted}}>{fl.duration}</div>
                <div style={{width:"100%",height:2,background:"#e2e5ea",position:"relative",borderRadius:1}}>
                  <div style={{position:"absolute",left:0,top:-3,width:6,height:6,borderRadius:"50%",background:s.teal}} />
                  {fl.connectingHub ? (
                    <div style={{position:"absolute",left:"50%",top:-4,transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center"}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:s.gold,border:"2px solid #fff"}} />
                      <div style={{fontSize:8,color:s.gold,fontWeight:700,marginTop:1}}>{fl.connectingHub}</div>
                    </div>
                  ) : fl.stops>0 && Array.from({length:fl.stops}).map((_,i)=>(
                    <div key={i} style={{position:"absolute",left:`${(i+1)*100/(fl.stops+1)}%`,top:-2,width:5,height:5,borderRadius:"50%",background:"#d1d5db",border:"2px solid #fff"}} />
                  ))}
                  <div style={{position:"absolute",right:0,top:-3,width:6,height:6,borderRadius:"50%",background:s.teal}} />
                </div>
                <div style={{fontSize:10,color:fl.nonstop?s.teal:fl.selfTransfer?s.gold:s.muted,fontWeight:fl.nonstop?600:fl.selfTransfer?600:400}}>
                  {fl.nonstop?"Nonstop":fl.selfTransfer?`Self-transfer · ${fl.layover} layover`:`${fl.stops} stop${fl.stops>1?"s":""}`}
                </div>
              </div>
              <div style={{textAlign:"left"}}>
                <div className="jv-mono" style={{fontSize:16,fontWeight:700,color:s.navy}}>{fl.arrTime}</div>
                <div className="jv-mono" style={{fontSize:11,fontWeight:600,color:s.muted}}>{fl.destination}</div>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,minWidth:75}}>
              {fl.selfTransfer ? (
                <span style={{background:"#fff3e0",color:s.gold,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:5,border:`1px solid ${s.gold}30`}}>Self-transfer</span>
              ) : (
                <span style={{background:ALLIANCE_COLORS[fl.airline.alliance]+"18",color:ALLIANCE_COLORS[fl.airline.alliance],fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:5}}>{fl.airline.alliance}</span>
              )}
              <span style={{fontSize:11,color:fl.seats<=3?s.red:s.muted,fontWeight:fl.seats<=3?700:400}}>
                {fl.seats} seat{fl.seats>1?"s":""}
              </span>
              {fl.hasDevaluation && <span style={{fontSize:10,color:s.gold,fontWeight:600}}>Devalued</span>}
            </div>
          </div>

          {expanded && (
            <div style={{marginTop:18,paddingTop:18,borderTop:"1px solid #eef0f4",animation:"jv-fadein 0.3s ease"}}>
              {fl.selfTransfer && fl.leg1 && fl.leg2 && (
                <div style={{background:"#fefbf3",border:`1px solid ${s.gold}25`,borderRadius:12,padding:16,marginBottom:16}}>
                  <div style={{fontSize:10,fontWeight:700,color:s.gold,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>Connection Details — Book Each Leg Separately</div>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:200,background:"#fff",borderRadius:10,padding:14,border:"1px solid #e8eaef"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        {AirlineLogo({code:fl.leg1.airline.code, color:fl.leg1.airline.color, size:24})}
                        <div style={{fontSize:13,fontWeight:700,color:s.navy}}>Leg 1 — {fl.leg1.airline.name}</div>
                      </div>
                      <div className="jv-mono" style={{fontSize:12,color:s.text}}>{fl.leg1.origin} → {fl.leg1.destination} · {fl.leg1.duration}</div>
                      <div className="jv-mono" style={{fontSize:18,fontWeight:700,color:s.teal,marginTop:6}}>${fl.leg1.cash.toLocaleString()}</div>
                      <button onClick={()=>window.open(getBookingUrl(fl.leg1.airline.code, fl.leg1.origin, fl.leg1.destination), "_blank")}
                        style={{background:s.teal,color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer",marginTop:8,width:"100%"}}>
                        Book Leg 1 — ${fl.leg1.cash}
                      </button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",flexDirection:"column",justifyContent:"center",padding:"0 4px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:s.gold}}>{fl.layover}</div>
                      <div style={{fontSize:9,color:s.muted}}>layover at</div>
                      <div className="jv-mono" style={{fontSize:13,fontWeight:700,color:s.navy}}>{fl.connectingHub}</div>
                    </div>
                    <div style={{flex:1,minWidth:200,background:"#fff",borderRadius:10,padding:14,border:"1px solid #e8eaef"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        {AirlineLogo({code:fl.leg2.airline.code, color:fl.leg2.airline.color, size:24})}
                        <div style={{fontSize:13,fontWeight:700,color:s.navy}}>Leg 2 — {fl.leg2.airline.name}</div>
                      </div>
                      <div className="jv-mono" style={{fontSize:12,color:s.text}}>{fl.leg2.origin} → {fl.leg2.destination} · {fl.leg2.duration}</div>
                      <div className="jv-mono" style={{fontSize:18,fontWeight:700,color:s.teal,marginTop:6}}>${fl.leg2.cash.toLocaleString()}</div>
                      <button onClick={()=>window.open(getBookingUrl(fl.leg2.airline.code, fl.leg2.origin, fl.leg2.destination), "_blank")}
                        style={{background:s.teal,color:"#fff",border:"none",borderRadius:6,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer",marginTop:8,width:"100%"}}>
                        Book Leg 2 — ${fl.leg2.cash}
                      </button>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:s.muted,marginTop:10,textAlign:"center"}}>
                    Total: <strong>${fl.cash.toLocaleString()}</strong> (${fl.leg1.cash} + ${fl.leg2.cash}) · Self-transfer: you'll need to collect bags and re-check in at {fl.connectingHub}
                  </div>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))",gap:18}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:s.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:8}}>Book Via</div>
                  <div style={{fontSize:15,fontWeight:700,color:s.navy}}>{fl.selfTransfer ? "Separate bookings" : (fl.airline.program || "Cash booking")}</div>
                  <div style={{fontSize:12,color:s.muted,marginTop:2}}>{orig?.city||fl.origin} → {dest?.city||fl.destination} · {fl.cabin} · {fl.depDate}{fl.arrDate ? ` → ${fl.arrDate}`:""}</div>
                </div>
                {fl.miles && (
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:s.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:8}}>Value Math</div>
                    <div className="jv-mono" style={{fontSize:13,color:s.text,lineHeight:1.8}}>
                      ${fl.cash.toLocaleString()} − ${fl.fees} = <strong>${(fl.cash-fl.fees).toLocaleString()}</strong><br/>
                      ${(fl.cash-fl.fees).toLocaleString()} ÷ {fl.miles.toLocaleString()} mi = <span style={{color:rating.color,fontWeight:700,fontSize:15}}>{fl.cpm}¢/mi</span>
                    </div>
                  </div>
                )}
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:s.muted,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:8}}>{fl.miles ? "Transfer Partners" : "Program"}</div>
                  {fl.miles && fl.airline.transfers.length>0 ? (
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {fl.airline.transfers.map(tp=>{const t=TRANSFER_PARTNERS.find(x=>x.name===tp);return <span key={tp} style={{background:t?.color+"12",color:t?.color,border:`1px solid ${t?.color}28`,fontSize:11,fontWeight:600,padding:"5px 11px",borderRadius:7}}>{tp}</span>;})}
                    </div>
                  ) : <div style={{fontSize:12,color:s.muted}}>{fl.miles ? "No major transfer partners" : "No loyalty program"}</div>}
                </div>
              </div>
              {fl.hasDevaluation && fl.devaluation && (
                <div style={{background:"#fef6e6",border:`1px solid ${s.gold}35`,borderRadius:12,padding:16,marginTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:s.gold}}>Devaluation Alert — {fl.devaluation.program} ({fl.devaluation.date})</div>
                  <div style={{fontSize:12,color:s.text,marginTop:4}}>{fl.devaluation.desc}</div>
                </div>
              )}
              {fl.miles && (
                <div style={{background:"#f0fdfb",border:`1px solid ${s.teal}25`,borderRadius:12,padding:16,marginTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:s.teal,marginBottom:4}}>AI Recommendation</div>
                  <div style={{fontSize:13,color:s.text,lineHeight:1.55}}>{aiRec(fl.cpm)}</div>
                </div>
              )}
              <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
                {fl.selfTransfer ? (
                  <>
                    <button onClick={()=>window.open(getBookingUrl(fl.leg1.airline.code, fl.leg1.origin, fl.leg1.destination), "_blank")}
                      style={{background:s.teal,color:"#fff",border:"none",borderRadius:8,padding:"11px 22px",fontSize:13,fontWeight:700,cursor:"pointer",transition:"opacity 0.15s"}}
                      onMouseEnter={e=>e.target.style.opacity="0.9"} onMouseLeave={e=>e.target.style.opacity="1"}>
                      Book Leg 1 — ${fl.leg1.cash} ({fl.leg1.airline.name})
                    </button>
                    <button onClick={()=>window.open(getBookingUrl(fl.leg2.airline.code, fl.leg2.origin, fl.leg2.destination), "_blank")}
                      style={{background:s.navy,color:"#fff",border:"none",borderRadius:8,padding:"11px 22px",fontSize:13,fontWeight:700,cursor:"pointer",transition:"opacity 0.15s"}}
                      onMouseEnter={e=>e.target.style.opacity="0.9"} onMouseLeave={e=>e.target.style.opacity="1"}>
                      Book Leg 2 — ${fl.leg2.cash} ({fl.leg2.airline.name})
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={()=>window.open(getBookingUrl(fl.airline.code, fl.origin, fl.destination), "_blank")}
                      style={{background:s.teal,color:"#fff",border:"none",borderRadius:8,padding:"11px 22px",fontSize:13,fontWeight:700,cursor:"pointer",transition:"opacity 0.15s"}}
                      onMouseEnter={e=>e.target.style.opacity="0.9"} onMouseLeave={e=>e.target.style.opacity="1"}>
                      Book with Cash — ${fl.cash}
                    </button>
                    {fl.miles && (
                      <button onClick={()=>window.open(getBookingUrl(fl.airline.code, fl.origin, fl.destination), "_blank")}
                        style={{background:"transparent",color:s.teal,border:`2px solid ${s.teal}`,borderRadius:8,padding:"9px 20px",fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.target.style.background=s.teal+"08";}} onMouseLeave={e=>{e.target.style.background="transparent";}}>
                        Book with Miles — {fl.miles.toLocaleString()} mi
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════ RESULTS ═══════════
  const Results = () => (
    <div style={{maxWidth:1060,margin:"0 auto",padding:"24px 24px 64px",animation:"jv-fadein 0.4s ease"}}>
      <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>{SearchBar({})}</div>

      {parsed && (
        <div style={{background:"#fff",borderRadius:14,padding:"14px 22px",marginBottom:18,border:"1px solid #e8eaef",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{background:s.teal+"12",color:s.teal,fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:8,border:`1px solid ${s.teal}25`}}>AI Understood</span>
          {flights[0]?.source==="amadeus" && <span style={{background:"#eef6ff",color:"#1a6eff",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:6,border:"1px solid #1a6eff20",letterSpacing:"0.3px"}}>LIVE DATA</span>}
          <span style={{fontSize:14,color:s.navy,fontWeight:600,flex:1}}>{parsed.summary}</span>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {parsed.origins?.slice(0,3).map(o=><span key={o} className="jv-mono" style={{fontSize:11,color:s.muted,background:"#f3f4f6",padding:"3px 8px",borderRadius:5,fontWeight:600}}>{o}</span>)}
            <span style={{color:s.muted,fontSize:11}}>→</span>
            {parsed.destinations?.slice(0,3).map(d=><span key={d} className="jv-mono" style={{fontSize:11,color:s.muted,background:"#f3f4f6",padding:"3px 8px",borderRadius:5,fontWeight:600}}>{d}</span>)}
            <span style={{background:`${s.teal}10`,color:s.teal,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:5}}>{parsed.cabin}</span>
          </div>
        </div>
      )}

      {stats && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:22}}>
          {[
            {label:"Best Miles",value:aBestMiles.toLocaleString(),sub:"miles",color:s.teal},
            {label:"Best Cash",value:`$${aBestCash.toLocaleString()}`,sub:"fare",color:s.blue},
            {label:"Best ¢/mi",value:`${aBestCpm}¢`,sub:"per mile",color:"#3b9e3b"},
            {label:"Avg Value",value:`${aAvgCpm}¢`,sub:"per mile",color:s.gold},
            {label:"Nonstop",value:stats.nonstops,sub:`of ${stats.totalResults}`,color:s.navy},
          ].map((m,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:12,padding:"16px 14px",border:"1px solid #e8eaef",textAlign:"center",borderTop:`3px solid ${m.color}`,animation:`jv-countup 0.5s ease ${i*0.1}s both`}}>
              <div className="jv-mono" style={{fontSize:24,fontWeight:700,color:m.color}}>{m.value}</div>
              <div style={{fontSize:11,color:s.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginTop:4}}>{m.label}</div>
              <div style={{fontSize:10,color:s.muted,marginTop:2}}>{m.sub}</div>
            </div>
          ))}
        </div>
      )}

      {flights.some(fl => fl.isReturn) && (
        <div style={{display:"flex",gap:0,marginBottom:16,borderRadius:12,overflow:"hidden",border:"1px solid #e8eaef"}}>
          <button onClick={()=>setTripDirection("outbound")} style={{flex:1,padding:"14px 28px",fontSize:14,fontWeight:700,cursor:"pointer",border:"none",background:tripDirection==="outbound"?s.teal:"#fff",color:tripDirection==="outbound"?"#fff":s.navy,transition:"all 0.2s"}}>
            <span style={{fontSize:18,marginRight:8}}>&#9992;</span> Outbound
            <span style={{display:"block",fontSize:11,fontWeight:400,marginTop:2,opacity:0.8}}>
              {parsed?.origins?.[0]} → {parsed?.destinations?.[0]}
            </span>
          </button>
          <button onClick={()=>setTripDirection("return")} style={{flex:1,padding:"14px 28px",fontSize:14,fontWeight:700,cursor:"pointer",border:"none",borderLeft:"1px solid #e8eaef",background:tripDirection==="return"?s.teal:"#fff",color:tripDirection==="return"?"#fff":s.navy,transition:"all 0.2s"}}>
            <span style={{fontSize:18,marginRight:8}}>&#9992;</span> Return
            <span style={{display:"block",fontSize:11,fontWeight:400,marginTop:2,opacity:0.8}}>
              {parsed?.destinations?.[0]} → {parsed?.origins?.[0]}
            </span>
          </button>
        </div>
      )}

      <div style={{background:"#fff",borderRadius:12,padding:"12px 18px",marginBottom:22,border:"1px solid #e8eaef",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{fontSize:11,fontWeight:700,color:s.muted}}>Sort:</span>
        {[["value","Best Value"],["miles","Miles"],["cash","Cash"],["fastest","Duration"],["nonstop","Stops"]].map(([id,l])=>(
          <button key={id} onClick={()=>{console.log("[Jovair] Sort clicked:",id);if(sortBy===id){setSortDir(d=>d==="asc"?"desc":"asc")}else{setSortBy(id);setSortDir("asc")}}} style={{background:sortBy===id?s.navy:"transparent",color:sortBy===id?"#fff":s.muted,border:`1px solid ${sortBy===id?s.navy:"#e2e5ea"}`,borderRadius:20,padding:"5px 13px",fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}{sortBy===id?(sortDir==="asc"?" ↑":" ↓"):""}</button>
        ))}
        <div style={{width:1,height:20,background:"#e2e5ea",margin:"0 4px"}} />
        <span style={{fontSize:11,fontWeight:700,color:s.muted}}>Alliance:</span>
        {["All","Star Alliance","oneworld","SkyTeam","Budget"].map(a=>{
          const cnt = a==="All" ? flights.length : flights.filter(fl=>fl.airline.alliance===a).length;
          return <button key={a} onClick={()=>{console.log("[Jovair] Filter clicked:",a);setFilterAlliance(a);}} style={{background:filterAlliance===a?(ALLIANCE_COLORS[a]||s.navy):"transparent",color:filterAlliance===a?"#fff":s.muted,border:`1px solid ${filterAlliance===a?(ALLIANCE_COLORS[a]||s.navy):"#e2e5ea"}`,borderRadius:20,padding:"5px 13px",fontSize:11,fontWeight:600,cursor:"pointer",opacity:cnt===0&&a!=="All"?0.4:1}}>{a}{cnt>0&&a!=="All"?` (${cnt})`:""}</button>;
        })}
        <div style={{width:1,height:20,background:"#e2e5ea",margin:"0 4px"}} />
        {TRANSFER_PARTNERS.map(tp=>(
          <button key={tp.name} onClick={()=>setFilterTransfer(filterTransfer===tp.name?null:tp.name)} style={{background:filterTransfer===tp.name?tp.color:"transparent",color:filterTransfer===tp.name?"#fff":s.muted,border:`1px solid ${filterTransfer===tp.name?tp.color:"#e2e5ea"}`,borderRadius:20,padding:"5px 11px",fontSize:10,fontWeight:600,cursor:"pointer"}}>{tp.short}</button>
        ))}
        <div style={{width:1,height:20,background:"#e2e5ea",margin:"0 4px"}} />
        <button onClick={()=>setFilterNonstop(!filterNonstop)} style={{background:filterNonstop?s.teal:"transparent",color:filterNonstop?"#fff":s.muted,border:`1px solid ${filterNonstop?s.teal:"#e2e5ea"}`,borderRadius:20,padding:"5px 13px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Nonstop</button>
        <button onClick={()=>setFilterSelfTransfer&&setFilterSelfTransfer(!filterSelfTransfer)} style={{background:filterSelfTransfer?s.gold:"transparent",color:filterSelfTransfer?"#fff":s.muted,border:`1px solid ${filterSelfTransfer?s.gold:"#e2e5ea"}`,borderRadius:20,padding:"5px 13px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Self-transfer</button>
        <div style={{width:1,height:20,background:"#e2e5ea",margin:"0 4px"}} />
        <span style={{fontSize:11,fontWeight:700,color:s.muted}}>Max:</span>
        {[250,500,750,1000].map(p=>(
          <button key={p} onClick={()=>setFilterMaxPrice(filterMaxPrice===p?null:p)} style={{background:filterMaxPrice===p?s.gold:"transparent",color:filterMaxPrice===p?"#fff":s.muted,border:`1px solid ${filterMaxPrice===p?s.gold:"#e2e5ea"}`,borderRadius:20,padding:"5px 11px",fontSize:10,fontWeight:600,cursor:"pointer"}}>${p}</button>
        ))}
      </div>

      {(filterAlliance!=="All"||filterTransfer||filterNonstop||filterSelfTransfer||filterMaxPrice) && <div style={{fontSize:12,color:s.muted,marginBottom:8}}>Showing {filtered.length} of {flights.length} results{filterAlliance!=="All"?` · ${filterAlliance}`:""}{filterNonstop?" · Nonstop":""}{filterSelfTransfer?" · Self-transfer":""}{filterMaxPrice?` · Under $${filterMaxPrice}`:""}</div>}
      <div key={`${sortBy}-${sortDir}-${filterAlliance}-${filterNonstop}-${filterSelfTransfer}-${filterMaxPrice}-${filterTransfer||"none"}`} style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.length>0 ? filtered.map((fl,i)=><FlightCard key={fl.id} fl={fl} rank={i}/>) : (
          <div style={{textAlign:"center",padding:48,color:s.muted}}>
            <div style={{fontSize:16,fontWeight:600,color:s.navy,marginBottom:8}}>No flights match your filters</div>
            <div style={{fontSize:13,marginTop:6}}>Try adjusting your alliance, transfer partner, or nonstop filters.</div>
            <button onClick={()=>{setFilterAlliance("All");setFilterTransfer(null);setFilterNonstop(false);setFilterSelfTransfer(false);setFilterMaxPrice(null);}} style={{background:s.teal,color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",marginTop:16,fontSize:13,fontWeight:600,cursor:"pointer"}}>Reset Filters</button>
          </div>
        )}
      </div>

      {filtered.length>0 && (
        <div style={{background:"#fff",borderRadius:14,padding:"16px 22px",marginTop:24,border:"1px solid #e8eaef"}}>
          <div style={{fontSize:12,fontWeight:700,color:s.navy,marginBottom:10}}>Value Guide — Cents per Mile</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[{r:"2.0¢+",l:"Great Value",c:"#00b4a0"},{r:"1.5–2.0¢",l:"Strong Redemption",c:"#3b9e3b"},{r:"1.0–1.5¢",l:"Fair",c:"#f5a623"},{r:"<1.0¢",l:"Pay Cash",c:"#e5384f"}].map(v=>(
              <div key={v.l} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:2,background:v.c}} />
                <span className="jv-mono" style={{fontSize:12,fontWeight:600,color:s.text}}>{v.r}</span>
                <span style={{fontSize:12,color:s.muted}}>{v.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ═══════════ SWEET SPOTS TAB ═══════════
  const SweetSpotsTab = () => (
    <div style={{maxWidth:980,margin:"0 auto",padding:"36px 24px 64px",animation:"jv-fadein 0.4s ease"}}>
      <h1 style={{fontSize:30,fontWeight:800,color:s.navy}}>Award Sweet Spots</h1>
      <p style={{fontSize:14,color:s.muted,marginTop:6,marginBottom:32}}>The best-value redemptions across all major loyalty programs. Click any to search.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(310px, 1fr))",gap:20}}>
        {SWEET_SPOTS.map((sp,idx)=>{const al=alByCode(sp.airline);return(
          <div key={sp.id} onClick={()=>runSearch(sp.query)} style={{background:"#fff",borderRadius:16,padding:26,cursor:"pointer",border:"1px solid #e8eaef",transition:"all 0.25s",animation:`jv-fadein 0.5s ease ${idx*0.08}s both`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 10px 32px rgba(0,0,0,0.1)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {AirlineLogo({code:sp.airline, color:al?.color, size:44})}
                <div><div style={{fontSize:17,fontWeight:700,color:s.navy}}>{sp.route}</div><div style={{fontSize:12,color:s.muted}}>{sp.program}</div></div>
              </div>
              <span style={{background:ALLIANCE_COLORS[sp.alliance]+"18",color:ALLIANCE_COLORS[sp.alliance],fontSize:10,fontWeight:600,padding:"4px 10px",borderRadius:5}}>{sp.alliance}</span>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
              <span className="jv-mono" style={{fontSize:30,fontWeight:700,color:s.teal}}>{sp.miles.toLocaleString()}</span>
              <span style={{fontSize:13,color:s.muted}}>miles · {sp.cabin}</span>
            </div>
            <div style={{fontSize:12,fontWeight:700,color:s.teal,marginBottom:10}}>{sp.savings}</div>
            <p style={{fontSize:13,color:s.muted,lineHeight:1.6,marginBottom:14}}>{sp.desc}</p>
            {sp.transfers.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {sp.transfers.map(tp=>{const t=TRANSFER_PARTNERS.find(x=>x.name===tp);return <span key={tp} style={{background:t?.color+"10",color:t?.color,fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:5,border:`1px solid ${t?.color}20`}}>{tp}</span>;})}
              </div>
            )}
          </div>
        );})}
      </div>
    </div>
  );

  // ═══════════ DEVALUATIONS TAB ═══════════
  const DevaluationsTab = () => (
    <div style={{maxWidth:780,margin:"0 auto",padding:"36px 24px 64px",animation:"jv-fadein 0.4s ease"}}>
      <h1 style={{fontSize:30,fontWeight:800,color:s.navy}}>Devaluation Tracker</h1>
      <p style={{fontSize:14,color:s.muted,marginTop:6,marginBottom:32}}>Stay informed — programs change award pricing constantly.</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {DEVALUATIONS.map((d,i)=>{const al=d.airline?alByCode(d.airline):null;return(
          <div key={i} style={{background:"#fff",borderRadius:14,padding:"20px 22px",border:"1px solid #e8eaef",borderLeft:`4px solid ${d.color}`,animation:`jv-fadein 0.4s ease ${i*0.08}s both`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {al && AirlineLogo({code:al.code, color:al.color, size:34})}
                <div><div style={{fontSize:16,fontWeight:700,color:s.navy}}>{d.program}</div><div style={{fontSize:12,color:s.muted}}>{d.date}</div></div>
              </div>
              <span style={{background:d.color+"15",color:d.color,fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:5,letterSpacing:"0.5px"}}>{d.severity}</span>
            </div>
            <p style={{fontSize:13,color:s.text,lineHeight:1.6}}>{d.desc}</p>
          </div>
        );})}
      </div>
      <div style={{background:"#f0fdfb",border:`1px solid ${s.teal}25`,borderRadius:16,padding:28,marginTop:32}}>
        <div style={{fontSize:18,fontWeight:700,color:s.navy,marginBottom:14}}>How to Protect Yourself</div>
        <div style={{fontSize:13,color:s.text,lineHeight:1.75}}>
          <strong>Earn and burn.</strong> Don't hoard miles — use them within 6-12 months of earning. Programs devalue constantly.
          <br/><br/><strong>Diversify.</strong> Keep points in transferable currencies (Chase UR, Amex MR) so you can move to whichever program offers the best value.
          <br/><br/><strong>Watch the 90-day rule.</strong> US programs typically give ~90 days notice before devaluations. Follow points blogs and set alerts.
          <br/><br/><strong>Book sweet spots now.</strong> When you see an outstanding redemption, lock it in. These deals disappear.
        </div>
      </div>
    </div>
  );

  // ═══════════ TOOLS TAB ═══════════
  const ToolsTab = () => (
    <div style={{maxWidth:780,margin:"0 auto",padding:"36px 24px 64px",animation:"jv-fadein 0.4s ease"}}>
      <h1 style={{fontSize:30,fontWeight:800,color:s.navy}}>Tools</h1>
      <p style={{fontSize:14,color:s.muted,marginTop:6,marginBottom:32}}>Powerful utilities coming soon.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))",gap:16}}>
        {[
          {title:"Transfer Partner Map",desc:"Visual map of credit card → airline transfer partnerships"},
          {title:"Points Portfolio",desc:"Connect accounts and see your total points value"},
          {title:"Fare Alerts",desc:"Get notified when award space opens on your routes"},
          {title:"Miles Calculator",desc:"Calculate any redemption value before booking"},
          {title:"Historical Pricing",desc:"Track how award prices change over time"},
          {title:"Route Explorer",desc:"Best routes from your home airport by value"},
        ].map((t,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:14,padding:22,border:"1px solid #e8eaef",position:"relative",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.06)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
            <span style={{position:"absolute",top:14,right:14,background:"#f3f4f6",color:s.muted,fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:4,letterSpacing:"0.5px"}}>COMING SOON</span>
            <div style={{fontSize:11,fontWeight:700,color:s.teal,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:12}}>{String.fromCharCode(65+i)}</div>
            <div style={{fontSize:15,fontWeight:700,color:s.navy,marginBottom:6}}>{t.title}</div>
            <div style={{fontSize:13,color:s.muted,lineHeight:1.5}}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════ RENDER ═══════════
  return (
    <div style={{minHeight:"100vh",background:s.bg,fontFamily:"'Manrope',system-ui,sans-serif",color:s.text}}>
      {Nav()}
      {tab==="search" && (phase==="home"?Home():phase==="parsing"?Parsing():phase==="searching"?Searching():Results())}
      {tab==="manual" && ManualSearch()}
      {tab==="sweetspots" && SweetSpotsTab()}
      {tab==="devaluations" && DevaluationsTab()}
      {tab==="tools" && ToolsTab()}
    </div>
  );
}
