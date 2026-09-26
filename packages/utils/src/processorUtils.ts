export interface StripeProcessorData {
  customer?: {
    id: string;
    object: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    balance?: number;
    created?: number;
    currency?: string;
    delinquent?: boolean;
    description?: string;
    discount?: any;
    email?: string;
    invoice_prefix?: string;
    name?: string;
    phone?: string;
    preferred_locales?: string[];
    shipping?: any;
    tax_exempt?: string;
  };
  paymentMethod?: {
    id: string;
    object: string;
    billing_details?: {
      address?: {
        city?: string;
        country?: string;
        line1?: string;
        line2?: string;
        postal_code?: string;
        state?: string;
      };
      email?: string;
      name?: string;
      phone?: string;
    };
    card?: {
      brand?: string;
      country?: string;
      display_brand?: string;
      exp_month?: number;
      exp_year?: number;
      fingerprint?: string;
      funding?: string;
      last4?: string;
    };
    type?: string;
  };
}

export class StripeActionsHandler {
  private processorData: StripeProcessorData;

  constructor(processorData: StripeProcessorData) {
    this.processorData = processorData;
  }

  public getBillingAddress(): string {
    const address = this.processorData?.customer?.address ?? this.processorData?.paymentMethod?.billing_details?.address ?? {};
    return this.formatAddress(address);
  }

  private formatAddress(address: Record<string, string | undefined>): string {
    const { line1 = '', line2 = '', city = '', state = '', country = '', postal_code = '' } = address;
    return [line1, line2, city, state, country, postal_code].filter((part) => part && part.trim() !== '').join(', ');
  }

  public getCustomerPaymentMethod() {
    return {
      last4: this.processorData?.paymentMethod?.card?.last4,
      exp_month: this.processorData?.paymentMethod?.card?.exp_month,
      exp_year: this.processorData?.paymentMethod?.card?.exp_year,
      brand: this.processorData?.paymentMethod?.card?.brand,
      type: this.processorData?.paymentMethod?.type,
    };
  }

  public getCustomerName(): string {
    return this.processorData?.customer?.name ?? this.processorData?.paymentMethod?.billing_details?.name ?? 'N/A';
  }

  public getCustomerEmail(): string {
    return this.processorData?.customer?.email ?? this.processorData?.paymentMethod?.billing_details?.email ?? 'N/A';
  }

  public getCustomerPhone(): string {
    const raw = this.processorData?.customer?.phone ?? this.processorData?.paymentMethod?.billing_details?.phone ?? 'N/A';
    return this.formatPhoneNumber(raw);
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : phone;
  }
}

export type ProcessorName = 'stripe';

/**
 * Factory that returns the appropriate processor handler for the given
 * processor name. Currently only Stripe is supported.
 *
 * @example
 * ```ts
 * const handler = getProcessorHandler('stripe', billing.paymentProcessorData['stripe']);
 * const name    = handler.getCustomerName();
 * ```
 */
export function getProcessorHandler(processor: ProcessorName, processorData: unknown): StripeActionsHandler {
  switch (processor) {
    case 'stripe':
      return new StripeActionsHandler(processorData as StripeProcessorData);
    default:
      throw new Error(`Unsupported payment processor: ${processor}`);
  }
}
