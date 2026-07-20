import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import { ClerkProvider } from '@clerk/nextjs'
import { Metadata } from 'next'
import {
  Rajdhani,
  IM_Fell_English,
  Exo_2,
  Share_Tech_Mono,
} from 'next/font/google'
import { Toaster } from 'sonner'
import '../styles/globals.css'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-rajdhani',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  fallback: ['sans-serif'],
})

const imFellEnglish = IM_Fell_English({
  subsets: ['latin'],
  variable: '--font-im-fell',
  weight: '400',
  display: 'swap',
  fallback: ['serif'],
})

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
  display: 'swap',
  fallback: ['sans-serif'],
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
  weight: '400',
  display: 'swap',
  fallback: ['monospace'],
})

export const metadata: Metadata = {
  title: 'QuestMind',
  description: 'AI-powered tabletop RPG Game Master',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${rajdhani.variable} ${imFellEnglish.variable} ${exo2.variable} ${shareTechMono.variable}`}
      >
        <body className="bg-bg-base text-text-primary flex min-h-dvh flex-col">
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var k='questmind-theme';var s=localStorage.getItem(k);var t=(s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.classList.toggle('light',t==='light');r.style.colorScheme=t;}catch(e){}})();`,
            }}
          />
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
