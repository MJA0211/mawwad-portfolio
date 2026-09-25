// The asset host currently ignores Range headers. Serve the requested portion
// of a recording so native video controls can seek without buffering it all.
import mediaSizes from './media-sizes.json' with { type: 'json' };

function portion(body, start, end) {
  const reader = body.getReader();
  let position = 0;
  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) throw new Error('Recording ended before the requested range');
        const next = position + value.byteLength;
        if (next > start) {
          controller.enqueue(
            value.subarray(
              Math.max(0, start - position),
              Math.min(value.byteLength, end + 1 - position),
            ),
          );
        }
        position = next;
        if (position > end) {
          controller.close();
          await reader.cancel();
          return;
        }
        if (next > start) return;
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (!Object.hasOwn(mediaSizes, path) || !['GET', 'HEAD'].includes(request.method)) {
      return env.ASSETS.fetch(request);
    }
    const assetRequest = new Request(request);
    assetRequest.headers.delete('Range');
    assetRequest.headers.delete('If-Range');
    const asset = await env.ASSETS.fetch(assetRequest);
    if (asset.status !== 200) return asset;
    // ASSETS omits Content-Length internally, so the build records the exact
    // sizes of the video files deployed alongside this Worker.
    const length = asset.headers.get('Content-Length') ?? mediaSizes[path];
    const size = Number(length);
    if (
      length === null ||
      !Number.isSafeInteger(size) ||
      size < 0 ||
      asset.headers.has('Content-Encoding')
    ) {
      return asset;
    }
    const headers = new Headers(asset.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Length', String(size));
    const full = () => new Response(asset.body, { status: 200, headers });
    const range = request.headers.get('Range');
    if (request.method === 'HEAD' || !range) return full();

    const validator = request.headers.get('If-Range');
    if (validator) {
      const etagMatches = !validator.startsWith('W/') && validator === asset.headers.get('ETag');
      const modified = asset.headers.get('Last-Modified');
      const dateMatches =
        modified &&
        Number.isFinite(Date.parse(validator)) &&
        Date.parse(validator) === Date.parse(modified);
      if (!etagMatches && !dateMatches) return full();
    }
    // Browsers request a single range. Unsupported range formats receive the
    // full representation, as permitted by HTTP, rather than an invalid 206.
    const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
    if (!match || (!match[1] && !match[2])) return full();
    const suffix = !match[1];
    const start = suffix ? Math.max(0, size - Number(match[2])) : Number(match[1]);
    const end = suffix || !match[2] ? size - 1 : Math.min(size - 1, Number(match[2]));
    if (start >= size || end < start || size === 0) {
      await asset.body?.cancel();
      headers.set('Content-Range', `bytes */${size}`);
      headers.set('Content-Length', '0');
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(portion(asset.body, start, end), { status: 206, headers });
  },
};
