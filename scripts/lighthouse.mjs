import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:net';

const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const browser = await chromium.launch({
  args: [`--remote-debugging-port=${port}`],
});
try {
  await mkdir('.local', { recursive: true });
  for (const mode of ['mobile', 'desktop']) {
    const result = await lighthouse(
      'http://127.0.0.1:4173/',
      {
        port,
        logLevel: 'error',
        output: ['json', 'html'],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      mode === 'desktop' ? desktopConfig : undefined,
    );
    if (!result) throw new Error('Lighthouse returned no report');
    await writeFile(`.local/lighthouse-${mode}.json`, result.report[0]);
    await writeFile(`.local/lighthouse-${mode}.html`, result.report[1]);
    console.log(
      JSON.stringify({
        mode,
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([name, category]) => [
            name,
            category.score * 100,
          ]),
        ),
        failed: Object.values(result.lhr.audits)
          .filter((a) => a.score !== null && a.score < 0.9 && a.details)
          .map((a) => ({ id: a.id, title: a.title, display: a.displayValue })),
      }),
    );
  }
} finally {
  await browser.close();
}
