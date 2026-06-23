import { Metadata } from 'next'
import { Cinzel, IM_Fell_English } from 'next/font/google'
import '../styles/globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/common/navbar'
import Footer from '@/components/common/footer'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const imFellEnglish = IM_Fell_English({
  subsets: ['latin'],
  variable: '--font-im-fell',
  weight: '400',
  display: 'swap',
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
        className={`${cinzel.variable} ${imFellEnglish.variable}`}
      >
        <body className="bg-[#0a0805] text-[#e8dcc8] ">
          <Navbar />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
