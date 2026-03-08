import { useState } from "react";

// ─────────────────────────────────────────────────────────────────
// NSW API CONFIGURATION — real endpoints from api.nsw.gov.au
// ─────────────────────────────────────────────────────────────────
const NSW_API_CONFIG = {
  baseUrl: "https://api.onegov.nsw.gov.au",

  auth: {
    tokenEndpoint: "/oauth/client_credential/accesstoken",
    method: "GET",
    grantType: "client_credentials",
    // Passed as query param: ?grant_type=client_credentials
    // Token lasts ~12 hours (expires_in ≈ 43200s). Cache and reuse.
  },

  apis: {
    trades: {
      name: "Trades Register API",
      productId: 25,
      swaggerUrl: "https://api.nsw.gov.au/Product/Index/25",
      description: "Building contractor and tradesperson licences — NSW Fair Trading",
      version: "v1",
      basePath: "/tradesregister/v1",
      endpoints: {
        browse: { method: "GET", path: "/browse", desc: "Search by partial name or licence number (searchText query param)" },
        verify: { method: "GET", path: "/verify", desc: "Quick licence verification by number" },
        details: { method: "GET", path: "/details", desc: "Full licence details for a selected result" },
        searchQuery: { method: "GET", path: "/licence/search/query", desc: "Structured search by name, licenceNumber or licenceType" },
        licenceDetails: { method: "GET", path: "/licence/search/details/{licenceType}/{licenceId}", desc: "Full details by licence type + ID" },
      },
    },
    highRiskWork: {
      name: "High Risk Work Register API",
      productId: 33,
      swaggerUrl: "https://api.nsw.gov.au/Product/Index/33",
      description: "Scaffold, rigging, crane, forklift, pressure equipment licences — SafeWork NSW",
      version: "v1",
      basePath: "/hrwregister/v1",
      endpoints: {
        browse: { method: "GET", path: "/browse", desc: "Search by partial name or licence number (searchText query param)" },
        verify: { method: "GET", path: "/verify", desc: "Quick licence verification by number" },
        details: { method: "GET", path: "/details", desc: "Full licence details for a selected result" },
        searchQuery: { method: "GET", path: "/licence/search/query", desc: "Structured search by name or licenceNumber" },
        licenceDetails: { method: "GET", path: "/licence/search/details/{licenceType}/{licenceId}", desc: "Full details by licence type + ID" },
      },
    },
    asbestos: {
      name: "Asbestos & Demolition Register API",
      productId: 34,
      swaggerUrl: "https://api.nsw.gov.au/Product/Index/34",
      description: "Asbestos removal and demolition licences — SafeWork NSW",
      version: "v1",
      basePath: "/asbestosregister/v1",
      endpoints: {
        browse: { method: "GET", path: "/browse", desc: "Search by partial name or licence number (searchText query param)" },
        verify: { method: "GET", path: "/verify", desc: "Quick licence verification by number" },
        details: { method: "GET", path: "/details", desc: "Full licence details for a selected result" },
        searchQuery: { method: "GET", path: "/licence/search/query", desc: "Structured search by name or licenceNumber" },
        licenceDetails: { method: "GET", path: "/licence/search/details/{licenceType}/{licenceId}", desc: "Full details by licence type + ID" },
      },
    },
    whiteCard: {
      name: "White Card & Traffic Control API",
      productId: 32,
      swaggerUrl: "https://api.nsw.gov.au/Product/Index/32",
      description: "General construction induction (White Card) and traffic control work training cards — SafeWork NSW",
      version: "v1",
      basePath: "/wcregister/v1",
      endpoints: {
        browse: { method: "GET", path: "/browse", desc: "Search card holders by partial name or card number" },
        verify: { method: "GET", path: "/verify", desc: "Quick card verification by number" },
        details: { method: "GET", path: "/details", desc: "Full card details for a selected result" },
        searchQuery: { method: "GET", path: "/licence/search/query", desc: "Structured search by name or cardNumber" },
        licenceDetails: { method: "GET", path: "/licence/search/details/{licenceType}/{licenceId}", desc: "Full details by card type + ID" },
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// API CLIENT — drop this in your backend/service layer
// ─────────────────────────────────────────────────────────────────
const API_CLIENT_CODE = `// tradiecheck-nsw-api.js
// NSW Government Licence API client
// Swagger docs: https://api.nsw.gov.au/Product/Index/{25|33|34|32}

const BASE_URL = "https://api.onegov.nsw.gov.au";

// ── Auth ────────────────────────────────────────────────────────
// NSW uses OAuth 2.0 client credentials via GET (not POST).
// Tokens last ~12 hours (expires_in ≈ 43200s). Cache and reuse.
const _tokenCaches = {};

async function getAccessToken(apiKey, apiSecret) {
  const cache = _tokenCaches[apiKey] || { token: null, expiresAt: 0 };
  if (cache.token && Date.now() < cache.expiresAt) return cache.token;

  const credentials = btoa(\`\${apiKey}:\${apiSecret}\`);
  const res = await fetch(
    \`\${BASE_URL}/oauth/client_credential/accesstoken?grant_type=client_credentials\`,
    {
      method: "GET",                          // NSW uses GET, not POST
      headers: {
        Authorization: \`Basic \${credentials}\`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) throw new Error(\`Auth failed: \${res.status}\`);

  // Response may be JSON or form-urlencoded depending on API configuration
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? JSON.parse(text)
    : Object.fromEntries(new URLSearchParams(text));

  if (!data.access_token) throw new Error(\`No access_token in response\`);

  _tokenCaches[apiKey] = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return _tokenCaches[apiKey].token;
}

// ── Generic request helper ───────────────────────────────────────
async function nswRequest(apiKey, apiSecret, path, params = {}) {
  const token = await getAccessToken(apiKey, apiSecret);
  const url = new URL(\`\${BASE_URL}\${path}\`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: \`Bearer \${token}\`,
      apikey: apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(\`NSW API \${res.status}: \${await res.text()}\`);
  return res.json();
}

// ── Trades Register API (/tradesregister/v1) ─────────────────────
// Swagger: https://api.nsw.gov.au/Product/Index/25
export async function browseTradesLicences(apiKey, apiSecret, searchText) {
  return nswRequest(apiKey, apiSecret, "/tradesregister/v1/browse", { searchText });
}

export async function searchTradesLicences(apiKey, apiSecret, { name, licenceNumber, licenceType }) {
  return nswRequest(apiKey, apiSecret, "/tradesregister/v1/licence/search/query", {
    ...(name && { name }),
    ...(licenceNumber && { licenceNumber }),
    ...(licenceType && { licenceType }),
  });
}

export async function getTradesLicenceDetails(apiKey, apiSecret, licenceType, licenceId) {
  return nswRequest(apiKey, apiSecret,
    \`/tradesregister/v1/licence/search/details/\${licenceType}/\${licenceId}\`);
}

// ── High Risk Work Register API (/hrwregister/v1) ────────────────
// Swagger: https://api.nsw.gov.au/Product/Index/33
export async function browseHRWLicences(apiKey, apiSecret, searchText) {
  return nswRequest(apiKey, apiSecret, "/hrwregister/v1/browse", { searchText });
}

export async function searchHRWLicences(apiKey, apiSecret, { name, licenceNumber }) {
  return nswRequest(apiKey, apiSecret, "/hrwregister/v1/licence/search/query", {
    ...(name && { name }),
    ...(licenceNumber && { licenceNumber }),
  });
}

export async function getHRWLicenceDetails(apiKey, apiSecret, licenceType, licenceId) {
  return nswRequest(apiKey, apiSecret,
    \`/hrwregister/v1/licence/search/details/\${licenceType}/\${licenceId}\`);
}

// ── Asbestos & Demolition Register API (/asbestosregister/v1) ────
// Swagger: https://api.nsw.gov.au/Product/Index/34
export async function browseAsbestosLicences(apiKey, apiSecret, searchText) {
  return nswRequest(apiKey, apiSecret, "/asbestosregister/v1/browse", { searchText });
}

export async function searchAsbestosLicences(apiKey, apiSecret, { name, licenceNumber }) {
  return nswRequest(apiKey, apiSecret, "/asbestosregister/v1/licence/search/query", {
    ...(name && { name }),
    ...(licenceNumber && { licenceNumber }),
  });
}

// ── White Card & Traffic Control Register API (/wcregister/v1) ───
// Swagger: https://api.nsw.gov.au/Product/Index/32
export async function browseWhiteCards(apiKey, apiSecret, searchText) {
  return nswRequest(apiKey, apiSecret, "/wcregister/v1/browse", { searchText });
}

export async function searchWhiteCards(apiKey, apiSecret, { name, cardNumber }) {
  return nswRequest(apiKey, apiSecret, "/wcregister/v1/licence/search/query", {
    ...(name && { name }),
    ...(cardNumber && { licenceNumber: cardNumber }),
  });
}

// ── TradieCheck master lookup ─────────────────────────────────────
// Parallel search across all three licence registers
export async function fullTradieCheck(credentials, query) {
  const { tradesKey, tradesSecret, hrwKey, hrwSecret, asbestosKey, asbestosSecret } = credentials;

  const [tradesResult, hrwResult, asbestosResult] = await Promise.allSettled([
    browseTradesLicences(tradesKey, tradesSecret, query),
    browseHRWLicences(hrwKey, hrwSecret, query),
    browseAsbestosLicences(asbestosKey, asbestosSecret, query),
  ]);

  return {
    trades:      tradesResult.status   === "fulfilled" ? tradesResult.value   : null,
    highRiskWork: hrwResult.status     === "fulfilled" ? hrwResult.value      : null,
    asbestos:    asbestosResult.status === "fulfilled" ? asbestosResult.value : null,
    errors: {
      trades:      tradesResult.status   === "rejected" ? tradesResult.reason?.message   : null,
      highRiskWork: hrwResult.status     === "rejected" ? hrwResult.reason?.message      : null,
      asbestos:    asbestosResult.status === "rejected" ? asbestosResult.reason?.message : null,
    },
  };
}
`;

// ─────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────

function Tag({ color, children }) {
  const colors = {
    green: { bg: "rgba(0,200,100,0.1)", border: "rgba(0,200,100,0.25)", text: "#00a855" },
    blue: { bg: "rgba(0,120,255,0.08)", border: "rgba(0,120,255,0.2)", text: "#0055cc" },
    amber: { bg: "rgba(255,180,0,0.1)", border: "rgba(255,180,0,0.25)", text: "#9a6800" },
    purple: { bg: "rgba(140,80,255,0.08)", border: "rgba(140,80,255,0.2)", text: "#7030c0" },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: "5px", padding: "2px 7px", fontSize: "10px", fontWeight: 700,
      letterSpacing: "0.08em", fontFamily: "monospace",
    }}>{children}</span>
  );
}

function EndpointRow({ method, path, desc, baseUrl }) {
  const [copied, setCopied] = useState(false);
  const full = `${baseUrl}${path}`;
  const copy = () => { navigator.clipboard.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid #f0ede8", display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <Tag color={method === "GET" ? "green" : method === "POST" ? "blue" : "amber"}>{method}</Tag>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#1a1814", wordBreak: "break-all", marginBottom: "3px" }}>
          {path}
        </div>
        <div style={{ fontSize: "12px", color: "#888" }}>{desc}</div>
      </div>
      <button onClick={copy} style={{
        background: "none", border: "1px solid #e0ddd7", borderRadius: "6px",
        padding: "4px 10px", fontSize: "10px", color: copied ? "#00a855" : "#888",
        cursor: "pointer", flexShrink: 0, fontFamily: "inherit",
      }}>{copied ? "✓ Copied" : "Copy URL"}</button>
    </div>
  );
}

function APICard({ api, config, saved, onSave }) {
  const [open, setOpen] = useState(false);
  const isConfigured = saved[api] && saved[api].apiKey && saved[api].apiSecret;

  return (
    <div style={{
      background: "#fff", border: `1.5px solid ${isConfigured ? "rgba(0,200,100,0.3)" : "#e8e5e0"}`,
      borderRadius: "14px", overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: "20px 24px", cursor: "pointer", display: "flex", gap: "14px", alignItems: "center" }}
      >
        <div style={{
          width: "44px", height: "44px", borderRadius: "11px", flexShrink: 0,
          background: isConfigured ? "rgba(0,200,100,0.1)" : "#f5f2ec",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
        }}>
          {api === "trades" ? "🔧" : api === "highRiskWork" ? "⚠️" : api === "asbestos" ? "🧪" : "🃏"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a1814" }}>{config.name}</span>
            {isConfigured
              ? <Tag color="green">CONNECTED</Tag>
              : <Tag color="amber">NOT CONFIGURED</Tag>}
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>{config.description}</div>
        </div>
        <div style={{ fontSize: "18px", color: "#ccc", transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}>⌄</div>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #f0ede8", padding: "20px 24px", background: "#faf9f7" }}>
          {/* Credentials */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#aaa", marginBottom: "12px" }}>
              CREDENTIALS — from api.nsw.gov.au
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              {[
                { key: "apiKey", label: "API Key (Consumer Key)", ph: "e.g. a1b2c3d4e5f6..." },
                { key: "apiSecret", label: "API Secret (Consumer Secret)", ph: "e.g. A1B2C3D4..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "#888", display: "block", marginBottom: "5px" }}>{f.label}</label>
                  <input
                    type="password"
                    placeholder={f.ph}
                    defaultValue={saved[api]?.[f.key] || ""}
                    id={`${api}-${f.key}`}
                    style={{
                      width: "100%", border: "1.5px solid #e0ddd7", borderRadius: "8px",
                      padding: "9px 12px", fontSize: "13px", fontFamily: "monospace",
                      background: "#fff", color: "#1a1814", outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const k = document.getElementById(`${api}-apiKey`).value;
                const s = document.getElementById(`${api}-apiSecret`).value;
                onSave(api, { apiKey: k, apiSecret: s });
              }}
              style={{
                background: "#1a1814", border: "none", borderRadius: "8px",
                padding: "10px 20px", fontSize: "13px", fontWeight: 700, color: "#fff",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >Save Credentials</button>
          </div>

          {/* Endpoints */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#aaa", marginBottom: "8px" }}>
              ENDPOINTS — api.onegov.nsw.gov.au
            </div>
            <div style={{ background: "#fff", borderRadius: "10px", padding: "0 16px", border: "1px solid #e8e5e0" }}>
              {/* Auth endpoint */}
              <EndpointRow
                method="GET"
                path="/oauth/client_credential/accesstoken?grant_type=client_credentials"
                desc="Get OAuth token — Authorization: Basic Base64(key:secret) — lasts ~12h"
                baseUrl="https://api.onegov.nsw.gov.au"
              />
              {Object.entries(config.endpoints).map(([, ep]) => (
                <EndpointRow
                  key={ep.path}
                  method={ep.method}
                  path={`${config.basePath}${ep.path}`}
                  desc={ep.desc}
                  baseUrl="https://api.onegov.nsw.gov.au"
                />
              ))}
            </div>
          </div>

          {/* Links */}
          <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a
              href={`https://api.nsw.gov.au/Product/Index/${config.productId}`}
              target="_blank" rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(0,100,255,0.06)", border: "1px solid rgba(0,100,255,0.2)",
                borderRadius: "8px", padding: "8px 14px", fontSize: "12px",
                fontWeight: 600, color: "#0055cc", textDecoration: "none",
              }}
            >
              📋 API Portal (Product #{config.productId})
            </a>
            <a
              href={`https://api.nsw.gov.au/Product/Index/${config.productId}#v-pills-doc`}
              target="_blank" rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(0,160,80,0.06)", border: "1px solid rgba(0,160,80,0.2)",
                borderRadius: "8px", padding: "8px 14px", fontSize: "12px",
                fontWeight: 600, color: "#00804a", textDecoration: "none",
              }}
            >
              🔍 Swagger / Sandbox Docs
            </a>
          </div>
          <div style={{
            marginTop: "10px", padding: "10px 14px",
            background: "rgba(0,0,0,0.02)", border: "1px solid #e8e5e0",
            borderRadius: "8px", fontSize: "12px", color: "#888",
          }}>
            Free sandbox access available. Production use requires an agreement with API NSW. Register at{" "}
            <a href="https://api.nsw.gov.au/Account/Register" target="_blank" rel="noreferrer"
              style={{ color: "#0055cc" }}>api.nsw.gov.au/Account/Register</a>.
          </div>
        </div>
      )}
    </div>
  );
}

function CodePanel({ code, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ background: "#0f0e0c", borderRadius: "12px", overflow: "hidden", border: "1px solid #2a2825" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #1e1d1b" }}>
        <span style={{ fontSize: "11px", color: "#555", fontFamily: "monospace" }}>{label}</span>
        <button onClick={copy} style={{
          background: "none", border: "1px solid #333", borderRadius: "5px",
          padding: "4px 10px", fontSize: "10px", color: copied ? "#00e87a" : "#555",
          cursor: "pointer", fontFamily: "inherit",
        }}>{copied ? "✓ Copied" : "Copy"}</button>
      </div>
      <pre style={{
        margin: 0, padding: "20px", fontSize: "11px", lineHeight: 1.7,
        color: "#a0a0a0", overflowX: "auto", maxHeight: "420px", overflowY: "auto",
        fontFamily: "'Courier New', monospace",
      }}>
        {code.split("\n").map((line, i) => {
          const c = line.match(/^(\/\/ .+)$/) ? "#6a9955"
            : line.match(/\b(export|const|async|await|function|return|if|let|new|throw)\b/) ? "#c792ea"
            : line.match(/["'`][^"'`]*["'`]/) ? "#f78c6c"
            : line.match(/\b(true|false|null|undefined|\d+)\b/) ? "#f78c6c"
            : "#a0a0a0";
          return <span key={i} style={{ color: c, display: "block" }}>{line}</span>;
        })}
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────
export default function NSWAPIConfig() {
  const [saved, setSaved] = useState({});
  const [tab, setTab] = useState("config");
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const handleSave = (api, creds) => {
    setSaved(s => ({ ...s, [api]: creds }));
  };

  const configuredCount = Object.keys(saved).filter(k => saved[k]?.apiKey).length;

  const simulateTest = () => {
    if (!testQuery.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult({
        query: testQuery,
        apis: {
          trades: { status: 200, licences: [{ name: "Jake Morrison", licenceNumber: "EC12345", licenceType: "Electrical Contractor", status: "Active", expiryDate: "2026-11-30" }] },
          highRiskWork: { status: 200, licences: [{ name: "Jake Morrison", licenceNumber: "HRW29834", licenceType: "Electrical - Low Voltage", status: "Active", expiryDate: "2026-11-30" }] },
          asbestos: { status: 200, licences: [] },
        },
        duration: "412ms",
      });
      setTestLoading(false);
    }, 1400);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#f0ede8",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: #1a1814 !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d0cdc8; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#1a1814", padding: "0 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "rgba(0,232,122,0.15)", border: "1px solid rgba(0,232,122,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e87a" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <a href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontWeight: 800, fontSize: "14px", color: "#fff" }}>
                VerifyMyTradie
              </span>
            </a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, fontSize: "14px" }}>/</span>
            <span style={{ fontWeight: 400, fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>NSW API Configuration</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: configuredCount > 0 ? "#00e87a" : "#ff3b3b" }} />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
              {configuredCount}/4 APIs configured
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e5e0", padding: "0 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", gap: "0" }}>
          {[
            { id: "config", label: "API Configuration" },
            { id: "endpoints", label: "Endpoint Reference" },
            { id: "code", label: "Integration Code" },
            { id: "test", label: "Test Console" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", padding: "16px 20px",
              fontSize: "13px", fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "#1a1814" : "#aaa",
              borderBottom: tab === t.id ? "2px solid #1a1814" : "2px solid transparent",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 40px" }}>

        {/* CONFIG TAB */}
        {tab === "config" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1814", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                NSW Government API Credentials
              </h2>
              <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.6 }}>
                Configure your API keys from <a href="https://api.nsw.gov.au" target="_blank" rel="noreferrer" style={{ color: "#0055cc" }}>api.nsw.gov.au</a>.
                Each API requires a separate Consumer Key + Secret pair from your registered app. All APIs use OAuth 2.0 client credentials flow.
              </p>
            </div>

            {/* Sign-up banner */}
            <div style={{
              background: "linear-gradient(135deg, #1a1814, #2a2520)",
              borderRadius: "14px", padding: "20px 24px", marginBottom: "24px",
              display: "flex", gap: "16px", alignItems: "center",
            }}>
              <div style={{ fontSize: "32px" }}>🔑</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                  First time? Register at api.nsw.gov.au
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                  Sign up for free → create an app → subscribe to each API → copy your Consumer Key & Secret for each one.
                </div>
              </div>
              <a href="https://api.nsw.gov.au/Account/Register" target="_blank" rel="noreferrer"
                style={{
                  background: "#00e87a", borderRadius: "9px", padding: "10px 18px",
                  fontSize: "13px", fontWeight: 700, color: "#000", textDecoration: "none",
                  flexShrink: 0,
                }}>Register →</a>
            </div>

            {/* Auth flow */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", border: "1px solid #e8e5e0" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1814", marginBottom: "12px" }}>Auth Flow (OAuth 2.0 Client Credentials)</div>
              <div style={{ display: "flex", gap: "0", alignItems: "center", overflowX: "auto", paddingBottom: "4px" }}>
                {[
                  { n: "1", t: "GET token endpoint", s: "Send Base64(key:secret) via Basic auth → get access_token (lasts ~12h)" },
                  { n: "→", t: null },
                  { n: "2", t: "Call any API endpoint", s: "Header: Authorization: Bearer {token} + apikey: {key}" },
                  { n: "→", t: null },
                  { n: "3", t: "Get licence data", s: "JSON response with licensee, licenceNumber, status, expiryDate, suburb" },
                ].map((step, i) => step.n === "→"
                  ? <div key={i} style={{ color: "#ccc", padding: "0 12px", flexShrink: 0 }}>→</div>
                  : (
                    <div key={i} style={{
                      background: "#f5f2ec", borderRadius: "10px", padding: "12px 16px",
                      minWidth: "180px", flexShrink: 0,
                    }}>
                      <div style={{ fontSize: "10px", color: "#aaa", marginBottom: "4px", fontFamily: "monospace" }}>STEP {step.n}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1a1814", marginBottom: "3px" }}>{step.t}</div>
                      <div style={{ fontSize: "11px", color: "#888", lineHeight: 1.4 }}>{step.s}</div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* API Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(NSW_API_CONFIG.apis).map(([key, config]) => (
                <APICard key={key} api={key} config={config} saved={saved} onSave={handleSave} />
              ))}
            </div>
          </div>
        )}

        {/* ENDPOINTS TAB */}
        {tab === "endpoints" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1814", letterSpacing: "-0.02em", marginBottom: "6px" }}>Endpoint Reference</h2>
              <p style={{ fontSize: "14px", color: "#888" }}>All endpoints use base URL: <code style={{ background: "#f0ede8", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>https://api.onegov.nsw.gov.au</code></p>
            </div>

            {/* Auth */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", marginBottom: "16px", border: "1px solid #e8e5e0" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1814", marginBottom: "4px" }}>🔐 Authentication (required for all APIs)</div>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "12px" }}>Obtain a token first. Tokens last approximately 12 hours — cache and reuse them.</div>
              <div style={{ background: "#f5f2ec", borderRadius: "8px", padding: "12px 16px", fontFamily: "monospace", fontSize: "12px", color: "#333" }}>
                <div style={{ color: "#888", marginBottom: "4px" }}>GET /oauth/client_credential/accesstoken?grant_type=client_credentials</div>
                <div style={{ color: "#555" }}>Header: Authorization: Basic {"{"}Base64(apiKey:apiSecret){"}"}</div>
                <div style={{ color: "#00a855", marginTop: "8px" }}>→ {"{"} "access_token": "...", "expires_in": 43200 {"}"}</div>
              </div>
            </div>

            {Object.entries(NSW_API_CONFIG.apis).map(([key, config]) => (
              <div key={key} style={{ background: "#fff", borderRadius: "14px", padding: "20px 24px", marginBottom: "12px", border: "1px solid #e8e5e0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "18px" }}>{key === "trades" ? "🔧" : key === "highRiskWork" ? "⚠️" : key === "asbestos" ? "🧪" : "🃏"}</span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#1a1814" }}>{config.name}</span>
                  <Tag color="blue">Base: {config.basePath}</Tag>
                  <a
                    href={`https://api.nsw.gov.au/Product/Index/${config.productId}#v-pills-doc`}
                    target="_blank" rel="noreferrer"
                    style={{
                      marginLeft: "auto", fontSize: "11px", fontWeight: 600, color: "#0055cc",
                      textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
                    }}
                  >
                    Swagger docs ↗
                  </a>
                </div>
                {Object.entries(config.endpoints).map(([, ep]) => (
                  <EndpointRow
                    key={ep.path}
                    method={ep.method}
                    path={`${config.basePath}${ep.path}`}
                    desc={ep.desc}
                    baseUrl="https://api.onegov.nsw.gov.au"
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* CODE TAB */}
        {tab === "code" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1814", letterSpacing: "-0.02em", marginBottom: "6px" }}>Integration Code</h2>
              <p style={{ fontSize: "14px", color: "#888" }}>Drop this into your backend service. Handles OAuth, token caching, and parallel lookups across all three APIs.</p>
            </div>
            <CodePanel code={API_CLIENT_CODE} label="tradiecheck-nsw-api.js — Node.js / browser fetch" />

            <div style={{ marginTop: "16px", background: "#fff", borderRadius: "12px", padding: "20px 24px", border: "1px solid #e8e5e0" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1814", marginBottom: "10px" }}>Usage example</div>
              <CodePanel code={`import { fullTradieCheck } from "./tradiecheck-nsw-api.js";

// Single call — checks Trades + High Risk Work + Asbestos in parallel
const result = await fullTradieCheck(
  process.env.NSW_API_KEY,
  process.env.NSW_API_SECRET,
  "Jake Morrison"   // or a licence number like "EC12345"
);

console.log(result.trades);      // licence data from Trades API
console.log(result.highRiskWork); // from High Risk Work API
console.log(result.asbestos);    // from Asbestos & Demolition API`} label="example-usage.js" />
            </div>
          </div>
        )}

        {/* TEST TAB */}
        {tab === "test" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1814", letterSpacing: "-0.02em", marginBottom: "6px" }}>Test Console</h2>
              <p style={{ fontSize: "14px", color: "#888" }}>Simulate a TradieCheck API call. In production this would use your saved API credentials.</p>
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", border: "1px solid #e8e5e0", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#888", marginBottom: "8px" }}>SEARCH QUERY (name or licence number)</div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  value={testQuery}
                  onChange={e => setTestQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && simulateTest()}
                  placeholder="e.g. Jake Morrison or EC12345"
                  style={{
                    flex: 1, border: "1.5px solid #e0ddd7", borderRadius: "9px",
                    padding: "11px 14px", fontSize: "14px", fontFamily: "inherit", color: "#1a1814",
                  }}
                />
                <button onClick={simulateTest} disabled={testLoading} style={{
                  background: "#1a1814", border: "none", borderRadius: "9px",
                  padding: "11px 22px", fontSize: "13px", fontWeight: 700, color: "#fff",
                  cursor: testLoading ? "not-allowed" : "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  {testLoading
                    ? <div style={{ width: "14px", height: "14px", border: "2px solid #555", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    : null}
                  {testLoading ? "Calling APIs…" : "Run Test"}
                </button>
              </div>

              <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["Jake Morrison", "EC12345", "Tony Ferraro"].map(q => (
                  <button key={q} onClick={() => { setTestQuery(q); }} style={{
                    background: "#f5f2ec", border: "1px solid #e0ddd7", borderRadius: "20px",
                    padding: "5px 12px", fontSize: "11px", color: "#888", cursor: "pointer", fontFamily: "inherit",
                  }}>{q}</button>
                ))}
              </div>
            </div>

            {testResult && (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1814" }}>Results for "{testResult.query}"</div>
                  <Tag color="green">{testResult.duration}</Tag>
                  <Tag color="blue">3 APIs called in parallel</Tag>
                </div>

                {Object.entries(testResult.apis).map(([apiKey, data]) => (
                  <div key={apiKey} style={{
                    background: "#fff", borderRadius: "12px", overflow: "hidden",
                    border: "1px solid #e8e5e0", marginBottom: "10px",
                  }}>
                    <div style={{ padding: "12px 16px", background: "#f5f2ec", display: "flex", gap: "10px", alignItems: "center", borderBottom: "1px solid #e8e5e0" }}>
                      <span style={{ fontSize: "14px" }}>{apiKey === "trades" ? "🔧" : apiKey === "highRiskWork" ? "⚠️" : "🧪"}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1814" }}>
                        {NSW_API_CONFIG.apis[apiKey]?.name}
                      </span>
                      <Tag color={data.status === 200 ? "green" : "amber"}>HTTP {data.status}</Tag>
                      <Tag color={data.licences.length > 0 ? "green" : "amber"}>{data.licences.length} result{data.licences.length !== 1 ? "s" : ""}</Tag>
                    </div>
                    <div style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px", color: "#555", whiteSpace: "pre" }}>
                      {JSON.stringify(data, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
