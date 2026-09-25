# Portfolio verification

Checked on September 23, 2026 against the redesigned production build.

## Build and code checks

- `npm run lint`: passed.
- `npm run build`: passed, including strict TypeScript checking.
- `npm test`: 23 tests passed.

The final build contains 3.20 KB of JavaScript, or 1.37 KB gzipped. Fonts are served locally. Engineering-note screenshots load lazily and retain their original bytes. Three optimized WebP video previews total 64,498 bytes. The first preview is preloaded with high priority. The MP4 and WebM recordings do not preload or autoplay.

## Browser checks

Playwright exercised widths of 1440, 1280, 1024, 768, 430, 390, and 375 pixels. Every width passed the horizontal-overflow checks with each case study expanded. Browser console errors and failed local requests were also checked.

The suite verifies architecture tabs, arrow-key navigation, native case-study disclosures, direct and repeated case-study hashes, contact links, internal anchors, document and image URLs, social metadata, and reduced motion. Screenshot dialogs close with Escape or their close button and return focus to the opening link. The scrollable image region is keyboard focusable. Primary content, links, and case studies remain usable without JavaScript.

All three videos decoded and played in Chromium. Tests verified increasing playback time, seeking to the midpoint, loaded WebVTT cues, entering and exiting fullscreen, and pausing the previous video when another starts. The recordings report durations of 105.367 seconds for AutoValue AI, 27.56 seconds for FailureLab, and 205.813 seconds for EICC. No recording request occurred before playback. Each text walkthrough passed a mobile overflow and accessibility check.

Axe found no violations in the selected WCAG A/AA and best-practice rules on desktop and mobile with all case studies expanded. The checks also cover the screenshot dialog and the experimental visible-label/accessibility-name rule. A desktop keyboard-focus issue in the image viewer was corrected before the final passing run.

The rendered desktop, tablet, and mobile views were also inspected visually. Captures are in `.local/verified-*.png`, with individual project and hero views alongside them.

## Lighthouse

| Production preview profile | Performance | Accessibility | Best practices | SEO |
| -------------------------- | ----------- | ------------- | -------------- | --- |
| Mobile                     | 100         | 100           | 100            | 100 |
| Desktop                    | 100         | 100           | 100            | 100 |

These are local measurements using Playwright's installed headless Chromium and Lighthouse's mobile configuration and explicit desktop configuration. They do not measure a deployed host. Lighthouse retains suggestions for image delivery, forced reflow, render-blocking CSS, and the request chain. Video preview compression and priority improved mobile performance from 78 to 100 in this local check. Full-size engineering screenshots remain unchanged.

Reports are saved as `.local/lighthouse-mobile.html`, `.local/lighthouse-desktop.html`, and the corresponding JSON files. Playwright's full report is in `playwright-report/index.html`.

## Content checks

All three projects have an Active Development label. Descriptions of current code are separate from In Development and Future sections. The supplied email and LinkedIn URL are present, and GitHub links match the project remotes.

The website copy was reviewed with the requested Humanizer skill. Project claims and recording sources are mapped to source files in `project-evidence.md`. The included recordings show project-owned demonstrations. The site does not bundle raw datasets, private model artifacts, runtime databases, credentials, or project environment files.

The user subsequently selected `mawwad.dev`. `portfolio.config.ts` now uses `https://mawwad.dev` for absolute social metadata and the canonical URL. The production build and lint checks passed after this configuration change. No registration or public deployment was performed. The local preview remains at http://127.0.0.1:4173; deployment instructions are in `deployment.md`.

## Public deployment check — September 24, 2026

The user registered the domain and uploaded the portfolio to [mawwad-portfolio.muhammedawwad12.workers.dev](https://mawwad-portfolio.muhammedawwad12.workers.dev). Chromium loaded the page over HTTPS with HTTP 200 and the expected title. All three recordings decoded and played, their WebVTT descriptions loaded, and their text walkthroughs returned HTTP 200. The contact links match the supplied email, LinkedIn, and GitHub details. Layouts at 1440px and 375px had no horizontal overflow. No page errors or failed asset responses were observed in that check.

The initial deployment failed video seeking: the players reported a zero-length seekable range and Range requests received the complete media file with HTTP 200. This was resolved in the final deployment below.

## Verified custom domains and video fix — September 24, 2026

Both `https://mawwad.dev` and `https://www.mawwad.dev` returned the portfolio with HTTP 200 and valid, trusted HTTPS certificates. The main domain retains the intended canonical URL. Live Chromium checks verified playback, midpoint seeking, and loaded descriptions for AutoValue AI, FailureLab, and EICC. Their text walkthroughs returned HTTP 200. Desktop and mobile checks at 1440px and 375px found no horizontal overflow or page errors; contact links matched the supplied addresses. The `www` host returned HTTP 206 with the correct Content-Range and 64-byte body for each recording's first 64 bytes.

`cloudflare/worker.mjs` now streams requested portions of the three recordings. The build records their exact file sizes because the internal ASSETS binding omits Content-Length. Eleven server regression checks passed, including suffix ranges against the actual built recordings. All eight browser video tests passed against the local Cloudflare runtime, including seeking and fullscreen. Build, lint, and Wrangler's deployment dry run passed. The deployed Worker version is `7d4c1620-0e39-4dee-819b-d502e61c16bf`.

Live results are saved in `.local/mawwad-live-verification.json` and `.local/www-live-verification.json`. Local Lighthouse results above remain local measurements and are not presented as scores for the public host.
