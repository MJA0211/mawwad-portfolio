import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { profile } from './portfolio.config.ts';

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  );

function contactLinks(style: 'compact' | 'rows') {
  return (['github', 'linkedin', 'email'] as const)
    .map((key) => {
      const label = { github: 'GitHub', linkedin: 'LinkedIn', email: 'Email' }[key];
      const value = profile[key];
      const description =
        key === 'github'
          ? 'Explore the source'
          : key === 'linkedin'
            ? 'Connect with me'
            : (value ?? 'Email');
      if (!value)
        return `<span class="contact-link pending ${style}" aria-disabled="true"><span>${label}</span><span class="contact-detail">Link to be added</span><span class="link-arrow" aria-hidden="true">—</span></span>`;
      if (key !== 'email' && !value.startsWith('https://'))
        throw new Error(`${key} must be an HTTPS URL`);
      if (key === 'email' && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value))
        throw new Error('Invalid public email');
      const url = key === 'email' ? `mailto:${value}` : value;
      const external = key === 'email' ? '' : ' target="_blank" rel="noopener noreferrer"';
      return `<a class="contact-link ${style}" href="${escape(url)}"${external}><span>${label}</span><span class="contact-detail">${escape(description)}</span><span class="link-arrow" aria-hidden="true">↗</span></a>`;
    })
    .join('\n');
}

export default defineConfig({
  root: 'site',
  plugins: [
    {
      name: 'portfolio-profile',
      transformIndexHtml(html) {
        const origin = profile.siteUrl ? new URL(profile.siteUrl).origin : null;
        const canonical = origin
          ? `<link rel="canonical" href="${escape(origin)}/"><meta property="og:url" content="${escape(origin)}/">`
          : '';
        return html
          .replaceAll('{{contacts:compact}}', contactLinks('compact'))
          .replaceAll('{{contacts:rows}}', contactLinks('rows'))
          .replaceAll('{{canonical}}', canonical)
          .replaceAll('{{social-image}}', `${origin ?? ''}/social-preview.png`);
      },
    },
  ],
  build: { outDir: '../dist', emptyOutDir: true },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [
        fileURLToPath(new URL('./site', import.meta.url)),
        fileURLToPath(new URL('./node_modules', import.meta.url)),
      ],
    },
  },
  preview: { port: 4173, strictPort: true },
});
