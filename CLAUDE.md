# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, hot reload)
npm run build     # tsc + vite build (production)
npm run preview   # Preview production build locally
npm run lint      # ESLint on src/
```

No test suite is configured yet. TypeScript type checking runs as part of `build` via `tsc --noEmit`.

## Architecture

Single-page React app that visualizes SPI Americas' annual revenue performance as a live football match (SPI Americas vs Real Adversidad). Each month = a "match minute" (Enero=8' through Diciembre=90'). Goles a favor = months above target. Squad = 26 total (24 titulares on pitch + Profe + Dueña del Club off-pitch).

**Data flow:**

```
api/match-data.ts (Vercel Serverless)
    ↓ (future: real fetch)
useMatchData hook  ←  currently returns MOCK_DATA with 800ms simulated delay
    ↓ data: MatchData | null
App.tsx            ←  owns goal/confetti show state, derives mesActual from MONTHS_TO_MINUTES
    ↓ props
Scoreboard components + FootballPitch + Effects
```

**`src/types/index.ts`** defines the three core types: `Player`, `MonthResult`, `MatchData`. All components are typed against these — change here first when the data shape evolves.

**`src/utils/constants.ts`** is the single source of truth for:
- `COLORS` — design token palette (Colombia flag: yellow `#FCD116`, blue `#003893`, red `#CE1126`, dark bg `#0A1628`)
- `MONTHS_TO_MINUTES` — maps each month name to its match minute (used in both `MatchMinute` bar and `MonthTimeline` badges)
- `TEAM_NAMES` — home/away display names

**Player positioning** (`FootballPitch.tsx`): `POSITION_MAP` translates `posicionCancha` string values (e.g. `"Defensa_Izq"`, `"Delantero_Centro"`) to `[x%, y%]` absolute coordinates overlaid on the SVG pitch. Adding a new field position requires entries in both `POSITION_MAP` and the mock data's `posicionCancha`.

**Special roles** (filtered in `FootballPitch`):
- `rol: 'Profe'` → `CoachBadge` (rendered below bench, styled blue)
- `rol: 'Dueña del Club'` → `OwnerBadge` (rendered below bench, styled gold)
- `posicionCancha` starting with `"Banca_"` → bench row, not placed on pitch

**Connecting the real API:** Replace the mock body in `useMatchData.ts` with `fetch('/api/match-data')`. The `api/match-data.ts` Vercel function already returns the same shape — update it with real data there. `vercel.json` rewrites all `/api/*` to the serverless functions and `/*` to `index.html`.

**Styling rules:** No component library. All styles use Tailwind utility classes + inline `style` props for dynamic values and the custom color palette. Colombia color tokens are in `tailwind.config.ts` under `theme.extend.colors.colombia.*` but the hex values in `constants.ts` are used for inline styles throughout.
