import React from 'react';
import type { IBilling } from '@tapestry/types';
import { Card, CardHeader, CardBody } from '@tapestry/ui';
import { StripeActionsHandler } from '@tapestry/utils';
import styles from './sections.module.scss';

interface PaymentMethodSectionProps {
  billing: IBilling;
}

export function PaymentMethodSection({ billing }: PaymentMethodSectionProps) {
  const { processor, paymentProcessorData } = billing;

  const hasProcessor = !!processor && !!paymentProcessorData?.[processor];

  if (!hasProcessor) {
    return (
      <Card>
        <CardHeader>
          <p className={styles.sectionTitle}>Payment Method</p>
        </CardHeader>
        <CardBody>
          <p className={styles.empty}>No payment method on file.</p>
        </CardBody>
      </Card>
    );
  }

  const handler = new StripeActionsHandler(paymentProcessorData![processor!]);
  const name = handler.getCustomerName();
  const email = handler.getCustomerEmail();
  const phone = handler.getCustomerPhone();
  const address = handler.getBillingAddress();
  const pm = handler.getCustomerPaymentMethod();

  return (
    <Card>
      <CardHeader>
        <p className={styles.sectionTitle}>Payment Method</p>
      </CardHeader>
      <CardBody>
        <div className={styles.grid}>
          {name !== 'N/A' && (
            <div className={styles.field}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>{name}</span>
            </div>
          )}
          {email !== 'N/A' && (
            <div className={styles.field}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{email}</span>
            </div>
          )}
          {phone !== 'N/A' && (
            <div className={styles.field}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{phone}</span>
            </div>
          )}
          {pm.last4 && (
            <div className={styles.field}>
              <span className={styles.label}>Card</span>
              <span className={styles.value}>
                {pm.brand ? `${pm.brand.charAt(0).toUpperCase()}${pm.brand.slice(1)} ` : ''}
                ···· {pm.last4}
                {pm.exp_month && pm.exp_year ? ` · ${pm.exp_month}/${String(pm.exp_year).slice(-2)}` : ''}
              </span>
            </div>
          )}
          {address && (
            <div className={styles.field}>
              <span className={styles.label}>Billing Address</span>
              <span className={styles.value}>{address}</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
