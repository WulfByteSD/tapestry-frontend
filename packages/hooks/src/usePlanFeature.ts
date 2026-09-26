import type { AxiosInstance } from 'axios';
import { useBilling } from './useBilling';

/**
 * Returns whether the current user's active billing record includes a specific
 * plan feature by name.
 *
 * @param api    - Authenticated axios instance
 * @param userId - The authenticated user's _id
 * @param featureName - The feature string to check (e.g. PlanFeature.SOCIAL_POSTING)
 *
 * @example
 * ```tsx
 * const { hasFeature, isLoading } = usePlanFeature(api, userId, PlanFeature.SOCIAL_POSTING);
 * ```
 */
export function usePlanFeature(api: AxiosInstance, userId: string, featureName: string) {
  const { data: billing, isLoading } = useBilling(api, userId as any);

  return {
    hasFeature: billing?.features?.includes(featureName) ?? false,
    isLoading,
  };
}
