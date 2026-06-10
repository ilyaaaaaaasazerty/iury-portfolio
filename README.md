# IURY — Cinematic Portfolio

The portfolio of **Belkhiri Abdelaziz** — autoentrepreneur & AI researcher — built around the IURY logo: a camera **aperture** that opens on scroll to reveal the work, with cinematic film language throughout (focus pulls, film grain, a viewfinder HUD, a focus‑reticle cursor, and projects shown as numbered film *frames*).

Pure monochrome. Trilingual **EN / FR / AR** with full right‑to‑left support. Comes with a local **Studio** dashboard to manage projects and images without touching code.

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Lenis** (smooth scroll) · **Framer Motion** · custom scroll‑scrub aperture
- Content stored as **local JSON** (`data/`) — no database
- Fonts: Instrument Serif (titles) · Hanken Grotesk (UI) · JetBrains Mono (labels) · IBM Plex Sans Arabic (RTL)

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000   (site)
                     # http://localhost:3000/studio   (dashboard)
```

Production:

```bash
npm run build
npm run start
```

---

## Managing content — the Studio

Open **/studio** while running `npm run dev`.

**Projects tab**
- **+ Add** a project, or pick one from the list.
- Drag‑free reorder with the ▲ ▼ arrows (order = order on the site).
- **Images** — click *Add image* (or drop files). The **first image is the cover**; hover any image to *★ Make cover* or remove it. Files are saved into `public/projects/<id>/`.
- Edit name, tagline, description, category, year, role, status, stack, links.
- Toggle **Featured** (featured projects get larger frames + appear under the *Featured* filter).
- **Translations** — optional French & Arabic per project; blank fields fall back to English.

**Profile tab** — your name, roles, email, availability, social links, and localized tagline/bio (EN/FR/AR). Stats & capabilities are edited as JSON (click *Apply JSON*, then *Save*).

Click **Save changes** to write to `data/projects.json` / `data/profile.json`.

> The dev server reflects your edits live. To publish, commit the changed `data/` + `public/projects/` files and redeploy (the public site is statically generated at build time).

---

## Project structure

```
app/
  (site)/          # public portfolio (smooth scroll, grain, cursor overlays)
    layout.tsx
    page.tsx
  studio/page.tsx  # the dashboard (noindex, no overlays)
  api/             # projects / profile / upload  (write-gated)
  layout.tsx       # fonts + metadata
  globals.css      # design tokens + cinematic CSS
components/        # aperture, hero, work gallery, modal, studio, …
data/              # projects.json + profile.json  ← your content
lib/               # types, i18n, data access, aperture geometry
public/projects/   # uploaded project images
```

---

## Deployment

Deploys anywhere that runs Next.js (Vercel, Netlify) or as a static export. Images use `unoptimized` so they work on any host.

**Security:** the Studio's write APIs are disabled in production by default, so a deployed site cannot be edited by visitors. Edit locally with `npm run dev`. To deliberately enable the dashboard on a server, set `ENABLE_STUDIO=true`.

---

## Customizing the look

- **Colors & type:** `app/globals.css` (`@theme` block).
- **The IURY mark / aperture** is generated geometry — `lib/aperture.ts` + `components/iury-mark.tsx`. Tune `span` / `swirl` / `ri` / `ro` to reshape the iris.
- **Sections & copy:** `lib/i18n.ts` (UI strings, all three languages).

Built with care — no templates, no stock layouts.
