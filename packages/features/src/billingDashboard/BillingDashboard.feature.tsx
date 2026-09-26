'use client';

import React from 'react';
import { useBilling, useTransactions } from '@tapestry/hooks';
import { Loader } from '@tapestry/ui';
import { PlanSummarySection } from './sections/PlanSummarySection';
import { PaymentMethodSection } from './sections/PaymentMethodSection';
import { TransactionHistorySection } from './sections/TransactionHistorySection';
import type { BillingDashboardProps } from './BillingDashboard.types';
import styles from './BillingDashboard.module.scss';

export function BillingDashboardFeature({ api, userId }: BillingDashboardProps) {
  const { data: billing, isLoading: billingLoading, isError: billingError } = useBilling(api, userId);

  const { transactions, isLoading: txLoading } = useTransactions(api, billing?._id);

  if (billingLoading) {
    return (
      <div className={styles.state}>
        <Loader label="Loading billing…" />
      </div>
    );
  }

  if (billingError || !billing) {
    return (
      <div className={styles.state}>
        <p className={styles.errorState}>Unable to load billing information. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <PlanSummarySection billing={billing} />
      <PaymentMethodSection billing={billing} />
      <TransactionHistorySection transactions={transactions} isLoading={txLoading} />
    </div>
  );
}
