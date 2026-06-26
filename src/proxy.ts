import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { ROUTES } from './constants/routes'

const isPublicRoute = createRouteMatcher([
  ROUTES.home,
  ROUTES.signIn,
  ROUTES.signUp,
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
