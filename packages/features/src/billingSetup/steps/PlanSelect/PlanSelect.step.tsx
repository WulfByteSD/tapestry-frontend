'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@tapestry/ui';
import type { AxiosInstance } from 'axios';
import type { FeaturePlan, BillingCycle } from '../../BillingSetup.types';
import { FeaturePlanCard } from './FeaturePlanCard';
import styles from './PlanSelect.module.scss';

interface PlanSelectProps {
  api: AxiosInstance;
  profileType: string;
  selectedPlan: FeaturePlan | null;
  billingCycle: BillingCycle;
  onSelectPlan: (plan: FeaturePlan) => void;
  onSetBillingCycle: (cycle: BillingCycle) => void;
  onContinue: () => void;
}

export default function PlanSelect({ api, profileType, selectedPlan, billingCycle, onSelectPlan, onSetBillingCycle, onContinue }: PlanSelectProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['billing-plans', profileType],
    queryFn: async () => {
      const res = await api.get('/auth/plan', {
        params: { filterOptions: `availableTo;{"$in":"${profileType}"}|isActive;true` },
      });
      const raw = res.data?.payload?.data ?? res.data?.payload ?? res.data?.data ?? res.data ?? [];
      return Array.isArray(raw) ? (raw as FeaturePlan[]) : [];
    },
  });

  const plans = [...(data ?? [])].sort((a, b) => a.price - b.price);

  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Choose Your Plan</h2>
        <p className={styles.stepDesc}>Select the plan that fits your needs.</p>

        <div className={styles.cycleToggle}>
          <button type="button" className={`${styles.cycleBtn} ${billingCycle === 'monthly' ? styles.cycleBtnActive : ''}`} onClick={() => onSetBillingCycle('monthly')}>
            Monthly
          </button>
          <button type="button" className={`${styles.cycleBtn} ${billingCycle === 'yearly' ? styles.cycleBtnActive : ''}`} onClick={() => onSetBillingCycle('yearly')}>
            Yearly
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.loading}>Loading plans…</p>
      ) : (
        <div className={styles.planGrid}>
          {plans.map((plan) => (
            <FeaturePlanCard key={plan._id} plan={plan} billingCycle={billingCycle} selected={selectedPlan?._id === plan._id} onSelect={() => onSelectPlan(plan)} />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <Button type="button" tone="gold" size="lg" disabled={!selectedPlan} onClick={onContinue}>
          {selectedPlan ? `Continue with ${selectedPlan.name}` : 'Select a plan'}
        </Button>
      </div>
    </div>
  );
}
