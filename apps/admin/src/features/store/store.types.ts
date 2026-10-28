import type {
  CommerceProduct,
  CommerceProductGrant,
  FulfillmentKind,
  PricingType,
  ProductStatus,
  ProductType,
  ProductVisibility,
} from '@tapestry/types';

export type ProductGalleryDraft = {
  url: string;
  alt: string;
  caption: string;
};

export type ProductEditorFormValues = {
  key: string;
  slug: string;
  title: string;
  productType: ProductType | "";
  subtitle: string;
  summary: string;
  description: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  pricingType: PricingType;
  amountCents: number | undefined;
  compareAtAmountCents: number | undefined;
  imageUrl: string;
  bannerImageUrl: string;
  productImageUrl: string;
  coverImageUrl: string;
  gallery: ProductGalleryDraft[];
  fulfillmentKind: FulfillmentKind;
  requiresShipping: boolean;
  grants: CommerceProductGrant[];
  tags: string[];
};

export type StoreStatusFilter = '' | ProductStatus;
export type StoreVisibilityFilter = '' | ProductVisibility;

export type StoreListRecord = CommerceProduct;
