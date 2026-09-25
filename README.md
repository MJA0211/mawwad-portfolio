# Muhammed Awwad's portfolio

A static portfolio for AutoValue AI, FailureLab, and EICC. All three are presented as active engineering projects. The case studies distinguish implemented behavior, work in development, and future direction.

Website: [mawwad.dev](https://mawwad.dev). Source: [MJA0211/mawwad-portfolio](https://github.com/MJA0211/mawwad-portfolio).

The site uses a centered introduction, monospace typography, teal waveform background, and three project panels inspired by the supplied reference. Each project has a recorded demo with native playback and fullscreen controls, optional text descriptions, and a text walkthrough.

HTML and CSS provide the page, with a small TypeScript module for architecture tabs, screenshot dialogs, section navigation, case-study deep links, and pausing other videos when playback starts. Vite builds the static output. Main content, videos, and native case-study disclosures also work without JavaScript.

## Run locally

Use Node.js 22.12 or newer.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173.

```powershell
npm run lint
npm run build
npm run preview
```

The production preview is at http://127.0.0.1:4173. Deploy only `dist/` to a static host. The original project directories are separate applications and are not bundled or copied into the site.

## Editing

- `site/index.html`: website copy, project descriptions, status labels, diagrams, and case studies.
- `site/styles.css`: layout, typography, responsive styles, and reduced-motion behavior.
- `site/main.ts`: interactive enhancements.
- `portfolio.config.ts`: public GitHub, LinkedIn, email, and optional deployed site origin. Vite inserts contact links into the HTML at build time.
- `site/public/images/`: unchanged engineering screenshots and optimized WebP video previews.
- `site/public/videos/`: three local recordings, WebVTT tracks, and accessible text walkthroughs. Videos use `preload="none"` and do not autoplay.
- `site/public/documents/`: supporting project notes.
- `site/public/fonts/`: local WOFF2 fonts and their licenses.

The portfolio is live at [mawwad.dev](https://mawwad.dev) and [www.mawwad.dev](https://www.mawwad.dev), with valid HTTPS certificates. GoDaddy handles domain registration; Cloudflare Workers hosts the site. Live checks verified playback and seeking for all three videos, descriptions, text walkthroughs, contact links, and desktop/mobile layout. Use `npm run deploy` to publish future changes. See [the deployment guide](docs/deployment.md) for the setup.

Restart the dev server after editing `portfolio.config.ts`. Run `node scripts/generate-social.mjs` to regenerate the social image after editing its source. The script draws the portfolio title and project names; it does not fabricate a project screenshot.

Run `node scripts/optimize-posters.mjs` to regenerate video previews from the supplied recordings and EICC screenshot. It resizes them to at most 800 pixels wide and encodes WebP. The recordings and original screenshots remain unchanged.

## Verification

```powershell
npx playwright install chromium
npm run build
npm test
```

The 23 tests start a production preview. Stop any existing preview on port 4173 before running them. They cover widths of 1440, 1280, 1024, 768, 430, 390, and 375 pixels, expanded case studies, architecture tabs, keyboard interactions, image dialogs, links, metadata, reduced motion, and access without JavaScript. Video checks cover decoding, playback, seeking, fullscreen, description tracks, exclusive playback, and deferred loading. Axe checks desktop and mobile with expanded content, the screenshot dialog, and the text walkthroughs.

With a production preview already running, use `node scripts/lighthouse.mjs` for mobile and desktop Lighthouse reports. Reports and screenshots are written to `.local/`; Playwright's HTML report is in `playwright-report/`.

## Content sources

The implementation review is recorded in `docs/project-evidence.md`. Claims come from project source code, documentation, and the user's identity and development-status updates. EICC is maintained separately in [MJA0211/eicc](https://github.com/MJA0211/eicc); its portfolio section includes local architecture notes and a real application screenshot. Repository access follows its GitHub visibility settings.

Local resumes, job applications, environment files, build output, and the separate project source directories are excluded from this repository.

Visual research used [thavlik.dev](https://thavlik.dev/), following the user's request to match its layout and visual style. The implementation, waveform drawing, diagrams, and copy are original. Website prose was reviewed with the requested [Humanizer skill](https://github.com/blader/humanizer).
