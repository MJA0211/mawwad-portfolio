import { stat, writeFile } from 'node:fs/promises';

const names = ['autovalue-demo.mp4', 'failurelab-demo.webm', 'eicc-demo.mp4'];
const entries = await Promise.all(
  names.map(async (name) => {
    const file = new URL(`../dist/videos/${name}`, import.meta.url);
    return [`/videos/${name}`, (await stat(file)).size];
  }),
);
await writeFile(
  new URL('../cloudflare/media-sizes.json', import.meta.url),
  `${JSON.stringify(Object.fromEntries(entries), null, 2)}\n`,
);
