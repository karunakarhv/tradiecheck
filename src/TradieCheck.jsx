import { useState, useEffect, useRef } from "react";
import { NSW_STATUS, parseNSWDate } from "./lib/nsw";
import { MOCK_TRADES } from "./lib/mockData";
import StarRating from "./components/StarRating";
import CheckRow from "./components/CheckRow";

const STATUS_CONFIG = {
  ACTIVE: { color: "#00e87a", label: "VERIFIED & ACTIVE", icon: "✓" },
  SUSPENDED: { color: "#ff3b3b", label: "SUSPENDED", icon: "✕" },
  EXPIRED: { color: "#ff9500", label: "EXPIRED", icon: "!" },
};

function ResultCard({ data, onClose }) {
  const status = STATUS_CONFIG[data.status];
  const isActive = data.status === "ACTIVE";

  return (
    <div style={{
      animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
      background: "#0d0d0d",
      border: `1px solid ${isActive ? "rgba(0,232,122,0.25)" : "rgba(255,59,59,0.3)"}`,
      borderRadius: "16px",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Status bar */}
      <div style={{
        background: isActive
          ? "linear-gradient(90deg, rgba(0,232,122,0.15), transparent)"
          : "linear-gradient(90deg, rgba(255,59,59,0.15), transparent)",
        padding: "12px 20px",
        display: "flex", alignItems: "center", gap: "10px",
        borderBottom: `1px solid ${isActive ? "rgba(0,232,122,0.12)" : "rgba(255,59,59,0.12)"}`,
      }}>
        <span style={{
          fontSize: "18px", fontWeight: 900, color: status.color,
          fontFamily: "'Courier New', monospace",
        }}>{status.icon}</span>
        <span style={{
          fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em",
          color: status.color, fontFamily: "'Courier New', monospace",
        }}>{status.label}</span>
        <span style={{
          marginLeft: "auto", fontSize: "10px", color: "#444",
          fontFamily: "'Courier New', monospace",
        }}>CHECKED {new Date().toLocaleTimeString("en-AU")}</span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Tradie Header */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "12px",
            background: `linear-gradient(135deg, ${status.color}22, ${status.color}44)`,
            border: `1px solid ${status.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 800, color: status.color,
            flexShrink: 0,
          }}>{data.photo}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{data.name}</div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>{data.trade}</div>
            <div style={{ marginTop: "6px" }}>
              <StarRating rating={data.rating} reviews={data.reviews} />
            </div>
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace", fontSize: "11px",
            color: "#444", textAlign: "right", lineHeight: "1.6",
          }}>
            <div style={{ color: "#555" }}>LICENCE</div>
            <div style={{ color: "#888" }}>{data.licence}</div>
            <div style={{ color: "#555", marginTop: "4px" }}>ISSUER</div>
            <div style={{ color: "#666", fontSize: "10px" }}>{data.issuer}</div>
          </div>
        </div>

        {/* Checks */}
        <div style={{
          background: "#080808", borderRadius: "10px", padding: "4px 16px",
          marginBottom: "20px", border: "1px solid #1a1a1a"
        }}>
          <CheckRow label="Licence Status" value={data.status === "ACTIVE"} />
          <CheckRow label="High-Risk Work Licence" value={data.highRiskWork} />
          <CheckRow label="Asbestos Certification" value={data.asbestosCleared} />
          <CheckRow label="Public Liability Insurance" value={data.insuranceValid} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <span style={{ color: "#888", fontSize: "13px", letterSpacing: "0.04em" }}>Licence Expiry</span>
            <span style={{
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em",
              color: new Date(data.expiry) < new Date() ? "#ff3b3b" : new Date(data.expiry) < new Date(Date.now() + 90 * 86400000) ? "#ff9500" : "#888"
            }}>
              {new Date(data.expiry).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            {data.alerts.map((a, i) => (
              <div key={i} style={{
                background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)",
                borderRadius: "8px", padding: "10px 14px", marginBottom: "6px",
                fontSize: "12px", color: "#ff8080", letterSpacing: "0.02em",
              }}>{a}</div>
            ))}
          </div>
        )}

        {/* Since */}
        <div style={{
          display: "flex", gap: "8px", justifyContent: "space-between",
          paddingTop: "16px", borderTop: "1px solid #1a1a1a"
        }}>
          <div style={{ fontSize: "11px", color: "#444", letterSpacing: "0.06em" }}>
            LICENSED SINCE <span style={{ color: "#666" }}>{data.since}</span>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid #222", borderRadius: "6px",
            color: "#555", fontSize: "11px", padding: "4px 12px",
            cursor: "pointer", letterSpacing: "0.06em",
          }}>NEW SEARCH</button>
        </div>
      </div>
    </div>
  );
}

function ResultsList({ results, onSelect, onBack }) {
  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "14px",
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "1px solid #222", borderRadius: "6px",
          color: "#555", fontSize: "11px", padding: "4px 10px",
          cursor: "pointer", letterSpacing: "0.06em",
        }}>← BACK</button>
        <span style={{ fontSize: "12px", color: "#444", fontFamily: "'DM Mono', monospace" }}>
          {results.length} RESULT{results.length !== 1 ? "S" : ""} FOUND
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {results.map((licence) => {
          const status = NSW_STATUS[licence.status] || "SUSPENDED";
          const statusColors = { ACTIVE: "#00e87a", EXPIRED: "#ff9500", SUSPENDED: "#ff3b3b" };
          const color = statusColors[status];
          return (
            <button key={licence.licenceID} onClick={() => onSelect(licence)}
              style={{
                background: "#0d0d0d", border: "1px solid #1e1e1e",
                borderRadius: "12px", padding: "14px 16px",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = `${color}44`}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1e1e1e"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {licence.licensee}
                  </div>
                  <div style={{ fontSize: "11px", color: "#555", fontFamily: "'DM Mono', monospace" }}>
                    {licence.licenceNumber} · {licence.licenceType}
                  </div>
                  {licence.suburb && (
                    <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>
                      {licence.suburb} {licence.postcode}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em",
                  color, padding: "3px 8px",
                  background: `${color}12`, border: `1px solid ${color}33`,
                  borderRadius: "4px", whiteSpace: "nowrap", flexShrink: 0,
                }}>{licence.status?.toUpperCase()}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TradieCheck() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [ticker, setTicker] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTicker(x => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const demos = [
    { label: "Active Electrician", code: "LIC-48291" },
    { label: "Expiring Plumber", code: "PLB-77432" },
    { label: "Suspended Builder", code: "BLD-10293" },
  ];

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
    const res = await fetch(`/api/check?query=${encodeURIComponent(term)}`);
    const data = await res.json();

    const trades = Array.isArray(data.trades) ? data.trades : [];
    if (trades.length === 0) {
      setNotFound(true);
    } else if (trades.length === 1) {
      handleSelect(trades[0], data);
    } else {
      // Store full data payload alongside trades so handleSelect can access hrw/asbestos
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
  const hrw = data?.highRiskWork ?? results?.hrw;
  const asbestos = data?.asbestos ?? results?.asbestos;
  const status = NSW_STATUS[licence.status] || "SUSPENDED";
  const expiryISO = parseNSWDate(licence.expiryDate);
  const isExpired = expiryISO && new Date(expiryISO) < new Date();
  const alerts = [];
  if (licence.status === "Cancelled") alerts.push("🚨 Licence cancelled");
  if (isExpired) alerts.push("🚨 Licence has expired");

  setResult({
    name: licence.licensee,
    trade: licence.licenceType,
    status,
    licence: licence.licenceNumber,
    expiry: expiryISO,
    issuer: "NSW Fair Trading",
    since: "—",
    insuranceValid: false,
    highRiskWork: Array.isArray(hrw) && hrw.length > 0,
    asbestosCleared: Array.isArray(asbestos) && asbestos.length > 0,
    rating: null,
    reviews: null,
    photo: licence.licensee?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
    alerts,
  });
};

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      color: "#fff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        * { box-sizing: border-box; margin:0; padding:0 }
        html, body { width:100%; min-height:100vh; }
        input:focus { outline: none }
        ::-webkit-scrollbar { width:4px } ::-webkit-scrollbar-track{background:#0a0a0a} ::-webkit-scrollbar-thumb{background:#222}

        .tc-layout {
          display: grid;
          grid-template-columns: 1fr;
          min-height: 100vh;
        }
        .tc-left {
          padding: 32px 28px 48px;
          border-right: none;
          border-bottom: 1px solid #111;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }
        .tc-right {
          padding: 32px 28px 48px;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 900px) {
          .tc-layout {
            grid-template-columns: 420px 1fr;
            min-height: 100vh;
          }
          .tc-left {
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
            border-right: 1px solid #111;
            border-bottom: none;
            padding: 40px 40px 48px;
          }
          .tc-right {
            padding: 40px 48px 48px;
            overflow-y: auto;
          }
        }
        @media (min-width: 1280px) {
          .tc-left { padding: 48px 48px 48px; }
          .tc-right { padding: 48px 64px 48px; }
        }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(0,232,122,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,122,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />
      <div style={{ position: "fixed", top: "-200px", left: "25%", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(0,232,122,0.06) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

      <div className="tc-layout">

        {/* ── LEFT PANEL ── */}
        <div className="tc-left">

          {/* Nav */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "52px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "linear-gradient(135deg, #00e87a22, #00e87a44)",
                border: "1px solid #00e87a44",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e87a" strokeWidth="2.5">
                  <circle cx="10" cy="10" r="6" />
                  <path d="m21 21-4.5-4.5" strokeLinecap="round" />
                  <path d="M7.5 10l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontWeight: 900, fontSize: "16px", letterSpacing: "-0.03em" }}>
                VerifyMy<span style={{ color: "#00e87a" }}>Tradie</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00e87a", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: "10px", color: "#444", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>LIVE</span>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {[
                  { label: "Mobile", href: "/mobile" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "API", href: "/api-config" },
                ].map(({ label, href }) => (
                  <a key={href} href={href} style={{
                    fontSize: "10px", color: "#333", padding: "4px 8px",
                    borderRadius: "5px", border: "1px solid #1a1a1a",
                    textDecoration: "none", fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.06em", transition: "all 0.15s",
                  }}
                    onMouseEnter={(e) => { e.target.style.color = "#00e87a"; e.target.style.borderColor = "#00e87a44"; }}
                    onMouseLeave={(e) => { e.target.style.color = "#333"; e.target.style.borderColor = "#1a1a1a"; }}
                  >{label}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Hero */}
          <div style={{ marginBottom: "36px" }}>
            <div style={{
              display: "inline-block", background: "rgba(0,232,122,0.08)",
              border: "1px solid rgba(0,232,122,0.2)", borderRadius: "20px",
              padding: "5px 14px", fontSize: "10px", letterSpacing: "0.15em",
              color: "#00e87a", fontWeight: 700, marginBottom: "20px",
              fontFamily: "'DM Mono', monospace",
            }}>AUSTRALIA'S TRADIE VERIFIER</div>

            <h1 style={{
              fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900,
              letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "14px",
            }}>
              Know who's<br />
              <span style={{
                background: "linear-gradient(90deg, #00e87a, #00c4ff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>at your door.</span>
            </h1>

            <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
              Instantly verify your tradie's licence, insurance & certifications before they step inside.
            </p>
          </div>

          {/* Search Box */}
          <div style={{
            background: "#0d0d0d",
            border: "1px solid #1e1e1e",
            borderRadius: "14px",
            padding: "6px 6px 6px 18px",
            display: "flex", alignItems: "center", gap: "10px",
            transition: "border-color 0.2s",
            marginBottom: "12px",
          }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#00e87a44"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#1e1e1e"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Name or licence number..."
              style={{
                flex: 1, background: "none", border: "none", color: "#fff",
                fontSize: "15px", fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              style={{
                background: loading ? "#0d0d0d" : "linear-gradient(135deg, #00e87a, #00c065)",
                border: "none", borderRadius: "10px",
                padding: "12px 20px", color: loading ? "#333" : "#000",
                fontSize: "13px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.06em", minWidth: "80px",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {loading
                ? <div style={{ width: "14px", height: "14px", border: "2px solid #333", borderTopColor: "#00e87a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                : "CHECK"}
            </button>
          </div>

          {/* Demo chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "32px" }}>
            <span style={{ fontSize: "11px", color: "#333", alignSelf: "center", letterSpacing: "0.06em" }}>TRY:</span>
            {demos.map(d => (
              <button key={d.code} onClick={() => { setQuery(d.code); handleSearch(d.code); }}
                style={{
                  background: "#0d0d0d", border: "1px solid #1e1e1e",
                  borderRadius: "20px", padding: "5px 12px",
                  color: "#555", fontSize: "11px", cursor: "pointer",
                  fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = "#00e87a44"; e.target.style.color = "#00e87a"; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "#1e1e1e"; e.target.style.color = "#555"; }}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* How it works */}
          <div style={{
            background: "#080808", border: "1px solid #111",
            borderRadius: "12px", padding: "20px",
          }}>
            <div style={{ fontSize: "10px", color: "#333", letterSpacing: "0.12em", marginBottom: "16px", fontFamily: "'DM Mono', monospace" }}>HOW IT WORKS</div>
            {[
              { n: "01", t: "Enter name or licence", d: "Type a tradie's name or licence number" },
              { n: "02", t: "We check live databases", d: "Fair Trading, WorkSafe & DMIRS APIs" },
              { n: "03", t: "Instant verdict", d: "Verified status, expiry & risk flags" },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", gap: "14px", marginBottom: "14px", alignItems: "flex-start" }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#00e87a",
                  minWidth: "24px", fontWeight: 700, paddingTop: "2px",
                }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", marginBottom: "2px" }}>{s.t}</div>
                  <div style={{ fontSize: "12px", color: "#3a3a3a" }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: "auto", paddingTop: "32px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: "10px", color: "#2a2a2a", letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>
              DATA: NSW · VIC · QLD · WA · SA
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              {["Privacy", "API", "About"].map(l => (
                <span key={l} style={{ fontSize: "11px", color: "#2a2a2a", cursor: "pointer", letterSpacing: "0.04em" }}>{l}</span>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="tc-right">

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: "40px", height: "40px", border: "2px solid #111", borderTopColor: "#00e87a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <div style={{ fontSize: "11px", color: "#333", letterSpacing: "0.12em", fontFamily: "'DM Mono', monospace" }}>CHECKING DATABASES…</div>
              </div>
            </div>
          )}

          {/* Results list */}
          {results && !result && !loading && (
            <ResultsList
              results={results.trades}
              onSelect={(licence) => handleSelect(licence)}
              onBack={() => { setResults(null); setNotFound(false); setTimeout(() => inputRef.current?.focus(), 100); }}
            />
          )}

          {/* Not found */}
          {notFound && !result && !loading && (
            <div style={{
              animation: "slideUp 0.3s ease",
              background: "#0d0d0d", border: "1px solid #1e1e1e",
              borderRadius: "14px", padding: "40px 32px", textAlign: "center",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
              <div style={{ fontWeight: 800, fontSize: "18px", marginBottom: "10px" }}>No results found</div>
              <div style={{ color: "#555", fontSize: "13px", marginBottom: "24px", lineHeight: 1.6 }}>
                No tradie matched "{query}". Double-check the name or licence number.
              </div>
              <button onClick={() => { setNotFound(false); setQuery(""); inputRef.current?.focus(); }}
                style={{
                  background: "none", border: "1px solid #222", borderRadius: "8px",
                  color: "#555", fontSize: "12px", padding: "10px 24px",
                  cursor: "pointer", letterSpacing: "0.06em",
                }}>TRY AGAIN</button>
            </div>
          )}

          {/* Result card */}
          {result && !loading && (
            <ResultCard data={result} onClose={() => { setResult(null); setResults(null); setQuery(""); setNotFound(false); setTimeout(() => inputRef.current?.focus(), 100); }} />
          )}

          {/* Empty state */}
          {!loading && !results && !notFound && !result && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", minHeight: "300px", opacity: 0.2,
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ marginTop: "16px", fontSize: "11px", color: "#555", letterSpacing: "0.12em", fontFamily: "'DM Mono', monospace", textAlign: "center", lineHeight: 1.8 }}>
                ENTER A NAME OR LICENCE<br />NUMBER TO BEGIN
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
