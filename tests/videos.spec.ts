import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('recordings wait for playback and have accessible alternatives', async ({ page }) => {
  const mediaRequests: string[] = [];
  page.on('request', (request) => {
    if (/\.(mp4|webm)(\?|$)/.test(request.url())) mediaRequests.push(request.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('video')).toHaveCount(3);
  for (const video of await page.locator('video').all()) {
    await expect(video).toHaveAttribute('controls', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveAttribute('preload', 'none');
    await expect(video).not.toHaveAttribute('autoplay');
  }
  expect(mediaRequests).toEqual([]);
});

for (const [id, duration] of [
  ['autovalue', 105.367],
  ['failurelab', 27.56],
  ['eicc', 205.813],
] as const) {
  test(`${id} decodes, plays, seeks, loads descriptions, and supports fullscreen`, async ({
    page,
  }) => {
    await page.goto('/');
    const video = page.locator(`#${id}-video`);
    await video.evaluate(async (element: HTMLVideoElement) => {
      element.textTracks[0].mode = 'hidden';
      await element.play();
    });
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
      .toBeGreaterThan(0.15);
    const metadata = await video.evaluate((v: HTMLVideoElement) => ({
      duration: v.duration,
      width: v.videoWidth,
      height: v.videoHeight,
      error: v.error?.message,
    }));
    expect(metadata.duration).toBeCloseTo(duration, 1);
    expect(metadata.width).toBeGreaterThan(1000);
    expect(metadata.height).toBeGreaterThan(500);
    expect(metadata.error).toBeUndefined();
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.textTracks[0].cues?.length ?? 0))
      .toBeGreaterThan(0);
    await video.evaluate(async (v: HTMLVideoElement) => {
      v.pause();
      await new Promise<void>((resolve) => {
        v.addEventListener('seeked', () => resolve(), { once: true });
        v.currentTime = v.duration / 2;
      });
    });
    expect(await video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
    expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(
      duration / 2,
      1,
    );
    await video.evaluate((v: HTMLVideoElement) => v.requestFullscreen());
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.id))
      .toBe(`${id}-video`);
    await page.evaluate(() => document.exitFullscreen());
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test(`${id} text walkthrough is readable and accessible`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 844 });
    await page.goto(`/videos/${id}-transcript.html`);
    await expect(page.locator('h1')).toContainText('demo walkthrough');
    await expect(page.locator('ol li').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(result.violations).toEqual([]);
    await page.getByRole('link', { name: /Back to/ }).click();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  });
}

test('starting another project pauses the previous recording', async ({ page }) => {
  await page.goto('/');
  await page.locator('#autovalue-video').evaluate((v: HTMLVideoElement) => v.play());
  await page.locator('#failurelab-video').evaluate((v: HTMLVideoElement) => v.play());
  expect(await page.locator('#autovalue-video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(
    true,
  );
  expect(await page.locator('#failurelab-video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(
    false,
  );
});
