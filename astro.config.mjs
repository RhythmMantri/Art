import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: process.env.SITE_URL || 'https://shagun-mehendi.pages.dev',
  output: 'static',
  integrations: [react()],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
