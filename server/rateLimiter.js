// server/rateLimiter.js
import rateLimit from 'express-rate-limit'

/**
 * Extracts the Supabase user ID from the JWT Bearer token.
 * Falls back to IP if no valid token present.
 */
function getUserKey(req) {
  try {
    const auth = req.headers['authorization'] || ''
    if (auth.startsWith('Bearer ')) {
      const token = auth.slice(7)
      // Decode only the payload (no signature verification needed — just for bucketing)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
      if (payload?.sub) return payload.sub
    }
  } catch {
    // Malformed JWT — fall through to IP
  }
  return req.ip
}

const rateLimitMessage = (windowDesc, max) => ({
  error: `Too many requests. You may make at most ${max} searches per ${windowDesc}. Please try again later.`,
})

/** 20 requests per minute per user */
export const perMinuteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
  handler: (req, res) => {
    res.status(429).json(rateLimitMessage('minute', 20))
  },
})

/** 100 requests per hour per user */
export const perHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getUserKey,
  handler: (req, res) => {
    res.status(429).json(rateLimitMessage('hour', 100))
  },
})
