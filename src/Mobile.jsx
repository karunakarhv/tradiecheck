import { useState, useRef } from "react";
import { MOCK_TRADES } from "./lib/mockData";

const RECENT = [
  { name: "Jake Morrison", trade: "Electrician", licence: "LIC-48291", status: "ACTIVE", ago: "2h ago" },
  { name: "Sandra Okafor", trade: "Plumber", licence: "PLB-77432", status: "ACTIVE", ago: "Yesterday" },
];

function Phone({ children, bg = "#f5f2ec" }) {
  return (
    <div style={{
      width: "375px", minHeight: "812px",
      background: bg,
      borderRadius: "52px",
      border: "10px solid #1a1814",
      boxShadow: "0 40px 80px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.05)",
      position: "relative",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      {/* Notch */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "126px", height: "34px",
        background: "#1a1814", borderRadius: "0 0 20px 20px", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      }}>
        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#111" }} />
        <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#222" }} />
      </div>
      {/* Status bar */}
      <div style={{ height: "44px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 28px 6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#1a1814" }}>9:41</span>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <div style={{ width: "16px", height: "10px", border: "1.5px solid #1a1814", borderRadius: "2px", position: "relative" }}>
            <div style={{ position: "absolute", left: "2px", top: "2px", bottom: "2px", right: "4px", background: "#1a1814", borderRadius: "1px" }} />
            <div style={{ position: "absolute", right: "-4px", top: "3px", width: "2.5px", height: "4px", background: "#1a1814", borderRadius: "1px" }} />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function HomeScreen({ onSearch, onDemo }) {
  const [q, setQ] = useState("");
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 0 0" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "2px" }}>Good morning 👋</div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#1a1814", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Verify your<br />tradie.</div>
          </div>
          <div style={{
            width: "42px", height: "42px", borderRadius: "12px",
            background: "#1a1814", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00e87a" strokeWidth="2.5">
              <circle cx="10" cy="10" r="6" />
              <path d="m21 21-4.5-4.5" strokeLinecap="round" />
              <path d="M7.5 10l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Search */}
        <div style={{
          background: "#fff", borderRadius: "16px", padding: "14px 16px",
          display: "flex", alignItems: "center", gap: "10px",
          border: "1.5px solid #e8e5e0", marginBottom: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearch(q)}
            placeholder="Name or licence number..."
            style={{
              flex: 1, border: "none", outline: "none", fontSize: "15px",
              color: "#1a1814", background: "none", fontFamily: "inherit",
            }}
          />
          {q && (
            <button onClick={() => onSearch(q)} style={{
              background: "#1a1814", border: "none", borderRadius: "10px",
              width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Quick Try */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {[
            { label: "Active", code: "LIC-48291" },
            { label: "Expiring", code: "PLB-77432" },
            { label: "Suspended", code: "BLD-10293" },
          ].map(d => (
            <button key={d.code} onClick={() => onDemo(d.code)} style={{
              background: "#fff", border: "1px solid #e8e5e0",
              borderRadius: "20px", padding: "6px 12px", fontSize: "11px",
              color: "#888", cursor: "pointer", fontFamily: "inherit",
              fontWeight: 500,
            }}>{d.label}</button>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div style={{ padding: "0 24px", flex: 1 }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1814", marginBottom: "12px", letterSpacing: "-0.01em" }}>Recent checks</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {RECENT.map((r, i) => (
            <button key={i} onClick={() => onDemo(r.licence)} style={{
              background: "#fff", border: "1px solid #e8e5e0", borderRadius: "14px",
              padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px",
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "11px", flexShrink: 0,
                background: "linear-gradient(135deg, rgba(0,232,122,0.15), rgba(0,232,122,0.3))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 800, color: "#009949",
              }}>{r.name.split(" ").map(n => n[0]).join("")}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1814" }}>{r.name}</div>
                <div style={{ fontSize: "12px", color: "#aaa" }}>{r.trade} · {r.ago}</div>
              </div>
              <div style={{
                background: "rgba(0,232,122,0.1)", borderRadius: "8px",
                padding: "4px 8px", fontSize: "10px", fontWeight: 700,
                color: "#009949", letterSpacing: "0.06em",
              }}>✓</div>
            </button>
          ))}
        </div>

        {/* Scan card */}
        <div style={{
          marginTop: "16px",
          background: "#1a1814", borderRadius: "18px", padding: "20px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-30px", right: "-30px",
            width: "120px", height: "120px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,232,122,0.15) 0%, transparent 70%)",
          }} />
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>📷</div>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>Scan licence card</div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "14px" }}>Point camera at licence for instant check</div>
          <div style={{
            background: "#00e87a", borderRadius: "10px", padding: "10px",
            fontSize: "13px", fontWeight: 700, color: "#000", textAlign: "center",
          }}>Open Camera</div>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar active="home" />
    </div>
  );
}

function ResultScreen({ data, onBack }) {
  const isActive = data.status === "ACTIVE";
  const isSuspended = data.status === "SUSPENDED";

  const checks = [
    { label: "Licence", value: data.status === "ACTIVE" },
    { label: "High-Risk", value: data.highRiskWork },
    { label: "Asbestos", value: data.asbestosCleared },
    { label: "Insurance", value: data.insuranceValid },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Status header */}
      <div style={{
        background: isSuspended ? "#1f0a0a" : isActive ? "#0a1f12" : "#1f180a",
        padding: "20px 24px 24px",
        borderBottom: `1px solid ${isSuspended ? "rgba(255,59,59,0.15)" : "rgba(0,232,122,0.15)"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px",
            width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Verification Result</span>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "16px", flexShrink: 0,
            background: `linear-gradient(135deg, ${isSuspended ? "rgba(255,59,59,0.2)" : "rgba(0,232,122,0.15)"}, ${isSuspended ? "rgba(255,59,59,0.35)" : "rgba(0,232,122,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 800,
            color: isSuspended ? "#ff3b3b" : "#00e87a",
          }}>{data.photo}</div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{data.name}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{data.trade}</div>
          </div>
        </div>

        <div style={{
          marginTop: "16px",
          background: isSuspended ? "rgba(255,59,59,0.12)" : "rgba(0,232,122,0.12)",
          border: `1px solid ${isSuspended ? "rgba(255,59,59,0.25)" : "rgba(0,232,122,0.2)"}`,
          borderRadius: "12px", padding: "12px 16px",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
            background: isSuspended ? "rgba(255,59,59,0.2)" : "rgba(0,232,122,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: 800,
            color: isSuspended ? "#ff3b3b" : "#00e87a",
          }}>{isSuspended ? "✕" : "✓"}</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: isSuspended ? "#ff6b6b" : "#00e87a", letterSpacing: "0.04em" }}>
              {isSuspended ? "LICENCE SUSPENDED" : "LICENCE ACTIVE & VERIFIED"}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
              {data.issuer} · Checked just now
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f5f2ec" }}>
        {/* 4-check grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {checks.map(c => (
            <div key={c.label} style={{
              background: "#fff", borderRadius: "12px", padding: "14px",
              border: `1px solid ${c.value ? "rgba(0,232,122,0.2)" : "rgba(255,59,59,0.2)"}`,
              display: "flex", flexDirection: "column", gap: "8px",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: c.value ? "rgba(0,232,122,0.1)" : "rgba(255,59,59,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700, color: c.value ? "#009949" : "#cc2222",
              }}>{c.value ? "✓" : "✕"}</div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>{c.label}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: c.value ? "#009949" : "#cc2222", letterSpacing: "0.06em" }}>
                {c.value ? "VERIFIED" : "FAILED"}
              </div>
            </div>
          ))}
        </div>

        {/* Licence details */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "16px", marginBottom: "12px", border: "1px solid #e8e5e0" }}>
          {[
            { label: "Licence Number", value: data.licence },
            { label: "Issuing Authority", value: data.issuer },
            { label: "Licensed Since", value: data.since },
            { label: "Expiry Date", value: new Date(data.expiry).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0",
              borderBottom: i < arr.length - 1 ? "1px solid #f5f2ec" : "none",
            }}>
              <span style={{ fontSize: "12px", color: "#aaa" }}>{row.label}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1814" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Google rating */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "16px", marginBottom: "12px", border: "1px solid #e8e5e0", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "28px" }}>⭐</div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1814" }}>{data.rating} / 5</div>
            <div style={{ fontSize: "12px", color: "#aaa" }}>{data.reviews} Google reviews</div>
          </div>
          <button style={{ marginLeft: "auto", background: "none", border: "1px solid #e0ddd7", borderRadius: "8px", padding: "7px 12px", fontSize: "11px", color: "#888", cursor: "pointer", fontFamily: "inherit" }}>
            Read →
          </button>
        </div>

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.alerts.map((a, i) => (
              <div key={i} style={{
                background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)",
                borderRadius: "10px", padding: "12px 14px",
                fontSize: "12px", color: "#cc3333", lineHeight: 1.5,
              }}>🚨 {a}</div>
            ))}
          </div>
        )}
      </div>

      {/* Share button */}
      <div style={{ padding: "12px 24px 20px", background: "#f5f2ec", borderTop: "1px solid #e8e5e0" }}>
        <button style={{
          width: "100%", background: "#1a1814", border: "none", borderRadius: "14px",
          padding: "16px", fontSize: "15px", fontWeight: 700, color: "#fff",
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Save Verification Report
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", background: "#f5f2ec" }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "22px",
        background: "#1a1814", display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "24px",
        animation: "pulse 1.5s ease infinite",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00e87a" strokeWidth="2">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ fontSize: "18px", fontWeight: 800, color: "#1a1814", marginBottom: "8px" }}>Checking databases…</div>
      <div style={{ fontSize: "13px", color: "#aaa", textAlign: "center", lineHeight: 1.6, marginBottom: "28px" }}>
        Cross-referencing NSW Fair Trading,<br />SafeWork, and more
      </div>
      {["NSW Fair Trading", "SafeWork NSW", "Google Reviews"].map((src, i) => (
        <div key={src} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", animation: `fadeIn 0.4s ${i * 0.3}s both` }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00e87a", animation: "pulse 1s infinite" }} />
          <span style={{ fontSize: "12px", color: "#888" }}>Checking {src}…</span>
        </div>
      ))}
    </div>
  );
}

function TabBar({ active }) {
  const tabs = [
    { id: "home", icon: "⊞", label: "Home" },
    { id: "search", icon: "◎", label: "Search" },
    { id: "saved", icon: "◈", label: "Saved" },
    { id: "profile", icon: "◉", label: "Profile" },
  ];
  return (
    <div style={{
      borderTop: "1px solid #e8e5e0", background: "#fff",
      display: "flex", padding: "8px 0 20px",
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
          cursor: "pointer",
        }}>
          <div style={{ fontSize: "20px", lineHeight: 1, opacity: t.id === active ? 1 : 0.3 }}>{t.icon}</div>
          <div style={{ fontSize: "10px", fontWeight: t.id === active ? 700 : 500, color: t.id === active ? "#1a1814" : "#bbb" }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function MobileApp() {
  const [screen, setScreen] = useState("home"); // home | loading | result
  const [result, setResult] = useState(null);

  const doSearch = (q) => {
    const term = q.trim().toUpperCase();
    const found = MOCK_TRADES[term] || Object.values(MOCK_TRADES).find(t => t.name.toUpperCase().includes(term));
    if (!found && !MOCK_TRADES[term]) return;
    setScreen("loading");
    setTimeout(() => {
      setResult(found || null);
      setScreen(found ? "result" : "home");
    }, 1800);
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(145deg, #e8e4de 0%, #d4d0ca 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      padding: "40px 20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        input { font-family: inherit; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <a href="/welcome" style={{
        position: "fixed", top: "20px", left: "20px",
        background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px",
        padding: "7px 14px", fontSize: "12px", fontWeight: 700,
        color: "#1a1814", textDecoration: "none", letterSpacing: "0.04em",
        fontFamily: "'DM Sans', sans-serif", zIndex: 100,
      }}>← Home</a>

      <div style={{ display: "flex", gap: "60px", alignItems: "flex-start" }}>
        {/* Phone */}
        <Phone>
          {screen === "home" && (
            <HomeScreen
              onSearch={doSearch}
              onDemo={doSearch}
            />
          )}
          {screen === "loading" && <LoadingScreen />}
          {screen === "result" && result && (
            <ResultScreen data={result} onBack={() => setScreen("home")} />
          )}
        </Phone>

        {/* Sidebar info */}
        <div style={{ maxWidth: "320px", paddingTop: "40px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#888", marginBottom: "12px", fontWeight: 700 }}>TRADIECHECK MOBILE</div>
          <h2 style={{ fontSize: "36px", fontWeight: 900, color: "#1a1814", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "16px" }}>
            Check before<br />you unlock<br />the door.
          </h2>
          <p style={{ fontSize: "15px", color: "#888", lineHeight: 1.7, marginBottom: "32px" }}>
            The TradieCheck app gives Australian homeowners instant access to government licence databases right from their pocket.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
            {[
              { icon: "⚡", title: "Sub-second results", desc: "Parallel API calls across all state databases" },
              { icon: "📷", title: "Scan to verify", desc: "Point camera at any tradie licence card" },
              { icon: "🔔", title: "Expiry alerts", desc: "Get notified if a saved tradie's licence changes" },
            ].map(f => (
              <div key={f.title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{ fontSize: "22px", width: "36px", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1814", marginBottom: "2px" }}>{f.title}</div>
                  <div style={{ fontSize: "13px", color: "#aaa" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{
              background: "#1a1814", borderRadius: "12px", padding: "12px 20px",
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
            }}>
              <span style={{ fontSize: "20px" }}>🍎</span>
              <div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>DOWNLOAD ON THE</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>App Store</div>
              </div>
            </div>
            <div style={{
              background: "#1a1814", borderRadius: "12px", padding: "12px 20px",
              display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
            }}>
              <span style={{ fontSize: "20px" }}>▶</span>
              <div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>GET IT ON</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Google Play</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px", padding: "14px 18px", background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.2)", borderRadius: "12px" }}>
            <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Try it live ↓</div>
            <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.5 }}>
              Tap <strong>Active</strong>, <strong>Expiring</strong>, or <strong>Suspended</strong> on the phone to see real verification flows.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
