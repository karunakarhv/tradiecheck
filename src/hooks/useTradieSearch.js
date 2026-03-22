import { useState, useEffect, useRef } from "react";
import { NSW_STATUS, parseNSWDate } from "../lib/nsw";
import { MOCK_TRADES } from "../lib/mockData";

export function useTradieSearch() {
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [results, setResults]   = useState(null); // { trades, hrw, asbestos }
  const [result, setResult]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef                = useRef(null);

  // Keeps the "LIVE" ticker refreshing every minute
  useEffect(() => {
    const t = setInterval(() => {}, 60000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = async (q) => {
    const term = (q || query).trim();
    if (!term) return;

    // Demo codes use local mock data
    if (MOCK_TRADES[term]) {
      setResult(MOCK_TRADES[term]);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const res  = await fetch(`/api/check?query=${encodeURIComponent(term)}`);
      const data = await res.json();
      const trades = Array.isArray(data.trades) ? data.trades : [];

      if (trades.length === 0) {
        setNotFound(true);
      } else if (trades.length === 1) {
        handleSelect(trades[0], data);
      } else {
        setResults({ trades, hrw: data.highRiskWork, asbestos: data.asbestos });
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (licence, data) => {
    const hrw      = data?.highRiskWork ?? results?.hrw;
    const asbestos = data?.asbestos     ?? results?.asbestos;
    const status   = NSW_STATUS[licence.status] || "SUSPENDED";
    const expiryISO = parseNSWDate(licence.expiryDate);
    const isExpired = expiryISO && new Date(expiryISO) < new Date();

    const alerts = [];
    if (licence.status === "Cancelled") alerts.push("🚨 Licence cancelled");
    if (isExpired)                      alerts.push("🚨 Licence has expired");

    setResult({
      name:           licence.licensee,
      trade:          licence.licenceType,
      status,
      licence:        licence.licenceNumber,
      expiry:         expiryISO,
      issuer:         "NSW Fair Trading",
      since:          "—",
      insuranceValid: false,
      highRiskWork:   Array.isArray(hrw)      && hrw.length > 0,
      asbestosCleared: Array.isArray(asbestos) && asbestos.length > 0,
      rating:         null,
      reviews:        null,
      photo:          licence.licensee?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
      alerts,
    });
  };

  const resetAll = () => {
    setResult(null);
    setResults(null);
    setQuery("");
    setNotFound(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const resetToList = () => {
    setResults(null);
    setNotFound(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return {
    query, setQuery,
    loading,
    results,
    result,
    notFound, setNotFound,
    inputRef,
    handleSearch,
    handleSelect,
    resetAll,
    resetToList,
  };
}
