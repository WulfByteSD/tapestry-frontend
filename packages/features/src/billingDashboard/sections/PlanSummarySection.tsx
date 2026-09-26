import React from 'react';
import type { IBilling } from '@tapestry/types';
import { Card, CardHeader, CardBody } from '@tapestry/ui';
import { formatDate } from '@tapestry/utils';
import styles from './sections.module.scss';

interface PlanSummarySectionProps {
  billing: IBilling;
}

export function PlanSummarySection({ billing }: PlanSummarySectionProps) {
  const { plan, isYearly, nextBillingDate } = billing;
  const cycle = isYearly ? 'Yearly' : 'Monthly';

  const formattedPrice = plan.price != null ? `$${Number(plan.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

  const formattedNextDate = nextBillingDate ? formatDate(nextBillingDate) : '—';

  return (
    <Card>
      <CardHeader>
        <p className={styles.sectionTitle}>Current Plan</p>
      </CardHeader>
      <CardBody>
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>Plan</span>
            <span className={styles.value}>{plan.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Price</span>
            <span className={styles.value}>{formattedPrice}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Billing Cycle</span>
            <span className={styles.value}>{cycle}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Next Billing Date</span>
            <span className={styles.value}>{formattedNextDate}</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
