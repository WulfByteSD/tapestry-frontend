import type { ReactNode } from 'react';

export type PolicyMeUser = {
  _id: string;
  acceptedPolicies?: Record<string, string | number>;
};

export type PolicyLegal = {
  type: string;
  version: string;
  title: string;
  effective_date?: Date;
};

export type UpdateUserMutation = {
  mutateAsync: (payload: { acceptedPolicies: Record<string, string> }) => Promise<unknown>;
  isPending: boolean;
};

export type PolicyGateProps = {
  requiredPolicies: string[];
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  onAccepted?: () => void;
  useMe: () => { data?: PolicyMeUser | null };
  useLegalPolicies: () => { data?: PolicyLegal[] | null };
  useUpdateUserAccount: (userId?: string) => UpdateUserMutation;
};
