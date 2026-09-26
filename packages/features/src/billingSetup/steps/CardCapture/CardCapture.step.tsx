'use client';

import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import type { Stripe, StripeCardElementChangeEvent } from '@stripe/stripe-js';
import { Button } from '@tapestry/ui';
import styles from './CardCapture.module.scss';

interface BillingAddress {
  name: string;
  address_line1: string;
  address_line2: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
}

const EMPTY_BILLING: BillingAddress = {
  name: '',
  address_line1: '',
  address_line2: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  address_country: '',
};

interface CardCaptureInnerProps {
  onTokenCreated: (token: string) => void;
  onBack: () => void;
}

function CardCaptureInner({ onTokenCreated, onBack }: CardCaptureInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [billing, setBilling] = useState<BillingAddress>(EMPTY_BILLING);

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    setError(event.error?.message ?? null);
  };

  const setField = (field: keyof BillingAddress) => (e: React.ChangeEvent<HTMLInputElement>) => setBilling((prev) => ({ ...prev, [field]: e.target.value }));

  const billingComplete =
    billing.name.trim() &&
    billing.address_line1.trim() &&
    billing.address_city.trim() &&
    billing.address_state.trim() &&
    billing.address_zip.trim() &&
    billing.address_country.trim();

  const handleContinue = async () => {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsTokenizing(true);
    setError(null);

    const { error: stripeError, token } = await stripe.createToken(cardElement, {
      name: billing.name,
      address_line1: billing.address_line1,
      address_line2: billing.address_line2 || undefined,
      address_city: billing.address_city,
      address_state: billing.address_state,
      address_zip: billing.address_zip,
      address_country: billing.address_country,
    });

    setIsTokenizing(false);

    if (stripeError) {
      setError(stripeError.message ?? 'Card error. Please try again.');
      return;
    }

    if (token) {
      onTokenCreated(token.id);
    }
  };

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Payment Information</h2>
        <p className={styles.stepDesc}>Your card details are securely processed by Stripe.</p>
      </div>

      {/* Cardholder name */}
      <div className={styles.field}>
        <label className={styles.label}>Cardholder Name</label>
        <input className={styles.input} type="text" placeholder="Jane Smith" autoComplete="cc-name" value={billing.name} onChange={setField('name')} />
      </div>

      {/* Stripe card element */}
      <div className={styles.field}>
        <label className={styles.label}>Card Details</label>
        <div className={styles.cardElement}>
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: '16px',
                  color: '#e2eaf2',
                  '::placeholder': { color: 'rgba(122, 144, 168, 0.6)' },
                  fontFamily: 'inherit',
                },
                invalid: { color: '#ef4444' },
              },
            }}
            onChange={handleCardChange}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {/* Billing address */}
      <div className={styles.addressSection}>
        <p className={styles.addressSectionTitle}>Billing Address</p>

        <div className={styles.field}>
          <label className={styles.label}>Address Line 1</label>
          <input
            className={styles.input}
            type="text"
            placeholder="123 Main Street"
            autoComplete="address-line1"
            value={billing.address_line1}
            onChange={setField('address_line1')}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Address Line 2 <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder="Apt, suite, unit…"
            autoComplete="address-line2"
            value={billing.address_line2}
            onChange={setField('address_line2')}
          />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>City</label>
            <input className={styles.input} type="text" placeholder="New York" autoComplete="address-level2" value={billing.address_city} onChange={setField('address_city')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>State / Province</label>
            <input className={styles.input} type="text" placeholder="NY" autoComplete="address-level1" value={billing.address_state} onChange={setField('address_state')} />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Postal Code</label>
            <input className={styles.input} type="text" placeholder="10001" autoComplete="postal-code" value={billing.address_zip} onChange={setField('address_zip')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Country</label>
            <input className={styles.input} type="text" placeholder="US" autoComplete="country" value={billing.address_country} onChange={setField('address_country')} />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button type="button" variant="ghost" tone="neutral" onClick={onBack}>
          Back
        </Button>
        <Button type="button" tone="gold" size="lg" disabled={!cardComplete || !billingComplete} isLoading={isTokenizing} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

interface CardCaptureProps {
  stripePromise: Promise<Stripe | null>;
  cardKey: number;
  onTokenCreated: (token: string) => void;
  onBack: () => void;
}

export default function CardCapture({ stripePromise, cardKey, onTokenCreated, onBack }: CardCaptureProps) {
  return (
    <Elements stripe={stripePromise} key={cardKey}>
      <CardCaptureInner onTokenCreated={onTokenCreated} onBack={onBack} />
    </Elements>
  );
}
