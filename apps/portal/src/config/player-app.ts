export const canonicalPlayerAppOrigin = 'https://app.tapestry-ttrpg.com';

// Public, build-time override for an explicitly configured developer/staging app.
// Keep storefront canonicals and API origins separate from this destination.
export function resolvePlayerAppOrigin(value?: string) {
  if (!value?.trim()) return canonicalPlayerAppOrigin;
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password
      || url.pathname !== '/' || url.search || url.hash) return canonicalPlayerAppOrigin;
    return url.origin;
  } catch { return canonicalPlayerAppOrigin; }
}

export const playerAppOrigin = resolvePlayerAppOrigin(process.env.NEXT_PUBLIC_PLAYER_APP_ORIGIN);
const destination = (path: string) => new URL(path, playerAppOrigin).toString();

// These paths exist in apps/player. No library or product-claim route is assumed.
export const playerAppLinks = {
  home: destination('/'),
  login: destination('/login'),
  register: destination('/register'),
  createCharacter: destination('/characters/new'),
  storyweaverCampaigns: destination('/storyweaver/campaigns'),
} as const;
