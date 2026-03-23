import { useState, useEffect, useRef } from "react";
import { NSW_STATUS, parseNSWDate } from "../lib/nsw";
import { MOCK_TRADES } from "../lib/mockData";

export function useTradieSearch() {
  const [query, setQuery]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState(null); // { trades, hrw, asbestos }
  const [result, setResult]         = useState(null);
  const [notFound, setNotFound]     = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [bulkResults, setBulkResults] = useState(null); // Array of { query, status, data }
  const inputRef                    = useRef(null);

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
    setRateLimited(false);
    setResult(null);

    try {
      const res  = await fetch(`/api/check?query=${encodeURIComponent(term)}`);

      if (res.status === 429) {
        setRateLimited(true);
        return;
      }

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
    setRateLimited(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const resetToList = () => {
    setResults(null);
    setNotFound(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleBulkUpload = async (file) => {
    if (!file) return;
    const text = await file.text();
    const rows = text.split(/\r?\n/).map(r => r.trim()).filter(r => r && !r.startsWith("#"));
    const queries = [...new Set(rows)]; // Unique queries

    setBulkResults(queries.map(q => ({ query: q, status: "pending", data: null })));
    setResult(null);
    setResults(null);

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i];
      setBulkResults(prev => prev.map((item, idx) => idx === i ? { ...item, status: "loading" } : item));

      try {
        const res = await fetch(`/api/check?query=${encodeURIComponent(q)}`);
        if (res.status === 429) {
          setBulkResults(prev => prev.map((item, idx) => idx === i ? { ...item, status: "rateLimited" } : item));
          // Wait 5 seconds on rate limit and retry or stop? 
          // For UX, let's wait 5s and try once more, then skip if still failing.
          await new Promise(r => setTimeout(r, 5000));
          const resRetry = await fetch(`/api/check?query=${encodeURIComponent(q)}`);
          if (resRetry.status === 429) {
             setBulkResults(prev => prev.map((item, idx) => idx === i ? { ...item, status: "rateLimited" } : item));
             continue; 
          }
          const data = await resRetry.json();
          const trades = Array.isArray(data.trades) ? data.trades : [];
          setBulkResults(prev => prev.map((item, idx) => idx === i ? {
            ...item,
            status: trades.length > 0 ? "success" : "notFound",
            data: trades[0] || null
          } : item));
        } else {
          const data = await res.json();
          const trades = Array.isArray(data.trades) ? data.trades : [];
          setBulkResults(prev => prev.map((item, idx) => idx === i ? {
            ...item,
            status: trades.length > 0 ? "success" : "notFound",
            data: trades[0] || null
          } : item));
        }
      } catch (err) {
        setBulkResults(prev => prev.map((item, idx) => idx === i ? { ...item, status: "error" } : item));
      }

      // Add a small delay between requests to stay under 20/min
      if (i < queries.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  };

  const resetBulk = () => {
    setBulkResults(null);
    resetAll();
  };

  return {
    query, setQuery,
    loading,
    results,
    result,
    notFound, setNotFound,
    rateLimited,
    bulkResults,
    inputRef,
    handleSearch,
    handleSelect,
    handleBulkUpload,
    resetAll,
    resetToList,
    resetBulk,
  };
}
