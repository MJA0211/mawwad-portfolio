import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const widths = [1440, 1280, 1024, 768, 430, 390, 375];
const projects = ['autovalue', 'failurelab', 'eicc'];

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll<HTMLElement>('main *')]
      .filter(
        (node) =>
          node.getBoundingClientRect().width &&
          (node.getBoundingClientRect().right > innerWidth + 1 ||
            node.getBoundingClientRect().left < -1),
      )
      .map((node) => `${node.tagName}.${node.className}`)
      .slice(0, 10),
  }));
  expect(overflow.document, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.offenders).toEqual([]);
}

for (const width of widths) {
  test(`readable layout and working case studies at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1:4173'))
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Muhammed Awwad');
    await expect(page.locator('.development-status')).toHaveCount(3);
    await expect(page.locator('.pending')).toHaveCount(0);
    await noOverflow(page);
    for (const project of projects) {
      const study = page.locator(`#${project}-case-study`);
      await study.locator('summary').click();
      await expect(study).toHaveAttribute('open', '');
      await expect(study.locator('.state-label').first()).toHaveText('IN DEVELOPMENT');
      await expect(study.locator('.state-future')).toHaveText('FUTURE');
      await noOverflow(page);
      await study.locator('summary').click();
      await expect(study).not.toHaveAttribute('open');
    }
    await page.locator('#eicc-case-study summary').click();
    await expect(page.locator('.eicc-screenshot img')).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('.eicc-screenshot img')
          .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      )
      .toBeTruthy();
    await page.locator('#eicc-case-study summary').click();
    await page.locator('#home').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `.local/verified-${width}.png`, fullPage: true });
    await page.locator('.navigation a[href="#contact"]').click();
    await expect(page.locator('#contact-title')).toBeInViewport();
    await expect(page.locator('.navigation a[href="#contact"]')).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(errors).toEqual([]);
  });
}

test('architecture tabs support pointer and keyboard navigation', async ({ page }) => {
  await page.goto('/#autovalue-case-study');
  const inference = page.getByRole('tab', { name: 'Inference', exact: true });
  await inference.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Data pipeline' })).toBeFocused();
  await expect(page.locator('#panel-data')).toBeVisible();
  await expect(page.locator('#panel-inference')).toBeHidden();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Shadow learning' })).toBeFocused();
  await expect(page.locator('#panel-shadow')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(inference).toBeFocused();
  await page.getByRole('tab', { name: 'Shadow learning' }).click();
  await expect(page.locator('#panel-shadow')).toContainText('Synthetic outcome stream');
});

test('image viewer traps focus, closes with Escape, and restores focus', async ({ page }) => {
  await page.goto('/#eicc-case-study');
  const trigger = page.getByRole('link', {
    name: 'EICC / Integration workspace: enlarge dashboard screenshot',
  });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#dialog-image')).toHaveAttribute('src', /eicc-dashboard\.png$/);
  await expect(page.getByRole('button', { name: 'Close screenshot' })).toBeFocused();
  for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
  expect(
    await page.evaluate(
      () => document.activeElement === document.body || !!document.activeElement?.closest('dialog'),
    ),
  ).toBeTruthy();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveClass('dialog-open');
  await trigger.click();
  await page.getByRole('button', { name: 'Close screenshot' }).click();
  await expect(dialog).not.toBeVisible();
});

test('case-study deep links and keyboard disclosure work', async ({ page }) => {
  await page.goto('/#failurelab-case-study');
  const study = page.locator('#failurelab-case-study');
  await expect(study).toHaveAttribute('open', '');
  await study.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(study).not.toHaveAttribute('open');
  await page.keyboard.press('Space');
  await expect(study).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(study).not.toHaveAttribute('open');
  await page.locator('#failurelab .project-links a[href="#failurelab-case-study"]').click();
  await expect(study).toHaveAttribute('open', '');
});

test('contact, metadata, assets and internal links are valid', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Muhammed Awwad | Software Engineer');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://mawwad.dev/social-preview.png',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://mawwad.dev/',
  );
  await expect(page.locator('#contact a[href="mailto:moeawwad02@outlook.com"]')).toHaveCount(1);
  await expect(
    page.locator('#contact a[href="https://www.linkedin.com/in/muhammedawwadcs/"]'),
  ).toHaveCount(1);
  await expect(page.locator('#contact a[href="https://github.com/MJA0211"]')).toHaveCount(1);
  const anchors = await page
    .locator('a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
  for (const href of new Set(anchors)) {
    expect(href).not.toBe('#');
    if (href.startsWith('#')) await expect(page.locator(href)).toHaveCount(1);
    if (href.startsWith('/')) {
      const response = await request.get(href);
      expect(response.ok(), href).toBeTruthy();
      if (href.endsWith('-transcript.html')) {
        expect(response.headers()['content-type'], href).toContain('text/html');
        expect(await response.text()).toContain('demo walkthrough');
      } else {
        expect(response.headers()['content-type'], href).not.toContain('text/html');
      }
    }
  }
  const socialImage = await request.get('/social-preview.png');
  expect(socialImage.headers()['content-type']).toContain('image/png');
  const html = await (await request.get('/')).text();
  expect(html).not.toContain('{{');
  expect(html).not.toContain('Link to be added');
  expect(html).not.toContain('G:\\Desktop');
});

test('main content, contact links and case studies work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('#autovalue-case-study summary').click();
  await expect(page.locator('#autovalue-case-study .case-content')).toBeVisible();
  await expect(page.locator('#contact a[href^="mailto:"]')).toBeVisible();
  await context.close();
});

test('reduced motion disables scrolling animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('html').evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe(
    'auto',
  );
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});

for (const width of [1440, 390]) {
  test(`accessibility audit at ${width}px with expanded case studies`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    for (const project of projects) await page.locator(`#${project}-case-study summary`).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .options({ rules: { 'label-content-name-mismatch': { enabled: true } } })
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page
      .getByRole('link', { name: 'EICC / Integration workspace: enlarge dashboard screenshot' })
      .click();
    const modal = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      modal.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}
