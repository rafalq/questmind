export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  dashboard: '/dashboard',
  newCampaign: '/dashboard/campaigns/new',
  newCharacter: '/dashboard/characters/new',
  play: (campaignId: string, sessionId: string) =>
    `/dashboard/campaigns/${campaignId}/play?sessionId=${sessionId}`,
  about: '/about',
  worlds: '/worlds',
} as const
