# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start frontend dev server (Vite, port 5173)
npm run dev

# Start backend API server (Express, port 3001)
node server.js

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

For development, both servers must run simultaneously — the frontend proxies `/api/*` requests to `localhost:3001`.

## Architecture

**TradieCheck** is a tradie licence verification app for Australia. It queries NSW Government registers to verify licences, high-risk work certifications, and asbestos qualifications.

### Stack
- **Frontend**: React 19 + Vite, plain JavaScript (no TypeScript), inline CSS style objects
- **Backend**: Express 5 on port 3001, calls NSW Government APIs using OAuth 2.0 client credentials
- **No router library** — `App.jsx` routes manually via `window.location.pathname`

### Frontend routes → components
| URL | Component |
|-----|-----------|
| `/` | `TradieCheck.jsx` — main verification search interface |
| `/dashboard` | `TradieCheck-Dashboard.jsx` — tradie self-service portal |
| `/mobile` | `TradieCheck-Mobile.jsx` — mobile app UI mockup |
| `/api-config` | `TradieCheck-NSW-API-Config.jsx` — NSW API docs & config panel |

### Backend (`server.js`)
- Single endpoint: `GET /api/check?query={term}`
- Fetches/caches an OAuth token via `getToken()` (auto-refreshes 60s before expiry)
- Makes 3 parallel calls with `Promise.allSettled()`: Trades Licence API, High Risk Work Register, Asbestos & Demolition Register
- Base URL: `https://api.onegov.nsw.gov.au`
- Credentials loaded from `.env`: `NSW_API_KEY`, `NSW_API_SECRET`

### Data flow
1. User searches in `TradieCheck.jsx` → hits `MOCK_TRADES` first (3 demo records), or calls `/api/check`
2. Backend aggregates 3 NSW API responses → returns `{ trades, highRiskWork, asbestos }`
3. Frontend renders `ResultCard` with status: `ACTIVE` (green), `EXPIRING` (orange), `SUSPENDED`/`EXPIRED` (red)

### Design system
- Two visual themes: dark (main search — dark bg, `#00e87a` green accents) and light (dashboard/mobile — warm beige `#f5f2ec`)
- Fonts: DM Sans (UI), DM Mono (licence numbers/technical data) via Google Fonts
- No CSS framework — all styles are inline style objects or `<style>` tags inside components

### No test infrastructure
The project has no test setup (no Jest, Vitest, or testing libraries).
