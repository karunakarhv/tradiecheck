export const STATUS_CONFIG = {
  ACTIVE:    { color: '#00e87a', label: 'VERIFIED & ACTIVE', badgeLabel: 'ACTIVE',    icon: '✓', bg: 'rgba(0,232,122,0.12)',  border: 'rgba(0,232,122,0.25)' },
  EXPIRING:  { color: '#b37d00', label: 'EXPIRING',          badgeLabel: 'EXPIRING',  icon: '!', bg: 'rgba(255,184,0,0.1)',   border: 'rgba(255,184,0,0.3)' },
  EXPIRED:   { color: '#ff9500', label: 'EXPIRED',           badgeLabel: 'EXPIRED',   icon: '!', bg: 'rgba(255,59,59,0.1)',   border: 'rgba(255,59,59,0.25)' },
  SUSPENDED: { color: '#ff3b3b', label: 'SUSPENDED',         badgeLabel: 'SUSPENDED', icon: '✕', bg: 'rgba(255,59,59,0.1)',   border: 'rgba(255,59,59,0.25)' },
};

export const STATUS_COLORS = {
  ACTIVE:    '#00e87a',
  EXPIRING:  '#b37d00',
  EXPIRED:   '#ff9500',
  SUSPENDED: '#ff3b3b',
};
