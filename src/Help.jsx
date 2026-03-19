import { useState } from "react";
import { FLAGS } from "./lib/flags";
import LogoutButton from './components/LogoutButton'

const NAV_LINKS = [
  { label: "Mobile", href: "/mobile" },
  { label: "Dashboard", href: "/dashboard" },
  ...(FLAGS.API_CONFIG ? [{ label: "API", href: "/api-config" }] : []),
];

const TOC = [
  { id: "getting-started", label: "Getting Started" },
  { id: "understanding-results", label: "Understanding Results" },
  { id: "verification-checks", label: "Verification Checks" },
  { id: "coverage", label: "Coverage" },
  { id: "faq", label: "FAQ" },
  { id: "data-sources", label: "Data Sources" },
];

const STATUSES = [
  {
    icon: "✓",
    label: "VERIFIED & ACTIVE",
    color: "#00e87a",
    bg: "rgba(0,232,122,0.08)",
    border: "rgba(0,232,122,0.2)",
    desc: "The licence is current, valid, and in good standing with the relevant NSW authority. Safe to proceed.",
  },
  {
    icon: "!",
    label: "EXPIRED",
    color: "#ff9500",
    bg: "rgba(255,149,0,0.08)",
    border: "rgba(255,149,0,0.2)",
    desc: "The licence has passed its expiry date. The tradie may not be legally permitted to work under this licence.",
  },
  {
    icon: "✕",
    label: "SUSPENDED",
    color: "#ff3b3b",
    bg: "rgba(255,59,59,0.08)",
    border: "rgba(255,59,59,0.2)",
    desc: "The licence has been suspended or cancelled by the authority. Work under this licence is not permitted.",
  },
];

const CHECKS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    label: "Licence Status",
    desc: "Confirms whether the tradie holds a valid, active licence registered with NSW Fair Trading. This is the primary check and covers trade types such as electricians, plumbers, builders, and more.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: "High-Risk Work Licence",
    desc: "Checks the SafeWork NSW High Risk Work register. High-risk work includes scaffolding, rigging, cranes, pressure equipment, and forklift operation. Required by law for these specialised tasks.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    label: "Asbestos Certification",
    desc: "Queries the NSW Asbestos & Demolition Register to confirm the tradie is certified to handle asbestos-containing materials. Critical for renovation or demolition work in older properties.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    label: "Public Liability Insurance",
    desc: "Indicates whether the tradie has declared active public liability insurance. This protects you from costs arising from property damage or personal injury caused during the work. Note: insurance data is self-declared and not government-verified.",
  },
];

const FAQS = [
  {
    q: "What data sources does TradieCheck use?",
    a: "TradieCheck queries three live NSW Government registers via the OneGov NSW API platform: the NSW Fair Trading Trades Register, the SafeWork NSW High Risk Work Register, and the NSW Asbestos & Demolition Register. All data is sourced directly from official government databases.",
  },
  {
    q: "How often is the data updated?",
    a: "Results are pulled in real-time directly from the NSW Government API at the moment you search. There is no local caching of licence data — every search reflects the current state of the register. Licence status changes made by the relevant authority are reflected immediately.",
  },
  {
    q: "What if a tradie isn't found in the results?",
    a: "If no results are returned, the tradie may not hold a licence registered in NSW, or the search term may not match the registered name or licence number exactly. Try searching by licence number if you have it, as it is more precise than a name search. If you believe a tradie should be registered, contact NSW Fair Trading directly.",
  },
  {
    q: "Is TradieCheck available outside NSW?",
    a: "Currently, TradieCheck only queries NSW Government registers. Tradies licensed in other states (VIC, QLD, WA, SA, TAS, NT, ACT) will not appear in results. Support for additional states and territories is on the roadmap.",
  },
  {
    q: "What does an expiring licence mean?",
    a: "A licence showing as expiring soon (typically within 90 days of the expiry date) is still valid today, but the tradie should be renewing it. You may choose to verify with the tradie that renewal is in progress. Once the expiry date passes, the status changes to EXPIRED and the tradie is no longer authorised to work under that licence.",
  },
  {
    q: "Can a tradie dispute incorrect information shown?",
    a: "TradieCheck displays data exactly as it appears in government registers. If a tradie believes their licence status is incorrect, they should contact the relevant authority directly — NSW Fair Trading for trade licences, SafeWork NSW for high-risk work licences, or the NSW EPA for asbestos certifications. TradieCheck has no ability to modify or override register data.",
  },
  {
    q: "Is my search history stored?",
    a: "No. TradieCheck does not store, log, or retain any search queries or results. Each search is a fresh API call made directly to NSW Government registers. No personal data is collected about the homeowners or tradies who are searched.",
  },
];

