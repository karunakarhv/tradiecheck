// server.js
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { perMinuteLimiter, perHourLimiter } from './server/rateLimiter.js'
dotenv.config()

const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

const app = express()

app.use(pinoHttp({ logger }))
app.use(helmet())

// Allow: local Vite dev server, Capacitor WebViews (iOS + Android), configurable Cloud Run origin
const CLOUD_RUN_ORIGIN = process.env.CLOUD_RUN_ORIGIN; // Set to exact Cloud Run URL in production
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'capacitor://localhost',  // iOS Capacitor WebView
  'http://localhost',       // Android Capacitor WebView
  ...(CLOUD_RUN_ORIGIN ? [CLOUD_RUN_ORIGIN] : []),
];
app.use(cors({ origin: ALLOWED_ORIGINS }))
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
  logger.info({ url: res.url, status: res.status, apiKey: apiKey.slice(0, 8) + '...' }, 'Token request')

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
    expiresAt: Date.now() + (parseInt(data.expires_in, 10) - 60) * 1000,
  }
  return tokenCaches[apiKey].token
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')))

// ── Health check ─────────────────────────────────────────────────
app.get('/healthz', (_, res) => res.json({ ok: true, timestamp: new Date().toISOString() }))

// ── Proxy route — frontend calls this ───────────────────────────
app.get('/api/check', perMinuteLimiter, perHourLimiter, async (req, res) => {
  const q     = req.query.query;
  const state = req.query.state || 'NSW';

  const VALID_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'ACT', 'TAS'];
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  if (q.length > 200) {
    return res.status(400).json({ error: 'Query too long (max 200 characters)' });
  }
  if (!VALID_STATES.includes(state)) {
    return res.status(400).json({ error: 'Invalid state' });
  }

  if (state !== 'NSW') {
    return res.status(400).json({
      error: `Verification for ${state} licences is not yet supported. Only NSW licences can be verified at this time.`,
      unsupportedState: true,
    });
  }

  const query = encodeURIComponent(q);

  // NSW OneGov Logic (Existing)
  try {
    const [trades, hrw, asbestos] = await Promise.allSettled([
      getToken(process.env.TRADES_API_KEY, process.env.TRADES_API_SECRET).then(token =>
        fetch(`${BASE_URL}/tradesregister/v1/browse?searchText=${query}`, {
          signal: AbortSignal.timeout(15000),
          headers: { Authorization: `Bearer ${token}`, apikey: process.env.TRADES_API_KEY, Accept: 'application/json' },
        }).then(r => {
          logger.debug({ api: 'trades', status: r.status }, 'NSW API response')
          return r.json()
        })
      ),

      getToken(process.env.HRW_API_KEY, process.env.HRW_API_SECRET).then(token =>
        fetch(`${BASE_URL}/hrwregister/v1/browse?searchText=${query}`, {
          signal: AbortSignal.timeout(15000),
          headers: { Authorization: `Bearer ${token}`, apikey: process.env.HRW_API_KEY, Accept: 'application/json' },
        }).then(r => {
          logger.debug({ api: 'hrw', status: r.status }, 'NSW API response')
          return r.json()
        })
      ),

      getToken(process.env.ASBESTOS_API_KEY, process.env.ASBESTOS_API_SECRET).then(token =>
        fetch(`${BASE_URL}/asbestosregister/v1/browse?searchText=${query}`, {
          signal: AbortSignal.timeout(15000),
          headers: { Authorization: `Bearer ${token}`, apikey: process.env.ASBESTOS_API_KEY, Accept: 'application/json' },
        }).then(r => {
          logger.debug({ api: 'asbestos', status: r.status }, 'NSW API response')
          return r.json()
        })
      ),
    ])

    const payload = {
      trades:       trades.status   === 'fulfilled' ? trades.value   : { error: trades.reason?.message },
      highRiskWork: hrw.status      === 'fulfilled' ? hrw.value      : { error: hrw.reason?.message },
      asbestos:     asbestos.status === 'fulfilled' ? asbestos.value : { error: asbestos.reason?.message },
    }
    res.json(payload)
  } catch {
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
})

// Catch-all to serve index.html for client-side routing
app.use((req, res) => {
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

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => logger.info({ port: PORT }, 'Server started'))
