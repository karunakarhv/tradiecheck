import { STATUS_CONFIG } from '../constants/statusConfig'

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return null
  return (
    <span style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, borderRadius: '20px', padding: '3px 10px',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
    }}>{cfg.badgeLabel}</span>
  )
}
