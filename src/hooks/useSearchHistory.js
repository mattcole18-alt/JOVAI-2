import { useState, useCallback } from "react";

const STORAGE_KEY = "jovair-search-history";
const MAX_ITEMS = 5;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  } catch (_) {}
}

export function useSearchHistory() {
  const [history, setHistory] = useState(loadHistory);

  const addQuery = useCallback((query) => {
    const q = (query || "").trim();
    if (!q) return;
    setHistory((prev) => {
      const next = [q, ...prev.filter((item) => item !== q)].slice(0, MAX_ITEMS);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeQuery = useCallback((query) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item !== query);
      saveHistory(next);
      return next;
    });
  }, []);

  return { history, addQuery, removeQuery };
}
