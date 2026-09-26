import type { FormValidators } from '@tapestry/ui';
import type { CloudinaryUploadAsset, CreateLibraryResourceInput, LibraryResource } from '@tapestry/types';
import type { ResourceAccessPolicyFilter, ResourceEditorFormValues, ResourceStatusFilter } from './resource.types';

export const RESOURCE_PAGE_SIZE = 10;

export const RESOURCE_KIND_OPTIONS = [
  { label: 'Guide', value: 'guide' },
  { label: 'Module', value: 'module' },
  { label: 'Dial', value: 'dial' },
  { label: 'Quickstart', value: 'quickstart' },
  { label: 'Reference', value: 'reference' },
  { label: 'Map', value: 'map' },
  { label: 'Printable', value: 'printable' },
  { label: 'Other', value: 'other' },
] as const;

export const RESOURCE_FORMAT_OPTIONS = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Web', value: 'web' },
  { label: 'Audio', value: 'audio' },
  { label: 'Video', value: 'video' },
  { label: 'Archive', value: 'archive' },
  { label: 'External', value: 'external' },
] as const;

export const RESOURCE_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
] as const;

export const RESOURCE_ACCESS_POLICY_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Entitlement', value: 'entitlement' },
] as const;

export function slugifyValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeStringList(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function createDefaultResourceFormValues(): ResourceEditorFormValues {
  return {
    key: '',
    slug: '',
    title: '',
    subtitle: '',
    summary: '',
    description: '',
    kind: 'guide',
    format: 'pdf',
    status: 'draft',
    accessPolicy: 'public',
    coverImageUrl: '',
    spineImageUrl: '',
    thumbnailImageUrl: '',
    bannerImageUrl: '',
    releaseVersion: '1.0',
    releaseProvider: 'cloudinary',
    releaseAssetKey: '',
    releaseMimeType: '',
    releaseSizeBytes: undefined,
    releasePublishedAt: '',
    tags: [],
    authors: [],
    publishedAt: '',
  };
}

export function toResourceFormValues(resource: LibraryResource): ResourceEditorFormValues {
  return {
    key: resource.key ?? '',
    slug: resource.slug ?? '',
    title: resource.title ?? '',
    subtitle: resource.subtitle ?? '',
    summary: resource.summary ?? '',
    description: resource.description ?? '',
    kind: resource.kind ?? 'guide',
    format: resource.format ?? 'pdf',
    status: resource.status ?? 'draft',
    accessPolicy: resource.accessPolicy ?? 'public',
    coverImageUrl: resource.presentation?.coverImageUrl ?? '',
    spineImageUrl: resource.presentation?.spineImageUrl ?? '',
    thumbnailImageUrl: resource.presentation?.thumbnailImageUrl ?? '',
    bannerImageUrl: resource.presentation?.bannerImageUrl ?? '',
    releaseVersion: resource.currentRelease?.version ?? '1.0',
    releaseProvider: (resource.currentRelease?.provider ?? 'cloudinary') as 'cloudinary',
    releaseAssetKey: resource.currentRelease?.assetKey ?? '',
    releaseMimeType: resource.currentRelease?.mimeType ?? '',
    releaseSizeBytes: resource.currentRelease?.sizeBytes,
    releasePublishedAt: toDateInputValue(resource.currentRelease?.publishedAt),
    tags: resource.tags ?? [],
    authors: resource.authors ?? [],
    publishedAt: toDateInputValue(resource.publishedAt),
  };
}

export function applyUploadedAsset(values: ResourceEditorFormValues, asset: CloudinaryUploadAsset): ResourceEditorFormValues {
  return {
    ...values,
    releaseProvider: 'cloudinary',
    releaseAssetKey: asset.assetKey,
    releaseMimeType: asset.mimeType,
    releaseSizeBytes: asset.bytes,
  };
}

export function toResourcePayload(values: ResourceEditorFormValues): CreateLibraryResourceInput {
  const presentation =
    values.coverImageUrl.trim() ||
    values.spineImageUrl.trim() ||
    values.thumbnailImageUrl.trim() ||
    values.bannerImageUrl.trim()
      ? {
          ...(values.coverImageUrl.trim() ? { coverImageUrl: values.coverImageUrl.trim() } : {}),
          ...(values.spineImageUrl.trim() ? { spineImageUrl: values.spineImageUrl.trim() } : {}),
          ...(values.thumbnailImageUrl.trim() ? { thumbnailImageUrl: values.thumbnailImageUrl.trim() } : {}),
          ...(values.bannerImageUrl.trim() ? { bannerImageUrl: values.bannerImageUrl.trim() } : {}),
        }
      : undefined;

  return {
    key: slugifyValue(values.key),
    slug: slugifyValue(values.slug),
    title: values.title.trim(),
    ...(values.subtitle.trim() ? { subtitle: values.subtitle.trim() } : {}),
    ...(values.summary.trim() ? { summary: values.summary.trim() } : {}),
    ...(values.description.trim() ? { description: values.description.trim() } : {}),
    kind: values.kind,
    format: values.format,
    status: values.status,
    accessPolicy: values.accessPolicy,
    ...(presentation ? { presentation } : {}),
    currentRelease: {
      version: values.releaseVersion.trim(),
      provider: 'cloudinary',
      assetKey: values.releaseAssetKey.trim(),
      ...(values.releaseMimeType.trim() ? { mimeType: values.releaseMimeType.trim() } : {}),
      ...(values.releaseSizeBytes !== undefined ? { sizeBytes: Number(values.releaseSizeBytes) } : {}),
      ...(values.releasePublishedAt ? { publishedAt: `${values.releasePublishedAt}T00:00:00.000Z` } : {}),
    },
    tags: normalizeStringList(values.tags).map((tag) => tag.toLowerCase()),
    authors: normalizeStringList(values.authors),
    ...(values.publishedAt ? { publishedAt: `${values.publishedAt}T00:00:00.000Z` } : {}),
  };
}

export function buildResourceFilterOptions(statusFilter: ResourceStatusFilter, accessPolicyFilter: ResourceAccessPolicyFilter) {
  const filters: string[] = [];

  if (statusFilter) {
    filters.push(`status;${statusFilter}`);
  }

  if (accessPolicyFilter) {
    filters.push(`accessPolicy;${accessPolicyFilter}`);
  }

  return filters.length > 0 ? filters.join('|') : undefined;
}

export function formatDate(value?: string) {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatBytes(bytes?: number) {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return '--';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function resourceFormatAccept(format: ResourceEditorFormValues['format']) {
  switch (format) {
    case 'pdf':
      return '.pdf,application/pdf';
    case 'audio':
      return 'audio/*';
    case 'video':
      return 'video/*';
    case 'archive':
      return '.zip,.rar,.7z,.tar,.gz,application/zip,application/x-zip-compressed';
    default:
      return undefined;
  }
}

function toDateInputValue(value?: string) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
}

export const resourceFormValidators: FormValidators<ResourceEditorFormValues> = {
  key: (value) => (slugifyValue(String(value || '')) ? undefined : 'Key is required'),
  title: (value) => (String(value || '').trim() ? undefined : 'Title is required'),
  // releaseVersion: (value) => (String(value || '').trim() ? undefined : 'Release version is required'),
  // releaseAssetKey: (value) => (String(value || '').trim() ? undefined : 'Upload the canonical resource file before saving'),
  // releaseMimeType: (value) => (String(value || '').trim() ? undefined : 'Uploaded file MIME type is required'),
  // releaseSizeBytes: (value) => {
  //   if (value === undefined || value === null) {
  //     return 'Uploaded file size metadata is required';
  //   }

  //   const numericValue = Number(value);
  //   if (!Number.isInteger(numericValue) || numericValue <= 0) {
  //     return 'Uploaded file size must be a positive byte count';
  //   }

  //   return undefined;
  // },
};
