import type { FormValidators } from '@tapestry/ui';
import type { CommerceProduct, CommerceProductGrant, CreateProductInput } from '@tapestry/types';
import type { ProductEditorFormValues, ProductGalleryDraft, StoreStatusFilter, StoreVisibilityFilter } from './store.types';

export const STORE_PAGE_SIZE = 10;

export const STORE_STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
] as const;

export const STORE_VISIBILITY_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Unlisted', value: 'unlisted' },
  { label: 'Private', value: 'private' },
] as const;

export const STORE_PRICING_TYPE_OPTIONS = [
  { label: 'Free', value: 'free' },
  { label: 'One-time', value: 'one_time' },
] as const;

export const STORE_FULFILLMENT_KIND_OPTIONS = [
  { label: 'Digital', value: 'digital' },
  { label: 'Physical', value: 'physical' },
  { label: 'Mixed', value: 'mixed' },
] as const;

export function createEmptyGalleryEntry(): ProductGalleryDraft {
  return {
    url: '',
    alt: '',
    caption: '',
  };
}

export function createEmptyGrant(): CommerceProductGrant {
  return {
    type: 'resource',
    resourceId: '',
    permissions: [],
  };
}

function hasMeaningfulGrantInput(grant: CommerceProductGrant) {
  return grant.resourceId.trim().length > 0 || grant.permissions.length > 0;
}

function getConfiguredGrants(grants: CommerceProductGrant[]) {
  return grants.filter(hasMeaningfulGrantInput);
}

export function createDefaultProductFormValues(): ProductEditorFormValues {
  return {
    key: '',
    slug: '',
    title: '',
    subtitle: '',
    summary: '',
    description: '',
    status: 'draft',
    visibility: 'private',
    pricingType: 'free',
    amountCents: 0,
    compareAtAmountCents: undefined,
    imageUrl: '',
    coverImageUrl: '',
    gallery: [],
    fulfillmentKind: 'digital',
    requiresShipping: false,
    grants: [createEmptyGrant()],
    tags: [],
  };
}

export function toProductFormValues(product: CommerceProduct): ProductEditorFormValues {
  return {
    key: product.key ?? '',
    slug: product.slug ?? '',
    title: product.title ?? '',
    subtitle: product.subtitle ?? '',
    summary: product.summary ?? '',
    description: product.description ?? '',
    status: product.status ?? 'draft',
    visibility: product.visibility ?? 'private',
    pricingType: product.pricing?.type ?? 'free',
    amountCents: product.pricing?.amountCents ?? 0,
    compareAtAmountCents: product.pricing?.compareAtAmountCents,
    imageUrl: product.presentation?.imageUrl ?? '',
    coverImageUrl: product.presentation?.coverImageUrl ?? '',
    gallery: (product.presentation?.gallery ?? []).map((entry) => ({
      url: entry.url ?? '',
      alt: entry.alt ?? '',
      caption: entry.caption ?? '',
    })),
    fulfillmentKind: product.fulfillment?.kind ?? 'digital',
    requiresShipping: Boolean(product.fulfillment?.requiresShipping),
    grants: (product.fulfillment?.grants ?? []).map((grant) => ({
      type: 'resource',
      resourceId: grant.resourceId,
      permissions: [...grant.permissions],
    })),
    tags: product.tags ?? [],
  };
}

export function slugifyValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

export function toProductPayload(values: ProductEditorFormValues): CreateProductInput {
  const pricingType = values.pricingType;
  const amountCents = pricingType === 'free' ? 0 : Number(values.amountCents ?? 0);
  const compareAtAmountCents =
    values.compareAtAmountCents === undefined || values.compareAtAmountCents === null || Number.isNaN(values.compareAtAmountCents)
      ? undefined
      : Number(values.compareAtAmountCents);

  const gallery = values.gallery
    .map((entry) => ({
      url: entry.url.trim(),
      alt: entry.alt.trim() || undefined,
      caption: entry.caption.trim() || undefined,
    }))
    .filter((entry) => entry.url);

  const presentation =
    values.imageUrl.trim() || values.coverImageUrl.trim() || gallery.length > 0
      ? {
          ...(values.imageUrl.trim() ? { imageUrl: values.imageUrl.trim() } : {}),
          ...(values.coverImageUrl.trim() ? { coverImageUrl: values.coverImageUrl.trim() } : {}),
          ...(gallery.length > 0 ? { gallery } : {}),
        }
      : undefined;

  const fulfillmentKind = values.fulfillmentKind;
  const requiresShipping = fulfillmentKind === 'digital' ? false : values.requiresShipping;
  const grants = fulfillmentKind === 'physical'
    ? []
    : getConfiguredGrants(values.grants)
        .map((grant) => ({
          type: 'resource' as const,
          resourceId: grant.resourceId.trim(),
          permissions: [...new Set(grant.permissions)],
        }))
        .filter((grant) => grant.resourceId);

  return {
    key: slugifyValue(values.key),
    slug: slugifyValue(values.slug),
    title: values.title.trim(),
    ...(values.subtitle.trim() ? { subtitle: values.subtitle.trim() } : {}),
    ...(values.summary.trim() ? { summary: values.summary.trim() } : {}),
    ...(values.description.trim() ? { description: values.description.trim() } : {}),
    status: values.status,
    visibility: values.visibility,
    pricing: {
      type: pricingType,
      currency: 'USD',
      amountCents,
      ...(compareAtAmountCents !== undefined ? { compareAtAmountCents } : {}),
    },
    ...(presentation ? { presentation } : {}),
    fulfillment: {
      kind: fulfillmentKind,
      grants,
      requiresShipping,
    },
    tags: normalizeTags(values.tags),
  };
}

