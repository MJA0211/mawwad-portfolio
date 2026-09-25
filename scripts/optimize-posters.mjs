import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const [id, source, mime, time] of [
    ['autovalue', 'site/public/videos/autovalue-demo.mp4', 'video/mp4', 60],
    ['failurelab', 'site/public/videos/failurelab-demo.webm', 'video/webm', 17],
    ['eicc', 'site/public/images/eicc-dashboard.png', 'image/png', null],
  ]) {
    const bytes = await readFile(source);
    const encoded = await page.evaluate(
      async ({ data, mime, time }) => {
        const visual = document.createElement(time === null ? 'img' : 'video');
        if (time !== null) {
          visual.muted = true;
          visual.src = `data:${mime};base64,${data}`;
          await visual.play();
          visual.pause();
          await new Promise((resolve) => {
            visual.addEventListener('seeked', resolve, { once: true });
            visual.currentTime = time;
          });
        } else {
          visual.src = `data:${mime};base64,${data}`;
          await visual.decode();
        }
        const width = time !== null ? visual.videoWidth : visual.naturalWidth;
        const height = time !== null ? visual.videoHeight : visual.naturalHeight;
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(800, width);
        canvas.height = Math.round((canvas.width * height) / width);
        canvas.getContext('2d').drawImage(visual, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/webp', 0.86).split(',')[1];
      },
      { data: bytes.toString('base64'), mime, time },
    );
    const poster = Buffer.from(encoded, 'base64');
    await writeFile(`site/public/images/${id}-video-poster.webp`, poster);
    console.log(`${id}: ${poster.length} bytes`);
  }
} finally {
  await browser.close();
}
