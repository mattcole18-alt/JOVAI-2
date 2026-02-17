export async function parseWithAI(query) {
  try {
    const response = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `API error: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.error("AI parse error:", e);
    return fallbackParse(query);
  }
}

export function fallbackParse(query) {
  const q = query.toLowerCase();
  const cabins = ["first", "business", "premium economy", "economy"];
  const cheapKeywords = /cheapest|cheap|budget|affordable/;
  let cabin = cheapKeywords.test(q) ? "Economy" : "Business";
  for (const c of cabins) {
    if (q.includes(c)) {
      cabin = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }
  let alliance = "any";
  if (q.includes("star alliance")) alliance = "Star Alliance";
  else if (q.includes("oneworld")) alliance = "oneworld";
  else if (q.includes("skyteam")) alliance = "SkyTeam";
  let origins = ["JFK", "EWR", "LGA"];
  if (q.includes("lax") || q.includes("los angeles")) origins = ["LAX"];
  else if (q.includes("sfo") || q.includes("san francisco")) origins = ["SFO"];
  else if (q.includes("ord") || q.includes("chicago")) origins = ["ORD"];
  else if (q.includes("mia") || q.includes("miami")) origins = ["MIA"];
  let destinations = ["LHR", "CDG", "FRA"];
  if (q.includes("tokyo") || q.includes("japan")) destinations = ["NRT", "HND"];
  else if (q.includes("london")) destinations = ["LHR"];
  else if (q.includes("lisbon")) destinations = ["LIS"];
  else if (q.includes("doha") || q.includes("qatar")) destinations = ["DOH"];
  else if (q.includes("singapore")) destinations = ["SIN"];
  else if (q.includes("sydney") || q.includes("australia")) destinations = ["SYD"];
  else if (q.includes("honolulu") || q.includes("hawaii")) destinations = ["HNL"];
  return { origins, destinations, cabin, alliance, program: null, dateRange: "Flexible", maxMiles: null, isExplore: false, summary: `${cabin} class flights` };
}
