// Vercel serverless function — mirrors the /api/check route from server.js
const BASE_URL = 'https://api.onegov.nsw.gov.au'

// Module-level cache survives warm Lambda re-use
const tokenCaches = {}

async function getToken(apiKey, apiSecret) {
  const cache = tokenCaches[apiKey] || { token: null, expiresAt: 0 }
  if (cache.token && Date.now() < cache.expiresAt) {
    return cache.token
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const res = await fetch(
    `${BASE_URL}/oauth/client_credential/accesstoken?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: { Authorization: `Basic ${credentials}`, Accept: 'application/json' },
    }
  )

  const text = await res.text()
  if (!res.ok || !text) {
    throw new Error(`Token request failed — HTTP ${res.status}: ${text || '(empty body)'}`)
  }

  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json')
    ? JSON.parse(text)
    : Object.fromEntries(new URLSearchParams(text))

  if (!data.access_token) throw new Error(`No access_token in response: ${text}`)

  tokenCaches[apiKey] = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return tokenCaches[apiKey].token
}

export default async function handler(req, res) {
  const q = encodeURIComponent(req.query.query)

  const [trades, hrw, asbestos] = await Promise.allSettled([
    getToken(process.env.TRADES_API_KEY, process.env.TRADES_API_SECRET).then(token =>
      fetch(`${BASE_URL}/tradesregister/v1/browse?searchText=${q}`, {
        headers: { Authorization: `Bearer ${token}`, apikey: process.env.TRADES_API_KEY, Accept: 'application/json' },
      }).then(r => r.json())
    ),
    getToken(process.env.HRW_API_KEY, process.env.HRW_API_SECRET).then(token =>
      fetch(`${BASE_URL}/hrwregister/v1/browse?searchText=${q}`, {
        headers: { Authorization: `Bearer ${token}`, apikey: process.env.HRW_API_KEY, Accept: 'application/json' },
      }).then(r => r.json())
    ),
    getToken(process.env.ASBESTOS_API_KEY, process.env.ASBESTOS_API_SECRET).then(token =>
      fetch(`${BASE_URL}/asbestosregister/v1/browse?searchText=${q}`, {
        headers: { Authorization: `Bearer ${token}`, apikey: process.env.ASBESTOS_API_KEY, Accept: 'application/json' },
      }).then(r => r.json())
    ),
  ])

  res.json({
    trades:       trades.status   === 'fulfilled' ? trades.value   : { error: trades.reason?.message },
    highRiskWork: hrw.status      === 'fulfilled' ? hrw.value      : { error: hrw.reason?.message },
    asbestos:     asbestos.status === 'fulfilled' ? asbestos.value : { error: asbestos.reason?.message },
  })
}
