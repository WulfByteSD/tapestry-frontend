export const portalRoutes = {
  home: '/',
  shop: '/shop',
  cart: '/cart',
  checkout: '/checkout',
  getPlayersGuide: '/get-players-guide',
  resources: {
    players: '/resources/tapestry-players-guide',
    storyweavers: '/resources/tapestry-storyweavers',
    adversaries: '/resources/tapestry-adversaries',
    unwoven: '/resources/tapestry-unwoven',
  },
  settings: {
    wovenRealms: '/settings/woven-realms',
  },
  productCategory: {
    dial: '/product-category/dial',
  },
} as const;
