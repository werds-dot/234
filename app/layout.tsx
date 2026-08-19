import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ConversationProvider } from '@/lib/conversation-store'
import { BackgroundProvider } from '@/lib/background-store'
import { BackgroundLayer } from '@/components/background-layer'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: '液态磁体球 | 声音驱动的交互体',
  description: '一个随声音与文字实时变形的液态磁体球，支持麦克风输入与语音合成。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh" className={`bg-background ${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <BackgroundProvider>
          <BackgroundLayer />
          <ConversationProvider>{children}</ConversationProvider>
        </BackgroundProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
