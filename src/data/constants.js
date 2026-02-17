import { AIRPORTS } from "./airports";
import { AIRLINES } from "./airlines";

export const TRANSFER_PARTNERS = [
  { name: "Chase UR", color: "#0c4a6e", short: "Chase" },
  { name: "Amex MR", color: "#006FCF", short: "Amex" },
  { name: "Citi TYP", color: "#003B70", short: "Citi" },
  { name: "Capital One", color: "#D03027", short: "CapOne" },
  { name: "Bilt", color: "#000000", short: "Bilt" },
];

export const SWEET_SPOTS = [
  { id: 1, route: "US → Europe", program: "Miles&Smiles", airline: "TK", miles: 45000, cabin: "Business", alliance: "Star Alliance", desc: "Turkish Miles&Smiles charges just 45K miles for Star Alliance business class to Europe — one of the lowest redemption rates available.", transfers: ["Citi TYP", "Capital One", "Bilt"], query: "Business class from NYC to Istanbul on Turkish Miles&Smiles" },
  { id: 2, route: "US → Japan", program: "Flying Club", airline: "VS", miles: 60000, cabin: "First", alliance: "Star Alliance", desc: "Virgin Atlantic lets you book ANA First Class for 60K miles — the cheapest way into the world's best first class cabin.", transfers: ["Chase UR", "Amex MR", "Citi TYP", "Capital One", "Bilt"], query: "First class from NYC to Tokyo on ANA using Virgin Atlantic miles" },
  { id: 3, route: "US → Asia", program: "Aeroplan", airline: "AC", miles: 75000, cabin: "Business", alliance: "Star Alliance", desc: "Aeroplan offers business class to Asia with flexible stopovers. Add a free stopover in Europe on the way.", transfers: ["Chase UR", "Amex MR", "Capital One", "Bilt"], query: "Business class from NYC to Asia on Aeroplan" },
  { id: 4, route: "US → Europe", program: "Avios", airline: "BA", miles: 13000, cabin: "Economy", alliance: "oneworld", desc: "British Airways Avios offers off-peak short-haul economy from 13K miles — great for quick European hops.", transfers: ["Chase UR", "Amex MR", "Capital One"], query: "Economy flights from NYC to London using Avios" },
  { id: 5, route: "US → Middle East", program: "AAdvantage", airline: "AA", miles: 70000, cabin: "Business", alliance: "oneworld", desc: "Book Qatar Qsuites (the world's best business class) using AAdvantage miles for 70K — exceptional value.", transfers: ["Citi TYP", "Bilt"], query: "Business class from NYC to Doha on Qatar Qsuites using AAdvantage miles" },
  { id: 6, route: "US → South America", program: "Flying Blue", airline: "AF", miles: 53000, cabin: "Business", alliance: "SkyTeam", desc: "Flying Blue promo awards offer business class to South America from 53K miles — watch for monthly deals.", transfers: ["Chase UR", "Amex MR", "Citi TYP", "Capital One", "Bilt"], query: "Business class from Miami to São Paulo using Flying Blue miles" },
  { id: 7, route: "US → Hawaii", program: "Flying Club", airline: "VS", miles: 15000, cabin: "Economy", alliance: "SkyTeam", desc: "Virgin Atlantic lets you book Delta economy to Hawaii for just 15K miles round trip — a steal.", transfers: ["Chase UR", "Amex MR", "Citi TYP", "Capital One", "Bilt"], query: "Economy flights from LAX to Honolulu using Virgin Atlantic miles" },
  { id: 8, route: "US → Australia", program: "Frequent Flyer", airline: "QF", miles: 72000, cabin: "Business", alliance: "oneworld", desc: "Qantas classic reward seats offer business class to Australia for 72K miles — book early for availability.", transfers: [], query: "Business class from LAX to Sydney on Qantas" },
];

