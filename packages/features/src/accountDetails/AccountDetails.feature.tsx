'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, CardBody, CardHeader, Form, FormField, FormGroup, Input, Loader, Switcher, TextField, Tooltip } from '@tapestry/ui';
import { useAccountForm } from './hooks/useAccountForm';
import { usePasswordForm } from './hooks/usePasswordForm';
import { CancelAccountModal } from './CancelAccountModal';
import type { AccountDetailsProps } from './AccountDetails.types';
import styles from './AccountDetails.module.scss';
import { useBilling } from '@tapestry/hooks';

export function AccountDetails({ userId, api, onSaveSuccess, onPasswordSuccess, notificationFeatures = {}, onSmsToggle, showCancelSection, onCancelSuccess }: AccountDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { data } = useBilling(api, userId);

  const shouldShowCancel = showCancelSection ?? !!data?.processor;

  const cancelMutation = useMutation({
    mutationFn: () => api.delete(`/payment/${userId}`),
    onSuccess: () => {
      setShowCancelModal(false);
      onCancelSuccess?.();
    },
  });

  const {
    form: accountForm,
    isLoading,
    isSaving,
  } = useAccountForm(api, userId, () => {
    setIsEditing(false);
    onSaveSuccess?.();
  });

  const { form: passwordForm, isSaving: isSavingPassword } = usePasswordForm(api, userId, onPasswordSuccess);

  const { email: emailEnabled = true, sms: smsEnabled = false, push: pushEnabled = false } = notificationFeatures;

  if (isLoading) {
    return (
      <div className={styles.loaderWrap}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Account Information ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className={styles.cardHead}>
            <h2 className={styles.sectionTitle}>Account Information</h2>
            <Button
              type="button"
              variant="ghost"
              tone="neutral"
              size="sm"
              onClick={() => {
                if (isEditing) accountForm.reset();
                setIsEditing((v) => !v);
              }}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          <Form form={accountForm}>
            <FormGroup gap="md">
              <FormField name="email">
                {(field) => (
                  <TextField
                    floatingLabel
                    label="Email Address"
                    type="email"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    disabled={!isEditing}
                    required
                  />
                )}
              </FormField>
            </FormGroup>

            <div className={styles.notificationSection}>
              <h3 className={styles.subTitle}>Notification Preferences</h3>

              <div className={styles.toggleList}>
                <FormField name="notificationsEmail">
                  {(field) => (
                    <div className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>Email Notifications</span>
                      <Switcher checked={field.value as boolean} onChange={(checked) => field.setValue(checked as never)} disabled={!isEditing || !emailEnabled} />
                    </div>
                  )}
                </FormField>

                <FormField name="notificationsSms">
                  {(field) => (
                    <div className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>SMS Notifications</span>
                      <Tooltip title={!smsEnabled ? 'SMS notifications are not available on your current plan' : ''}>
                        <Switcher
                          checked={smsEnabled ? (field.value as boolean) : false}
                          onChange={(checked) => {
                            if (!smsEnabled) return;
                            if (onSmsToggle) {
                              onSmsToggle(checked);
                            } else {
                              field.setValue(checked as never);
                            }
                          }}
                          disabled={!isEditing || !smsEnabled}
                        />
                      </Tooltip>
                    </div>
                  )}
                </FormField>

                <FormField name="notificationsPush">
                  {(field) => (
                    <div className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>Push Notifications</span>
                      <Tooltip title={!pushEnabled ? 'Push notifications are not available on your current plan' : ''}>
                        <Switcher
                          checked={pushEnabled ? (field.value as boolean) : false}
                          onChange={(checked) => field.setValue(checked as never)}
                          disabled={!isEditing || !pushEnabled}
                        />
                      </Tooltip>
                    </div>
                  )}
                </FormField>
              </div>
            </div>

            {isEditing && (
              <div className={styles.actions}>
                <Button type="submit" tone="gold" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            )}
          </Form>
        </CardBody>
      </Card>

      {/* ── Change Password ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <h2 className={styles.sectionTitle}>Change Password</h2>
        </CardHeader>

        <CardBody>
          <Form form={passwordForm}>
            <FormGroup gap="md">
              <FormField name="newPassword">
                {(field) => (
                  <TextField
                    id="newPassword"
                    floatingLabel
                    type="password"
                    label="New Password"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                  />
                )}
              </FormField>

              <FormField name="confirmPassword">
                {(field) => (
                  <TextField
                    floatingLabel
                    type="password"
                    label="Confirm Password"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                  />
                )}
              </FormField>
            </FormGroup>

            <div className={styles.actions}>
              <Button type="submit" tone="gold" isLoading={isSavingPassword}>
                Update Password
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>

      {/* ── Danger Zone ──────────────────────────────────────── */}
      {!shouldShowCancel && (
        <Card className={styles.dangerZone}>
          <CardHeader>
            <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h2>
          </CardHeader>

          <CardBody>
            <p className={styles.dangerDescription}>
              Your account will be cancelled at the end of your current billing period. You will no longer be discoverable by teams and agents after cancellation.
            </p>
            <Button type="button" tone="danger" variant="outline" onClick={() => setShowCancelModal(true)}>
              Cancel Account
            </Button>
          </CardBody>
        </Card>
      )}

      <CancelAccountModal open={showCancelModal} onConfirm={() => cancelMutation.mutate()} onCancel={() => setShowCancelModal(false)} isLoading={cancelMutation.isPending} />
    </div>
  );
}
