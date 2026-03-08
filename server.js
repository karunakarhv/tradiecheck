// server.js
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const BASE_URL = 'https://api.onegov.nsw.gov.au'

// Per-API token caches keyed by API key
const tokenCaches = {}

// ── Get OAuth token for a specific API's credentials ─────────────
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
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    }
  )

  const text = await res.text()
  console.log(`[token] URL: ${res.url} | HTTP ${res.status}`)

  if (!res.ok || !text) {
    throw new Error(`Token request failed — HTTP ${res.status}: ${text || '(empty body)'}`)
  }

  // NSW API returns form-urlencoded OR JSON depending on setup
  let data
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    data = JSON.parse(text)
  } else {
    // Parse form-urlencoded: access_token=xxx&token_type=bearer&expires_in=43199
    data = Object.fromEntries(new URLSearchParams(text))
  }

  if (!data.access_token) {
    throw new Error(`No access_token in response: ${text}`)
  }

  tokenCaches[apiKey] = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }
  return tokenCaches[apiKey].token
}

// ── Proxy route — frontend calls this ───────────────────────────
app.get('/api/check', async (req, res) => {
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

  const payload = {
    trades:       trades.status   === 'fulfilled' ? trades.value   : { error: trades.reason?.message },
    highRiskWork: hrw.status      === 'fulfilled' ? hrw.value      : { error: hrw.reason?.message },
    asbestos:     asbestos.status === 'fulfilled' ? asbestos.value : { error: asbestos.reason?.message },
  }
  res.json(payload)
})

app.listen(3001, () => console.log('TradieCheck API server running on http://localhost:3001'))
