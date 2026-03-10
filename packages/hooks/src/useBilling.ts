import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import type { IBilling } from "@tapestry/types";

// Minimal user interface required for billing hooks
export interface BillingUser {
  _id: string;
}

// Fetch function for billing data
const fetchBillingData = async (api: AxiosInstance, userId: string): Promise<IBilling> => {
  const { data } = await api.get(`/auth/billing`, {
    params: {
      filterOptions: `payor;${userId}`,
    },
  });
  return data.payload[0];
};

export interface UseBillingOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
  retry?: number | boolean;
}

/**
 * Custom hook to fetch a user's billing details
 * Uses React Query for caching and state management
 *
 * @param api - The axios instance to use for API calls
 * @param user - The authenticated user object (from useMe hook) - must have _id
 * @param options - Optional configuration for the query
 * @returns UseQueryResult containing billing information
 *
 * @example
 * ```tsx
 * import { useBilling } from '@tapestry/hooks';
 * import { api } from '@/lib/api';
 * import { useMe } from '@/lib/auth-hooks';
 *
 * function MyComponent() {
 *   const { data: user } = useMe();
 *   const { data: billing, isLoading } = useBilling(api, user);
 *   // ...
 * }
 * ```
 */
export const useBilling = (api: AxiosInstance, user: BillingUser | null | undefined, options?: UseBillingOptions) => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 1000 * 60 * 5, // 5 minutes
    gcTime = 1000 * 60 * 10, // 10 minutes
    refetchInterval,
    retry = 1,
  } = options || {};

  return useQuery({
    queryKey: ["billing", user?._id],
    queryFn: () => fetchBillingData(api, user!._id),
    enabled: enabled && !!user?._id,
    refetchOnWindowFocus,
    staleTime,
    gcTime,
    refetchInterval,
    retry,
  }) as UseQueryResult<IBilling, Error>;
};

/**
 * Hook to get billing info with additional helper properties
 * Provides computed properties for easier component usage
 *
 * @param api - The axios instance to use for API calls
 * @param user - The authenticated user object (from useMe hook) - must have _id
 * @param options - Optional configuration for the query
 * @returns Query result with billing data and computed helper properties
 *
 * @example
 * ```tsx
 * import { useBillingInfo } from '@tapestry/hooks';
 * import { api } from '@/lib/api';
 * import { useMe } from '@/lib/auth-hooks';
 *
 * function MyComponent() {
 *   const { data: user } = useMe();
 *   const {
 *     billingInfo,
 *     hasActiveSubscription,
 *     isYearlySubscription
 *   } = useBillingInfo(api, user);
 *   // ...
 * }
 * ```
 */
export const useBillingInfo = (
  api: AxiosInstance,
  user: BillingUser | null | undefined,
  options?: UseBillingOptions,
) => {
  const billingQuery = useBilling(api, user, options);
  const billingData = billingQuery.data;

  return {
    ...billingQuery,
    billingInfo: billingData,
    // Helper computed properties based on IBilling interface
    hasActiveSubscription: billingData?.status === "active",
    isActiveStatus: billingData?.status === "active",
    hasVaultedPayment: billingData?.vaulted ?? false,
    needsUpdate: billingData?.needsUpdate ?? false,
    setupFeePaid: billingData?.setupFeePaid ?? false,
    hasCredits: (billingData?.credits ?? 0) > 0,
    isYearlySubscription: billingData?.isYearly ?? false,
    hasNextBillingDate: !!billingData?.nextBillingDate,
    trialActive: billingData?.trialLength ? billingData.trialLength > 0 : false,
  };
};
