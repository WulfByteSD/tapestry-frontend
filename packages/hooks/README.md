# @tapestry/hooks

Shared React hooks for Tapestry applications using React Query for data fetching and state management.

## Installation

This package is automatically available in the monorepo workspace:

```bash
pnpm install
```

## Hooks

### useBilling & useBillingInfo

Fetch and manage user billing information.

**Usage:**

```tsx
import { useBilling, useBillingInfo } from "@tapestry/hooks";
import { api } from "@/lib/api";
import { useMe } from "@/lib/auth-hooks";

function BillingComponent() {
  const { data: user } = useMe();

  // Basic billing data
  const { data: billing, isLoading } = useBilling(api, user);

  // Or with helper properties
  const { billingInfo, hasActiveSubscription, isYearlySubscription, trialActive, hasCredits } = useBillingInfo(
    api,
    user,
  );

  return (
    <div>
      {hasActiveSubscription && <p>Active subscription</p>}
      {trialActive && <p>Trial active</p>}
    </div>
  );
}
```

**Options:**

```tsx
const options = {
  enabled: true,
  refetchOnWindowFocus: false,
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // 10 minutes
  refetchInterval: undefined,
  retry: 1,
};

const billing = useBilling(api, user, options);
```

### useProfile

Generic hook for fetching user profiles of any type.

**Usage:**

```tsx
import { useProfile, useAthleteProfile, usePlayerProfile } from "@tapestry/hooks";
import { api } from "@/lib/api";
import { useMe } from "@/lib/auth-hooks";

function ProfileComponent() {
  const { data: user } = useMe();

  // Generic profile
  const { selectedProfile, isLoading } = useProfile(api, user, "athlete");

  // Or use type-specific helpers
  const { selectedProfile: athlete } = useAthleteProfile(api, user);
  const { selectedProfile: player } = usePlayerProfile(api, user);
  const { selectedProfile: admin } = useAdminProfile(api, user);

  return <div>{selectedProfile?.name}</div>;
}
```

**With TypeScript:**

```tsx
interface AthleteProfile {
  name: string;
  sport: string;
  team: string;
}

const { selectedProfile } = useAthleteProfile<AthleteProfile>(api, user);
// selectedProfile is now typed as AthleteProfile | null
```

**Options:**

```tsx
const options = {
  enabled: true,
  refetchOnWindowFocus: false,
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 10,
  onSuccess: (profile) => console.log("Profile loaded:", profile),
  onError: (error) => console.error("Error loading profile:", error),
};

const profile = useProfile(api, user, "athlete", options);
```

## Architecture

All hooks follow dependency injection patterns and accept flexible user types:

- **api**: Pass your configured AxiosInstance from `@tapestry/api-client`
- **user**: Pass the authenticated user from your `useMe()` hook
  - For `useBilling`: user must have `_id` property
  - For `useProfile`: user must have `_id` and `profileRefs` properties

This allows the hooks to work across different apps (admin, player) while maintaining proper authentication and API configuration, regardless of the exact shape of your user object.

## Migrating from Old Hooks

### From old useBilling

**Before:**

```tsx
import { useBilling } from "@/hooks/useBilling";

const { data: billing } = useBilling();
```

**After:**

```tsx
import { useBilling } from "@tapestry/hooks";
import { api } from "@/lib/api";
import { useMe } from "@/lib/auth-hooks";

const { data: user } = useMe();
const { data: billing } = useBilling(api, user);
```

### From old useSelectedProfile

**Before:**

```tsx
import { useSelectedProfile } from "@/hooks/useSelectedProfile";

const { selectedProfile } = useSelectedProfile();
```

**After:**

```tsx
import { useAthleteProfile } from "@tapestry/hooks";
import { api } from "@/lib/api";
import { useMe } from "@/lib/auth-hooks";

const { data: user } = useMe();
const { selectedProfile } = useAthleteProfile(api, user);
```

## TypeScript Support

All hooks are fully typed and support generic type parameters for custom profile types:

```tsx
import type { IBilling, AuthType } from "@tapestry/types";

// Billing is already typed
const billing: UseQueryResult<IBilling, Error> = useBilling(api, user);

// Custom profile types
interface MyCustomProfile {
  customField: string;
}

const { selectedProfile } = useProfile<MyCustomProfile>(api, user, "custom");
// selectedProfile is typed as MyCustomProfile | null
```
