import type { AxiosInstance } from 'axios';

export type BillingCycle = 'monthly' | 'yearly';

export type FeaturePlan = {
  _id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  features: { name: string }[];
  tier: 'silver' | 'gold' | 'platinum' | 'diamond';
  mostPopular?: boolean;
  yearlyDiscount?: number;
};

export interface BillingValidation {
  needsUpdate: boolean;
  reasons: string[];
  severity: 'critical' | 'warning' | 'info';
  recommendations: string[];
}

export type WizardStep = 'plan' | 'payment' | 'review';

export type WizardState = {
  step: WizardStep;
  selectedPlan: FeaturePlan | null;
  billingCycle: BillingCycle;
  stripeToken: string | null;
  cardKey: number;
};

export type WizardAction =
  | { type: 'SET_PLAN'; plan: FeaturePlan }
  | { type: 'SET_BILLING_CYCLE'; cycle: BillingCycle }
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'SET_STRIPE_TOKEN'; token: string }
  | { type: 'RESET_PAYMENT' };

export interface BillingSetupProps {
  api: AxiosInstance;
  profileId: string;
  profileType: string;
  stripePublishableKey: string;
  billingValidation?: BillingValidation;
}
