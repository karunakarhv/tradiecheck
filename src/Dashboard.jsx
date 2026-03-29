import { useState } from "react";
import { NSW_STATUS, parseNSWDate } from "./lib/nsw";
import StatusBadge from "./components/StatusBadge";
import SourceIcon from "./components/SourceIcon";
import LogoutButton from "./components/LogoutButton";

function mapAPIResponse(data) {
  const trades = Array.isArray(data.trades) ? data.trades : [];
  const hrw = Array.isArray(data.highRiskWork) ? data.highRiskWork : [];
  const asbestos = Array.isArray(data.asbestos) ? data.asbestos : [];

  const primary = trades[0] || hrw[0] || asbestos[0];
  if (!primary) return null;

  const name = primary.licensee || "Unknown";
  const initials = name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const allLicences = [
    ...trades.map(l => ({
      name: l.licenceType || "Trade Licence",
      number: l.licenceNumber,
      status: NSW_STATUS[l.status] || "SUSPENDED",
      expiry: parseNSWDate(l.expiryDate),
      issuer: "NSW Fair Trading",
      source: "trades",
    })),
    ...hrw.map(l => ({
      name: l.licenceType || "High Risk Work Licence",
      number: l.licenceNumber,
      status: NSW_STATUS[l.status] || "SUSPENDED",
      expiry: parseNSWDate(l.expiryDate),
      issuer: "SafeWork NSW",
      source: "hrw",
    })),
    ...asbestos.map(l => ({
      name: l.licenceType || "Asbestos Removal Licence",
      number: l.licenceNumber,
      status: NSW_STATUS[l.status] || "SUSPENDED",
      expiry: parseNSWDate(l.expiryDate),
      issuer: "SafeWork NSW",
      source: "asbestos",
    })),
  ];

  const primaryLicence = allLicences[0] || {};

  return {
    name,
    initials,
    trade: trades[0]?.licenceType || hrw[0]?.licenceType || asbestos[0]?.licenceType || "Licensed Tradie",
    suburb: primary.suburb ? `${primary.suburb}${primary.postcode ? " " + primary.postcode : ""}, ${primary.issuer?.split(' ').pop() || 'NSW'}` : "Australia",
    status: primaryLicence.status || "ACTIVE",
    primaryLicence,
    allLicences,
  };
}

const DEMO = {
  name: "Jake Morrison",
  initials: "JM",
  trade: "Electrical Contractor",
  suburb: "Surry Hills 2010, NSW",
  status: "ACTIVE",
  primaryLicence: {
    name: "Electrical Contractor",
    number: "EC-48291",
    status: "ACTIVE",
    expiry: "2026-11-30",
    issuer: "NSW Fair Trading",
    source: "trades",
  },
  allLicences: [
    { name: "Electrical Contractor", number: "EC-48291", status: "ACTIVE", expiry: "2026-11-30", issuer: "NSW Fair Trading", source: "trades" },
    { name: "High Risk Work (Electrical)", number: "HRW-29834", status: "ACTIVE", expiry: "2026-11-30", issuer: "SafeWork NSW", source: "hrw" },
    { name: "Asbestos Non-Friable Removal", number: "ASB-10293", status: "ACTIVE", expiry: "2027-02-01", issuer: "SafeWork NSW", source: "asbestos" },
  ],
};

