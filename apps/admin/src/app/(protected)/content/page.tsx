import { createAdminPageMetadata } from "@/app/pageMetadata";
import ContentStudio from "@/features/content/_components/contentStudio/ContentStudio";

export const metadata = createAdminPageMetadata({
  title: "Content Studio",
  description: "Organize setting content, lore structure, and gameplay records from the main storyweaver workspace.",
});

export default function ContentPage() {
  return <ContentStudio />;
}