export function buildStoreFilterOptions(statusFilter: StoreStatusFilter, visibilityFilter: StoreVisibilityFilter) {
  const filters: string[] = [];

  if (statusFilter) {
    filters.push(`status;${statusFilter}`);
  }

  if (visibilityFilter) {
    filters.push(`visibility;${visibilityFilter}`);
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

export function formatPriceLabel(product: CommerceProduct) {
  if (product.pricing.type === 'free') {
    return 'Free';
  }

  return formatCurrencyCents(product.pricing.amountCents);
}

export function formatCurrencyCents(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '--';
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value / 100);
}

export function getGrantSummary(product: CommerceProduct) {
  const grantCount = product.fulfillment.grants.length;
  if (grantCount === 0) {
    return product.fulfillment.kind === 'physical' ? 'No digital grants' : 'No grants configured';
  }

  return `${grantCount} resource grant${grantCount === 1 ? '' : 's'}`;
}

export const productFormValidators: FormValidators<ProductEditorFormValues> = {
  key: (value) => (slugifyValue(String(value || '')) ? undefined : 'Key is required'),
  slug: (value) => {
    const rawValue = String(value || '').trim();
    if (!rawValue) {
      return undefined;
    }

    return slugifyValue(rawValue) ? undefined : 'Slug must resolve to a valid path segment';
  },
  title: (value) => (String(value || '').trim() ? undefined : 'Title is required'),
  amountCents: (value, values) => {
    const numericValue = Number(value);

    if (values.pricingType === 'free') {
      return numericValue === 0 ? undefined : 'Free products must use 0 cents';
    }

    if (!Number.isInteger(numericValue) || numericValue <= 0) {
      return 'One-time products must use a positive whole-cent amount';
    }

    return undefined;
  },
  compareAtAmountCents: (value) => {
    if (value === undefined || value === null) return undefined;

    const numericValue = Number(value);
    if (!Number.isInteger(numericValue) || numericValue < 0) {
      return 'Compare-at amount must be a whole-cent value';
    }

    return undefined;
  },
  gallery: (value) => {
    const gallery = value ?? [];
    const hasInvalidEntry = gallery.some((entry) => entry.url.trim().length === 0 && (entry.alt.trim().length > 0 || entry.caption.trim().length > 0));
    return hasInvalidEntry ? 'Gallery rows with caption or alt text also need a URL' : undefined;
  },
  requiresShipping: (value, values) => {
    if (values.fulfillmentKind === 'digital' && value) {
      return 'Digital products cannot require shipping';
    }

    return undefined;
  },
  grants: (value, values) => {
    const grants = value ?? [];
    const configuredGrants = getConfiguredGrants(grants);

    if (values.fulfillmentKind === 'physical' && configuredGrants.length > 0) {
      return 'Physical products cannot include digital resource grants';
    }

    if (values.status !== 'draft' && values.pricingType === 'free' && values.fulfillmentKind !== 'physical' && configuredGrants.length === 0) {
      return 'Free products need at least one resource grant';
    }

    const hasMissingResource = configuredGrants.some((grant) => !grant.resourceId.trim());
    if (hasMissingResource) {
      return 'Each grant needs a library resource';
    }

    const hasMissingPermissions = configuredGrants.some((grant) => grant.permissions.length === 0);
    if (hasMissingPermissions) {
      return 'Each grant needs at least one permission';
    }

    const uniqueIds = new Set(configuredGrants.map((grant) => grant.resourceId.trim()));
    if (uniqueIds.size !== configuredGrants.length) {
      return 'Each library resource should only be granted once per product';
    }

    return undefined;
  },
};
