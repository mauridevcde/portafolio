import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mauriciogonzalez.dev',
  integrations: [
    svelte(),
    sitemap({
      serialize(item) {
        return { ...item, lastmod: new Date().toISOString() };
      },
    }),
  ],
  output: 'static',
  trailingSlash: 'always',
});
