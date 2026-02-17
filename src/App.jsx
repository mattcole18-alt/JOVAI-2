import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useFlightSearch } from "./hooks/useFlightSearch";
import { useSearchHistory } from "./hooks/useSearchHistory";
import { Nav, HomeView, ParsingView, SearchingView, ResultsView, SweetSpotsTab, DevaluationsTab, ToolsTab } from "./components";
import { theme } from "./styles/theme";

export default function Jovair() {
  const s = theme;
  const navigate = useNavigate();
  const searchState = useFlightSearch();
  const { history: searchHistory, addQuery, removeQuery } = useSearchHistory();
  const { query, setQuery, phase, parsed, sortBy, setSortBy, filterAlliance, setFilterAlliance, filterTransfer, setFilterTransfer, filterNonstop, setFilterNonstop, expandedId, setExpandedId, filteredFlights, stats, dataSource } = searchState;

  const runSearch = (q) => {
    const trimmed = (q || "").trim();
    if (!trimmed) return;
    addQuery(trimmed);
    navigate("/search");
    searchState.runSearch(trimmed);
  };

  return (
    <div style={{ minHeight: "100vh", background: s.bg, fontFamily: "'Manrope',sans-serif", color: s.text }}>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route
          path="/search"
          element={
            phase === "home" ? (
              <HomeView query={query} setQuery={setQuery} runSearch={runSearch} searchHistory={searchHistory} removeFromHistory={removeQuery} />
            ) : phase === "parsing" ? (
              <ParsingView />
            ) : phase === "searching" ? (
              <SearchingView parsed={parsed} />
            ) : (
              <ResultsView
                query={query}
                setQuery={setQuery}
                runSearch={runSearch}
                searchHistory={searchHistory}
                removeFromHistory={removeQuery}
                parsed={parsed}
                stats={stats}
                sortBy={sortBy}
                setSortBy={setSortBy}
                filterAlliance={filterAlliance}
                setFilterAlliance={setFilterAlliance}
                filterTransfer={filterTransfer}
                setFilterTransfer={setFilterTransfer}
                filterNonstop={filterNonstop}
                setFilterNonstop={setFilterNonstop}
                filteredFlights={filteredFlights}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                dataSource={dataSource}
              />
            )
          }
        />
        <Route path="/sweet-spots" element={<SweetSpotsTab runSearch={runSearch} />} />
        <Route path="/devaluations" element={<DevaluationsTab />} />
        <Route path="/tools" element={<ToolsTab />} />
      </Routes>
    </div>
  );
}
