const ICONS = { trades: '🔧', hrw: '⚠️', asbestos: '🛡️' }

export default function SourceIcon({ source }) {
  return <span title={source}>{ICONS[source] || '📋'}</span>
}
