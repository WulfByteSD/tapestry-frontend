export type ProductStatus = 'draft' | 'published' | 'archived';
export type ProductVisibility = 'public' | 'unlisted' | 'private';
export type PricingType = 'free' | 'one_time';
export type FulfillmentKind = 'digital' | 'physical' | 'mixed';
export type ProductGrantPermission = 'view' | 'download';

export interface CommerceProductGrant {
  type: 'resource';
  resourceId: string;
  permissions: ProductGrantPermission[];
}

export interface CommerceProductPricing {
  type: PricingType;
  currency: 'USD';
  amountCents: number;
  compareAtAmountCents?: number;
}

export interface CommerceProductPresentation {
  imageUrl?: string;
  coverImageUrl?: string;
  gallery?: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;
}

export interface CommerceProductFulfillment {
  kind: FulfillmentKind;
  grants: CommerceProductGrant[];
  requiresShipping: boolean;
}

export interface CommerceProduct {
  _id: string;
  key: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  pricing: CommerceProductPricing;
  presentation?: CommerceProductPresentation;
  fulfillment: CommerceProductFulfillment;
  tags: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommerceClaimGrantResult {
  type: 'resource';
  resourceId: string;
  permissions: ProductGrantPermission[];
  status: 'granted' | 'already_owned';
}

export interface CommerceClaimResult {
  productId: string;
  acquired: boolean;
  alreadyOwned: boolean;
  grants: CommerceClaimGrantResult[];
}

export interface CreateProductInput {
  key: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  pricing: CommerceProductPricing;
  presentation?: CommerceProductPresentation;
  fulfillment: CommerceProductFulfillment;
  tags?: string[];
}
