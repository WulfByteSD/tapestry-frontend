import { fetchCatalogue } from '@/features/catalogue/Catalogue.api';
import type { MetadataRoute } from 'next';
import { MetadataBase } from '@/lib/route-metadata';
import { fetchBookPage } from '@/features/resources/library/ResourceLibrary.api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = new Set(['/', '/shop', '/resources', '/settings/woven-realms']);
  try {
    let page = 1;
    while (page <= 50) {
      const result = await fetchBookPage(page);
      for (const book of result.books) paths.add('/resources/books/' + book.slug);
      if (page >= result.pages) break;
      page++;
    }
  } catch { /* The public landing pages remain discoverable during a library outage. */ }
  try {
    for (let page = 1; page <= 50; page++) {
      const result = await fetchCatalogue(page);
      for (const product of result.products) paths.add('/product/' + product.slug);
      if (page >= result.pages) break;
    }
  } catch { /* Keep public landing pages when the catalogue is unavailable. */ }
  return [...paths].map((path) => ({ url: new URL(path, MetadataBase).toString() }));
}
