import express from "express";
import "dotenv/config";

const app = express();
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// AMADEUS AUTH — OAuth2 token management
// ═══════════════════════════════════════════════════════════════

let amadeusToken = null;
let amadeusTokenExpiry = 0;

async function getAmadeusToken() {
  // Return cached token if still valid (with 60s buffer)
  if (amadeusToken && Date.now() < amadeusTokenExpiry - 60000) return amadeusToken;

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Amadeus credentials not configured");

  // Use test environment by default, production if AMADEUS_ENV=production
  const baseUrl = process.env.AMADEUS_ENV === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";

  const res = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Amadeus auth failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  amadeusToken = data.access_token;
  amadeusTokenExpiry = Date.now() + data.expires_in * 1000;
  return amadeusToken;
}

function amadeusBaseUrl() {
  return process.env.AMADEUS_ENV === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";
}

// ═══════════════════════════════════════════════════════════════
// AI PARSE ENDPOINT (Anthropic Claude)
// ═══════════════════════════════════════════════════════════════

const AI_SYSTEM_PROMPT = `You are a flight search query parser for Jovair, an AI-powered flight search engine. Parse the user's natural language query into structured JSON.

IMPORTANT: Respond with ONLY valid JSON, no markdown, no code fences, no explanation.

CABIN DEFAULTS:
- Words like "cheapest", "cheap", "budget", or "affordable" with no cabin mentioned → cabin MUST be "Economy" (not Business).
- Only set Business or First when the user explicitly asks for that cabin (e.g. "business class", "first class", "premium").

EVENT-BASED DATE AND DESTINATION INTERPRETATION:
Interpret cultural and sporting events as specific dates and destinations. Examples:
- "Wimbledon" → destinations: ["LHR"], dateRange: "late June 2026" (or current/future year). Summary should mention "for Wimbledon".
- "The Olympics" / "Olympics" → destination is the host city for that year (e.g. Los Angeles 2028 = ["LAX"], "Summer 2028"; Paris 2024 = ["CDG"], "Summer 2024"). Include the event in the summary.
- "Thanksgiving" → dateRange: "late November" (e.g. "late November 2026"). US holiday; origins/destinations unchanged unless specified.
- "Cherry blossom season" / "cherry blossoms" → destinations: ["NRT","HND"] (Tokyo), dateRange: "late March to early April" (e.g. "late March 2026"). Include "cherry blossom season" in the summary.
- "Christmas" / "New Year" → dateRange: "late December" or "early January" as appropriate.
Always reflect the inferred event, dates, and destination in the "summary" field so the user sees exactly what you understood.

SUMMARY FIELD (critical):
The summary must be detailed and human-readable. It should reflect exactly what the AI understood, including:
- Cabin class (Economy, Business, etc.)
- Origin(s) and destination(s), with airport codes in parentheses when helpful, e.g. "London (LHR)"
- Inferred dates or date range, e.g. "late June 2026", "late November"
- The event or reason if inferred from context

DATE OUTPUT (critical — must include departureDate and returnDate for Amadeus):
If dates can be inferred, include ISO format dates:
- "departureDate": "2026-06-22" (YYYY-MM-DD, pick a sensible date within the range)
- "returnDate": "2026-07-02" (optional, ~7-10 days later for round trips, or null for one-way)
If the user says "one way", set returnDate to null.
If dates are "Flexible", pick dates 30-60 days from today.

Airport region mappings:
- "NYC area" / "New York" = ["JFK","EWR","LGA"]
- "London" = ["LHR"]
- "Tokyo" = ["NRT","HND"]
- "Washington" / "DC" = ["IAD","DCA"]
- "Chicago" = ["ORD"]
- "San Francisco" / "Bay Area" = ["SFO"]
- "Los Angeles" / "LA" = ["LAX"]
- "Paris" = ["CDG"]
- "Europe" = ["LHR","CDG","FRA","AMS","FCO","BCN","LIS","ATH","ZRH"]
- "Asia" = ["NRT","HND","SIN","HKG","ICN","BKK","DEL"]
- "Middle East" = ["DXB","DOH","IST"]
- "South America" = ["GRU","MEX"]

Transfer partner mappings:
- "Chase UR" / "Chase Ultimate Rewards" / "Chase points" → maps to airlines: United, Air Canada, Singapore, British Airways, Air France/KLM, Virgin Atlantic, Emirates, Japan Airlines
- "Amex MR" / "Amex Membership Rewards" / "Amex points" → maps to airlines: Air Canada, Lufthansa, ANA, Singapore, British Airways, Cathay Pacific, Delta, Air France/KLM, Virgin Atlantic, Emirates
- "Citi TYP" / "Citi ThankYou" → maps to airlines: Turkish, American, Qatar, Cathay Pacific, Japan Airlines, Air France/KLM, Virgin Atlantic, Emirates
- "AAdvantage miles" → program: AAdvantage, alliance: oneworld
- "MileagePlus miles" → program: MileagePlus, alliance: Star Alliance

Return this JSON structure:
{
  "origins": ["JFK","EWR","LGA"],
  "destinations": ["LHR","CDG"],
  "cabin": "Economy",
  "alliance": "any",
  "program": null,
  "dateRange": "April 2026",
  "departureDate": "2026-04-15",
  "returnDate": "2026-04-25",
  "maxMiles": null,
  "isExplore": false,
  "summary": "Economy flights from NYC to London (LHR) in late June 2026 for Wimbledon"
}

cabin must be one of: "Economy", "Premium Economy", "Business", "First"
alliance must be one of: "Star Alliance", "oneworld", "SkyTeam", "any"
If no specific date, use "Flexible" for dateRange but still provide departureDate/returnDate 30-60 days out.
If user mentions a specific program, set "program" to the program name.`;

