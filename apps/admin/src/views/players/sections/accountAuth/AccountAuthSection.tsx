'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Button, TextField, Form, FormField, useForm, Switcher, CopyField, useAlert } from '@tapestry/ui';
import { usePlayerAuth, usePlayerDetail, useUpdateAuthAccount } from '@/lib/player-admin';
import { FaKey, FaShieldAlt } from 'react-icons/fa';
import { ResetPasswordModal } from './ResetPasswordModal.component';
import { SetCustomPasswordModal } from './SetCustomPasswordModal.component';
import styles from './AccountAuthSection.module.scss';

type AuthFormValues = {
  email: string;
  isEmailVerified: boolean;
  isActive: boolean;
};

type AccountAuthSectionProps = {
  playerId: string;
};

export function AccountAuthSection({ playerId }: AccountAuthSectionProps) {
  const { data: playerData } = usePlayerDetail(playerId);
  const player = playerData?.payload;
  const { data: auth } = usePlayerAuth(player?.user);

  const [isEditing, setIsEditing] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [customPasswordModalOpen, setCustomPasswordModalOpen] = useState(false);

  const { addAlert } = useAlert();

  const updateAuthMutation = useUpdateAuthAccount(auth?._id || '');

  const authForm = useForm<AuthFormValues>({
    initialValues: {
      email: '',
      isEmailVerified: false,
      isActive: false,
    },
  });

  // Initialize form when auth data loads
  useEffect(() => {
    if (auth) {
      authForm.replaceValues({
        email: auth.email || '',
        isEmailVerified: auth.isEmailVerified || false,
        isActive: auth.isActive || false,
      });
    }
  }, [auth]);

  const handleSaveChanges = () => {
    updateAuthMutation.mutate(
      {
        email: authForm.values.email.trim() || undefined,
        isEmailVerified: authForm.values.isEmailVerified,
        isActive: authForm.values.isActive,
      },
      {
        onSuccess: () => {
          addAlert({
            type: 'success',
            message: 'Account updated successfully',
          });
          authForm.replaceValues(authForm.values);
          setIsEditing(false);
        },
        onError: () => {
          addAlert({
            type: 'error',
            message: 'Failed to update account',
          });
        },
      }
    );
  };

  const handleResetChanges = () => {
    authForm.reset();
    setIsEditing(false);
  };

  if (!player || !auth) return null;

  return (
    <div className={styles.authSectionContainer}>
      {/* Account Information Card */}
      <Card className={styles.authCard}>
        <CardHeader>
          <div className={styles.cardHeaderContent}>
            <h2>Account Information</h2>
            <Button variant={isEditing ? 'outline' : 'solid'} tone="purple" onClick={() => setIsEditing(!isEditing)} disabled={updateAuthMutation.isPending}>
              {isEditing ? 'Cancel' : 'Edit Account'}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className={styles.infoGrid}>
            {/* User ID - readonly */}
            <div className={styles.infoRow}>
              <CopyField
                label="User ID"
                value={auth._id}
                variant="field"
                displayAs="code"
                truncate
                size="sm"
                copyMessage="User ID copied to clipboard"
                className={styles.copyField}
              />
            </div>
            <Form form={authForm} className={styles.form}>
              <div className={styles.formRow}>
                <FormField name="email">
                  {(field) => (
                    <TextField
                      id={field.id}
                      label="Email"
                      value={field.value as string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={field.shouldShowError ? field.error : undefined}
                      placeholder="Enter email address"
                      disabled={!isEditing || updateAuthMutation.isPending}
                      type="email"
                    />
                  )}
                </FormField>
              </div>

              <div className={styles.formRow}>
                <FormField name="isEmailVerified">
                  {(field) => (
                    <div className={styles.switcherField}>
                      <label htmlFor={field.id} className={styles.switcherLabel}>
                        Email Verified
                      </label>
                      <Switcher id={field.id} checked={field.value as boolean} onChange={field.onChange} disabled={!isEditing || updateAuthMutation.isPending} size="md" />
                    </div>
                  )}
                </FormField>
              </div>

              <div className={styles.formRow}>
                <FormField name="isActive">
                  {(field) => (
                    <div className={styles.switcherField}>
                      <label htmlFor={field.id} className={styles.switcherLabel}>
                        Account Active
                        <span className={styles.fieldHint}>{field.value ? '(User can log in)' : '(User cannot log in)'}</span>
                      </label>
                      <Switcher id={field.id} checked={field.value as boolean} onChange={field.onChange} disabled={!isEditing || updateAuthMutation.isPending} size="md" />
                    </div>
                  )}
                </FormField>
              </div>
            </Form>
          </div>

          {isEditing && authForm.isDirty && (
            <div className={styles.formActions}>
              <Button variant="outline" tone="neutral" onClick={handleResetChanges} disabled={updateAuthMutation.isPending}>
                Reset
              </Button>
              <Button tone="purple" onClick={handleSaveChanges} disabled={updateAuthMutation.isPending}>
                {updateAuthMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}

          {updateAuthMutation.isError && <div className={styles.errorMessage}>Failed to update account information. Please try again.</div>}
        </CardBody>
      </Card>

      {/* Password Management Card */}
      <Card className={styles.authCard}>
        <CardHeader>
          <div className={styles.cardHeaderContent}>
            <FaShieldAlt className={styles.headerIcon} />
            <h2>Password Management</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className={styles.passwordManagement}>
            <div className={styles.passwordInfo}>
              <FaKey className={styles.infoIcon} />
              <div className={styles.infoText}>
                <h4>Manage user password and authentication settings</h4>
                <p>Reset the password or set a custom one for the user.</p>
              </div>
            </div>

            <div className={styles.passwordActions}>
              <Button variant="solid" tone="danger" onClick={() => setResetPasswordModalOpen(true)} leftIcon={<FaKey />}>
                Reset Password (Auto-Generate)
              </Button>
              <Button variant="outline" tone="neutral" onClick={() => setCustomPasswordModalOpen(true)}>
                Set Custom Password
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <ResetPasswordModal open={resetPasswordModalOpen} onClose={() => setResetPasswordModalOpen(false)} authId={auth._id} displayName={player.displayName} email={auth.email} />

      <SetCustomPasswordModal open={customPasswordModalOpen} onClose={() => setCustomPasswordModalOpen(false)} authId={auth._id} />
    </div>
  );
}
