// Booking URL builders — each takes (origin, destination, depDate?) and returns the airline's booking page
const bookingUrls = {
  UA: (o, d, date) => `https://www.united.com/en/us/fsr/choose-flights?f=${o}&t=${d}&d=${date || ""}&tt=1&at=1&sc=7&px=1&taxng=1&newHP=True&clm=7&st=bestmatches&tqp=R`,
  AC: (o, d, date) => `https://www.aircanada.com/booking/search?org0=${o}&dest0=${d}&departure0=${date || ""}&ADT=1&lang=en-CA`,
  LH: (o, d, date) => `https://www.lufthansa.com/us/en/flight-search?origin=${o}&destination=${d}&outboundDate=${date || ""}`,
  NH: (o, d) => `https://www.ana.co.jp/en/us/book-plan/search/international/`,
  TK: (o, d, date) => `https://www.turkishairlines.com/en-us/flights/?origin=${o}&destination=${d}&date=${date || ""}`,
  SQ: (o, d) => `https://www.singaporeair.com/en_UK/plan-and-book/`,
  ET: (o, d) => `https://www.ethiopianairlines.com/book`,
  AA: (o, d, date) => `https://www.aa.com/booking/search?origin=${o}&destination=${d}&departDate=${date || ""}&pax=1`,
  BA: (o, d, date) => `https://www.britishairways.com/travel/book/public/en_us?from=${o}&to=${d}&depDate=${date || ""}`,
  QR: (o, d) => `https://www.qatarairways.com/en/booking.html?origin=${o}&destination=${d}`,
  CX: (o, d) => `https://www.cathaypacific.com/cx/en_US/book-a-trip/flight-search.html`,
  JL: (o, d) => `https://www.jal.co.jp/en/inter/flight/`,
  QF: (o, d) => `https://www.qantas.com/us/en/book-a-trip/flights.html`,
  DL: (o, d, date) => `https://www.delta.com/flight-search/search?originCity=${o}&destinationCity=${d}&departureDate=${date || ""}&paxCount=1`,
  AF: (o, d, date) => `https://www.airfrance.us/search/offer?origin=${o}&destination=${d}&outboundDate=${date || ""}`,
  VS: (o, d) => `https://www.virginatlantic.com/book/flights`,
  EK: (o, d, date) => `https://www.emirates.com/us/english/book/?origin=${o}&destination=${d}&date=${date || ""}`,
};

export function getBookingUrl(airlineCode, origin, destination, depDate) {
  const builder = bookingUrls[airlineCode];
  // Format date as YYYY-MM-DD if we have a Date object
  let dateStr = "";
  if (depDate) {
    try {
      const d = depDate instanceof Date ? depDate : new Date(depDate);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().slice(0, 10);
      }
    } catch (_) { /* ignore */ }
  }
  if (builder) return builder(origin, destination, dateStr);
  // Fallback: airline homepage search
  return `https://www.google.com/search?q=${encodeURIComponent(`book flight ${origin} to ${destination} site:${airlineCode.toLowerCase()}.com`)}`;
}

export const AIRLINES = [
  { code: "UA", name: "United Airlines", program: "MileagePlus", alliance: "Star Alliance", color: "#0032A0", transfers: ["Chase UR", "Bilt"], website: "united.com" },
  { code: "AC", name: "Air Canada", program: "Aeroplan", alliance: "Star Alliance", color: "#d81e05", transfers: ["Chase UR", "Amex MR", "Capital One", "Bilt"], website: "aircanada.com" },
  { code: "LH", name: "Lufthansa", program: "Miles & More", alliance: "Star Alliance", color: "#05164d", transfers: ["Amex MR"], website: "lufthansa.com" },
  { code: "NH", name: "ANA", program: "Mileage Club", alliance: "Star Alliance", color: "#00467F", transfers: ["Amex MR"], website: "ana.co.jp" },
  { code: "TK", name: "Turkish Airlines", program: "Miles&Smiles", alliance: "Star Alliance", color: "#C8102E", transfers: ["Citi TYP", "Capital One", "Bilt"], website: "turkishairlines.com" },
  { code: "SQ", name: "Singapore Airlines", program: "KrisFlyer", alliance: "Star Alliance", color: "#F0AB00", transfers: ["Chase UR", "Amex MR", "Citi TYP", "Capital One"], website: "singaporeair.com" },
  { code: "ET", name: "Ethiopian Airlines", program: "ShebaMiles", alliance: "Star Alliance", color: "#078930", transfers: [], website: "ethiopianairlines.com" },
  { code: "AA", name: "American Airlines", program: "AAdvantage", alliance: "oneworld", color: "#0078D2", transfers: ["Citi TYP", "Bilt"], website: "aa.com" },
  { code: "BA", name: "British Airways", program: "Avios", alliance: "oneworld", color: "#075AAA", transfers: ["Chase UR", "Amex MR", "Capital One"], website: "britishairways.com" },
  { code: "QR", name: "Qatar Airways", program: "Privilege Club", alliance: "oneworld", color: "#5C0632", transfers: ["Citi TYP"], website: "qatarairways.com" },
  { code: "CX", name: "Cathay Pacific", program: "Asia Miles", alliance: "oneworld", color: "#005D63", transfers: ["Amex MR", "Citi TYP", "Capital One", "Bilt"], website: "cathaypacific.com" },
  { code: "JL", name: "Japan Airlines", program: "Mileage Bank", alliance: "oneworld", color: "#C8102E", transfers: ["Chase UR", "Citi TYP"], website: "jal.co.jp" },
  { code: "QF", name: "Qantas", program: "Frequent Flyer", alliance: "oneworld", color: "#E0002A", transfers: [], website: "qantas.com" },
  { code: "DL", name: "Delta Air Lines", program: "SkyMiles", alliance: "SkyTeam", color: "#003A70", transfers: ["Amex MR"], website: "delta.com" },
  { code: "AF", name: "Air France/KLM", program: "Flying Blue", alliance: "SkyTeam", color: "#002157", transfers: ["Chase UR", "Amex MR", "Citi TYP", "Capital One", "Bilt"], website: "airfrance.us" },
  { code: "VS", name: "Virgin Atlantic", program: "Flying Club", alliance: "SkyTeam", color: "#E01224", transfers: ["Chase UR", "Amex MR", "Citi TYP", "Capital One", "Bilt"], website: "virginatlantic.com" },
  { code: "EK", name: "Emirates", program: "Skywards", alliance: "Independent", color: "#D71921", transfers: ["Chase UR", "Amex MR", "Citi TYP", "Capital One", "Bilt"], website: "emirates.com" },
];
