'use client';

import React from 'react';
import type { FeaturePlan, BillingCycle } from '../../BillingSetup.types';
import styles from './PlanSelect.module.scss';

interface FeaturePlanCardProps {
  plan: FeaturePlan;
  billingCycle: BillingCycle;
  selected: boolean;
  onSelect: () => void;
}

export function FeaturePlanCard({ plan, billingCycle, selected, onSelect }: FeaturePlanCardProps) {
  const isYearly = billingCycle === 'yearly';
  const yearlyDiscount = plan.yearlyDiscount ?? 0;
  const price = isYearly ? plan.price * 12 * ((100 - yearlyDiscount) / 100) : plan.price;

  return (
    <button type="button" className={`${styles.card} ${selected ? styles.selected : ''} ${styles[plan.tier] ?? ''}`} onClick={onSelect}>
      {plan.mostPopular && <div className={styles.popularBadge}>Most Popular</div>}

      <div className={styles.cardTier}>{plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}</div>
      <h3 className={styles.cardName}>{plan.name}</h3>
      <p className={styles.cardDescription}>{plan.description}</p>

      <div className={styles.priceRow}>
        {plan.price === 0 ? (
          <span className={styles.price}>Free</span>
        ) : (
          <>
            <span className={styles.price}>${price.toFixed(0)}</span>
            <span className={styles.pricePer}>/{isYearly ? 'yr' : 'mo'}</span>
          </>
        )}
      </div>

      {isYearly && yearlyDiscount > 0 && plan.price > 0 && <div className={styles.discountBadge}>Save {yearlyDiscount}% annually</div>}

      {plan.features.length > 0 && (
        <ul className={styles.featureList}>
          {plan.features.map((f, i) => (
            <li key={i} className={styles.featureItem}>
              ✓ {f.name}
            </li>
          ))}
        </ul>
      )}
    </button>
  );
}
