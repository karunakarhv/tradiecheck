const STATUS_CONFIG = {
  ACTIVE:    { bg: 'rgba(0,232,122,0.12)',  border: 'rgba(0,232,122,0.25)',  color: '#009949', label: 'ACTIVE' },
  EXPIRING:  { bg: 'rgba(255,184,0,0.1)',   border: 'rgba(255,184,0,0.3)',   color: '#b37d00', label: 'EXPIRING' },
  EXPIRED:   { bg: 'rgba(255,59,59,0.1)',   border: 'rgba(255,59,59,0.25)', color: '#cc1f1f', label: 'EXPIRED' },
  SUSPENDED: { bg: 'rgba(255,59,59,0.1)',   border: 'rgba(255,59,59,0.25)', color: '#cc1f1f', label: 'SUSPENDED' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return null
  return (
    <span style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, borderRadius: '20px', padding: '3px 10px',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
    }}>{cfg.label}</span>
  )
}
