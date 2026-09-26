import { createAdminPageMetadata } from '@/app/pageMetadata';
import ProductsWorkspace from '@/features/store/_components/productsWorkspace/ProductsWorkspace.component';

export const metadata = createAdminPageMetadata({
  title: 'Edit Product',
  description: 'Update a commerce product record, its storefront visibility, and the connected fulfillment grants.',
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductsWorkspace initialProductId={id} />;
}
