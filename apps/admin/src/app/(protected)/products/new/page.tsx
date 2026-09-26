import { createAdminPageMetadata } from '@/app/pageMetadata';
import ProductsWorkspace from '@/features/store/_components/productsWorkspace/ProductsWorkspace.component';

export const metadata = createAdminPageMetadata({
  title: 'New Product',
  description: 'Create a new commerce product and prepare its pricing, presentation, and fulfillment rules.',
});

export default function NewProductPage() {
  return <ProductsWorkspace initialNew />;
}
