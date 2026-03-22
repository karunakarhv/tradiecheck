# TradieCheck

[![Tests](https://github.com/karunakarhv/tradiecheck/actions/workflows/test.yml/badge.svg)](https://github.com/karunakarhv/tradiecheck/actions/workflows/test.yml)

Instantly verify Australian tradie licences, high-risk work certifications, and asbestos qualifications against live NSW Government registers.

![TradieCheck](image.png)

### Additional Views
<p align="center">
  <img src="dashboard.png" width="32%" alt="Dashboard Page" />
  <img src="mobile.png" width="32%" alt="Mobile App View" />
  <img src="help.png" width="32%" alt="Help Page" />
</p>


## Features

- **Live licence lookup** — searches NSW Fair Trading (Trades), SafeWork NSW (High Risk Work), and the Asbestos & Demolition Register in parallel
- **Instant status** — ACTIVE, EXPIRING, SUSPENDED, or EXPIRED with colour-coded verdicts
- **Demo records** — three built-in mock tradies for offline testing
- **Multiple views** — main search, tradie self-service dashboard, mobile app mockup, and NSW API config panel

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, plain JavaScript |
| Backend | Express 5, Node.js |
| Auth | NSW Government OAuth 2.0 client credentials |
| Unit tests | Vitest, @testing-library/react, happy-dom |
| E2E tests | Playwright |

---

## Prerequisites

- Node.js 18+
- npm 9+
- NSW Government API credentials (see [Getting API Keys](#getting-api-keys))

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/karunakarhv/tradiecheck.git
cd tradiecheck
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env   # if the example exists, otherwise create it manually
```

Add your NSW API credentials:

```env
NSW_API_KEY=your_consumer_key_here
NSW_API_SECRET=your_consumer_secret_here
```

> The app still works without credentials — demo records (`LIC-48291`, `PLB-77432`, `BLD-10293`) are served from local mock data and don't require API access.

### 4. Run the development servers

Both servers must run simultaneously — the frontend proxies `/api/*` to the backend.

**Terminal 1 — Backend (port 3001):**
```bash
node server.js
```

**Terminal 2 — Frontend (port 5173):**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Getting API Keys

1. Register at [api.nsw.gov.au/Account/Register](https://api.nsw.gov.au/Account/Register)
2. Create an app and subscribe to the following APIs:
   - **Trades Register API** (Product #25)
   - **High Risk Work Register API** (Product #33)
   - **Asbestos & Demolition Register API** (Product #34)
3. Copy the **Consumer Key** and **Consumer Secret** for your app into `.env`

The NSW API uses OAuth 2.0 client credentials flow. The backend fetches and caches tokens automatically, refreshing them 60 seconds before expiry.

---

## Deployment (Google Cloud Run)

TradieCheck is designed to deploy seamlessly to Google Cloud Run. The backend (`server.js`) natively serves the built frontend (`dist/`) statically, meaning no separate infrastructure is needed.

### 1. Manual Deployment
A native script `deploy-gcp.sh` is provided to deploy natively to Cloud Run from your terminal while explicitly capturing your `.env` build-time secrets (`VITE_SUPABASE_URL`) safely.

```bash
# Make it executable (only needed once)
chmod +x deploy-gcp.sh

# Deploy to Cloud Run
./deploy-gcp.sh
```

### 2. GitHub Actions (CI/CD)
The `.github/workflows/test.yml` pipeline automatically deploys your `main` branch directly to Cloud Run after running both Unit and E2E tests successfully.

To use the automated pipeline, configure the following secrets in your GitHub repository (**Settings → Secrets and variables → Actions**):
1. `GCP_CREDENTIALS` (Required): Your Google Cloud Service Account JSON Key with permissions to deploy to Cloud Run (`Editor` or `Cloud Run Admin`, `Cloud Build Editor`, `Artifact Registry Writer`).
2. `ENV_FILE_CONTENT` (Required): A `base64` string of your local `.env` file containing both your `VITE_` variables and backend API credentials. Run `cat .env | base64` locally to grab it.

---

## Routes

| URL | Description |
|-----|-------------|
| **Public Routes** | |
| `/login` | User authentication and login page |
| | |
| **Protected Routes** | *(Requires active session)* |
| `/` or `/welcome` | Landing / Welcome dashboard |
| `/verifyTradie` | Main verification lookup & search interface |
| `/dashboard` | Tradie self-service portal |
| `/mobile` | Mobile app UI mockup |
| `/help` | Help / Information page |
| `/api-config` | NSW API docs and credential config (if enabled in feature flags) |
| | |
| **Backend API** | |
| `/api/check?query={term}`| Express backend proxy to live NSW Government registers |

---

## Running Tests

### Unit tests

```bash
npm test              # run once
npm run test:watch    # watch mode during development
```

Tests use Vitest + Testing Library. Coverage includes utility functions (`parseNSWDate`, `NSW_STATUS`) and all shared components (`StarRating`, `CheckRow`, `StatusBadge`, `SourceIcon`).

### E2E tests

```bash
npm run test:e2e        # headless (auto-starts the dev server)
npm run test:e2e:ui     # interactive Playwright UI
```

E2E tests use Playwright + Chromium. The config (`playwright.config.js`) automatically starts `npm run dev` before running. Tests cover:

- Homepage loads with search input and demo chips
- All three mock tradie searches (Active, Expiring, Suspended)
- Search by typing + Enter key and via the CHECK button
- NEW SEARCH and TRY AGAIN reset flows
- Not-found state when the backend is unreachable
- Navigation to `/dashboard`, `/mobile`, and `/api-config`

> **Note:** E2E tests use the local mock data for the three demo codes (`LIC-48291`, `PLB-77432`, `BLD-10293`) and do not require NSW API credentials.

---

## Project Structure

```
tradiecheck/
├── server.js                        # Express backend — NSW API proxy
├── src/
│   ├── App.jsx                      # Manual router
│   ├── TradieCheck.jsx              # Main search page
│   ├── TradieCheck-Dashboard.jsx    # Tradie dashboard
│   ├── TradieCheck-Mobile.jsx       # Mobile mockup
│   ├── TradieCheck-NSW-API-Config.jsx
│   ├── components/                  # Shared UI components
│   │   ├── CheckRow.jsx
│   │   ├── SourceIcon.jsx
│   │   ├── StarRating.jsx
│   │   ├── StatusBadge.jsx
│   │   └── __tests__/
│   ├── lib/                         # Shared utilities and data
│   │   ├── nsw.js                   # NSW_STATUS map, parseNSWDate
│   │   ├── mockData.js              # Demo tradie records
│   │   └── __tests__/
│   └── test/
│       └── setup.js
├── e2e/
│   └── tradiecheck.spec.js          # Playwright E2E tests
├── playwright.config.js             # Playwright configuration
└── vite.config.js
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests (headless) |
| `npm run test:e2e:ui` | Run Playwright E2E tests (interactive UI) |
