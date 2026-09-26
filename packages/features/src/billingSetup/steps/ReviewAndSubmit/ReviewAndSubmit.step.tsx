'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosInstance } from 'axios';
import { Button } from '@tapestry/ui';
import type { FeaturePlan, BillingCycle } from '../../BillingSetup.types';
import styles from './ReviewAndSubmit.module.scss';

interface ReviewAndSubmitProps {
  api: AxiosInstance;
  profileId: string;
  selectedPlan: FeaturePlan;
  billingCycle: BillingCycle;
  stripeToken: string | null;
  onBack: () => void;
  onError: () => void;
}

export default function ReviewAndSubmit({ api, profileId, selectedPlan, billingCycle, stripeToken, onBack, onError }: ReviewAndSubmitProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isYearly = billingCycle === 'yearly';
  const yearlyDiscount = selectedPlan.yearlyDiscount ?? 0;
  const price = isYearly ? selectedPlan.price * 12 * ((100 - yearlyDiscount) / 100) : selectedPlan.price;

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      api.post(`/payment/${profileId}`, {
        stripeToken,
        planId: selectedPlan._id,
        billingCycle,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setSubmitError(axiosErr?.response?.data?.message ?? axiosErr?.message ?? 'Something went wrong. Please re-enter your card details.');
      onError();
    },
  });

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Review &amp; Confirm</h2>
        <p className={styles.stepDesc}>Please review your selection before submitting.</p>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Plan</span>
          <span className={styles.summaryValue}>{selectedPlan.name}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Billing cycle</span>
          <span className={styles.summaryValue}>{isYearly ? 'Yearly' : 'Monthly'}</span>
        </div>
        {selectedPlan.price > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Amount</span>
            <span className={styles.summaryValue}>
              ${price.toFixed(2)} / {isYearly ? 'year' : 'month'}
            </span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Payment</span>
          <span className={styles.summaryValue}>{selectedPlan.price === 0 ? 'Free — no card required' : 'Card on file (secured by Stripe)'}</span>
        </div>
      </div>

      {submitError && <p className={styles.error}>{submitError}</p>}

      <div className={styles.footer}>
        <Button type="button" variant="ghost" tone="neutral" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button type="button" tone="gold" size="lg" isLoading={isPending} onClick={() => mutate()}>
          Confirm &amp; Activate
        </Button>
      </div>
    </div>
  );
}
