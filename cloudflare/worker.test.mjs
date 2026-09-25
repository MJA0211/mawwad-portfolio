import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import worker from './worker.mjs';

const bytes = new TextEncoder().encode('0123456789abcdefghij');
const origin = 'https://mawwad.dev/videos/autovalue-demo.mp4';
function assets(status = 200) {
  return {
    ASSETS: {
      async fetch(request) {
        assert.equal(request.headers.get('Range'), null);
        const stream = new ReadableStream({
          start(controller) {
            for (let offset = 0; offset < bytes.length; offset += 3) {
              controller.enqueue(bytes.slice(offset, offset + 3));
            }
            controller.close();
          },
        });
        return new Response(request.method === 'HEAD' || status === 304 ? null : stream, {
          status,
          headers: {
            'Content-Length': String(bytes.length),
            'Content-Type': 'video/mp4',
            ETag: '"current"',
          },
        });
      },
    },
  };
}

for (const [range, expected, contentRange] of [
  ['bytes=2-6', '23456', 'bytes 2-6/20'],
  ['bytes=17-', 'hij', 'bytes 17-19/20'],
  ['bytes=-4', 'ghij', 'bytes 16-19/20'],
  ['bytes=18-999', 'ij', 'bytes 18-19/20'],
  ['bytes=-999', '0123456789abcdefghij', 'bytes 0-19/20'],
]) {
  test(`serves exact bytes across stream chunks: ${range}`, async () => {
    const response = await worker.fetch(
      new Request(origin, { headers: { Range: range } }),
      assets(),
    );
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('Content-Range'), contentRange);
    assert.equal(response.headers.get('Accept-Ranges'), 'bytes');
    assert.equal(await response.text(), expected);
  });
}

test('rejects an unsatisfiable range with the total length', async () => {
  const response = await worker.fetch(
    new Request(origin, { headers: { Range: 'bytes=20-' } }),
    assets(),
  );
  assert.equal(response.status, 416);
  assert.equal(response.headers.get('Content-Range'), 'bytes */20');
  assert.equal(await response.text(), '');
});

test('serves the full file for unsupported ranges and mismatched If-Range', async () => {
  for (const headers of [{ Range: 'bytes=0-1,4-5' }, { Range: 'bytes=0-2', 'If-Range': '"old"' }]) {
    const response = await worker.fetch(new Request(origin, { headers }), assets());
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '0123456789abcdefghij');
  }
});

test('honors a matching If-Range and preserves conditional responses', async () => {
  const request = new Request(origin, { headers: { Range: 'bytes=0-2', 'If-Range': '"current"' } });
  const response = await worker.fetch(request, assets());
  assert.equal(response.status, 206);
  assert.equal(await response.text(), '012');
  const cached = await worker.fetch(
    new Request(origin, { headers: { 'If-None-Match': '"current"' } }),
    assets(304),
  );
  assert.equal(cached.status, 304);
});

test('HEAD advertises range support without a response body', async () => {
  const response = await worker.fetch(
    new Request(origin, { method: 'HEAD', headers: { Range: 'bytes=0-2' } }),
    assets(),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Length'), '20');
  assert.equal(response.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(await response.text(), '');
});

test('leaves unrelated assets and missing files to the asset host', async () => {
  const response = new Response('asset response', { status: 404 });
  const env = { ASSETS: { fetch: async () => response } };
  assert.equal(await worker.fetch(new Request('https://mawwad.dev/'), env), response);
  assert.equal(await worker.fetch(new Request(origin), assets(404)).then((r) => r.status), 404);
});

test('serves the end of each built recording when ASSETS omits Content-Length', async () => {
  for (const name of ['autovalue-demo.mp4', 'failurelab-demo.webm', 'eicc-demo.mp4']) {
    const file = await readFile(new URL(`../dist/videos/${name}`, import.meta.url));
    const env = { ASSETS: { fetch: async () => new Response(file) } };
    const response = await worker.fetch(
      new Request(`https://mawwad.dev/videos/${name}`, { headers: { Range: 'bytes=-64' } }),
      env,
    );
    assert.equal(response.status, 206);
    assert.equal(
      response.headers.get('Content-Range'),
      `bytes ${file.length - 64}-${file.length - 1}/${file.length}`,
    );
    assert.deepEqual(
      new Uint8Array(await response.arrayBuffer()),
      new Uint8Array(file.subarray(-64)),
    );
  }
});
