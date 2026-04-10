# ⚽ SPI World Cup 2026

Gamified revenue dashboard for SPI Americas — visualizes the team's annual sales performance as a live football match against *Real Adversidad* (the revenue target).

**Live:** https://spi-world-cup.vercel.app

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Backend | Vercel Serverless Functions (Node.js) |
| CMS | Google Sheets (via Sheets API v4) |
| Hosting | Vercel |

---

## Architecture

```
Google Sheets (CMS)
  └─ Tab "Alineacion"         → jugadores, fotos, posiciones
  └─ Tab "Resultados_Mensuales" → recaudo mensual (PRIVADO)
          │
          ▼
  Vercel Serverless Function  /api/match-data
    • Reads Recaudo_Real_USD (NEVER sent to client)
    • Calculates goals: recaudo ≥ META → gol a favor, else gol en contra
    • Returns only: { alineacion, resultados (solo goles), marcadorGlobal, minutoActual }
          │
          ▼
  React SPA
    • Displays match score, timeline, formation, animations
    • Financial data (Recaudo_Real_USD) NEVER reaches the browser
```

---

## Run locally

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local
# Edit .env.local and add your Google Sheets API key:
# GOOGLE_API_KEY=AIza...

# 3a. Frontend only (uses mock data — no API key needed)
npm run dev

# 3b. Frontend + API (requires GOOGLE_API_KEY)
npx vercel dev
```

---

## Deploy

Vercel auto-deploys on every push to `main`:

```bash
git push origin main
```

Manual deploy:

```bash
npx vercel --prod
```

---

## Environment variables

| Variable | Description | Required |
|---|---|---|
| `GOOGLE_API_KEY` | Google Cloud API key with Sheets API v4 enabled | Yes (production) |

Set in Vercel Dashboard → Project → Settings → Environment Variables.

> **Security note:** `Recaudo_Real_USD` (actual revenue figures) is consumed exclusively inside the serverless function and never included in API responses. The client only ever sees goal counts (0 or 1 per month).

---

## OG image

To regenerate the social sharing preview image:

1. Open `public/og-image.html` in a browser
2. Set viewport to 1200×630 (DevTools → device toolbar)
3. Screenshot and save as `public/og-image.png`

Or with Playwright:
```bash
npx playwright screenshot --viewport-size=1200,630 public/og-image.html public/og-image.png
```

---

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # tsc + vite build (production)
npm run preview  # Preview production build
npm run lint     # ESLint
```
