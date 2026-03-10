import { AuthType } from "./auth";
import { IPlan } from "./plan";

// Define the billing information interface
export interface IBilling {
  _id: string;
  customerId: string;
  profileId: string;
  email: string;
  profileType: string;
  features: string[];
  status: string;
  trialLength: number;
  processor?: string;
  credits?: number;
  setupFeePaid?: boolean;
  createdAt: Date;
  updatedAt: Date;
  vaulted: boolean;
  vaultId: string;
  nextBillingDate?: Date;
  needsUpdate?: boolean;
  payor: AuthType;
  plan: IPlan;
  // is yearly? whether or not the subscription is yearly
  isYearly?: boolean;
  // Payment processor specific data map
  paymentProcessorData?: {
    [processorName: string]: any;
  };
}
