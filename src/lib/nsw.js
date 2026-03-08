export const NSW_STATUS = { Current: 'ACTIVE', Expired: 'EXPIRED', Cancelled: 'SUSPENDED' }

export function parseNSWDate(str) {
  if (!str) return null
  const [d, m, y] = str.split('/')
  return y && m && d ? `${y}-${m}-${d}` : null
}
