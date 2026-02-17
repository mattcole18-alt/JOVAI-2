/**
 * Distance map for common city/airport pairs (great-circle miles).
 * Used for realistic flight durations. Missing pairs fall back to haversine.
 */
import { AIRPORTS } from "./airports";

export const ROUTE_DISTANCES_MILES = {
  "JFK-LHR": 3459, "JFK-CDG": 3635, "JFK-FRA": 3850, "JFK-AMS": 3658, "JFK-FCO": 4280, "JFK-MIA": 1092, "JFK-LAX": 2475, "JFK-SFO": 2586, "JFK-ORD": 740, "JFK-DXB": 6830, "JFK-DOH": 6650, "JFK-IST": 5010, "JFK-NRT": 6740, "JFK-HND": 6755, "JFK-SIN": 9530, "JFK-HKG": 8050, "JFK-ICN": 6905, "JFK-SYD": 9930, "JFK-GRU": 4810, "JFK-MEX": 2090, "JFK-LIS": 3365, "JFK-BCN": 3855, "JFK-ATH": 4925, "JFK-ZRH": 3855,
  "LAX-LHR": 5455, "LAX-CDG": 5665, "LAX-NRT": 5475, "LAX-HND": 5475, "LAX-ICN": 5735, "LAX-SYD": 7485, "LAX-HKG": 7265, "LAX-SIN": 8770, "LAX-DXB": 8340, "LAX-HNL": 2555, "LAX-JFK": 2475, "LAX-SFO": 339, "LAX-ORD": 1745, "LAX-MIA": 2342, "LAX-MEX": 1550, "LAX-GRU": 6165,
  "SFO-LHR": 5355, "SFO-CDG": 5565, "SFO-NRT": 5135, "SFO-HKG": 6915, "SFO-SIN": 8440, "SFO-ICN": 5610, "SFO-SYD": 7415, "SFO-DXB": 8040, "SFO-FRA": 5715, "SFO-AMS": 5505, "SFO-HNL": 2400,
  "MIA-LHR": 4420, "MIA-CDG": 4605, "MIA-GRU": 4135, "MIA-MEX": 1280, "MIA-CUN": 520, "MIA-DXB": 7730, "MIA-DOH": 7595, "MIA-JFK": 1092, "MIA-LAX": 2342, "MIA-ORD": 1185,
  "ORD-LHR": 3950, "ORD-CDG": 4140, "ORD-FRA": 4370, "ORD-NRT": 6305, "ORD-DXB": 7195, "ORD-HKG": 7595, "ORD-JFK": 740, "ORD-LAX": 1745, "ORD-MIA": 1185, "ORD-DEN": 920, "ORD-SFO": 1855,
  "DFW-LHR": 4735, "DFW-CDG": 5010, "DFW-NRT": 6510, "DFW-DXB": 8010, "DFW-DOH": 7840, "DFW-MEX": 850, "DFW-JFK": 1390, "DFW-LAX": 1235, "DFW-MIA": 1120,
  "SEA-NRT": 4795, "SEA-HND": 4795, "SEA-ICN": 5135, "SEA-LHR": 4780, "SEA-CDG": 5010, "SEA-FRA": 5015, "SEA-JFK": 2420, "SEA-LAX": 960, "SEA-SFO": 680, "SEA-HNL": 2670,
  "BOS-LHR": 3260, "BOS-CDG": 3440, "BOS-FRA": 3665, "BOS-DUB": 3005, "BOS-JFK": 187, "BOS-MIA": 1255, "BOS-LAX": 2610, "BOS-ORD": 867,
  "ATL-LHR": 4220, "ATL-CDG": 4400, "ATL-FRA": 4630, "ATL-DXB": 7590, "ATL-LAX": 1945, "ATL-JFK": 760, "ATL-MIA": 595, "ATL-ORD": 606,
  "IAD-LHR": 3660, "IAD-CDG": 3855, "IAD-FRA": 4035, "IAD-DXB": 6935, "IAD-DOH": 6780, "IAD-NRT": 6710, "IAD-LAX": 2305, "IAD-JFK": 228, "IAD-ORD": 612, "IAD-MIA": 901,
  "IAH-LHR": 4745, "IAH-CDG": 5025, "IAH-DXB": 8180, "IAH-DOH": 8010, "IAH-NRT": 6595, "IAH-MEX": 760, "IAH-LAX": 1375, "IAH-JFK": 1410, "IAH-ORD": 942,
  "DEN-LHR": 4745, "DEN-CDG": 4930, "DEN-LAX": 862, "DEN-ORD": 920, "DEN-JFK": 1630, "DEN-SFO": 950, "DEN-MIA": 1705,
  "HNL-NRT": 3855, "HNL-HND": 3855, "HNL-ICN": 4925, "HNL-SYD": 5065, "HNL-LAX": 2555, "HNL-SFO": 2400, "HNL-SEA": 2670,
  "LHR-CDG": 212, "LHR-FRA": 406, "LHR-AMS": 229, "LHR-FCO": 890, "LHR-DXB": 3400, "LHR-DOH": 3195, "LHR-IST": 1550, "LHR-NRT": 5955, "LHR-HKG": 5995, "LHR-SIN": 6765, "LHR-JFK": 3459, "LHR-BCN": 710, "LHR-LIS": 985, "LHR-ATH": 1495, "LHR-ZRH": 485,
  "CDG-NRT": 6035, "CDG-HKG": 5965, "CDG-SIN": 6595, "CDG-DXB": 3210, "CDG-DOH": 3075, "CDG-IST": 1395, "CDG-FRA": 278, "CDG-AMS": 267, "CDG-JFK": 3635, "CDG-GRU": 5725, "CDG-MEX": 5710,
  "FRA-NRT": 5825, "FRA-HKG": 5760, "FRA-SIN": 6295, "FRA-DXB": 2895, "FRA-DOH": 2765, "FRA-IST": 1085, "FRA-JFK": 3850, "FRA-LAX": 5715, "FRA-GRU": 6035, "FRA-MEX": 6025,
  "DXB-LHR": 3400, "DXB-CDG": 3210, "DXB-FRA": 2895, "DXB-IST": 2195, "DXB-SIN": 3735, "DXB-HKG": 3665, "DXB-NRT": 4915, "DXB-SYD": 7505, "DXB-JFK": 6830, "DXB-LAX": 8340, "DXB-MIA": 7730, "DXB-DOH": 235,
  "DOH-LHR": 3195, "DOH-CDG": 3075, "DOH-FRA": 2765, "DOH-JFK": 6650, "DOH-LAX": 8335, "DOH-ORD": 7195, "DOH-IAH": 8010, "DOH-DXB": 235, "DOH-IST": 1965, "DOH-SIN": 3845, "DOH-HKG": 3810, "DOH-NRT": 5085, "DOH-SYD": 7525, "DOH-MIA": 7595,
  "NRT-LAX": 5475, "NRT-JFK": 6740, "NRT-LHR": 5955, "NRT-SIN": 3305, "NRT-HKG": 1835, "NRT-ICN": 785, "NRT-SYD": 4865, "NRT-HNL": 3855,
  "HKG-LAX": 7265, "HKG-JFK": 8050, "HKG-LHR": 5995, "HKG-SIN": 1610, "HKG-SYD": 4585, "HKG-NRT": 1835, "HKG-ICN": 1295, "HKG-DXB": 3665,
  "SIN-LAX": 8770, "SIN-SFO": 8440, "SIN-JFK": 9530, "SIN-LHR": 6765, "SIN-HKG": 1610, "SIN-SYD": 3905, "SIN-DXB": 3735, "SIN-NRT": 3305,
  "SYD-LAX": 7485, "SYD-SFO": 7415, "SYD-JFK": 9930, "SYD-HKG": 4585, "SYD-SIN": 3905, "SYD-DXB": 7505, "SYD-NRT": 4865, "SYD-HNL": 5065,
  "GRU-JFK": 4810, "GRU-MIA": 4135, "GRU-MEX": 4655, "GRU-CDG": 5725, "GRU-FRA": 6035, "GRU-LAX": 6165, "GRU-LIS": 4855,
  "MEX-LAX": 1550, "MEX-JFK": 2090, "MEX-MIA": 1280, "MEX-ORD": 1690, "MEX-CUN": 800, "MEX-CDG": 5710, "MEX-MAD": 5765,
  "CUN-MIA": 520, "CUN-JFK": 1540, "CUN-LAX": 2345, "CUN-ORD": 1485, "CUN-MEX": 800,
};

