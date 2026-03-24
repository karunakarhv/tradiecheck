import LogoutButton from "./LogoutButton";
import { FLAGS } from "../lib/flags";

const DEMOS = [
  { label: "Active Electrician", code: "LIC-48291" },
  { label: "Expiring Plumber",   code: "PLB-77432" },
  { label: "Suspended Builder",  code: "BLD-10293" },
];

const HOW_IT_WORKS = [
  { n: "01", t: "Enter name or licence",   d: "Type a tradie's name or licence number" },
  { n: "02", t: "We check live databases", d: "Fair Trading, WorkSafe & DMIRS APIs" },
  { n: "03", t: "Instant verdict",         d: "Verified status, expiry & risk flags" },
];

const NAV_LINKS = [
  { label: "Home",      href: "/welcome" },
  { label: "Mobile",    href: "/mobile" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Help",      href: "/help" },
];

export default function LeftPanel({ query, setQuery, loading, onSearch, onBulkUpload, isBulkLoading, selectedState, setSelectedState }) {
  const navLinks = FLAGS.API_CONFIG
    ? [...NAV_LINKS.slice(0, 3), { label: "API", href: "/api-config" }, NAV_LINKS[3]]
    : NAV_LINKS;

  return (
    <div className="tc-left">

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "52px" }}>
        {/* Logo */}
        <a href="/welcome" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", color: "inherit" }}>
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
            Tradie<span style={{ color: "#00e87a" }}>Check</span>
          </span>
        </a>

        {/* Nav right */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00e87a", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: "10px", color: "#444", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace" }}>LIVE</span>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {navLinks.map(({ label, href }) => (
              <a key={href} href={href} style={{
                fontSize: "10px", color: "#333", padding: "4px 8px",
                borderRadius: "5px", border: "1px solid #1a1a1a",
                textDecoration: "none", fontFamily: "'DM Mono', monospace",
                letterSpacing: "0.06em", transition: "all 0.15s",
              }}
                onMouseEnter={(e) => { e.target.style.color = "#00e87a"; e.target.style.borderColor = "#00e87a44"; }}
                onMouseLeave={(e) => { e.target.style.color = "#333";    e.target.style.borderColor = "#1a1a1a"; }}
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

        <h1 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "14px" }}>
          Know who's<br />
          <span style={{ background: "linear-gradient(90deg, #00e87a, #00c4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            at your door.
          </span>
        </h1>

        <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
          Instantly verify your tradie's licence, insurance & certifications before they step inside.
        </p>
      </div>

      {/* Search box */}
      <div style={{
        background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "14px",
        padding: "6px 6px 6px 18px", display: "flex", alignItems: "center", gap: "10px",
        transition: "border-color 0.2s", marginBottom: "12px",
      }}
        onFocus={(e) => e.currentTarget.style.borderColor = "#00e87a44"}
        onBlur={(e)  => e.currentTarget.style.borderColor = "#1e1e1e"}
      >
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{
            background: "none", border: "none", color: "#00e87a",
            fontSize: "13px", fontWeight: 800, fontFamily: "'DM Mono', monospace",
            cursor: "pointer", outline: "none", paddingRight: "4px",
            borderRight: "1px solid #1e1e1e", marginRight: "4px"
          }}
        >
          {["NSW", "VIC", "QLD", "WA", "SA", "ACT", "TAS"].map(s => (
            <option key={s} value={s} style={{ background: "#0d0d0d", color: "#fff" }}>{s}</option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="Name or licence number..."
          style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: "15px", fontFamily: "'DM Sans', sans-serif" }}
        />
        <button
          onClick={() => onSearch()}
          disabled={loading || !query.trim()}
          style={{
            background: loading ? "#0d0d0d" : "linear-gradient(135deg, #00e87a, #00c065)",
            border: "none", borderRadius: "10px", padding: "12px 20px",
            color: loading ? "#333" : "#000", fontSize: "13px", fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.06em",
            minWidth: "80px", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          {loading
            ? <div style={{ width: "14px", height: "14px", border: "2px solid #333", borderTopColor: "#00e87a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            : "CHECK"}
        </button>
      </div>

      {/* Bulk Upload */}
      <div style={{ marginBottom: "32px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="file"
          accept=".csv"
          id="bulk-csv"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) onBulkUpload(file);
            e.target.value = null; // Reset for same file re-upload
          }}
        />
        <button
          onClick={() => document.getElementById("bulk-csv").click()}
          disabled={loading || isBulkLoading}
          style={{
            background: "none", border: "1px dashed #333", borderRadius: "10px",
            padding: "10px 16px", color: (loading || isBulkLoading) ? "#222" : "#888",
            fontSize: "11px", fontWeight: 700, cursor: (loading || isBulkLoading) ? "not-allowed" : "pointer",
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
            transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px",
          }}
          onMouseEnter={(e) => { if(!loading && !isBulkLoading) { e.target.style.borderColor = "#00e87a"; e.target.style.color = "#00e87a"; } }}
          onMouseLeave={(e) => { if(!loading && !isBulkLoading) { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; } }}
        >
          {isBulkLoading ? (
            <div style={{ width: "12px", height: "12px", border: "2px solid #222", borderTopColor: "#00e87a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          )}
          {isBulkLoading ? "PROCESSING BATCH..." : "BULK CSV UPLOAD"}
        </button>
        {isBulkLoading && (
          <span style={{ fontSize: "9px", color: "#00e87a", fontFamily: "'DM Mono', monospace", animation: "pulse 2s infinite" }}>
            SEQUENTIAL CHECK ACTIVE
          </span>
        )}
      </div>

      {/* Demo chips */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "32px" }}>
        <span style={{ fontSize: "11px", color: "#333", alignSelf: "center", letterSpacing: "0.06em" }}>TRY:</span>
        {DEMOS.map(d => (
          <button key={d.code} onClick={() => { setQuery(d.code); onSearch(d.code); }}
            style={{
              background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "20px",
              padding: "5px 12px", color: "#555", fontSize: "11px", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#00e87a44"; e.target.style.color = "#00e87a"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#1e1e1e";   e.target.style.color = "#555"; }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* How it works */}
      <div style={{ background: "#080808", border: "1px solid #111", borderRadius: "12px", padding: "20px" }}>
        <div style={{ fontSize: "10px", color: "#333", letterSpacing: "0.12em", marginBottom: "16px", fontFamily: "'DM Mono', monospace" }}>
          HOW IT WORKS
        </div>
        {HOW_IT_WORKS.map(s => (
          <div key={s.n} style={{ display: "flex", gap: "14px", marginBottom: "14px", alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#00e87a", minWidth: "24px", fontWeight: 700, paddingTop: "2px" }}>
              {s.n}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#aaa", marginBottom: "2px" }}>{s.t}</div>
              <div style={{ fontSize: "12px", color: "#3a3a3a" }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", paddingTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "10px", color: "#444", letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>
          NATIONAL COVERAGE: {selectedState} REGISTER ACTIVE
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {["Privacy", "API", "About"].map(l => (
            <span key={l} style={{ fontSize: "11px", color: "#2a2a2a", cursor: "pointer", letterSpacing: "0.04em" }}>{l}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
