import {
  Exo_2,
  IM_Fell_English,
  Rajdhani,
  Share_Tech_Mono,
} from 'next/font/google'

// Four families, one per register the app speaks in: Rajdhani for UI chrome,
// IM Fell English for narrative prose, Exo 2 for the sci-fi world and Share
// Tech Mono for anything that should read as machine output.
//
// `display: 'swap'` and an explicit `fallback` on all four on purpose: the
// session screen streams text token by token, and a blocking font swap mid
// stream is far more visible than a brief fallback face.

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
  display: 'swap',
  weight: '400',
  fallback: ['monospace'],
})

/**
 * Every font custom property the stylesheet expects, as one class string for
 * the <html> element. Adding a family is a change to this file alone — the
 * root layout never names them individually.
 */
export const fontVariables = [
  rajdhani.variable,
  imFellEnglish.variable,
  exo2.variable,
  shareTechMono.variable,
].join(' ')
