import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mauridevcde.pro',
  integrations: [svelte(), sitemap()],
  output: 'static',
  trailingSlash: 'always',
});
