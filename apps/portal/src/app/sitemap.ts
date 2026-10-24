import type { MetadataRoute } from 'next';
import { MetadataBase } from '@/lib/route-metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/resources', '/settings/woven-realms'].map((path) => ({
    url: new URL(path, MetadataBase).toString(),
  }));
}
