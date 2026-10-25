import type { MetadataRoute } from 'next';
import { MetadataBase } from '@/lib/route-metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', MetadataBase).toString(),
  };
}
