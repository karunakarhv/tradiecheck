import StarRating from "./StarRating";
import CheckRow from "./CheckRow";
import { STATUS_CONFIG } from "../constants/statusConfig";

export default function ResultCard({ data, onClose }) {
  const status   = STATUS_CONFIG[data.status];
  const isActive = data.status === "ACTIVE";

  const expiryColor =
    new Date(data.expiry) < new Date()
      ? "#ff3b3b"
      : new Date(data.expiry) < new Date(Date.now() + 90 * 86400000)
      ? "#ff9500"
      : "#888";

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
        <span style={{ fontSize: "18px", fontWeight: 900, color: status.color, fontFamily: "'Courier New', monospace" }}>
          {status.icon}
        </span>
        <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", color: status.color, fontFamily: "'Courier New', monospace" }}>
          {status.label}
        </span>
        <span style={{ marginLeft: "auto", fontSize: "10px", color: "#444", fontFamily: "'Courier New', monospace" }}>
          CHECKED {new Date().toLocaleTimeString("en-AU")}
        </span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Tradie header */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "12px",
            background: `linear-gradient(135deg, ${status.color}22, ${status.color}44)`,
            border: `1px solid ${status.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", fontWeight: 800, color: status.color, flexShrink: 0,
          }}>
            {data.photo}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{data.name}</div>
            <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>{data.trade}</div>
            <div style={{ marginTop: "6px" }}>
              <StarRating rating={data.rating} reviews={data.reviews} />
            </div>
          </div>

          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "#444", textAlign: "right", lineHeight: "1.6" }}>
            <div style={{ color: "#555" }}>LICENCE</div>
            <div style={{ color: "#888" }}>{data.licence}</div>
            <div style={{ color: "#555", marginTop: "4px" }}>ISSUER</div>
            <div style={{ color: "#666", fontSize: "10px" }}>{data.issuer}</div>
          </div>
        </div>

        {/* Checks */}
        <div style={{ background: "#080808", borderRadius: "10px", padding: "4px 16px", marginBottom: "20px", border: "1px solid #1a1a1a" }}>
          <CheckRow label="Licence Status"          value={data.status === "ACTIVE"} />
          <CheckRow label="High-Risk Work Licence"  value={data.highRiskWork} />
          <CheckRow label="Asbestos Certification"  value={data.asbestosCleared} />
          <CheckRow label="Public Liability Insurance" value={data.insuranceValid} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
            <span style={{ color: "#888", fontSize: "13px", letterSpacing: "0.04em" }}>Licence Expiry</span>
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", color: expiryColor }}>
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

        {/* Footer row */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", paddingTop: "16px", borderTop: "1px solid #1a1a1a" }}>
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
