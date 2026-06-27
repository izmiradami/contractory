import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AppProviders } from '@/components/providers/app-providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default:  'Contractory',
    template: '%s · Contractory',
  },
  description:
    'The Developer Operating System for Arc. Deploy, manage and interact with smart contracts on the Arc blockchain.',
  keywords: ['Arc', 'blockchain', 'smart contracts', 'USDC', 'developer tools', 'ERC20', 'NFT'],
  authors:  [{ name: 'Contractory Contributors' }],
  creator:  'Contractory',
  openGraph: {
    type:        'website',
    locale:      'en_US',
    siteName:    'Contractory',
    title:       'Contractory · Developer OS for Arc',
    description: 'Deploy, manage and interact with smart contracts on the Arc blockchain.',
  },
  twitter: {
    card:  'summary_large_image',
    title: 'Contractory',
  },
  robots: {
    index:  true,
    follow: true,
  },
  icons: {
    icon:     '/logo.png',
    shortcut: '/logo.png',
    apple:    '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor:  '#0d0e14',
  colorScheme: 'dark light',
  width:       'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background-primary text-text-primary antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}