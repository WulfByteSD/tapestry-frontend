const CATEGORY_ICONS: Record<string, string> = {
  weapon: 'https://i.postimg.cc/4yT9XJCG/Crossed_sword_and_battleaxe_in_fantasy.png',
  armor: 'https://i.postimg.cc/yxzZ7VqB/Medieval_armor_in_glowing_arc_frame.png',
  gear: 'https://i.postimg.cc/TPnyCpNN/Chat_GPT_Image_Apr_13_2026_04_52_11_PM.png',
  consumable: 'https://i.postimg.cc/GpvBqHg7/Chat_GPT_Image_Apr_13_2026_04_55_14_PM.png',
  tool: 'https://i.postimg.cc/qvPhs8Qd/Chat_GPT_Image_Apr_13_2026_05_14_26_PM.png',
  quest: 'https://i.postimg.cc/LsjqNnQ0/Chat_GPT_Image_Apr_13_2026_05_21_14_PM.png',
  other: 'https://i.postimg.cc/TPnyCpNs/Chat_GPT_Image_Apr_13_2026_05_24_13_PM.png',
};

const FALLBACK_ICON = CATEGORY_ICONS.other;

export function getCategoryIconUrl(category?: string | null): string {
  if (!category) return FALLBACK_ICON;
  return CATEGORY_ICONS[category] ?? FALLBACK_ICON;
}
