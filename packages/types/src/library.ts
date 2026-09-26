export type LibraryResourceKind = 'guide' | 'module' | 'dial' | 'quickstart' | 'reference' | 'map' | 'printable' | 'other';
export type LibraryResourceFormat = 'pdf' | 'web' | 'audio' | 'video' | 'archive' | 'external';
export type LibraryResourceAccessPolicy = 'public' | 'entitlement';
export type LibraryResourceStatus = 'draft' | 'published' | 'archived';
export type LibraryResourceProvider = 'cloudinary' | 's3' | 'external';

export interface LibraryResourcePresentation {
  coverImageUrl?: string;
  spineImageUrl?: string;
  thumbnailImageUrl?: string;
  bannerImageUrl?: string;
}

export interface LibraryResourceCurrentRelease {
  version: string;
  provider: LibraryResourceProvider;
  assetKey: string;
  mimeType?: string;
  sizeBytes?: number;
  publishedAt?: string;
}

export interface LibraryResourceSummary {
  _id: string;
  key: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  kind: LibraryResourceKind;
  format: LibraryResourceFormat;
  status: LibraryResourceStatus;
  accessPolicy: LibraryResourceAccessPolicy;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryResource extends LibraryResourceSummary {
  description?: string;
  presentation: LibraryResourcePresentation;
  currentRelease: LibraryResourceCurrentRelease;
  tags: string[];
  authors?: string[];
  publishedAt?: string;
}

export interface CreateLibraryResourceInput {
  key: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  kind: LibraryResourceKind;
  format: LibraryResourceFormat;
  status?: LibraryResourceStatus;
  accessPolicy?: LibraryResourceAccessPolicy;
  presentation?: LibraryResourcePresentation;
  currentRelease: LibraryResourceCurrentRelease;
  tags?: string[];
  authors?: string[];
  publishedAt?: string;
}

export interface CloudinaryUploadAsset {
  provider: 'cloudinary';
  assetKey: string;
  publicId: string;
  url: string;
  fileName: string;
  type: string;
  mimeType: string;
  resourceType: string;
  format: string;
  bytes: number;
}