/**
 * Which region-pairs each airline actually flies (hub/spoke reality).
 * Format: airline code -> array of "RegionA-RegionB" (normalized so A < B lexicographically).
 * Airlines don't operate domestic in other countries (e.g. QR doesn't fly US-US).
 */
export const AIRLINE_ROUTE_PAIRS = {
  UA: ["US-US", "US-UK", "US-Europe", "US-MiddleEast", "US-Asia", "US-Japan", "US-Australia", "US-SouthAmerica", "US-Mexico", "US-Africa"],
  AA: ["US-US", "US-UK", "US-Europe", "US-MiddleEast", "US-Asia", "US-Japan", "US-Australia", "US-SouthAmerica", "US-Mexico", "US-Africa"],
  DL: ["US-US", "US-UK", "US-Europe", "US-MiddleEast", "US-Asia", "US-Japan", "US-Australia", "US-SouthAmerica", "US-Mexico", "US-Africa"],
  AC: ["US-Canada", "UK-Canada", "Europe-Canada", "Asia-Canada", "Japan-Canada", "Mexico-Canada", "SouthAmerica-Canada", "Canada-Canada", "US-UK", "US-Europe", "UK-Europe", "US-Asia", "US-Japan", "Europe-Asia", "Europe-Japan"],
  BA: ["UK-US", "UK-Europe", "UK-MiddleEast", "UK-Asia", "UK-Japan", "UK-Australia", "UK-SouthAmerica", "UK-Africa", "UK-Mexico"],
  LH: ["Europe-US", "Europe-UK", "Europe-Europe", "Europe-MiddleEast", "Europe-Asia", "Europe-Japan", "Europe-Africa", "Europe-SouthAmerica", "Europe-Mexico"],
  AF: ["Europe-US", "Europe-UK", "Europe-Europe", "Europe-MiddleEast", "Europe-Asia", "Europe-Japan", "Europe-Africa", "Europe-SouthAmerica", "Europe-Mexico"],
  TK: ["MiddleEast-US", "MiddleEast-UK", "MiddleEast-Europe", "MiddleEast-Asia", "MiddleEast-Japan", "MiddleEast-Africa", "MiddleEast-SouthAmerica"],
  SQ: ["Asia-US", "Asia-UK", "Asia-Europe", "Asia-MiddleEast", "Asia-Asia", "Asia-Japan", "Asia-Australia"],
  NH: ["Japan-US", "Japan-UK", "Japan-Europe", "Japan-Asia", "Japan-Australia", "Japan-Japan"],
  QR: ["MiddleEast-US", "MiddleEast-UK", "MiddleEast-Europe", "MiddleEast-Asia", "MiddleEast-Japan", "MiddleEast-Australia", "MiddleEast-Africa", "MiddleEast-SouthAmerica"],
  EK: ["MiddleEast-US", "MiddleEast-UK", "MiddleEast-Europe", "MiddleEast-Asia", "MiddleEast-Japan", "MiddleEast-Australia", "MiddleEast-Africa", "MiddleEast-SouthAmerica"],
  CX: ["Asia-US", "Asia-UK", "Asia-Europe", "Asia-MiddleEast", "Asia-Asia", "Asia-Japan", "Asia-Australia"],
  JL: ["Japan-US", "Japan-UK", "Japan-Europe", "Japan-Asia", "Japan-Australia", "Japan-Japan"],
  QF: ["Australia-US", "Australia-UK", "Australia-Europe", "Australia-Asia", "Australia-Japan", "Australia-Australia", "Australia-MiddleEast"],
  VS: ["UK-US", "UK-Europe", "UK-Caribbean", "UK-MiddleEast", "UK-Africa"],
  ET: ["Africa-US", "Africa-Europe", "Africa-Asia", "Africa-MiddleEast", "Africa-Africa"],
};

