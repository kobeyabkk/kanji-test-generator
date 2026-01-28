import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: 'Context-Kanji | 漢字学習AIアプリ',
  description: '文脈の中で漢字を学ぶ - プログラミングのKOBEYA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} ${notoSansJP.variable}`}>
        {children}
      </body>
    </html>
  )
}
