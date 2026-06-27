export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  dashboard: '/dashboard',
  newCampaign: '/dashboard/campaigns/new',
  newCharacter: '/dashboard/characters/new',
  play: (campaignId: string) => `/dashboard/campaign/${campaignId}/play`,
} as const