export const DEVALUATIONS = [
  { program: "Flying Blue", airline: "AF", date: "January 2026", desc: "Business class awards to Europe increased ~20%. Economy also saw 10-15% increases on popular transatlantic routes.", severity: "HIGH", color: "#e5384f" },
  { program: "MileagePlus", airline: "UA", date: "December 2025", desc: "United eliminated the Excursionist Perk for new bookings and moved to fully dynamic upgrade pricing.", severity: "HIGH", color: "#e5384f" },
  { program: "SkyMiles", airline: "DL", date: "Ongoing", desc: "Delta operates fully dynamic pricing with no published award chart. Prices fluctuate wildly based on demand.", severity: "HIGH", color: "#e5384f" },
  { program: "Hilton Honors", airline: null, date: "2025", desc: "Top-tier properties jumped from 120K to 250K+ points per night. Standard room redemptions up 30-50% across the board.", severity: "MODERATE", color: "#f5a623" },
  { program: "Flying Club", airline: "VS", date: "2025", desc: "Surcharges on European redemptions increased significantly. Fuel surcharges on BA metal now rival cash fares.", severity: "MODERATE", color: "#f5a623" },
  { program: "AAdvantage", airline: "AA", date: "2025", desc: 'Web specials removed. Partner award charts now show "starting at" pricing only — effectively dynamic pricing.', severity: "MODERATE", color: "#f5a623" },
];

export const ALLIANCE_COLORS = { "Star Alliance": "#cfb53b", "oneworld": "#e5384f", "SkyTeam": "#003A70", "Independent": "#888" };

export const AIRCRAFT_TYPES = ["Boeing 777-300ER", "Boeing 787-9", "Airbus A350-900", "Airbus A380", "Boeing 777-200LR", "Airbus A330-900neo", "Boeing 787-10", "Airbus A321XLR", "Boeing 767-400ER", "Airbus A350-1000"];

export const FARE_CLASSES = {
  Economy: ["Y", "B", "M", "H", "Q", "V", "W", "S", "T", "L", "K", "G"],
  "Premium Economy": ["W", "P", "E", "N", "R"],
  Business: ["J", "C", "D", "Z", "I", "O"],
  First: ["F", "A", "P", "R"],
};

export const EXAMPLE_QUERIES = [
  "Cheapest business class out of NYC area on Star Alliance miles",
  "JFK to Lisbon in business class in April 2026",
  "Best first class to Tokyo using Amex MR points",
  "NYC to Doha on Qatar Qsuites using AAdvantage miles",
  "Cheap economy flights from SFO to Europe",
  "Business class from LAX to Singapore on any alliance",
  "First class from Miami to London under 80,000 miles",
  "Best oneworld business class out of Chicago to Asia",
];

export const WHY_JOVAIR_ITEMS = [
  { icon: "🔍", title: "Transparency Crisis", desc: "Airlines hide true point values behind dynamic pricing. Jovair shows the real cents-per-mile on every flight." },
  { icon: "🧩", title: "Fragmented Search", desc: "Comparing miles vs. cash requires searching 20+ websites. Jovair unifies everything in one place." },
  { icon: "📉", title: "Silent Devaluations", desc: "Programs devalue points with no warning. Jovair tracks changes in real time and alerts you." },
  { icon: "🤖", title: "AI-First Discovery", desc: "Stop filling out rigid search forms. Just type what you want in plain English." },
];

export const TOOLS_COMING_SOON = [
  { icon: "🗺️", title: "Transfer Partner Map", desc: "Visual map of all credit card → airline transfer partnerships" },
  { icon: "💰", title: "Points Portfolio", desc: "Connect your accounts and see your total points value in one place" },
  { icon: "🔔", title: "Fare Alerts", desc: "Set alerts for specific routes and get notified when award space opens" },
  { icon: "🧮", title: "Miles Calculator", desc: "Calculate the value of any redemption before you book" },
  { icon: "📊", title: "Historical Pricing", desc: "Track how award prices change over time for any route" },
  { icon: "🌍", title: "Route Explorer", desc: "Discover the best routes from your home airport sorted by value" },
];

export const airportByCode = (c) => AIRPORTS.find((a) => a.code === c);
export const airlineByCode = (c) => AIRLINES.find((a) => a.code === c);