export default function TradieDashboard() {
  const [tab, setTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tradie, setTradie] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedState, setSelectedState] = useState("NSW");

  const daysUntil = (d) => d ? Math.floor((new Date(d) - new Date()) / 86400000) : null;

  const handleLoad = async (q) => {
    const term = (q || searchQuery).trim();
    if (!term) return;
    setLoading(true);
    setNotFound(false);
    setTradie(null);
    try {
      const res = await fetch(`http://localhost:3001/api/check?query=${encodeURIComponent(term)}&state=${selectedState}`);
      const data = await res.json();
      const mapped = mapAPIResponse(data);
      if (mapped) {
        setTradie(mapped);
        setTab("overview");
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTradie(null);
    setNotFound(false);
    setSearchQuery("");
  };

  const tabs = [
    { id: "overview", icon: "⊞", label: "Overview" },
    { id: "credentials", icon: "◈", label: "Credentials" },
    { id: "profile", icon: "◎", label: "Profile" },
  ];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#f0ede8",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      display: "flex",
    }}>
      {/* Fixed sign out button — always visible, top-right */}
      <div style={{ position: "fixed", top: "16px", right: "20px", zIndex: 100 }}>
        <LogoutButton variant="dark" />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d0cdc8; border-radius: 2px; }
        button { font-family: inherit; }
        input { font-family: inherit; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{
        width: "240px", flexShrink: 0,
        background: "#1a1814",
        padding: "24px 16px",
        display: "flex", flexDirection: "column", gap: "8px",
        minHeight: "100dvh",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", marginBottom: "24px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px",
            background: "rgba(0,232,122,0.15)", border: "1px solid rgba(0,232,122,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e87a" strokeWidth="2.5">
              <circle cx="10" cy="10" r="6" />
              <path d="m21 21-4.5-4.5" strokeLinecap="round" />
              <path d="M7.5 10l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <a href="/welcome" style={{ textDecoration: "none", fontWeight: 800, fontSize: "14px", color: "#fff" }}>
            Tradie<span style={{ color: "#00e87a" }}>Check</span>
          </a>
        </div>

        {/* User card */}
        <div style={{
          padding: "14px", borderRadius: "12px",
          background: "rgba(255,255,255,0.04)", marginBottom: "16px",
          display: "flex", gap: "12px", alignItems: "center",
        }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
            background: tradie
              ? "linear-gradient(135deg, rgba(0,232,122,0.2), rgba(0,232,122,0.4))"
              : "rgba(255,255,255,0.06)",
            border: tradie ? "1px solid rgba(0,232,122,0.3)" : "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 800,
            color: tradie ? "#00e87a" : "rgba(255,255,255,0.2)",
          }}>
            {tradie ? tradie.initials : "—"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontSize: "13px", fontWeight: 700,
              color: tradie ? "#fff" : "rgba(255,255,255,0.25)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {tradie ? tradie.name : "No profile loaded"}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "1px" }}>
              {tradie ? tradie.trade.split(" ").slice(0, 2).join(" ") : "Search to load"}
            </div>
          </div>
        </div>

        {/* Nav — only shown when tradie is loaded */}
        {tradie && tabs.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: tab === item.id ? "rgba(0,232,122,0.12)" : "transparent",
            color: tab === item.id ? "#00e87a" : "rgba(255,255,255,0.35)",
            fontSize: "13px", fontWeight: tab === item.id ? 700 : 500,
            transition: "all 0.15s", textAlign: "left",
          }}>
            <span style={{ fontSize: "15px", width: "18px", textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Status or Load button */}
        {tradie ? (
          <div>
            <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.15)", marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: "6px" }}>PROFILE STATUS</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: tradie.status === "ACTIVE" ? "#00e87a" : "#ff3b3b",
                }} />
                <span style={{
                  fontSize: "12px", fontWeight: 700,
                  color: tradie.status === "ACTIVE" ? "#00e87a" : "#ff5555",
                }}>
                  {tradie.status === "ACTIVE" ? "Verified" : tradie.status}
                </span>
              </div>
            </div>
            <button onClick={handleReset} style={{
              width: "100%", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
              padding: "10px", fontSize: "12px", color: "rgba(255,255,255,0.35)",
              cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.target.style.color = "#fff"; e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.35)"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              Load Different Profile
            </button>
          </div>
        ) : (
          <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", marginBottom: "6px" }}>{selectedState} REGISTER</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", lineHeight: "1.5" }}>
              Search by name or licence number in {selectedState} to load a live profile.
            </div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "32px", overflowY: "auto", maxHeight: "100dvh" }}>

        {/* ── SEARCH / LOAD SCREEN ─────────────────────────────── */}
        {!tradie && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#1a1814", letterSpacing: "-0.02em" }}>
                Tradie Dashboard
              </div>
              <div style={{ fontSize: "13px", color: "#8a8680", marginTop: "2px" }}>
                Search any Australian state register to load a live tradie profile
              </div>
            </div>

            {/* Search card */}
            <div style={{
              background: "#fff", borderRadius: "20px", padding: "40px",
              border: "1px solid #e8e5e0", maxWidth: "520px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#1a1814", marginBottom: "8px" }}>
                Load a Tradie Profile
              </div>
              <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "24px" }}>
                Enter a name or licence number and select the state register to search.
              </div>

              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  style={{
                    border: "1.5px solid #e0ddd7", borderRadius: "10px",
                    padding: "12px", fontSize: "14px", color: "#1a1814",
                    background: "#fdfcfb", outline: "none",
                  }}
                >
                  {["NSW", "VIC", "QLD", "WA", "SA", "ACT", "TAS"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLoad()}
                  placeholder="e.g. John Smith or EC-12345"
                  style={{
                    flex: 1, border: "1.5px solid #e0ddd7", borderRadius: "10px",
                    padding: "12px 16px", fontSize: "14px", color: "#1a1814",
                    outline: "none", transition: "border-color 0.15s",
                    background: "#fdfcfb",
                  }}
                  onFocus={e => e.target.style.borderColor = "#1a1814"}
                  onBlur={e => e.target.style.borderColor = "#e0ddd7"}
                  disabled={loading}
                />
                <button
                  onClick={() => handleLoad()}
                  disabled={loading || !searchQuery.trim()}
                  style={{
                    background: "#1a1814", border: "none", borderRadius: "10px",
                    padding: "12px 20px", fontSize: "13px", fontWeight: 700, color: "#fff",
                    cursor: loading || !searchQuery.trim() ? "default" : "pointer",
                    opacity: loading || !searchQuery.trim() ? 0.5 : 1,
                    transition: "opacity 0.15s",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}
                >
                  {loading ? (
                    <div style={{
                      width: "14px", height: "14px", borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      animation: "spin 0.7s linear infinite",
                    }} />
                  ) : "Search"}
                </button>
              </div>

              {notFound && (
                <div style={{
                  background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)",
                  borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
                  fontSize: "13px", color: "#cc3333",
                }}>
                  No results found in the NSW register for that query.
                </div>
              )}

              <div style={{ borderTop: "1px solid #f0ede8", paddingTop: "16px" }}>
                <div style={{ fontSize: "11px", color: "#bbb", letterSpacing: "0.06em", marginBottom: "10px" }}>
                  TRY DEMO
                </div>
                <button
                  onClick={() => { setTradie(DEMO); setTab("overview"); }}
                  style={{
                    background: "rgba(0,232,122,0.06)", border: "1px solid rgba(0,232,122,0.2)",
                    borderRadius: "8px", padding: "8px 16px", fontSize: "12px",
                    fontWeight: 600, color: "#009949", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.target.style.background = "rgba(0,232,122,0.12)"; }}
                  onMouseLeave={e => { e.target.style.background = "rgba(0,232,122,0.06)"; }}
                >
                  ✓ Load Demo Profile (Jake Morrison)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DASHBOARD (tradie loaded) ────────────────────────── */}
        {tradie && (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#1a1814", letterSpacing: "-0.02em" }}>
                  {tabs.find(t => t.id === tab)?.label}
                </div>
                <div style={{ fontSize: "13px", color: "#8a8680", marginTop: "2px" }}>
                  {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "#fff", border: "1px solid #e8e5e0", borderRadius: "8px",
                  padding: "8px 14px",
                }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#00e87a",
                  }} />
                  <span style={{ fontSize: "11px", color: "#555", fontWeight: 600, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
                    {selectedState} REGISTER
                  </span>
                </div>
              </div>
            </div>

            {/* ── OVERVIEW TAB ─────────────────────────────────── */}
            {tab === "overview" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                {/* KPI Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
                  {[
                    {
                      label: "Total Licences",
                      value: tradie.allLicences.length.toString(),
                      sub: `Across ${[...new Set(tradie.allLicences.map(l => l.source))].length} register${[...new Set(tradie.allLicences.map(l => l.source))].length !== 1 ? "s" : ""}`,
                      icon: "📋",
                    },
                    {
                      label: "Active Licences",
                      value: tradie.allLicences.filter(l => l.status === "ACTIVE").length.toString(),
                      sub: `${tradie.allLicences.filter(l => l.status !== "ACTIVE").length} expired/suspended`,
                      icon: "✓",
                      accent: true,
                    },
                    {
                      label: "Earliest Expiry",
                      value: (() => {
                        const expiries = tradie.allLicences.map(l => l.expiry).filter(Boolean);
                        if (!expiries.length) return "—";
                        const earliest = expiries.reduce((a, b) => a < b ? a : b);
                        const d = daysUntil(earliest);
                        if (d === null) return "—";
                        if (d < 0) return "Expired";
                        return `${d}d`;
                      })(),
                      sub: (() => {
                        const expiries = tradie.allLicences.map(l => l.expiry).filter(Boolean);
                        if (!expiries.length) return "No expiry data";
                        const earliest = expiries.reduce((a, b) => a < b ? a : b);
                        return new Date(earliest).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
                      })(),
                      icon: "📅",
                    },
                  ].map(k => (
                    <div key={k.label} style={{
                      background: "#fff", borderRadius: "14px", padding: "20px",
                      border: `1px solid ${k.accent ? "rgba(0,232,122,0.2)" : "#e8e5e0"}`,
                    }}>
                      <div style={{ fontSize: "22px", marginBottom: "8px" }}>{k.icon}</div>
                      <div style={{ fontSize: "28px", fontWeight: 800, color: k.accent ? "#009949" : "#1a1814", letterSpacing: "-0.02em" }}>{k.value}</div>
                      <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{k.label}</div>
                      <div style={{ fontSize: "11px", color: "#bbb", fontWeight: 500, marginTop: "4px" }}>{k.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Credential Health */}
                <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", border: "1px solid #e8e5e0", marginBottom: "20px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1814", marginBottom: "20px" }}>Credential Health</div>
                  {tradie.allLicences.length === 0 ? (
                    <div style={{ fontSize: "13px", color: "#aaa" }}>No licences found.</div>
                  ) : tradie.allLicences.map((c, i) => {
                    const days = daysUntil(c.expiry);
                    const pct = days === null ? 0 : Math.min(100, Math.max(0, (days / 365) * 100));
                    const col = days === null ? "#ccc" : days < 0 ? "#ff3b3b" : days < 30 ? "#ff3b3b" : days < 90 ? "#ffb800" : "#00e87a";
                    return (
                      <div key={i} style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <SourceIcon source={c.source} />
                            <span style={{ fontSize: "13px", color: "#333", fontWeight: 600 }}>{c.name}</span>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: col }}>
                            {days === null ? "No expiry" : days < 0 ? "EXPIRED" : `${days}d left`}
                          </span>
                        </div>
                        <div style={{ background: "#f0ede8", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: "4px", transition: "width 0.5s" }} />
                        </div>
                        <div style={{ fontSize: "11px", color: "#ccc", marginTop: "4px" }}>
                          {c.number} · {c.issuer}
                          {c.expiry && ` · Exp ${new Date(c.expiry).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Data source note */}
                <div style={{
                  background: "rgba(0,232,122,0.04)", borderRadius: "12px",
                  padding: "16px 20px", border: "1px solid rgba(0,232,122,0.12)",
                  display: "flex", gap: "12px", alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "16px" }}>ℹ️</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1814", marginBottom: "3px" }}>Live NSW Register Data</div>
                    <div style={{ fontSize: "12px", color: "#888", lineHeight: "1.6" }}>
                      This data was retrieved in real time from NSW Fair Trading (Trades), SafeWork NSW (High Risk Work) and the NSW Asbestos Register. Last checked: {new Date().toLocaleTimeString("en-AU")}.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CREDENTIALS TAB ──────────────────────────────── */}
            {tab === "credentials" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {tradie.allLicences.length === 0 ? (
                    <div style={{
                      background: "#fff", borderRadius: "14px", padding: "32px",
                      border: "1px solid #e8e5e0", textAlign: "center",
                      color: "#aaa", fontSize: "14px",
                    }}>No licences found in the NSW register.</div>
                  ) : tradie.allLicences.map((c, i) => {
                    const days = daysUntil(c.expiry);
                    const urgency = c.status !== "ACTIVE" ? c.status : days !== null && days < 30 ? "EXPIRING" : "ACTIVE";
                    const borderCol = urgency === "ACTIVE" ? "#e8e5e0" : urgency === "EXPIRING" ? "rgba(255,184,0,0.3)" : "rgba(255,59,59,0.3)";
                    return (
                      <div key={i} style={{
                        background: "#fff", borderRadius: "14px", padding: "22px 24px",
                        border: `1px solid ${borderCol}`,
                        display: "flex", alignItems: "center", gap: "18px",
                      }}>
                        <div style={{
                          width: "48px", height: "48px", flexShrink: 0, borderRadius: "12px",
                          background: urgency === "ACTIVE" ? "rgba(0,232,122,0.1)" : urgency === "EXPIRING" ? "rgba(255,184,0,0.1)" : "rgba(255,59,59,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                        }}>
                          <SourceIcon source={c.source} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1814", marginBottom: "4px" }}>{c.name}</div>
                          <div style={{ fontSize: "12px", color: "#aaa", fontFamily: "'DM Mono', monospace" }}>
                            {c.number}
                          </div>
                          <div style={{ fontSize: "12px", color: "#bbb", marginTop: "2px" }}>{c.issuer}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ marginBottom: "6px" }}>
                            <StatusBadge status={urgency} />
                          </div>
                          <div style={{ fontSize: "12px", color: "#aaa" }}>
                            {c.expiry
                              ? `Expires ${new Date(c.expiry).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`
                              : "No expiry date"
                            }
                          </div>
                          {days !== null && days >= 0 && (
                            <div style={{ fontSize: "11px", color: days < 90 ? "#b37d00" : "#ccc", marginTop: "2px" }}>
                              {days} days remaining
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Source breakdown */}
                  <div style={{
                    background: "rgba(0,0,0,0.02)", borderRadius: "12px",
                    padding: "16px 20px", border: "1px dashed #ddd",
                    display: "flex", gap: "20px",
                  }}>
                    {[
                      { icon: "🔧", label: "NSW Fair Trading", key: "trades", count: tradie.allLicences.filter(l => l.source === "trades").length },
                      { icon: "⚠️", label: "SafeWork (HRW)", key: "hrw", count: tradie.allLicences.filter(l => l.source === "hrw").length },
                      { icon: "🛡️", label: "Asbestos Register", key: "asbestos", count: tradie.allLicences.filter(l => l.source === "asbestos").length },
                    ].map(s => (
                      <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{s.icon}</span>
                        <div>
                          <div style={{ fontSize: "11px", color: "#999", fontWeight: 600 }}>{s.label}</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: s.count > 0 ? "#1a1814" : "#ccc" }}>{s.count}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFILE TAB ──────────────────────────────────── */}
            {tab === "profile" && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  {/* Banner */}
                  <div style={{
                    background: "#fff", borderRadius: "14px", padding: "28px",
                    border: "1px solid #e8e5e0", gridColumn: "span 2",
                    display: "flex", gap: "20px", alignItems: "center",
                  }}>
                    <div style={{
                      width: "72px", height: "72px", borderRadius: "18px", flexShrink: 0,
                      background: "linear-gradient(135deg, rgba(0,232,122,0.15), rgba(0,232,122,0.3))",
                      border: "2px solid rgba(0,232,122,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "24px", fontWeight: 800, color: "#00a855",
                    }}>{tradie.initials}</div>
                    <div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#1a1814", marginBottom: "4px" }}>{tradie.name}</div>
                      <div style={{ fontSize: "14px", color: "#888", marginBottom: "8px" }}>{tradie.trade} · {tradie.suburb}</div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <StatusBadge status={tradie.status} />
                        <span style={{ fontSize: "12px", color: "#aaa" }}>{selectedState} Register</span>
                      </div>
                    </div>
                  </div>

                  {/* Fields from NSW API */}
                  {[
                    { label: "Full Name", value: tradie.name, fromAPI: true },
                    { label: "Primary Trade", value: tradie.trade, fromAPI: true },
                    { label: "Location", value: tradie.suburb, fromAPI: true },
                    { label: "Primary Licence", value: tradie.primaryLicence?.number || "—", fromAPI: true },
                  ].map(f => (
                    <div key={f.label} style={{
                      background: "#fff", borderRadius: "14px", padding: "20px 24px",
                      border: "1px solid #e8e5e0",
                    }}>
                      <div style={{ fontSize: "11px", color: "#aaa", letterSpacing: "0.08em", marginBottom: "6px", fontWeight: 600 }}>
                        {f.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: "14px", color: "#333", fontWeight: 500 }}>{f.value}</div>
                    </div>
                  ))}

                  {/* Fields NOT available from NSW API */}
                  {[
                    { label: "Email" },
                    { label: "Phone" },
                    { label: "ABN" },
                    { label: "Insurance" },
                  ].map(f => (
                    <div key={f.label} style={{
                      background: "#fafaf8", borderRadius: "14px", padding: "20px 24px",
                      border: "1px dashed #e0ddd7",
                    }}>
                      <div style={{ fontSize: "11px", color: "#ccc", letterSpacing: "0.08em", marginBottom: "6px", fontWeight: 600 }}>
                        {f.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: "13px", color: "#ccc", fontStyle: "italic" }}>
                        Not available from NSW register
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
