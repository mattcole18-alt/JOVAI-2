// Vercel Serverless Function: /api/flights
// Searches Amadeus for real flight offers

let amadeusToken = null;
let amadeusTokenExpiry = 0;

async function getAmadeusToken() {
  if (amadeusToken && Date.now() < amadeusTokenExpiry - 60000) return amadeusToken;

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Amadeus credentials not configured");

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

const CABIN_MAP = {
  "Economy": "ECONOMY",
  "Premium Economy": "PREMIUM_ECONOMY",
  "Business": "BUSINESS",
  "First": "FIRST",
};

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
  NK: { program: null, alliance: "Budget", transfers: [], color: "#FFD700" },
  F9: { program: null, alliance: "Budget", transfers: [], color: "#003D82" },
  WN: { program: null, alliance: "Budget", transfers: ["Chase UR"], color: "#0066CC" },
  FR: { program: null, alliance: "Budget", transfers: [], color: "#003DA5" },
  U2: { program: null, alliance: "Budget", transfers: [], color: "#FFC72C" },
  W6: { program: null, alliance: "Budget", transfers: [], color: "#003D82" },
  DY: { program: null, alliance: "Budget", transfers: [], color: "#FF0000" },
  WS: { program: null, alliance: "Budget", transfers: [], color: "#003D82" },
};

const ESTIMATED_MILES = {
  ECONOMY: { min: 8000, max: 45000 },
  PREMIUM_ECONOMY: { min: 20000, max: 70000 },
  BUSINESS: { min: 30000, max: 120000 },
  FIRST: { min: 50000, max: 180000 },
};

function getFutureDate(daysOut) {
  const d = new Date(Date.now() + daysOut * 86400000);
  return d.toISOString().split("T")[0];
}

function transformAmadeusOffer(offer, dictionaries) {
  const price = parseFloat(offer.price?.grandTotal || offer.price?.total || "0");
  const itinerary = offer.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];

  const carrierCode = firstSeg?.carrierCode || "??";
  const airlineInfo = AIRLINE_PROGRAMS[carrierCode] || {
    program: null, alliance: "Independent", transfers: [], color: "#666"
  };
  const airlineName = dictionaries?.carriers?.[carrierCode] || carrierCode;

  const depTime = firstSeg?.departure?.at ? new Date(firstSeg.departure.at) : null;
  const arrTime = lastSeg?.arrival?.at ? new Date(lastSeg.arrival.at) : null;
  const depStr = depTime ? `${String(depTime.getHours()).padStart(2,"0")}:${String(depTime.getMinutes()).padStart(2,"0")}` : "--:--";
  const arrStr = arrTime ? `${String(arrTime.getHours()).padStart(2,"0")}:${String(arrTime.getMinutes()).padStart(2,"0")}` : "--:--";

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const depDateStr = depTime ? `${DAYS[depTime.getDay()]}, ${MONTHS[depTime.getMonth()]} ${depTime.getDate()}` : "";
  const nextDay = depTime && arrTime && depTime.toDateString() !== arrTime.toDateString();
  const arrDateStr = nextDay ? `${DAYS[arrTime.getDay()]}, ${MONTHS[arrTime.getMonth()]} ${arrTime.getDate()}` : null;

  const durationStr = itinerary?.duration || "";
  const durationMatch = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const durationHrs = parseInt(durationMatch?.[1] || "0");
  const durationMin = parseInt(durationMatch?.[2] || "0");
  const durationFormatted = `${durationHrs}h ${durationMin}m`;
  const durationTotalMin = durationHrs * 60 + durationMin;

  const stops = segments.length - 1;
  const origin = firstSeg?.departure?.iataCode || "";
  const dest = lastSeg?.arrival?.iataCode || "";

  const cabinClass = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY";
  const cabinNice = { ECONOMY: "Economy", PREMIUM_ECONOMY: "Premium Economy", BUSINESS: "Business", FIRST: "First" }[cabinClass] || "Economy";
  const fareClass = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class || "Y";

  const aircraftCode = firstSeg?.aircraft?.code || "";
  const aircraftName = dictionaries?.aircraft?.[aircraftCode] || aircraftCode;

  const milesRange = ESTIMATED_MILES[cabinClass] || ESTIMATED_MILES.ECONOMY;
  const estimatedMiles = airlineInfo.program
    ? Math.round((milesRange.min + Math.random() * (milesRange.max - milesRange.min)) / 500) * 500
    : null;
  const fees = estimatedMiles ? Math.round(20 + Math.random() * 160) : 0;
  const cpm = estimatedMiles ? +((price - fees) / estimatedMiles * 100).toFixed(1) : null;
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { origins, destinations, departureDate, returnDate, cabin, alliance, maxResults } = req.body;

  if (!origins?.length || !destinations?.length) {
    return res.status(400).json({ error: "Missing origins or destinations" });
  }

  const hasAmadeus = process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET;
  if (!hasAmadeus) {
    return res.status(200).json({ source: "simulated", flights: [], message: "Amadeus not configured — using simulated data" });
  }

  try {
    const token = await getAmadeusToken();
    const baseUrl = amadeusBaseUrl();
    const travelClass = CABIN_MAP[cabin] || "ECONOMY";

    const allOffers = [];
    const pairs = [];
    for (const orig of origins.slice(0, 3)) {
      for (const dest of destinations.slice(0, 2)) {
        if (orig !== dest) pairs.push({ orig, dest });
      }
    }

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

    allOffers.sort((a, b) => a.cash - b.cash);
    return res.json({ source: "amadeus", flights: allOffers });
  } catch (err) {
    console.error("[Amadeus] Flight search error:", err.message);
    return res.status(500).json({ error: err.message, source: "error" });
  }
}
