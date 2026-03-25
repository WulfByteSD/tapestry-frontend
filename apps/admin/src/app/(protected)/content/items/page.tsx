import { createAdminPageMetadata } from '@/app/pageMetadata';
import ItemsListView from '@/views/content/items/ItemsView.component';

export const metadata = createAdminPageMetadata({
  title: 'Items',
  description: 'Open the item management route for setting-specific gear, rewards, and related gameplay records.',
});

export default async function ContentPage() {
  return <ItemsListView />;
}
