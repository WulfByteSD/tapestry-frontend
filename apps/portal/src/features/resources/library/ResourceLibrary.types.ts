export type PublicBook = {
  _id: string;
  key: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  kind: string;
  format: 'pdf';
  status: 'published';
  accessPolicy: 'public';
  presentation?: { coverImageUrl?: string; spineImageUrl?: string; thumbnailImageUrl?: string };
  currentRelease?: { version?: string; sizeBytes?: number; publishedAt?: string };
  tags?: string[];
  authors?: string[];
};
export type BookPage = { books: PublicBook[]; page: number; pages: number };
