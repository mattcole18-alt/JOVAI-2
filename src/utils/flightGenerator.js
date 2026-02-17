import { AIRLINES } from "../data/airlines";
import { DEVALUATIONS, AIRCRAFT_TYPES, FARE_CLASSES } from "../data/constants";
import { getDistanceMiles, airlineFliesRoute } from "../data/routeDistances";
import { rand, pick } from "./helpers";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function durationHoursFromDistance(miles, stops) {
  const avgSpeedMph = 450;
  const baseHours = miles / avgSpeedMph;
  const layoverHours = stops * 2.5;
  return baseHours + layoverHours;
}

function formatDuration(totalHours) {
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  if (m === 0) return `${h}h 0m`;
  return `${h}h ${m}m`;
}

function formatDate(d) {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function generateFlights(parsed) {
  const origins = parsed.origins || ["JFK"];
  const destinations = parsed.destinations || ["LHR"];
  const cabin = parsed.cabin || "Business";
  const alliance = parsed.alliance || "any";
  const maxMiles = parsed.maxMiles || null;

  let airlines = AIRLINES.filter((a) => {
    if (alliance && alliance !== "any") {
      return a.alliance.toLowerCase() === alliance.toLowerCase();
    }
    return true;
  });

  if (parsed.program) {
    const prog = parsed.program.toLowerCase();
    const match = AIRLINES.find((a) => a.program.toLowerCase().includes(prog) || a.name.toLowerCase().includes(prog));
    if (match) {
      airlines = [match, ...airlines.filter((a) => a.code !== match.code)];
    }
  }

  if (airlines.length === 0) airlines = AIRLINES;

  const milesRanges = { Economy: [8000, 40000], "Premium Economy": [20000, 65000], Business: [30000, 120000], First: [50000, 180000] };
  const cashRanges = { Economy: [300, 1200], "Premium Economy": [600, 2400], Business: [1800, 8000], First: [4000, 15000] };
  const [milesLo, milesHi] = milesRanges[cabin] || milesRanges.Business;
  const [cashLo, cashHi] = cashRanges[cabin] || cashRanges.Business;

  // Date window: default 7-90 days out, sorted chronologically
  const now = new Date();
  const dateStart = new Date(now.getTime() + 7 * 86400000);
  const dateEnd = new Date(now.getTime() + 90 * 86400000);
  const dateSpanMs = dateEnd.getTime() - dateStart.getTime();

  const results = [];
  const targetCount = rand(8, 16);
  let attempts = 0;
  const maxAttempts = targetCount * 6;

  while (results.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const al = airlines[attempts % airlines.length];
    const orig = pick(origins);
    const dest = pick(destinations);
    if (orig === dest) continue;

    if (!airlineFliesRoute(al.code, orig, dest)) continue;

    const miles = Math.round(rand(milesLo, milesHi) / 500) * 500;
    if (maxMiles && miles > maxMiles) continue;
    const fees = rand(20, 180);
    const cash = rand(cashLo, cashHi);
    const cpm = +((cash - fees) / miles * 100).toFixed(1);
    if (cpm < 0.3) continue;
    const stops = rand(0, 2);
    const distanceMiles = getDistanceMiles(orig, dest);
    const totalHours = durationHoursFromDistance(distanceMiles, stops);
    const durationMin = Math.round(totalHours * 60);
    const durationStr = formatDuration(totalHours);
    const depHr = rand(6, 22);
    const depMin = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    const arrHr = (depHr + Math.floor(totalHours)) % 24;
    const arrMin = Math.min(59, Math.round((totalHours % 1) * 60));
    const nextDay = depHr + totalHours >= 24;
    const seats = rand(1, 9);
    const fareClasses = FARE_CLASSES[cabin] || FARE_CLASSES.Business;
    const hasDevaluation = DEVALUATIONS.some((d) => d.airline === al.code);

    // Generate departure date within window
    const depDate = new Date(dateStart.getTime() + Math.random() * dateSpanMs);
    const arrDate = new Date(depDate.getTime() + Math.round(totalHours * 3600000));
    const depDateStr = formatDate(depDate);
    const arrDateStr = depDate.toDateString() !== arrDate.toDateString() ? formatDate(arrDate) : null;

    results.push({
      id: `fl-${results.length}-${Date.now()}`,
      airline: al,
      origin: orig,
      destination: dest,
      cabin,
      miles,
      fees,
      cash,
      cpm,
      stops,
      duration: durationStr,
      durationMin,
      depTime: `${String(depHr).padStart(2, "0")}:${String(depMin).padStart(2, "0")}`,
      arrTime: `${String(arrHr).padStart(2, "0")}:${String(arrMin).padStart(2, "0")}${nextDay ? " +1" : ""}`,
      depDate: depDateStr,
      arrDate: arrDateStr,
      depDateObj: depDate,
      aircraft: pick(AIRCRAFT_TYPES),
      fareClass: pick(fareClasses),
      seats,
      nonstop: stops === 0,
      hasDevaluation,
      devaluation: hasDevaluation ? DEVALUATIONS.find((d) => d.airline === al.code) : null,
    });
  }

  // Sort by date first
  results.sort((a, b) => {
    const da = a.depDateObj ? a.depDateObj.getTime() : 0;
    const db = b.depDateObj ? b.depDateObj.getTime() : 0;
    if (da !== db) return da - db;
    return (b.cpm || 0) - (a.cpm || 0);
  });
  return results;
}
