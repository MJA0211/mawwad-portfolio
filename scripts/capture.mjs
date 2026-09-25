import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#home').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.local/desktop-hero.png' });
  await page.screenshot({ path: '.local/desktop-final.png', fullPage: true });
  await page.locator('#autovalue').screenshot({ path: '.local/autovalue-final.png' });
  await page.locator('#failurelab').screenshot({ path: '.local/failurelab-final.png' });
  await page.locator('#eicc').screenshot({ path: '.local/eicc-final.png' });
  for (const width of [768, 390, 375]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('#home').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `.local/hero-${width}.png` });
    await page.locator('#autovalue').screenshot({ path: `.local/autovalue-${width}.png` });
  }
  for (const project of ['autovalue', 'failurelab', 'eicc'])
    await page.locator(`#${project}-case-study summary`).click();
  await writeFile('.local/website-copy.txt', await page.locator('body').innerText());
  console.log('Captured desktop, project, tablet and mobile views; exported full copy for review.');
} finally {
  await browser.close();
}
