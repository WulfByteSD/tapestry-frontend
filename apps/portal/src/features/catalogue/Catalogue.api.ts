import type { ProductType } from '@tapestry/types';

export const catalogueKinds = ['guide', 'module', 'dial', 'quickstart', 'reference', 'map', 'printable', 'other', 'physical'] as const;
export type CatalogueKind = typeof catalogueKinds[number];
export type CatalogueQuery = { q: string; kind: CatalogueKind | ''; page: number };
export type CatalogueProduct = {
  id: string; slug: string; title: string; subtitle?: string; summary?: string; description?: string;
  pricing: { type: 'free' | 'one_time'; currency: 'USD'; amountCents: number };
  format: 'digital' | 'physical' | 'mixed'; kinds: CatalogueKind[];
  productType?: ProductType; banner?: string; primaryImage?: string; gallery: { url: string; alt: string; caption?: string }[];
};
export type CataloguePage = { products: CatalogueProduct[]; page: number; pages: number; total: number; query: CatalogueQuery };
export class CatalogueError extends Error {
  constructor(public status: number) { super('The catalogue could not be reached.'); }
}
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {};
const text = (value: unknown, max = 12000) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined;
const isId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
export function catalogueImage(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.toString() : undefined; } catch { return undefined; }
}
export function publicProduct(value: unknown): CatalogueProduct | undefined {
  const item = record(value);
  if (item.status !== 'published' || item.visibility !== 'public' || !isId(item._id)
    || typeof item.slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(item.slug) || !text(item.title, 240)) return undefined;
  const price = record(item.pricing); const fulfillment = record(item.fulfillment);
  if (!['free', 'one_time'].includes(String(price.type)) || price.currency !== 'USD' || typeof price.amountCents !== 'number'
    || !Number.isSafeInteger(price.amountCents) || (price.type === 'free' ? price.amountCents !== 0 : price.amountCents <= 0)
    || !['digital', 'physical', 'mixed'].includes(String(fulfillment.kind))) return undefined;
  const art = record(item.presentation);
  const gallery = Array.isArray(art.gallery) ? art.gallery.flatMap((entry: unknown) => {
    const image = record(entry); const url = catalogueImage(image.url);
    return url ? [{ url, alt: text(image.alt, 300) || String(item.title) + ' preview', caption: text(image.caption, 500) }] : [];
  }) : [];
  const productType = ['book', 'merchandise', 'other'].includes(String(item.productType)) ? item.productType as ProductType : undefined;
  // A role is never guessed from category, delivery, or image aspect ratio.
  // Unknown future types use neutral presentation but do not reinterpret legacy art.
  const primaryImage = productType === 'book' ? catalogueImage(art.coverImageUrl)
    : catalogueImage(art.productImageUrl) || (item.productType == null ? catalogueImage(art.imageUrl) || catalogueImage(art.coverImageUrl) : undefined);
  // Resource cover/spine/asset keys never enter these public product props.
  return { id: item._id, slug: item.slug, title: text(item.title, 240)!, subtitle: text(item.subtitle, 500), summary: text(item.summary, 1000), description: text(item.description),
    pricing: { type: price.type as 'free' | 'one_time', currency: 'USD', amountCents: price.amountCents },
    format: fulfillment.kind as CatalogueProduct['format'], kinds: [],
    productType, banner: catalogueImage(art.bannerImageUrl), primaryImage, gallery };
}
export function cataloguePageNumber(value: unknown): number {
  const number = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 1;
  return Number.isSafeInteger(number) && number >= 1 && number <= 1000 ? number : 1;
}
export function catalogueQuery(value: RecordValue): CatalogueQuery {
  return { q: text(value.q, 120) || '', kind: catalogueKinds.includes(value.kind as CatalogueKind) ? value.kind as CatalogueKind : '', page: cataloguePageNumber(value.page) };
}
export function catalogueHref(query: CatalogueQuery, page = query.page) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.kind) params.set('kind', query.kind);
  if (page > 1) params.set('page', String(page));
  return '/shop' + (params.size ? '?' + params : '');
}
export const kindLabel = (kind: string) => kind.charAt(0).toUpperCase() + kind.slice(1);
async function request(path: string, fetcher: typeof fetch): Promise<unknown> {
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN;
  if (!origin) throw new CatalogueError(503);
  let url: URL;
  try { url = new URL('/api/v1/' + path, origin); } catch { throw new CatalogueError(503); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new CatalogueError(503);
  try {
    const response = await fetcher(url, { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new CatalogueError(response.status);
    return await response.json();
  } catch (error) { throw error instanceof CatalogueError ? error : new CatalogueError(502); }
}
function pageData(value: unknown, limit: number) {
  const result = record(value); const meta = record(result.metadata);
  if (!Array.isArray(result.payload) || !Number.isSafeInteger(meta.totalCount) || (meta.totalCount as number) < 0
    || !Number.isSafeInteger(meta.pages) || meta.pages !== Math.ceil((meta.totalCount as number) / limit)) throw new CatalogueError(502);
  return { rows: result.payload as unknown[], total: meta.totalCount as number, pages: meta.pages as number };
}
// AdvFilters supports comma-separated $in strings, rather than JSON arrays.
const inclusion = (key: string, values: string[]) => key + ';' + JSON.stringify({ $in: values.join(',') });
type ResourceKind = { id: string; kind: CatalogueKind };
async function resourceKinds(filter: string, fetcher: typeof fetch): Promise<ResourceKind[]> {
  const output: ResourceKind[] = [];
  for (let page = 1; page <= 50; page++) {
    const params = new URLSearchParams({ pageNumber: String(page), pageLimit: '100', filterOptions: filter, sortOptions: '_id' });
    const result = pageData(await request('library/resources?' + params, fetcher), 100);
    if (result.pages > 50) throw new CatalogueError(503);
    for (const value of result.rows) {
      const item = record(value);
      if (item.status === 'published' && isId(item._id) && catalogueKinds.includes(item.kind as CatalogueKind) && item.kind !== 'physical') output.push({ id: item._id, kind: item.kind as CatalogueKind });
    }
    if (page >= result.pages) return output;
  }
  return output;
}
function grantIds(value: unknown): string[] {
  const grants = record(record(value).fulfillment).grants;
  return Array.isArray(grants) ? grants.flatMap(value => { const grant = record(value); return grant.type === 'resource' && isId(grant.resourceId) ? [grant.resourceId] : []; }) : [];
}
async function classify(rows: unknown[], fetcher: typeof fetch): Promise<CatalogueProduct[]> {
  const products = rows.map(publicProduct);
  if (products.some(product => !product) || new Set(products.map(product => product!.id)).size !== products.length) throw new CatalogueError(502);
  const ids = [...new Set(rows.flatMap(grantIds))];
  const resources: ResourceKind[] = [];
  for (let start = 0; start < ids.length; start += 80) resources.push(...await resourceKinds(inclusion('_id', ids.slice(start, start + 80)), fetcher));
  const kinds = new Map(resources.map(resource => [resource.id, resource.kind]));
  return products.map((product, index) => ({ ...product!, kinds: [...new Set(grantIds(rows[index]).flatMap(id => kinds.has(id) ? [kinds.get(id)!] : []))] }));
}
export async function fetchCatalogue(input: number | CatalogueQuery = 1, fetcher: typeof fetch = fetch): Promise<CataloguePage> {
  const query = typeof input === 'number' ? catalogueQuery({ page: String(input) }) : catalogueQuery({ ...input, page: String(input.page) });
  let filter = '';
  if (query.kind === 'physical') filter = inclusion('fulfillment.kind', ['physical', 'mixed']);
  else if (query.kind) {
    const resources = await resourceKinds('kind;' + query.kind, fetcher);
    if (!resources.length) return { products: [], page: 1, pages: 0, total: 0, query: { ...query, page: 1 } };
    // Classification lives on resources, joined through actual product grants.
    // Avoid oversized URLs; beyond this bound a native joined API filter is needed.
    if (resources.length > 150) throw new CatalogueError(503);
    filter = inclusion('fulfillment.grants.resourceId', resources.map(resource => resource.id));
  }
  const params = new URLSearchParams({ pageNumber: String(query.page), pageLimit: '12', sortOptions: 'title;_id' });
  if (query.q) params.set('keyword', query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (filter) params.set('filterOptions', filter);
  let result = pageData(await request('commerce/products?' + params, fetcher), 12);
  const page = Math.min(query.page, Math.max(1, result.pages));
  if (page !== query.page && result.total > 0) {
    params.set('pageNumber', String(page)); result = pageData(await request('commerce/products?' + params, fetcher), 12);
  }
  const expected = Math.max(0, Math.min(12, result.total - (page - 1) * 12));
  if (result.rows.length !== expected) throw new CatalogueError(502);
  return { products: await classify(result.rows, fetcher), page, pages: result.pages, total: result.total, query: { ...query, page } };
}
export async function fetchProduct(slug: string, fetcher: typeof fetch = fetch): Promise<CatalogueProduct> {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new CatalogueError(404);
  const result = record(await request('commerce/products/slug/' + encodeURIComponent(slug), fetcher));
  const product = publicProduct(result.payload);
  if (!product || product.slug !== slug) throw new CatalogueError(404);
  return (await classify([result.payload], fetcher))[0];
}
export function productPrice(product: CatalogueProduct) {
  return product.pricing.type === 'free' ? 'Free' : new Intl.NumberFormat('en-US', { style: 'currency', currency: product.pricing.currency }).format(product.pricing.amountCents / 100) + ' USD';
}
export function productClassification(product: CatalogueProduct) {
  const labels = [...(product.productType === 'book' ? ['Book'] : product.productType === 'merchandise' ? ['Merchandise'] : []), ...product.kinds.map(kindLabel)];
  if (product.format !== 'digital') labels.push(product.format === 'mixed' ? 'Digital + physical' : 'Physical');
  return labels.length ? labels.join(' · ') : 'Digital product';
}
