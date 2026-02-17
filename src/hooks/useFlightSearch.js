import { useState, useMemo, useCallback } from "react";
import { parseWithAI } from "../utils/aiParser";
import { generateFlights } from "../utils/flightGenerator";

export function useFlightSearch() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("home");
  const [parsed, setParsed] = useState(null);
  const [flights, setFlights] = useState([]);
  const [sortBy, setSortBy] = useState("value");
  const [filterAlliance, setFilterAlliance] = useState("All");
  const [filterTransfer, setFilterTransfer] = useState(null);
  const [filterNonstop, setFilterNonstop] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [dataSource, setDataSource] = useState("simulated"); // "amadeus" or "simulated"

  const runSearch = useCallback(async (q) => {
    if (!q?.trim()) return;
    setQuery(q);
    setPhase("parsing");
    setExpandedId(null);
    setSortBy("value");
    setFilterAlliance("All");
    setFilterTransfer(null);
    setFilterNonstop(false);
    setDataSource("simulated");

    const p = await parseWithAI(q);
    setParsed(p);
    setPhase("searching");

    await new Promise((r) => setTimeout(r, 1800));

    // Try real Amadeus API first, fall back to simulated data
    let realFlights = null;
    try {
      const res = await fetch("/api/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origins: p.origins,
          destinations: p.destinations,
          departureDate: p.departureDate || null,
          returnDate: p.returnDate || null,
          cabin: p.cabin,
          alliance: p.alliance,
          maxResults: 12,
        }),
      });
      const data = await res.json();
      if (data.source === "amadeus" && data.flights?.length > 0) {
        realFlights = data.flights;
        setDataSource("amadeus");
        console.log(`[Jovair] Got ${realFlights.length} real flights from Amadeus`);
      }
    } catch (err) {
      console.log("[Jovair] Amadeus unavailable, using simulated data:", err.message);
    }

    const fl = realFlights || generateFlights(p);
    setFlights(fl);
    setPhase("results");
  }, []);

  const filteredFlights = useMemo(() => {
    let f = [...flights];
    if (filterAlliance !== "All") f = f.filter((fl) => fl.airline.alliance === filterAlliance);
    if (filterTransfer) f = f.filter((fl) => fl.airline.transfers.includes(filterTransfer));
    if (filterNonstop) f = f.filter((fl) => fl.nonstop);

    if (sortBy === "value") f.sort((a, b) => (b.cpm||0) - (a.cpm||0));
    else if (sortBy === "miles") f.sort((a, b) => (a.miles||999999) - (b.miles||999999));
    else if (sortBy === "cash") f.sort((a, b) => a.cash - b.cash);
    else if (sortBy === "fastest") f.sort((a, b) => a.durationMin - b.durationMin);
    else if (sortBy === "nonstop") f.sort((a, b) => a.stops - b.stops);
    else if (sortBy === "date") f.sort((a, b) => {
      const da = a.depDateObj ? new Date(a.depDateObj).getTime() : 0;
      const db = b.depDateObj ? new Date(b.depDateObj).getTime() : 0;
      return da - db;
    });
    return f;
  }, [flights, sortBy, filterAlliance, filterTransfer, filterNonstop]);

  const stats = useMemo(() => {
    if (!flights.length) return null;
    const milesFlights = flights.filter(f => f.miles);
    const bestMiles = milesFlights.length ? Math.min(...milesFlights.map((f) => f.miles)) : 0;
    const bestCash = Math.min(...flights.map((f) => f.cash));
    const bestCpm = milesFlights.length ? Math.max(...milesFlights.map((f) => f.cpm)) : 0;
    const avgCpm = milesFlights.length ? +(milesFlights.reduce((s, f) => s + f.cpm, 0) / milesFlights.length).toFixed(1) : 0;
    const nonstops = flights.filter((f) => f.nonstop).length;
    return { bestMiles, bestCash, bestCpm, avgCpm, nonstops };
  }, [flights]);

  return {
    query,
    setQuery,
    phase,
    parsed,
    flights,
    sortBy,
    setSortBy,
    filterAlliance,
    setFilterAlliance,
    filterTransfer,
    setFilterTransfer,
    filterNonstop,
    setFilterNonstop,
    expandedId,
    setExpandedId,
    runSearch,
    filteredFlights,
    stats,
    dataSource,
  };
}
