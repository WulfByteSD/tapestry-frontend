import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Catalogue } from '@/features/catalogue/Catalogue.component';
import { catalogueQuery, catalogueHref, fetchCatalogue } from '@/features/catalogue/Catalogue.api';
import { createRouteMetadata } from '@/lib/route-metadata';
type Props = { searchParams: Promise<{ q?: string | string[]; kind?: string | string[]; page?: string | string[] }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = catalogueQuery(await searchParams);
  return createRouteMetadata({ title: 'Catalogue | Tapestry', description: 'Explore Tapestry books, adventures and tools. Search the published catalogue by category and find your next story.', path: catalogueHref(query), robots: { index: !query.q && !query.kind && query.page === 1, follow: true } });
}
export default async function CataloguePage({ searchParams }: Props) {
  const query = catalogueQuery(await searchParams);
  const result = await fetchCatalogue(query);
  if (result.page !== query.page) redirect(catalogueHref(result.query));
  return <Catalogue {...result} />;
}
