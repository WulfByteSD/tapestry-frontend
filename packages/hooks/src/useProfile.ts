import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AxiosInstance } from "axios";
import type { ProfileResponse } from "@tapestry/types";

// Minimal user interface required for profile hooks
export interface ProfileUser {
  _id: string;
  profileRefs?: Record<string, string | null>;
}

export interface UseProfileOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
  retry?: number | boolean;
  onSuccess?: (profile: any | null) => void;
  onError?: (error: Error) => void;
}

/**
 * Generic hook to fetch a user's profile of a specific type
 *
 * @param api - The axios instance to use for API calls
 * @param user - The authenticated user object (from useMe hook) - must have _id and profileRefs
 * @param profileType - The type of profile to fetch (e.g., 'athlete', 'admin', 'player')
 * @param options - Optional configuration for the query
 * @returns Query result with profile data and selectedProfile convenience property
 *
 * @example
 * ```tsx
 * import { useProfile } from '@tapestry/hooks';
 * import { api } from '@/lib/api';
 * import { useMe } from '@/lib/auth-hooks';
 *
 * function MyComponent() {
 *   const { data: user } = useMe();
 *   const { selectedProfile, isLoading } = useProfile(api, user, 'athlete');
 *   // selectedProfile will be the athlete profile data
 * }
 * ```
 */
export const useProfile = <TProfile = any>(
  api: AxiosInstance,
  user: ProfileUser | null | undefined,
  profileType: string,
  options?: UseProfileOptions,
): UseQueryResult<ProfileResponse<TProfile>, Error> & { selectedProfile: TProfile | null } => {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 1000 * 60 * 5, // 5 minutes
    gcTime = 1000 * 60 * 10, // 10 minutes
    refetchInterval,
    retry = 1,
    onSuccess,
    onError,
  } = options || {};

  // Get the profile ID reference from user's profileRefs
  const profileId = user?.profileRefs?.[profileType];

  const query = useQuery<ProfileResponse<TProfile>, Error>({
    queryKey: ["profile", profileType, profileId],
    queryFn: async () => {
      if (!profileId) {
        throw new Error(`No ${profileType} profile reference found for user`);
      }
      const { data } = await api.get(`/profiles/${profileType}/profile/${profileId}`);
      return data;
    },
    enabled: enabled && !!user?._id && !!profileId,
    refetchOnWindowFocus,
    staleTime,
    gcTime,
    refetchInterval,
    retry,
    meta: {
      errorMessage: `An error occurred while fetching ${profileType} profile data`,
    },
  });

  // Get the selected profile from the response
  const selectedProfile = query.data?.payload || null;

  // Handle success callback
  if (query.isSuccess && selectedProfile && onSuccess) {
    onSuccess(selectedProfile);
  }

  // Handle error callback
  if (query.isError && onError) {
    onError(query.error);
  }

  return {
    ...query,
    selectedProfile,
  };
};

/**
 * Type-safe hooks for specific profile types
 * These provide better TypeScript support for common profile types
 */

/**
 * Hook specifically for fetching player profiles
 *
 * @example
 * ```tsx
 * import { usePlayerProfile } from '@tapestry/hooks';
 * import { api } from '@/lib/api';
 * import { useMe } from '@/lib/auth-hooks';
 *
 * function MyComponent() {
 *   const { data: user } = useMe();
 *   const { selectedProfile: player } = usePlayerProfile(api, user);
 * }
 * ```
 */
export const usePlayerProfile = <TPlayerProfile = any>(
  api: AxiosInstance,
  user: ProfileUser | null | undefined,
  options?: UseProfileOptions,
) => useProfile<TPlayerProfile>(api, user, "player", options);

/**
 * Hook specifically for fetching admin profiles
 *
 * @example
 * ```tsx
 * import { useAdminProfile } from '@tapestry/hooks';
 * import { api } from '@/lib/api';
 * import { useMe } from '@/lib/auth-hooks';
 *
 * function MyComponent() {
 *   const { data: user } = useMe();
 *   const { selectedProfile: admin } = useAdminProfile(api, user);
 * }
 * ```
 */
export const useAdminProfile = <TAdminProfile = any>(
  api: AxiosInstance,
  user: ProfileUser | null | undefined,
  options?: UseProfileOptions,
) => useProfile<TAdminProfile>(api, user, "admin", options);
