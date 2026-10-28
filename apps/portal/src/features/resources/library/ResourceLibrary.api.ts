import type { BookPage, PublicBook } from './ResourceLibrary.types';

export class ResourceRequestError extends Error {
  constructor(public status: number) { super('The book library could not be reached.'); }
}
export function isPublicBook(value: unknown): value is PublicBook {
  if (!value || typeof value !== 'object') return false;
  const book = value as Partial<PublicBook>;
  return typeof book._id === 'string' && /^[a-f0-9]{24}$/i.test(book._id)
    && typeof book.title === 'string' && Boolean(book.title.trim())
    && typeof book.slug === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(book.slug)
    && book.status === 'published' && book.accessPolicy === 'public' && book.format === 'pdf';
}
export function resourceApiUrl(path: string) {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN;
  if (!origin) throw new ResourceRequestError(503);
  const url = new URL(origin);
  if (!['http:', 'https:'].includes(url.protocol)) throw new ResourceRequestError(503);
  return new URL('/api/v1/library/resources' + path, url).toString();
}
async function request(path: string): Promise<unknown> {
  const response = await fetch(resourceApiUrl(path), { signal: AbortSignal.timeout(10000), cache: 'no-store' });
  if (!response.ok) throw new ResourceRequestError(response.status);
  return response.json();
}
export async function fetchBookPage(page = 1): Promise<BookPage> {
  const params = new URLSearchParams({ pageNumber: String(page), pageLimit: '24', sortOptions: 'title', filterOptions: 'accessPolicy;public|format;pdf' });
  const response = await request('?' + params) as { payload?: unknown; metadata?: { pages?: number } };
  if (!Array.isArray(response.payload)) throw new ResourceRequestError(502);
  return { books: response.payload.filter(isPublicBook), page, pages: Math.max(page, Number(response.metadata?.pages) || page) };
}
export async function fetchBook(slug: string): Promise<PublicBook> {
  const response = await request('/' + encodeURIComponent(slug)) as { payload?: unknown };
  if (!isPublicBook(response.payload)) throw new ResourceRequestError(404);
  return response.payload;
}
export function bookStreamUrl(book: PublicBook) {
  // Public payloads deliberately omit provider and assetKey. The API owns delivery.
  return resourceApiUrl('/' + encodeURIComponent(book._id) + '/stream');
}
export function safeImageUrl(value?: string) {
  if (!value) return undefined;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined; }
  catch { return undefined; }
}
