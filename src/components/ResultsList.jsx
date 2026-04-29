import { NSW_STATUS } from "../lib/nsw";
import { STATUS_COLORS } from "../constants/statusConfig";

export default function ResultsList({ results, onSelect, onBack }) {
  return (
    <div style={{ animation: "slideUp 0.3s ease" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
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
          const color  = STATUS_COLORS[status];

          return (
            <button
              key={licence.licenceNumber}
              onClick={() => onSelect(licence)}
              style={{
                background: "#0d0d0d", border: "1px solid #1e1e1e",
                borderRadius: "12px", padding: "14px 16px",
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = `${color}44`}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1e1e1e"}
            >
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
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
                }}>
                  {licence.status?.toUpperCase()}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
