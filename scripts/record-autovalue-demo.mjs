// Start the real AutoValue frontend/API with its verified local RF05 bundle first.
// Use a disposable AUTOVALUE_PREDICTION_HISTORY_PATH for recording.
// node scripts/record-autovalue-demo.mjs [frontend URL] [output directory]
import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.argv[2] || 'http://127.0.0.1:5181';
const output = path.resolve(process.argv[3] || '.local/autovalue-demo-2026-10-01');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: output, size: { width: 1600, height: 900 } },
});
const startedAt = Date.now();
const page = await context.newPage();
const video = page.video();
const chapters = [];
const results = [];
const failures = [];
page.on('pageerror', (error) => failures.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
});
const elapsed = () => (Date.now() - startedAt) / 1000;
const pause = (seconds) => page.waitForTimeout(seconds * 1000);
function chapter(title, caption) {
  chapters.push({ start: elapsed(), title, caption });
  console.log(`${chapters.length}. ${title}`);
}
async function frame(locator, offset = 32) {
  await locator.evaluate((element, offset) => {
    element.ownerDocument.defaultView.scrollTo({
      top: element.getBoundingClientRect().top + element.ownerDocument.defaultView.scrollY - offset,
      behavior: 'smooth',
    });
  }, offset);
  await pause(1.2);
}
async function submit() {
  const response = page.waitForResponse(
    (response) => response.url().endsWith('/valuations') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Estimate vehicle' }).click();
  const received = await response;
  expect(received.ok()).toBe(true);
  const result = await received.json();
  expect(result.model_information.model_version).toBe('retail-rf05-v1');
  results.push(result);
  await expect(page.locator('.valuation-result')).toBeVisible();
  await frame(page.locator('.workspace'));
}

try {
  await page.goto(baseURL);
  await expect(page.locator('.api-status')).toContainText('API online');
  await expect(page.locator('.submit-button')).toBeEnabled({ timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await pause(1);
  const trimStart = elapsed();
  chapter(
    'AutoValue AI',
    'A working prototype for historical 2023 U.S. asking-price estimates. Recorded against the local API.',
  );
  await pause(5);

  chapter(
    'Enter a vehicle',
    'Select a 2020 Toyota Camry with 48,000 miles and a 90% prediction interval.',
  );
  await frame(page.locator('.workspace'));
  await page.getByRole('button', { name: /Sedan.*Toyota Camry/ }).click();
  await pause(5);

  chapter(
    'Estimate with RF05',
    'The API returns a price estimate and a calibrated range. These are historical asking prices.',
  );
  await submit();
  await pause(7);
  await page.screenshot({ path: path.join(output, 'valuation.png') });

  chapter(
    'Compare interval coverage',
    'Choose 95% coverage: the interval widens while the point estimate stays the same.',
  );
  await page.locator('select[name="coverage"]').selectOption('0.95');
  await pause(2);
  await submit();
  expect(results[1].predicted_value).toBe(results[0].predicted_value);
  expect(results[1].interval_width).toBeGreaterThan(results[0].interval_width);
  await pause(6);

  chapter(
    'Try another vehicle',
    'Estimate a certified 2021 Honda CR-V with 31,000 miles, using 90% coverage.',
  );
  await page.getByRole('button', { name: /SUV.*Honda CR-V/ }).click();
  await page.locator('select[name="coverage"]').selectOption('0.9');
  await pause(2);
  await submit();
  await pause(6);

  chapter(
    'Review saved estimates',
    'The API saves these requests in browser-scoped SQLite history. Three estimates are now listed.',
  );
  await expect(page.locator('.recent-list article')).toHaveCount(3);
  await frame(page.locator('.recent-section'), 180);
  await pause(6);

  chapter(
    'Inspect the model',
    'The engineering view identifies the frozen RF05 model and checks that its serving artifacts are ready.',
  );
  await page.getByRole('button', { name: 'ML engineering', exact: true }).click();
  await expect(page.locator('.serving-banner')).toContainText('Verified inference ready');
  await pause(6);

  chapter(
    'Read the holdout results',
    'On 27,589 held-out observations, mean absolute error is $10,575. The model has material limitations.',
  );
  await frame(page.locator('[aria-labelledby="batch-title"]'), -40);
  await pause(7);

  chapter(
    'Check interval calibration',
    'The nominal 90% interval reached 89.10% empirical coverage. Wider intervals carry a cost in precision.',
  );
  await frame(
    page
      .locator('.engineering-section')
      .filter({ has: page.getByRole('heading', { name: 'Coverage shown honestly.' }) }),
    -40,
  );
  await pause(7);

  chapter(
    'Follow the architecture',
    'RF05 serves the estimate. River learning and external-source experiments run in separate paths.',
  );
  await frame(
    page
      .locator('.engineering-section')
      .filter({ has: page.getByRole('heading', { name: 'Three paths. Clear boundaries.' }) }),
    -40,
  );
  await pause(7);

  chapter(
    'Review experiment decisions',
    'The experiment log records accepted, rejected, and research-only results.',
  );
  await frame(page.locator('.decision-table'), 205);
  await pause(6);

  chapter(
    'Replay a synthetic shift',
    'Replay 600 simulated mileage-shift events. This shows recorded research results, separate from the serving model.',
  );
  await frame(page.locator('.river-section'), -45);
  await page.getByRole('button', { name: 'Mileage shift', exact: true }).click();
  await pause(2);
  await page.getByRole('button', { name: 'Replay 600 events', exact: true }).click();
  await expect(page.locator('.river-readout')).toContainText('600 / 600', { timeout: 10000 });
  await expect(page.locator('.river-readout')).toContainText('1 detected');
  await pause(7);
  await page.screenshot({ path: path.join(output, 'river.png') });
  expect(failures).toEqual([]);
  const trimEnd = elapsed();
  await context.close();
  const rawVideo = await video.path();
  await writeFile(
    path.join(output, 'capture.json'),
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        baseURL,
        rawVideo,
        trimStart,
        trimEnd,
        viewport: { width: 1600, height: 900 },
        chapters,
        results,
        assertions: [
          'real RF05 API responses',
          'wider 95% interval',
          'three saved estimates',
          'completed synthetic replay',
          'no page or HTTP errors',
        ],
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`Saved ${chapters.length} chapters to ${output}`);
} finally {
  await browser.close();
}
