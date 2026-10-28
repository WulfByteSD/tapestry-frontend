import type { LibraryResource } from '@tapestry/types';

export function getPublicPdfHref(resource: LibraryResource | undefined, apiOrigin: string | undefined): string | undefined {
  if (!resource || resource.status !== 'published' || resource.accessPolicy !== 'public' || resource.format !== 'pdf') return undefined;
  if (!/^[a-f0-9]{24}$/i.test(resource._id) || !apiOrigin) return undefined;
  // Public payloads omit the storage provider; delivery policy belongs to the API.

  try {
    const url = new URL(apiOrigin);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    return new URL(`/api/v1/library/resources/${resource._id}/stream`, url).toString();
  } catch {
    return undefined;
  }
}

export function getGuidePresentation<T extends { title: string; description: string; coverSrc: string }>(fallback: T, resource?: LibraryResource) {
  if (!resource || resource.status !== 'published' || resource.accessPolicy !== 'public') return fallback;
  return {
    ...fallback,
    title: resource.title || fallback.title,
    description: resource.description || resource.summary || fallback.description,
    coverSrc: resource.presentation?.coverImageUrl || fallback.coverSrc,
  };
}
