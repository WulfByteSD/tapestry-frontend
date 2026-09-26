import type {
  LibraryResource,
  LibraryResourceAccessPolicy,
  LibraryResourceFormat,
  LibraryResourceKind,
  LibraryResourceStatus,
} from '@tapestry/types';

export type ResourceEditorFormValues = {
  key: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  kind: LibraryResourceKind;
  format: LibraryResourceFormat;
  status: LibraryResourceStatus;
  accessPolicy: LibraryResourceAccessPolicy;
  coverImageUrl: string;
  spineImageUrl: string;
  thumbnailImageUrl: string;
  bannerImageUrl: string;
  releaseVersion: string;
  releaseProvider: 'cloudinary';
  releaseAssetKey: string;
  releaseMimeType: string;
  releaseSizeBytes: number | undefined;
  releasePublishedAt: string;
  tags: string[];
  authors: string[];
  publishedAt: string;
};

export type ResourceStatusFilter = '' | LibraryResourceStatus;
export type ResourceAccessPolicyFilter = '' | LibraryResourceAccessPolicy;

export type ResourceListRecord = LibraryResource;