app.post("/api/parse", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured. Add it to your .env file." });
  }

  const { query } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'query' in request body" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: AI_SYSTEM_PROMPT,
        messages: [{ role: "user", content: query }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Anthropic API error" });
    }

    const text = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    return res.json(parsed);
  } catch (err) {
    console.error("Anthropic proxy error:", err);
    return res.status(500).json({ error: "Failed to parse query" });
  }
});

// ═══════════════════════════════════════════════════════════════
// AMADEUS FLIGHT SEARCH ENDPOINT
// ═══════════════════════════════════════════════════════════════

// Cabin class mapping: Jovair names → Amadeus travel class
const CABIN_MAP = {
  "Economy": "ECONOMY",
  "Premium Economy": "PREMIUM_ECONOMY",
  "Business": "BUSINESS",
  "First": "FIRST",
};

// Airline code → loyalty program info (for miles/CPM overlay)
const AIRLINE_PROGRAMS = {
  UA: { program: "MileagePlus", alliance: "Star Alliance", transfers: ["Chase UR","Bilt"], color: "#0032A0" },
  AA: { program: "AAdvantage", alliance: "oneworld", transfers: ["Citi TYP","Bilt"], color: "#0078D2" },
  DL: { program: "SkyMiles", alliance: "SkyTeam", transfers: ["Amex MR"], color: "#003A70" },
  AS: { program: "Mileage Plan", alliance: "oneworld", transfers: ["Chase UR","Bilt"], color: "#003580" },
  B6: { program: "TrueBlue", alliance: "Independent", transfers: ["Amex MR","Chase UR"], color: "#003DA5" },
  HA: { program: "HawaiianMiles", alliance: "Independent", transfers: ["Amex MR","Chase UR"], color: "#00A0DF" },
  AC: { program: "Aeroplan", alliance: "Star Alliance", transfers: ["Chase UR","Amex MR","Capital One","Bilt"], color: "#d81e05" },
  LH: { program: "Miles & More", alliance: "Star Alliance", transfers: ["Amex MR"], color: "#05164d" },
  BA: { program: "Avios", alliance: "oneworld", transfers: ["Chase UR","Amex MR","Capital One"], color: "#075AAA" },
  AF: { program: "Flying Blue", alliance: "SkyTeam", transfers: ["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], color: "#002157" },
  KL: { program: "Flying Blue", alliance: "SkyTeam", transfers: ["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], color: "#00A1DE" },
  VS: { program: "Flying Club", alliance: "SkyTeam", transfers: ["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], color: "#E01224" },
  LX: { program: "Miles & More", alliance: "Star Alliance", transfers: ["Amex MR","Chase UR"], color: "#DC143C" },
  SK: { program: "EuroBonus", alliance: "Star Alliance", transfers: ["Amex MR"], color: "#003580" },
  IB: { program: "Avios", alliance: "oneworld", transfers: ["Amex MR","Chase UR","Citi TYP"], color: "#FFC72C" },
  AY: { program: "Finnair Plus", alliance: "oneworld", transfers: ["Amex MR"], color: "#003580" },
  TK: { program: "Miles&Smiles", alliance: "Star Alliance", transfers: ["Citi TYP","Capital One","Bilt"], color: "#C8102E" },
  SQ: { program: "KrisFlyer", alliance: "Star Alliance", transfers: ["Chase UR","Amex MR","Citi TYP","Capital One"], color: "#F0AB00" },
  NH: { program: "Mileage Club", alliance: "Star Alliance", transfers: ["Amex MR"], color: "#00467F" },
  CX: { program: "Asia Miles", alliance: "oneworld", transfers: ["Amex MR","Citi TYP","Capital One","Bilt"], color: "#005D63" },
  JL: { program: "Mileage Bank", alliance: "oneworld", transfers: ["Chase UR","Citi TYP"], color: "#C8102E" },
  KE: { program: "SKYPASS", alliance: "SkyTeam", transfers: ["Amex MR"], color: "#003D82" },
  BR: { program: "Infinity MileageLands", alliance: "Star Alliance", transfers: ["Amex MR"], color: "#0066CC" },
  CI: { program: "Dynasty Flyer", alliance: "SkyTeam", transfers: ["Amex MR"], color: "#0066CC" },
  CA: { program: "PhoenixMiles", alliance: "Star Alliance", transfers: ["Amex MR"], color: "#FF0000" },
  AI: { program: "Flying Returns", alliance: "Star Alliance", transfers: ["Amex MR"], color: "#0033CC" },
  EK: { program: "Skywards", alliance: "Independent", transfers: ["Chase UR","Amex MR","Citi TYP","Capital One","Bilt"], color: "#D71921" },
  QR: { program: "Privilege Club", alliance: "oneworld", transfers: ["Citi TYP"], color: "#5C0632" },
  ET: { program: "ShebaMiles", alliance: "Star Alliance", transfers: [], color: "#078930" },
  LA: { program: "LATAM Pass", alliance: "Independent", transfers: ["Chase UR","Citi TYP"], color: "#000000" },
  QF: { program: "Frequent Flyer", alliance: "oneworld", transfers: [], color: "#E0002A" },
  // Budget airlines — no loyalty program
  NK: { program: null, alliance: "Budget", transfers: [], color: "#FFD700" },
  F9: { program: null, alliance: "Budget", transfers: [], color: "#003D82" },
  WN: { program: null, alliance: "Budget", transfers: ["Chase UR"], color: "#0066CC" },
  FR: { program: null, alliance: "Budget", transfers: [], color: "#003DA5" },
  U2: { program: null, alliance: "Budget", transfers: [], color: "#FFC72C" },
  W6: { program: null, alliance: "Budget", transfers: [], color: "#003D82" },
  DY: { program: null, alliance: "Budget", transfers: [], color: "#FF0000" },
  WS: { program: null, alliance: "Budget", transfers: [], color: "#003D82" },
};

// Estimated miles cost by cabin (for CPM calculation when we have real cash price)
const ESTIMATED_MILES = {
  ECONOMY: { min: 8000, max: 45000 },
  PREMIUM_ECONOMY: { min: 20000, max: 70000 },
  BUSINESS: { min: 30000, max: 120000 },
  FIRST: { min: 50000, max: 180000 },
};

app.post("/api/flights", async (req, res) => {
  const { origins, destinations, departureDate, returnDate, cabin, alliance, maxResults } = req.body;

  if (!origins?.length || !destinations?.length) {
    return res.status(400).json({ error: "Missing origins or destinations" });
  }

  // Check if Amadeus is configured
  const hasAmadeus = process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET;
  if (!hasAmadeus) {
    return res.status(200).json({ source: "simulated", flights: [], message: "Amadeus not configured — using simulated data" });
  }

  try {
    const token = await getAmadeusToken();
    const baseUrl = amadeusBaseUrl();
    const travelClass = CABIN_MAP[cabin] || "ECONOMY";

    // Search for each origin→destination pair (Amadeus does one pair per call)
    const allOffers = [];
    const pairs = [];
    for (const orig of origins.slice(0, 3)) {      // limit to 3 origins to avoid rate limits
      for (const dest of destinations.slice(0, 2)) { // limit to 2 destinations
        if (orig !== dest) pairs.push({ orig, dest });
      }
    }

    // Run searches in parallel (max 6 pairs)
    const searches = pairs.slice(0, 6).map(async ({ orig, dest }) => {
      const params = new URLSearchParams({
        originLocationCode: orig,
        destinationLocationCode: dest,
        departureDate: departureDate || getFutureDate(30),
        adults: "1",
        travelClass,
        nonStop: "false",
        max: String(Math.min(maxResults || 10, 15)),
        currencyCode: "USD",
      });
      if (returnDate) params.set("returnDate", returnDate);

      const url = `${baseUrl}/v2/shopping/flight-offers?${params}`;
      console.log(`[Amadeus] Searching: ${orig}→${dest} on ${departureDate || "flexible"}`);

      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!r.ok) {
        const errText = await r.text();
        console.error(`[Amadeus] Error for ${orig}→${dest}: ${r.status} — ${errText}`);
        return [];
      }

      const data = await r.json();
      return (data.data || []).map(offer => transformAmadeusOffer(offer, data.dictionaries));
    });

    const results = await Promise.all(searches);
    for (const r of results) allOffers.push(...r);

    // Sort by price (ascending)
    allOffers.sort((a, b) => a.cash - b.cash);

    console.log(`[Amadeus] Found ${allOffers.length} real flight offers`);
    return res.json({ source: "amadeus", flights: allOffers });
  } catch (err) {
    console.error("[Amadeus] Flight search error:", err.message);
    return res.status(500).json({ error: err.message, source: "error" });
  }
});

// Transform an Amadeus flight offer into Jovair's format
function transformAmadeusOffer(offer, dictionaries) {
  const price = parseFloat(offer.price?.grandTotal || offer.price?.total || "0");
  const itinerary = offer.itineraries?.[0]; // outbound
  const segments = itinerary?.segments || [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  // Airline info
  const carrierCode = firstSeg?.carrierCode || "??";
  const airlineInfo = AIRLINE_PROGRAMS[carrierCode] || {
    program: null, alliance: "Independent", transfers: [], color: "#666"
  };
  const airlineName = dictionaries?.carriers?.[carrierCode] || carrierCode;

  // Timing
  const depTime = firstSeg?.departure?.at ? new Date(firstSeg.departure.at) : null;
  const arrTime = lastSeg?.arrival?.at ? new Date(lastSeg.arrival.at) : null;
  const depStr = depTime ? `${String(depTime.getHours()).padStart(2,"0")}:${String(depTime.getMinutes()).padStart(2,"0")}` : "--:--";
  const arrStr = arrTime ? `${String(arrTime.getHours()).padStart(2,"0")}:${String(arrTime.getMinutes()).padStart(2,"0")}` : "--:--";

  // Date formatting
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const depDateStr = depTime ? `${DAYS[depTime.getDay()]}, ${MONTHS[depTime.getMonth()]} ${depTime.getDate()}` : "";
  const nextDay = depTime && arrTime && depTime.toDateString() !== arrTime.toDateString();
  const arrDateStr = nextDay ? `${DAYS[arrTime.getDay()]}, ${MONTHS[arrTime.getMonth()]} ${arrTime.getDate()}` : null;

  // Duration
  const durationStr = itinerary?.duration || "";
  const durationMatch = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const durationHrs = parseInt(durationMatch?.[1] || "0");
  const durationMin = parseInt(durationMatch?.[2] || "0");
  const durationFormatted = `${durationHrs}h ${durationMin}m`;
  const durationTotalMin = durationHrs * 60 + durationMin;

  // Stops
  const stops = segments.length - 1;

  // Origin/destination
  const origin = firstSeg?.departure?.iataCode || "";
  const dest = lastSeg?.arrival?.iataCode || "";

  // Cabin from first segment
  const cabinClass = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY";
  const cabinNice = { ECONOMY: "Economy", PREMIUM_ECONOMY: "Premium Economy", BUSINESS: "Business", FIRST: "First" }[cabinClass] || "Economy";

  // Fare class
  const fareClass = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class || "Y";

  // Aircraft
  const aircraftCode = firstSeg?.aircraft?.code || "";
  const aircraftName = dictionaries?.aircraft?.[aircraftCode] || aircraftCode;

  // Estimated miles cost for CPM calculation
  const milesRange = ESTIMATED_MILES[cabinClass] || ESTIMATED_MILES.ECONOMY;
  const estimatedMiles = airlineInfo.program
    ? Math.round((milesRange.min + Math.random() * (milesRange.max - milesRange.min)) / 500) * 500
    : null;
  const fees = estimatedMiles ? Math.round(20 + Math.random() * 160) : 0;
  const cpm = estimatedMiles ? +((price - fees) / estimatedMiles * 100).toFixed(1) : null;

  // Seats available
  const seats = offer.numberOfBookableSeats || Math.floor(Math.random() * 8) + 1;

  return {
    id: `am-${offer.id || Math.random().toString(36).slice(2,8)}`,
    source: "amadeus",
    airline: {
      code: carrierCode,
      name: airlineName,
      program: airlineInfo.program,
      alliance: airlineInfo.alliance,
      color: airlineInfo.color,
      transfers: airlineInfo.transfers,
      type: airlineInfo.program ? "full-service" : "budget",
    },
    origin,
    destination: dest,
    cabin: cabinNice,
    miles: estimatedMiles,
    fees,
    cash: Math.round(price),
    cpm,
    stops,
    duration: durationFormatted,
    durationMin: durationTotalMin,
    depTime: depStr,
    arrTime: `${arrStr}${nextDay ? " +1" : ""}`,
    depDate: depDateStr,
    arrDate: arrDateStr,
    depDateObj: depTime,
    aircraft: aircraftName || "Unknown",
    fareClass,
    seats,
    nonstop: stops === 0,
    hasDevaluation: false,
    devaluation: null,
    // Extra Amadeus data
    amadeusPrice: price,
    amadeusId: offer.id,
    segments: segments.map(s => ({
      carrier: s.carrierCode,
      flight: `${s.carrierCode}${s.number}`,
      from: s.departure?.iataCode,
      to: s.arrival?.iataCode,
      depTime: s.departure?.at,
      arrTime: s.arrival?.at,
      aircraft: dictionaries?.aircraft?.[s.aircraft?.code] || s.aircraft?.code,
      duration: s.duration,
    })),
  };
}

function getFutureDate(daysOut) {
  const d = new Date(Date.now() + daysOut * 86400000);
  return d.toISOString().split("T")[0];
}

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    amadeus: !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`  Anthropic: ${process.env.ANTHROPIC_API_KEY ? "✓ configured" : "✗ missing"}`);
  console.log(`  Amadeus:   ${process.env.AMADEUS_CLIENT_ID ? "✓ configured" : "✗ missing"}`);
});
