import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'admin/src/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        'styled-components',
        '@strapi/admin/strapi-admin',
        '@strapi/design-system',
        '@strapi/icons',
        'react-intl',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          'styled-components': 'styled',
          '@strapi/admin/strapi-admin': 'StrapiAdmin',
          '@strapi/design-system': 'StrapiDesignSystem',
          '@strapi/icons': 'StrapiIcons',
          'react-intl': 'ReactIntl',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'admin/src'),
    },
  },
});
