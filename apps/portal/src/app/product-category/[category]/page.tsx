import { notFound, redirect } from 'next/navigation';
import { catalogueKinds, type CatalogueKind } from '@/features/catalogue/Catalogue.api';
export default async function ProductCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!catalogueKinds.includes(category as CatalogueKind)) notFound();
  redirect('/shop?kind=' + category);
}
