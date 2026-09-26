import { Button, Card, CardBody, CardHeader, Checkbox, FormField, FormGroup, SelectField, type SelectOption } from '@tapestry/ui';
import type { ProductGrantPermission } from '@tapestry/types';
import { createEmptyGrant, STORE_FULFILLMENT_KIND_OPTIONS } from '../../../store.helpers';
import type { ProductEditorFormValues } from '../../../store.types';
import type { FulfillmentTabProps } from '../productEditor.types';
import styles from '../ProductEditor.module.scss';

export default function FulfillmentTab({ form, disabled, resourceOptions, resourceQueryState }: FulfillmentTabProps) {
  const selectedIds = form.values.grants.map((grant) => grant.resourceId);

  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Fulfillment & Grants</h2>
          <p className={styles.sectionSubtitle}>Connect products to library resources and define whether the product has digital or shipping requirements.</p>
        </div>
      </CardHeader>
      <CardBody className={styles.formBody}>
        <FormGroup>
          <FormField name="fulfillmentKind">
            {(field) => (
              <SelectField
                floatingLabel
                id={field.id}
                label="Fulfillment Kind"
                value={field.value as string}
                onChange={(event) => {
                  const nextKind = event.target.value as ProductEditorFormValues['fulfillmentKind'];
                  field.onChange(nextKind);

                  if (nextKind === 'physical') {
                    form.setValue('grants', [], { touch: true, validate: true });
                  }

                  if (nextKind === 'digital') {
                    form.setValue('requiresShipping', false, { touch: true, validate: true });
                  }
                }}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                options={STORE_FULFILLMENT_KIND_OPTIONS as unknown as SelectOption[]}
                disabled={disabled}
              />
            )}
          </FormField>
          <FormField name="requiresShipping">
            {(field) => (
              <div className={styles.checkboxField}>
                <Checkbox id={field.id} checked={field.value as boolean} onChange={field.onChange} disabled={disabled || form.values.fulfillmentKind === 'digital'} label="Requires Shipping" />
              </div>
            )}
          </FormField>
        </FormGroup>

        <FormField name="grants">
          {(field) => (
            <div className={styles.sectionStack}>
              <div className={styles.subsectionHeader}>
                <div>
                  <h3 className={styles.subsectionTitle}>Resource Grants</h3>
                  <p className={styles.subsectionCopy}>Choose the library resources this product should unlock. Each resource can only appear once.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  tone="neutral"
                  onClick={() => {
                    form.setValue('grants', [...form.values.grants, createEmptyGrant()], { touch: true, validate: true });
                  }}
                  disabled={disabled || form.values.fulfillmentKind === 'physical'}
                >
                  Add Grant
                </Button>
              </div>

              {resourceQueryState.isError ? (
                <div className={styles.notice}>Library resources failed to load from `/api/v1/library/resources`. Check the API mount or auth context before saving grants.</div>
              ) : null}

              {resourceQueryState.isLoading ? <div className={styles.notice}>Loading library resources...</div> : null}

              {form.values.fulfillmentKind === 'physical' ? (
                <div className={styles.emptyState}>Physical products cannot include digital resource grants.</div>
              ) : form.values.grants.length === 0 ? (
                <div className={styles.emptyState}>No grants configured yet.</div>
              ) : (
                <div className={styles.collectionStack}>
                  {form.values.grants.map((grant, index) => {
                    const rowOptions = resourceOptions.map((option) => ({
                      ...option,
                      disabled: option.value !== grant.resourceId && selectedIds.includes(String(option.value)),
                    }));

                    return (
                      <div key={`grant-${index}`} className={styles.collectionCard}>
                        <div className={styles.collectionCardHeader}>
                          <strong>Grant {index + 1}</strong>
                          <Button
                            type="button"
                            variant="ghost"
                            tone="danger"
                            onClick={() => {
                              form.setValue(
                                'grants',
                                form.values.grants.filter((_, grantIndex) => grantIndex !== index),
                                { touch: true, validate: true }
                              );
                            }}
                            disabled={disabled}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className={styles.collectionCardBody}>
                          <SelectField
                            floatingLabel
                            label="Library Resource"
                            value={grant.resourceId}
                            onChange={(event) => {
                              const nextGrants = [...form.values.grants];
                              nextGrants[index] = {
                                ...grant,
                                resourceId: event.target.value,
                              };
                              form.setValue('grants', nextGrants, { touch: true, validate: true });
                            }}
                            helpText="Loaded from `/api/v1/library/resources`."
                            options={[{ label: 'Select a resource...', value: '' }, ...rowOptions]}
                            disabled={disabled || resourceQueryState.isLoading}
                          />

                          <div className={styles.permissionGrid}>
                            <Checkbox
                              checked={grant.permissions.includes('view')}
                              onChange={(checked) => {
                                const permissions = checked
                                  ? ([...new Set([...grant.permissions, 'view'])] as ProductGrantPermission[])
                                  : grant.permissions.filter((permission) => permission !== 'view');
                                const nextGrants = [...form.values.grants];
                                nextGrants[index] = {
                                  ...grant,
                                  permissions,
                                };
                                form.setValue('grants', nextGrants, { touch: true, validate: true });
                              }}
                              disabled={disabled}
                              label="View"
                            />
                            <Checkbox
                              checked={grant.permissions.includes('download')}
                              onChange={(checked) => {
                                const permissions = checked
                                  ? ([...new Set([...grant.permissions, 'download'])] as ProductGrantPermission[])
                                  : grant.permissions.filter((permission) => permission !== 'download');
                                const nextGrants = [...form.values.grants];
                                nextGrants[index] = {
                                  ...grant,
                                  permissions,
                                };
                                form.setValue('grants', nextGrants, { touch: true, validate: true });
                              }}
                              disabled={disabled}
                              label="Download"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {field.shouldShowError && field.error ? <p className={styles.errorText}>{field.error}</p> : null}
            </div>
          )}
        </FormField>
      </CardBody>
    </Card>
  );
}
