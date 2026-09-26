import { Card, CardBody, CardHeader, FormField, FormGroup, SelectField, TextField, type SelectOption } from '@tapestry/ui';
import { formatCurrencyCents, STORE_PRICING_TYPE_OPTIONS } from '../../../store.helpers';
import type { ProductEditorFormValues } from '../../../store.types';
import type { ProductEditorTabProps } from '../productEditor.types';
import styles from '../ProductEditor.module.scss';

export default function PricingTab({ form, disabled }: ProductEditorTabProps) {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Pricing Rules</h2>
          <p className={styles.sectionSubtitle}>Commerce currently supports free claims and one-time pricing only. Keep all amounts in USD cents.</p>
        </div>
      </CardHeader>
      <CardBody className={styles.formBody}>
        <FormGroup>
          <FormField name="pricingType">
            {(field) => (
              <SelectField
                floatingLabel
                id={field.id}
                label="Pricing Type"
                value={field.value as string}
                onChange={(event) => {
                  const nextType = event.target.value as ProductEditorFormValues['pricingType'];
                  field.onChange(nextType);
                  if (nextType === 'free') {
                    form.setValue('amountCents', 0, { touch: true, validate: true });
                  } else if ((form.values.amountCents ?? 0) <= 0) {
                    form.setValue('amountCents', undefined, { touch: true, validate: true });
                  }
                }}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                options={STORE_PRICING_TYPE_OPTIONS as unknown as SelectOption[]}
                disabled={disabled}
              />
            )}
          </FormField>
          <TextField floatingLabel label="Currency" value="USD" disabled />
        </FormGroup>

        <FormGroup>
          <FormField name="amountCents">
            {(field) => (
              <TextField
                floatingLabel
                id={field.id}
                label="Amount (cents)"
                type="number"
                value={field.value as number | undefined}
                valueMode="number"
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={disabled || form.values.pricingType === 'free'}
                placeholder="0"
              />
            )}
          </FormField>
          <FormField name="compareAtAmountCents">
            {(field) => (
              <TextField
                floatingLabel
                id={field.id}
                label="Compare-at (cents)"
                type="number"
                value={field.value as number | undefined}
                valueMode="number"
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={disabled}
                placeholder="Optional"
              />
            )}
          </FormField>
        </FormGroup>

        <div className={styles.metaStrip}>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Current price</span>
            <strong className={styles.metaValue}>{form.values.pricingType === 'free' ? 'Free' : formatCurrencyCents(form.values.amountCents)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Compare-at</span>
            <strong className={styles.metaValue}>{formatCurrencyCents(form.values.compareAtAmountCents)}</strong>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
