# Life Points — handoff

Branch `life-points` (from `main`). Never touch/merge `cities-guide-v2`. Don't run `npm run deploy` or push `main`.

## Commands
- Dev: `npm run dev` → http://localhost:5173/my-portfolio/lab/life-points/
- Build: `npm run build` (output `dist/`), check with `npm run preview` → http://localhost:4173/my-portfolio/lab/life-points/
- Env: Node v22.23.4, npm 10.9.9, `npm ci`. Baseline build passes with no warnings.

## Where things live
- Page: `lab/life-points/index.html` (currently only "Life Points — coming soon"). Source goes in `src/lab/life-points/` (like `src/lab/astro/`, `src/lab/outfit/`) and is loaded with `<script type="module" src="/src/lab/life-points/main.js">`.
- Route: multi-page Vite app. Each page is an entry in `vite.config.js` → `build.rollupOptions.input` (`labLifePoints`). No client router.
- Lab entry: `src/data.js` → `lab.items` (last item, `link: ${import.meta.env.BASE_URL}lab/life-points/`) and the zh copy in `src/i18n.js` → `lab.items`. **zh is merged by array index** — keep the same order in both files. Cards without `thumb` use `art: "spark"` + `glyph` (see `src/system.css` `.lab-art-*`). Add `thumb` (import from `src/assets/images/lab/*.webp`) when a real one exists. `status`: Lit / Brewing / Wandering (sorted in that order). Replace the placeholder copy and the `["Placeholder"]` stack chip.

## Base path and assets
- `base: "/my-portfolio/"` in `vite.config.js`. In HTML, Vite rewrites root-absolute URLs (`/favicon.svg`, `/lab/vendor/gsap.min.js`) to `/my-portfolio/...` in the build; in JS use `import.meta.env.BASE_URL`.
- `public/` is copied as-is: `public/lab/vendor/` has `gsap.min.js`, `ScrollTrigger.min.js`, `d3.min.js`, `topojson.min.js` (classic scripts, used by cities/weekend/room). Put Life Points static data in `public/lab/life-points/`. Imports from `src/` get hashed names.
- Back link convention: `<a href="../../work/#lab">`.

## Fonts
- Site fonts (`src/tokens.css`): LINE Seed Sans (Latin) and LINE Seed TW (CJK **subset** to the site's characters — new CJK glyphs may be missing; see `scripts/subset-fonts.py`). Only load them via `src/tokens.css` if the page imports it.
- Lab pages also use Google Fonts links (Geist, Geist Mono, Instrument Serif, Noto Sans TC; astro uses Cinzel, Cormorant Garamond, Noto Serif TC).

## Dependencies
react 18.3.1, react-dom 18.3.1, vite 5.4.21, gsap 3.15.0, @gsap/react 2.1.2, framer-motion 12.38.0, d3 7.9.0, astronomy-engine 2.1.19, lunar-javascript 1.7.7, react-ga4 2.1.0 (dev: eslint 8.57.1, gh-pages 6.3.0). No dependencies were added.

## Gotchas
- Every lab page has a strict CSP `<meta>`: external hosts must be allowed explicitly (cities recently needed `images.pexels.com` in `img-src`). The placeholder allows only self, data:, blob:, and Google Fonts. Astro/outfit use `script-src 'self'` (no inline scripts); cities/room/weekend allow `'unsafe-inline'`.
- A new page must be added to `vite.config.js` input or it is missing from the build (dev server still serves it).
- `npm run lint` already fails on `main` (ESLint crashes at startup with a module resolution error); not caused by this branch.
- `npm audit` reports 2 vulnerabilities (1 moderate, 1 high) already on `main`.
- `.gitmodules` has submodule `resumx` (not needed for the build). `AGENT.md` sets the design bar: polished, aligned, subtle motion, not template-looking.
- Site supports light/dark (`prefers-color-scheme`, `data-theme`) and `prefers-reduced-motion`; match that.
