import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,

  // Required for wagmi / viem browser-only modules
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },

  // Security headers
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return []
    }
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://rpc.testnet.arc.network https://*.arc.network https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://*.reown.com wss://*.reown.com https://explorer-api.walletconnect.com https://api.coingecko.com https://*.merkle.io",
              "frame-src 'none'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // Environment validation at build time
  env: {
    NEXT_PUBLIC_APP_NAME: 'Contractory',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },

  // Experimental features for Next.js 15
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
