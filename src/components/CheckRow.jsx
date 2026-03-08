export default function CheckRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid #1a1a1a',
    }}>
      <span style={{ color: '#888', fontSize: '13px', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{
        fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
        color: value ? '#00e87a' : '#ff3b3b',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        <span style={{
          width: '18px', height: '18px', borderRadius: '50%',
          background: value ? 'rgba(0,232,122,0.12)' : 'rgba(255,59,59,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px',
        }}>{value ? '✓' : '✕'}</span>
        {value ? 'CONFIRMED' : 'NOT VERIFIED'}
      </span>
    </div>
  )
}
