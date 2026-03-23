import StatusBadge from "./StatusBadge";
import { getVerifiableStatus } from "../lib/nsw";

export default function BulkResultsList({ results, onReset, onDownload }) {
  const completed = results.filter(r => r.status !== "pending" && r.status !== "loading").length;
  const total = results.length;
  const progress = (completed / total) * 100;

  return (
    <div style={{ animation: "slideUp 0.3s ease", display: "flex", flexDirection: "column", height: "100%", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#00e87a", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "4px" }}>
            BULK CHECK IN PROGRESS
          </div>
          <div style={{ fontWeight: 800, fontSize: "20px" }}>
            {completed} / {total} Verified
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {completed === total && (
            <button onClick={onDownload} style={{
              background: "#00e87a", border: "none", borderRadius: "8px",
              padding: "8px 16px", color: "#000", fontSize: "11px", fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 3v12"/>
              </svg>
              EXPORT CSV
            </button>
          )}
          <button onClick={onReset} style={{
            background: "none", border: "1px solid #222", borderRadius: "8px",
            padding: "8px 16px", color: "#555", fontSize: "11px", fontWeight: 800,
            cursor: "pointer"
          }}>
            {completed === total ? "NEW SEARCH" : "CANCEL"}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ background: "#111", height: "4px", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          width: `${progress}%`, height: "100%", background: "#00e87a",
          transition: "width 0.4s ease", boxShadow: "0 0 10px rgba(0,232,122,0.5)"
        }} />
      </div>

      {/* Results Table */}
      <div style={{
        flex: 1, overflowY: "auto", background: "#080808",
        border: "1px solid #111", borderRadius: "12px",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead style={{ position: "sticky", top: 0, background: "#0a0a0a", zIndex: 1 }}>
            <tr>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#444", fontWeight: 600, borderBottom: "1px solid #111", fontSize: "10px" }}>TRADIE / LICENCE</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#444", fontWeight: 600, borderBottom: "1px solid #111", fontSize: "10px" }}>STATUS</th>
              <th style={{ textAlign: "left", padding: "12px 16px", color: "#444", fontWeight: 600, borderBottom: "1px solid #111", fontSize: "10px" }}>RESULT</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #0d0d0d" }}>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{res.query}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {res.status === "loading" && <div style={{ width: "8px", height: "8px", border: "1.5px solid #333", borderTopColor: "#00e87a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                    <span style={{
                      color: res.status === "loading" ? "#00e87a" :
                             res.status === "pending" ? "#333" :
                             res.status === "rateLimited" ? "#ff6b35" :
                             res.status === "error" ? "#ff3b3b" : "#555",
                      fontSize: "11px", fontWeight: 700, fontFamily: "'DM Mono', monospace"
                    }}>
                      {res.status.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {res.data ? (
                    <StatusBadge status={getVerifiableStatus(res.data.status)} />
                  ) : res.status === "notFound" ? (
                    <span style={{ color: "#333", fontSize: "11px" }}>NOT FOUND</span>
                  ) : res.status === "rateLimited" ? (
                    <span style={{ color: "#ff6b35", fontSize: "11px" }}>THROTTLED</span>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        table tbody tr:hover { background: #0d0d0d; }
      `}</style>
    </div>
  );
}