/** Haversine distance in miles */
function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function getDistanceMiles(origCode, destCode) {
  const key = `${origCode}-${destCode}`;
  const revKey = `${destCode}-${origCode}`;
  if (ROUTE_DISTANCES_MILES[key] != null) return ROUTE_DISTANCES_MILES[key];
  if (ROUTE_DISTANCES_MILES[revKey] != null) return ROUTE_DISTANCES_MILES[revKey];
  const o = AIRPORTS.find((a) => a.code === origCode);
  const d = AIRPORTS.find((a) => a.code === destCode);
  if (o?.lat == null || d?.lat == null) return 3500;
  return haversineMiles(o.lat, o.lon, d.lat, d.lon);
}

/** Normalized region pair "A-B" (lexicographic) for route validity */
export function getRoutePair(origCode, destCode) {
  const o = AIRPORTS.find((a) => a.code === origCode);
  const d = AIRPORTS.find((a) => a.code === destCode);
  const r1 = o?.networkRegion || "US";
  const r2 = d?.networkRegion || "US";
  return r1 <= r2 ? `${r1}-${r2}` : `${r2}-${r1}`;
}

export function airlineFliesRoute(airlineCode, origCode, destCode) {
  const pairs = AIRLINE_ROUTE_PAIRS[airlineCode];
  if (!pairs) return true;
  const pair = getRoutePair(origCode, destCode);
  return pairs.includes(pair);
}
