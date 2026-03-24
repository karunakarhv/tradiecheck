// server.js
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { perMinuteLimiter, perHourLimiter } from './server/rateLimiter.js'
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')))

// ── Proxy route — frontend calls this ───────────────────────────
app.get('/api/check', perMinuteLimiter, perHourLimiter, async (req, res) => {
  const q     = req.query.query;
  const state = req.query.state || 'NSW';
  const query = encodeURIComponent(q);

  if (state !== 'NSW') {
    // Simulated response for other states
    // In a real app, these would call VIC Building Authority, QBCC, etc.
    const issuers = {
      'VIC': 'VIC Building Authority',
      'QLD': 'QBCC Queensland',
      'WA':  'Building Services WA',
      'SA':  'CBS South Australia',
      'ACT': 'Access Canberra',
      'TAS': 'CBOS Tasmania'
    };
    const issuer = issuers[state] || 'State Authority';

    // Simulate search delay
    await new Promise(r => setTimeout(r, 800));

    // Return a format that is compatible with the frontend expectation
    // (A single list of trades from the 'state' register)
    return res.json({
      trades: [{
        licensee: q.length > 5 ? q : `${q} (Simulated)`,
        licenceNumber: q.includes('-') ? q : `${state}-${q.padStart(5, '0')}`,
        licenceType: 'General Building / Trade',
        status: 'Active',
        expiryDate: '30/11/2026',
        suburb: 'Capital City',
        postcode: '0000',
        issuer: issuer
      }],
      highRiskWork: [],
      asbestos: []
    });
  }

  // NSW OneGov Logic (Existing)
  try {
    const [trades, hrw, asbestos] = await Promise.allSettled([
      getToken(process.env.TRADES_API_KEY, process.env.TRADES_API_SECRET).then(token =>
        fetch(`${BASE_URL}/tradesregister/v1/browse?searchText=${query}`, {
          headers: { Authorization: `Bearer ${token}`, apikey: process.env.TRADES_API_KEY, Accept: 'application/json' },
        }).then(r => r.json())
      ),

      getToken(process.env.HRW_API_KEY, process.env.HRW_API_SECRET).then(token =>
        fetch(`${BASE_URL}/hrwregister/v1/browse?searchText=${query}`, {
          headers: { Authorization: `Bearer ${token}`, apikey: process.env.HRW_API_KEY, Accept: 'application/json' },
        }).then(r => r.json())
      ),

      getToken(process.env.ASBESTOS_API_KEY, process.env.ASBESTOS_API_SECRET).then(token =>
        fetch(`${BASE_URL}/asbestosregister/v1/browse?searchText=${query}`, {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

// Catch-all to serve index.html for client-side routing
app.use((req, res, next) => {
  // If request is for a missing static asset (like old cached JS/CSS files), 
  // do not return index.html to prevent confusing MIME type errors.
  if (req.path.startsWith('/assets/')) {
    return res.status(404).send('Asset not found')
  }
  
  // Set no-cache headers for index.html so the browser always gets the latest file hashes
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log(`TradieCheck server running on port ${PORT}`))
