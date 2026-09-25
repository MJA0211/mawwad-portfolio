import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const font = await readFile('site/public/fonts/ibm-plex-mono-latin.woff2');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
    @font-face{font-family:Plex;src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2');font-weight:400}
    *{box-sizing:border-box}body{margin:0;background:#0b0e12;color:#e2e9f1;font-family:Plex,monospace;padding:65px 75px;width:1200px;height:630px;border-top:3px solid #39d9bf}
    header{display:flex;align-items:center;justify-content:space-between;font-size:15px;color:#9eacbc}.mark{font-size:32px;letter-spacing:-2px}.accent{color:#39d9bf}
    h1{font-size:75px;letter-spacing:-4px;font-weight:400;margin:80px 0 25px;line-height:1.15}p{font-size:24px;margin:0;color:#9eacbc}footer{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #2a3542;margin-top:85px;padding-top:24px;font-size:16px;color:#f0bd80}.work{display:flex;gap:36px}.status{color:#9eacbc;font-size:13px}
  </style></head><body><header><span class="mark">ma<span class="accent">.</span></span><span>SOFTWARE ENGINEER · UNIVERSITY OF MARYLAND</span></header><h1>Muhammed Awwad<span class="accent">.</span></h1><p>Building software with AI, data, and automation.</p><footer><div class="work"><span>AutoValue <span class="accent">AI</span></span><span>FailureLab</span><span>EICC</span></div><span class="status">Active engineering projects</span></footer></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'site/public/social-preview.png' });
  console.log('Generated 1200 × 630 social preview.');
} finally {
  await browser.close();
}