const SOURCES = [
  {
    abbr: "FT",
    name: "NSW Fair Trading",
    register: "Trades Register",
    color: "#00e87a",
    desc: "The authoritative register of licensed tradies in NSW, maintained by NSW Fair Trading. Covers over 30 trade categories including electricians, plumbers, builders, gasfitters, and air conditioning technicians.",
    url: "https://www.fairtrading.nsw.gov.au",
    api: "Trades Register API (OneGov NSW)",
  },
  {
    abbr: "SW",
    name: "SafeWork NSW",
    register: "High Risk Work Register",
    color: "#00c4ff",
    desc: "Maintained by SafeWork NSW, this register lists individuals licensed to perform high-risk work including scaffolding, rigging, crane operation, forklift driving, and pressure equipment.",
    url: "https://www.safework.nsw.gov.au",
    api: "High Risk Work Register API (OneGov NSW)",
  },
  {
    abbr: "EP",
    name: "NSW EPA",
    register: "Asbestos & Demolition Register",
    color: "#ff9500",
    desc: "Operated by the NSW Environment Protection Authority, this register certifies contractors approved to remove or handle asbestos-containing materials safely and legally in NSW.",
    url: "https://www.epa.nsw.gov.au",
    api: "Asbestos Register API (OneGov NSW)",
  },
];

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: "64px", scrollMarginTop: "32px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px",
        paddingBottom: "16px", borderBottom: "1px solid #111",
      }}>
        <h2 style={{
          fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: 0,
        }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "#0d0d0d", border: "1px solid #1a1a1a",
      borderRadius: "10px", marginBottom: "8px", overflow: "hidden",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#2a2a2a"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1a1a1a"}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none", padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", gap: "16px", textAlign: "left",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#ccc", lineHeight: 1.4 }}>{q}</span>
        <span style={{
          fontSize: "18px", color: open ? "#00e87a" : "#333",
          transition: "transform 0.2s, color 0.2s",
          transform: open ? "rotate(45deg)" : "none",
          flexShrink: 0, lineHeight: 1,
        }}>+</span>
      </button>
      {open && (
        <div style={{
          padding: "0 20px 16px",
          fontSize: "13px", color: "#666", lineHeight: 1.7,
          borderTop: "1px solid #111",
          paddingTop: "14px",
        }}>{a}</div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      color: "#fff",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0a; } ::-webkit-scrollbar-thumb { background: #222; }
        .help-layout { display: grid; grid-template-columns: 1fr; gap: 0; }
        .help-sidebar { display: none; }
        @media (min-width: 900px) {
          .help-layout { grid-template-columns: 240px 1fr; align-items: start; }
          .help-sidebar { display: block; position: sticky; top: 32px; }
        }
        .toc-link { display: block; padding: 7px 12px; font-size: 12px; color: #444; text-decoration: none; border-left: 2px solid #1a1a1a; font-family: 'DM Mono', monospace; letter-spacing: 0.04em; transition: color 0.15s, border-color 0.15s; }
        .toc-link:hover { color: #00e87a; border-color: #00e87a44; }
        .nav-link { font-size: 10px; color: #333; padding: 4px 8px; border-radius: 5px; border: 1px solid #1a1a1a; text-decoration: none; font-family: 'DM Mono', monospace; letter-spacing: 0.06em; transition: all 0.15s; }
        .nav-link:hover { color: #00e87a; border-color: #00e87a44; }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(0,232,122,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,122,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none",
      }} />

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(5,5,5,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #111",
        padding: "0 28px", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px",
            background: "linear-gradient(135deg, #00e87a22, #00e87a44)",
            border: "1px solid #00e87a44",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e87a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="6" />
              <path d="m21 21-4.5-4.5" />
              <path d="M7.5 10l2 2 3-3" />
            </svg>
          </div>
          <span style={{ fontWeight: 900, fontSize: "15px", letterSpacing: "-0.03em", color: "#fff" }}>
            Tradie<span style={{ color: "#00e87a" }}>Check</span>
          </span>
        </a>
        <div style={{ display: "flex", gap: "4px" }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className="nav-link">{label}</a>
          ))}
        </div>
        {/* Fixed logout button — always visible, top-right */}
          <LogoutButton variant="dark" />
      </nav>

      {/* Hero */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: "64px 28px 48px",
        maxWidth: "960px", margin: "0 auto",
      }}>
        <div style={{
          display: "inline-block", background: "rgba(0,232,122,0.08)",
          border: "1px solid rgba(0,232,122,0.2)", borderRadius: "20px",
          padding: "5px 14px", fontSize: "10px", letterSpacing: "0.15em",
          color: "#00e87a", fontWeight: 700, marginBottom: "20px",
          fontFamily: "'DM Mono', monospace",
        }}>HELP CENTRE</div>

        <h1 style={{
          fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900,
          letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "16px",
        }}>
          How TradieCheck<br />
          <span style={{
            background: "linear-gradient(90deg, #00e87a, #00c4ff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>works.</span>
        </h1>
        <p style={{ fontSize: "15px", color: "#555", lineHeight: 1.7, maxWidth: "540px" }}>
          Everything you need to know about verifying your tradie's credentials using live NSW Government registers.
        </p>
      </div>

      {/* Main content */}
      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: "960px", margin: "0 auto",
        padding: "0 28px 80px",
      }}>
        <div className="help-layout">

          {/* Sidebar TOC */}
          <aside className="help-sidebar" style={{ paddingRight: "40px" }}>
            <div style={{
              fontSize: "9px", color: "#2a2a2a", letterSpacing: "0.14em",
              fontFamily: "'DM Mono', monospace", marginBottom: "12px", paddingLeft: "12px",
            }}>ON THIS PAGE</div>
            {TOC.map(({ id, label }) => (
              <a key={id} href={`#${id}`} className="toc-link">{label}</a>
            ))}
          </aside>

          {/* Article */}
          <article>

            {/* Getting Started */}
            <Section id="getting-started" title="Getting Started">
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.8, marginBottom: "24px" }}>
                TradieCheck lets you instantly verify a tradie's licence and certifications before they begin work.
                All you need is their name or licence number.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                {[
                  { n: "01", t: "Enter a name or licence number", d: "Type the tradie's full name or their licence number (e.g. EC12345) into the search field on the home page." },
                  { n: "02", t: "Press CHECK or hit Enter", d: "TradieCheck queries three NSW Government registers simultaneously and returns results in seconds." },
                  { n: "03", t: "Review the verification card", d: "A result card shows the tradie's licence status, expiry date, high-risk work certification, asbestos clearance, and any active alerts." },
                ].map(s => (
                  <div key={s.n} style={{
                    background: "#0d0d0d", border: "1px solid #1a1a1a",
                    borderRadius: "12px", padding: "16px 20px",
                    display: "flex", gap: "16px", alignItems: "flex-start",
                  }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: "11px",
                      color: "#00e87a", fontWeight: 700, minWidth: "24px", paddingTop: "2px",
                    }}>{s.n}</span>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#ccc", marginBottom: "4px" }}>{s.t}</div>
                      <div style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                background: "rgba(0,232,122,0.04)", border: "1px solid rgba(0,232,122,0.12)",
                borderRadius: "10px", padding: "14px 18px",
              }}>
                <div style={{ fontSize: "11px", color: "#00e87a", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>TRY THE DEMOS</div>
                <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>
                  Use the demo chips on the home page — <strong style={{ color: "#888" }}>Active Electrician</strong>, <strong style={{ color: "#888" }}>Expiring Plumber</strong>, and <strong style={{ color: "#888" }}>Suspended Builder</strong> — to explore all result types without needing a real licence number.
                </p>
              </div>
            </Section>

            {/* Understanding Results */}
            <Section id="understanding-results" title="Understanding Your Results">
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.8, marginBottom: "24px" }}>
                Every result card displays one of three status indicators at the top. Here's what each means:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                {STATUSES.map(s => (
                  <div key={s.label} style={{
                    background: s.bg, border: `1px solid ${s.border}`,
                    borderRadius: "12px", padding: "16px 20px",
                    display: "flex", gap: "16px", alignItems: "flex-start",
                  }}>
                    <span style={{
                      fontSize: "20px", fontWeight: 900, color: s.color,
                      fontFamily: "'Courier New', monospace", minWidth: "24px",
                    }}>{s.icon}</span>
                    <div>
                      <div style={{
                        fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em",
                        color: s.color, fontFamily: "'DM Mono', monospace", marginBottom: "6px",
                      }}>{s.label}</div>
                      <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                background: "#0d0d0d", border: "1px solid #1a1a1a",
                borderRadius: "10px", padding: "14px 18px",
              }}>
                <div style={{ fontSize: "11px", color: "#555", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>EXPIRY DATE</div>
                <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>
                  The expiry date is shown in the result card. If it falls within 90 days, it appears in <strong style={{ color: "#ff9500" }}>orange</strong> as a warning. A past expiry date appears in <strong style={{ color: "#ff3b3b" }}>red</strong>.
                </p>
              </div>
            </Section>

            {/* Verification Checks */}
            <Section id="verification-checks" title="Verification Checks">
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.8, marginBottom: "24px" }}>
                Each result card runs four distinct checks. A green tick means the check passed; a red cross means it did not.
              </p>

              <div style={{
                background: "#080808", border: "1px solid #1a1a1a",
                borderRadius: "12px", overflow: "hidden", marginBottom: "24px",
              }}>
                {CHECKS.map((c, i) => (
                  <div key={c.label} style={{
                    padding: "18px 20px",
                    borderBottom: i < CHECKS.length - 1 ? "1px solid #111" : "none",
                    display: "flex", gap: "16px", alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px",
                      background: "rgba(0,232,122,0.08)", border: "1px solid rgba(0,232,122,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#00e87a", flexShrink: 0,
                    }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#ccc", marginBottom: "5px" }}>{c.label}</div>
                      <div style={{ fontSize: "13px", color: "#555", lineHeight: 1.7 }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Coverage */}
            <Section id="coverage" title="Coverage — NSW Only">
              <div style={{
                background: "rgba(0,196,255,0.05)", border: "1px solid rgba(0,196,255,0.15)",
                borderRadius: "12px", padding: "20px 24px", marginBottom: "24px",
              }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#00c4ff", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", marginBottom: "8px" }}>NSW ONLY — CURRENT COVERAGE</div>
                    <p style={{ fontSize: "14px", color: "#777", lineHeight: 1.7 }}>
                      TradieCheck currently queries <strong style={{ color: "#aaa" }}>New South Wales Government registers only</strong>.
                      Tradies licensed exclusively in Victoria, Queensland, Western Australia, South Australia, or other states and territories
                      will <strong style={{ color: "#aaa" }}>not</strong> appear in search results.
                    </p>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.8, marginBottom: "20px" }}>
                The app connects to three registers maintained by NSW Government agencies:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                {[
                  "NSW Fair Trading — Trades Register (electricians, plumbers, builders, and 30+ other trades)",
                  "SafeWork NSW — High Risk Work Licence Register",
                  "NSW EPA — Asbestos & Demolition Contractors Register",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "#00e87a", fontSize: "12px", paddingTop: "3px", flexShrink: 0 }}>›</span>
                    <span style={{ fontSize: "13px", color: "#555", lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: "#0d0d0d", border: "1px solid #1a1a1a",
                borderRadius: "10px", padding: "14px 18px",
              }}>
                <div style={{ fontSize: "11px", color: "#333", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "6px", fontFamily: "'DM Mono', monospace" }}>COMING SOON</div>
                <p style={{ fontSize: "13px", color: "#444", lineHeight: 1.6 }}>
                  Support for additional states and territories is on the roadmap. VIC, QLD, WA, and SA will be added as their respective government APIs become available.
                </p>
              </div>
            </Section>

            {/* FAQ */}
            <Section id="faq" title="Frequently Asked Questions">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} />
              ))}
            </Section>

            {/* Data Sources */}
            <Section id="data-sources" title="Data Sources">
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.8, marginBottom: "24px" }}>
                TradieCheck uses the OneGov NSW API platform to query official government registers in real time.
                No data is stored or modified by TradieCheck — all information is returned directly from the source.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {SOURCES.map(s => (
                  <div key={s.name} style={{
                    background: "#0d0d0d", border: "1px solid #1a1a1a",
                    borderRadius: "12px", padding: "20px 24px",
                  }}>
                    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                        background: `${s.color}12`, border: `1px solid ${s.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 800, color: s.color,
                        fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
                      }}>{s.abbr}</div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "2px" }}>{s.name}</div>
                        <div style={{ fontSize: "11px", color: s.color, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>{s.register}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.7, marginBottom: "12px" }}>{s.desc}</p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: "10px", color: "#333", padding: "3px 10px",
                        border: "1px solid #1e1e1e", borderRadius: "4px",
                        textDecoration: "none", fontFamily: "'DM Mono', monospace",
                        letterSpacing: "0.04em", transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.target.style.color = s.color; e.target.style.borderColor = `${s.color}44`; }}
                        onMouseLeave={e => { e.target.style.color = "#333"; e.target.style.borderColor = "#1e1e1e"; }}
                      >↗ Official site</a>
                      <span style={{
                        fontSize: "10px", color: "#2a2a2a", padding: "3px 10px",
                        border: "1px solid #161616", borderRadius: "4px",
                        fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
                      }}>{s.api}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

          </article>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid #0d0d0d",
        padding: "24px 28px",
        maxWidth: "960px", margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ fontSize: "10px", color: "#2a2a2a", letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>
          DATA: NSW ONLY
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
