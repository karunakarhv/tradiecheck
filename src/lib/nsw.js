export const NSW_STATUS = {
  Current: 'ACTIVE',
  Active: 'ACTIVE',
  Registered: 'ACTIVE',
  Uncancelled: 'ACTIVE',
  Expired: 'EXPIRED',
  Cancelled: 'SUSPENDED',
  Suspended: 'SUSPENDED',
  Refused: 'SUSPENDED',
  Surrendered: 'SUSPENDED',
  Deceased: 'SUSPENDED',
  Disqualified: 'SUSPENDED'
}

export function getVerifiableStatus(rawStatus) {
  if (!rawStatus) return "SUSPENDED";
  const normalized = rawStatus.trim();
  return NSW_STATUS[normalized] || "SUSPENDED";
}

export function parseNSWDate(str) {
  if (!str) return null
  const [d, m, y] = str.split('/')
  return y && m && d ? `${y}-${m}-${d}` : null
}
