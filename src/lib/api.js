const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * Check a tradie's licence against NSW Government registers.
 * @param {string} query - Licence number or name to search
 * @param {string} state - Australian state code (default: 'NSW')
 * @returns {Promise<{data: object|null, unsupportedState: boolean, error: string|null}>}
 */
export async function checkTradie(query, state = 'NSW') {
  const url = `${API_BASE}/api/check?query=${encodeURIComponent(query)}&state=${encodeURIComponent(state)}`
  const res = await fetch(url)
  const body = await res.json()

  if (res.status === 400 && body.unsupportedState) {
    return { data: null, unsupportedState: true, error: body.error }
  }
  if (!res.ok) {
    return { data: null, unsupportedState: false, error: body.error || 'Request failed' }
  }
  return { data: body, unsupportedState: false, error: null }
}
