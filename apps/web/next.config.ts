import { config } from 'dotenv';
import { resolve } from 'path';
import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Load .env from monorepo root
config({ path: resolve(import.meta.dirname, '../../.env') });


const devOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',')
  : ['localhost'];
 
const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      'react-icons/lu',
      'react-icons/si',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      '@radix-ui/react-switch',
      '@tanstack/react-query'
    ],
    webVitalsAttribution: ['CLS', 'LCP']
  },
  modularizeImports: {
    '@radix-ui/react-*': {
      transform: '@radix-ui/react-{{member}}',
      skipDefaultConversion: true
    },
    'react-icons/lu': {
      transform: 'react-icons/lu/{{member}}',
      skipDefaultConversion: true
    },
    'react-icons/si': {
      transform: 'react-icons/si/{{member}}',
      skipDefaultConversion: true
    }
  },
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);