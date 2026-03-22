import ResultCard from "./ResultCard";
import ResultsList from "./ResultsList";

export default function RightPanel({ loading, results, result, notFound, query, onSelect, onBack, onReset, onRetry }) {
  return (
    <div className="tc-right">

      {/* Loading spinner */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "40px", height: "40px", border: "2px solid #111", borderTopColor: "#00e87a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <div style={{ fontSize: "11px", color: "#333", letterSpacing: "0.12em", fontFamily: "'DM Mono', monospace" }}>
              CHECKING DATABASES…
            </div>
          </div>
        </div>
      )}

      {/* Multiple results list */}
      {results && !result && !loading && (
        <ResultsList
          results={results.trades}
          onSelect={onSelect}
          onBack={onBack}
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
          <button onClick={onRetry} style={{
            background: "none", border: "1px solid #222", borderRadius: "8px",
            color: "#555", fontSize: "12px", padding: "10px 24px",
            cursor: "pointer", letterSpacing: "0.06em",
          }}>TRY AGAIN</button>
        </div>
      )}

      {/* Single result card */}
      {result && !loading && (
        <ResultCard data={result} onClose={onReset} />
      )}

      {/* Empty / idle state */}
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
  );
}
