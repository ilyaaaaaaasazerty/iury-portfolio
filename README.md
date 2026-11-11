# IURY — Belkhiri Abdelaziz's portfolio

The portfolio of **Belkhiri Abdelaziz** — autoentrepreneur & AI researcher — presented by **IURY**, his robot assistant.

IURY is a live, hand-rigged SVG robot that stays on screen (left pane on desktop, a floating head on mobile). He tracks the cursor with his eyes, blinks, rolls his treads when you scroll, changes pose and chest-screen mood per section, points at and describes whichever project you hover, and reacts when clicked. Trilingual **EN / FR / AR** with full right-to-left support.

Projects are **pulled from GitHub automatically** and merged with any hand-curated projects.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** · **Framer Motion** · **Lenis**
- Content in local JSON (`data/`) — no database
- Fonts: Space Grotesk (display) · Hanken Grotesk (UI) · JetBrains Mono · IBM Plex Sans Arabic

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000   (site)
                     # http://localhost:3000/studio   (dashboard)
```

## GitHub projects

The site reads `https://api.github.com/users/<username>/repos` and re-checks **every hour** (ISR), so a new repo shows up without a redeploy.

Pick what appears in **Studio → GitHub**:

- **Show / hide** each repo. With *Show new repos automatically* on, anything you push later appears unless you hide it; turn it off to show only repos you switch on.
- **★ Featured** makes a card span two columns.
- **Edit** overrides the display name, category or tagline (defaults: repo name, first topic or language, repo description).
- **Curate** copies a repo into the Projects tab so you can add screenshots, a case study and translations. A curated project linked to a repo (same GitHub URL, or same slug as the repo name) is merged with it instead of appearing twice — hiding the repo hides that project too.

Choices are saved to `data/github.json`. Each Studio sync also writes `data/github-cache.json`, used as a fallback if GitHub can't be reached at build time — commit it.

Optional: set `GITHUB_TOKEN` to raise the API rate limit.

## Studio

Open **/studio** while running `npm run dev`:

- **Projects** — curated projects: images (first is the cover), copy, stack, links, *Featured*, *Spotlight* (shows in Deep dives), *Coming soon*, FR/AR translations.
- **GitHub** — see above.
- **Profile** — name, roles, availability, socials, bio/statement, stats, services, process, capabilities.

The Studio's write APIs are disabled in production unless `ENABLE_STUDIO=true`. Edit locally, commit `data/` + `public/projects/`, redeploy.

## Project structure

```
app/(site)/page.tsx      # fetches profile + merged projects (revalidate: 1h)
app/api/github/          # repo list + selection for the Studio
components/robot.tsx     # IURY: the rigged, animated SVG robot
components/iury-context  # what IURY says/does: section narration + reactions
components/stage.tsx     # sticky IURY pane, nav, mobile companion
components/modules.tsx   # intro, about, skills, contact
components/work-gallery  # GitHub-synced projects grid + modal
components/deep-dives    # spotlight case studies
lib/github.ts            # GitHub fetch, config, cache (server)
lib/repos.ts             # repo → project merge rules (shared)
data/                    # profile.json, projects.json, github.json
```

## Customizing

- **Colours & type:** `app/globals.css` (`@theme`).
- **IURY's poses:** the `RIGS` table in `components/robot.tsx` (joint angles, eyelids, bounce).
- **What IURY says:** `lib/i18n.ts` (`*.note`, `iury.*` keys) in all three languages.
