import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { fetchProduct, CatalogueError } from '@/features/catalogue/Catalogue.api';
import { ProductShowcase } from '@/features/catalogue/Catalogue.component';
import { createRouteMetadata } from '@/lib/route-metadata';
const loadProduct = cache(fetchProduct);
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await loadProduct(slug);
    const metadata = createRouteMetadata({ title: product.title + ' | Tapestry', description: (product.summary || product.description || 'Explore this published title in the Tapestry catalogue. An account is required for acquisition.').slice(0, 180), path: '/product/' + product.slug, robots: { index: true, follow: true } });
    const socialImage = product.banner || product.primaryImage;
    if (socialImage) {
      metadata.openGraph = { ...metadata.openGraph, images: [{ url: socialImage, alt: product.title + (product.banner ? ' promotional artwork' : product.productType === 'book' ? ' cover' : ' product image') }] };
      metadata.twitter = { ...metadata.twitter, images: [socialImage] };
    }
    return metadata;
  } catch { return { title: 'Title unavailable | Tapestry', robots: { index: false, follow: false } }; }
}
export default async function ProductPage({ params }: Props) {
  const product = await loadProduct((await params).slug).catch(error => { if (error instanceof CatalogueError && error.status === 404) notFound(); throw error; });
  return <ProductShowcase product={product} />;
}
