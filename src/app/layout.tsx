import Footer from '@/components/common/footer'
import Navbar from '@/components/common/navbar'
import ThemeScript from '@/components/common/theme-script'
import { fontVariables } from '@/styles/fonts'
import { ClerkProvider } from '@clerk/nextjs'
import { Metadata } from 'next'
import { Toaster } from 'sonner'
import '../styles/globals.css'

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
      <html lang="en" suppressHydrationWarning className={fontVariables}>
        <body className="bg-bg-base text-text-primary flex min-h-dvh flex-col">
          <ThemeScript />
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
