import type { ApiListResponse, ApiResponse, ListQueryParams } from '@tapestry/api-client';
import type { AbilityDefinition, ItemDefinition, SkillDefinition } from '@tapestry/types';

export type ContentAdminResource = 'items' | 'skills' | 'abilities';

export type ContentAdminRecordMap = {
  items: ItemDefinition;
  skills: SkillDefinition;
  abilities: AbilityDefinition;
};

export type ContentAdminRecord<K extends ContentAdminResource = ContentAdminResource> = ContentAdminRecordMap[K];

export type ContentAdminPayload<K extends ContentAdminResource = ContentAdminResource> = Partial<ContentAdminRecordMap[K]>;

export type ContentAdminListParams = ListQueryParams;

export type ContentAdminListResponse<K extends ContentAdminResource = ContentAdminResource> = ApiListResponse<ContentAdminRecordMap[K]>;

export type ContentAdminDetailResponse<K extends ContentAdminResource = ContentAdminResource> = ApiResponse<ContentAdminRecordMap[K]>;

export type ContentAdminCreateResponse = ApiResponse<string>;

export type ContentAdminDeleteResponse = {
  success: boolean;
  message?: string;
};

export type ContentImportMode = 'dry-run' | 'commit';

export type ContentImportError = {
  row: number;
  key?: string;
  field?: string;
  message: string;
};

export type ContentImportSummary = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  creates: number;
  updates: number;
};

export type ContentImportResult = {
  entityName: string;
  mode: ContentImportMode;
  success: boolean;
  summary: ContentImportSummary;
  errors: ContentImportError[];
};

export type ContentImportResponse = ApiResponse<ContentImportResult>;

export type CreateContentVariables<K extends ContentAdminResource = ContentAdminResource> = {
  resource: K;
  payload: ContentAdminPayload<K>;
};

export type UpdateContentVariables<K extends ContentAdminResource = ContentAdminResource> = {
  resource: K;
  id: string;
  payload: ContentAdminPayload<K>;
};

export type DeleteContentVariables<K extends ContentAdminResource = ContentAdminResource> = {
  resource: K;
  id: string;
};

export type ImportContentVariables<K extends ContentAdminResource = ContentAdminResource> = {
  resource: K;
  file: File | Blob;
  filename?: string;
  mode?: ContentImportMode;
};

export const CONTENT_ADMIN_RESOURCE_LABELS: Record<ContentAdminResource, { singular: string; plural: string }> = {
  items: {
    singular: 'Item',
    plural: 'Items',
  },
  skills: {
    singular: 'Skill',
    plural: 'Skills',
  },
  abilities: {
    singular: 'Ability',
    plural: 'Abilities',
  },
};

export const CONTENT_ADMIN_RESOURCE_PATHS: Record<ContentAdminResource, string> = {
  items: '/game/content/items',
  skills: '/game/content/skills',
  abilities: '/game/content/abilities',
};

export type ContentExportCountResult = {
  count: number;
};

export type ContentExportCountResponse = ApiResponse<ContentExportCountResult>;

export type ExportContentVariables<K extends ContentAdminResource = ContentAdminResource> = {
  resource: K;
  filterOptions?: string;
};
