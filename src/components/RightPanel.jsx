import ResultCard from "./ResultCard";
import ResultsList from "./ResultsList";
import BulkResultsList from "./BulkResultsList";

export default function RightPanel({ loading, results, result, notFound, rateLimited, bulkResults, query, onSelect, onBack, onReset, onResetBulk, onRetry }) {
  const handleDownloadCSV = () => {
    if (!bulkResults) return;
    const header = "Query,Status,Result,LicenceNumber\n"
    const rows = bulkResults.map(r => {
      const status = r.status.toUpperCase();
      const resultVal = r.data ? (r.data.status === "Active" ? "ACTIVE" : "SUSPENDED") : (r.status === "notFound" ? "NOT_FOUND" : "PENDING");
      const licence = r.data ? r.data.licenceNumber : "";
      return `"${r.query}","${status}","${resultVal}","${licence}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradiecheck_report_${new Date().getTime()}.csv`;
    a.click();
  };

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
      {results && !result && !loading && !bulkResults && (
        <ResultsList
          results={results.trades}
          onSelect={onSelect}
          onBack={onBack}
        />
      )}

      {/* Bulk Results */}
      {bulkResults && (
        <BulkResultsList
          results={bulkResults}
          onReset={onResetBulk}
          onDownload={handleDownloadCSV}
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

      {/* Rate limited */}
      {rateLimited && !loading && (
        <div
          id="rate-limit-banner"
          style={{
            animation: "slideUp 0.3s ease",
            background: "#0d0d0d", border: "1px solid #3a1800",
            borderRadius: "14px", padding: "40px 32px", textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏱️</div>
          <div style={{ fontWeight: 800, fontSize: "18px", marginBottom: "10px", color: "#ff6b35" }}>Too many requests</div>
          <div style={{ color: "#555", fontSize: "13px", marginBottom: "24px", lineHeight: 1.6 }}>
            You've made too many searches. Please wait a minute and try again.
          </div>
          <button onClick={onReset} style={{
            background: "none", border: "1px solid #3a1800", borderRadius: "8px",
            color: "#ff6b35", fontSize: "12px", padding: "10px 24px",
            cursor: "pointer", letterSpacing: "0.06em",
          }}>NEW SEARCH</button>
        </div>
      )}

      {/* Single result card */}
      {result && !loading && (
        <ResultCard data={result} onClose={onReset} />
      )}

      {/* Empty / idle state */}
      {!loading && !results && !notFound && !result && !bulkResults && (
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
