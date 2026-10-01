# Muhammed Awwad's portfolio

My portfolio for AutoValue AI, FailureLab, and EICC. All three projects are in development. Each has a recorded demo and notes on its implementation, tests, and remaining work.

Website: [mawwad.dev](https://mawwad.dev). Source: [MJA0211/mawwad-portfolio](https://github.com/MJA0211/mawwad-portfolio).

The page has a centered introduction, monospace text, a teal waveform background, and a panel for each project. Each project has a recorded demo with native playback and fullscreen controls, optional text descriptions, and a text walkthrough.

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

Only the owner has write access to this repository. Visitors can fork it and
propose a change through a pull request; merging requires the owner's review.

- `site/index.html`: website copy, project descriptions, status labels, diagrams, and case studies.
- `site/styles.css`: layout, typography, responsive styles, and reduced-motion behavior.
- `site/main.ts`: interactive enhancements.
- `portfolio.config.ts`: public GitHub, LinkedIn, email, and optional deployed site origin. Vite inserts contact links into the HTML at build time.
- `site/public/images/`: unchanged engineering screenshots and optimized WebP video previews.
- `site/public/videos/`: three local recordings, WebVTT tracks, and accessible text walkthroughs. Videos use `preload="none"` and do not autoplay.
- `site/public/documents/`: supporting project notes.
- `site/public/fonts/`: local WOFF2 fonts and their licenses.

The portfolio is live at [mawwad.dev](https://mawwad.dev) and [www.mawwad.dev](https://www.mawwad.dev), with valid HTTPS certificates. GoDaddy handles domain registration; Cloudflare Workers hosts the site. Live checks verified playback and seeking for all three videos, descriptions, text walkthroughs, contact links, and desktop/mobile layout. Use `npm run deploy` to publish future changes. See [the deployment guide](docs/deployment.md) for the setup.

Restart the dev server after editing `portfolio.config.ts`. Run `node scripts/generate-social.mjs` to regenerate the social image after editing its source. The script draws the portfolio title and project names.

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

The implementation review is recorded in `docs/project-evidence.md`. Project descriptions come from the source code and documentation, with development status supplied by Muhammed Awwad. EICC is maintained in [MJA0211/eicc](https://github.com/MJA0211/eicc). Its portfolio section links to the source, architecture notes, and an application screenshot.

Local resumes, job applications, environment files, build output, and the separate project source directories are excluded from this repository.

The layout takes inspiration from [thavlik.dev](https://thavlik.dev/). The implementation, waveform drawing, diagrams, and copy are original. I used [Humanizer](https://github.com/blader/humanizer) and [Stop Slop](https://github.com/hardikpandya/stop-slop) to edit the writing.
