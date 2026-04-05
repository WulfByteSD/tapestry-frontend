'use client';

import { Modal, Button, TextField, Form, FormField, useForm, Switcher, useAlert } from '@tapestry/ui';
import { useSetCustomPassword } from '@/lib/player-admin';
import { FaKey } from 'react-icons/fa';
import styles from './AccountAuthSection.module.scss';

type PasswordFormValues = {
  password: string;
  confirmPassword: string;
  sendNotification: boolean;
};

type SetCustomPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  authId: string;
};

export function SetCustomPasswordModal({ open, onClose, authId }: SetCustomPasswordModalProps) {
  const { addAlert } = useAlert();
  const setPasswordMutation = useSetCustomPassword(authId);

  const passwordForm = useForm<PasswordFormValues>({
    initialValues: {
      password: '',
      confirmPassword: '',
      sendNotification: false,
    },
    validators: {
      password: (value) => {
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        return undefined;
      },
      confirmPassword: (value, values) => {
        if (!value) {
          return 'Please confirm the password';
        }
        if (value !== values.password) {
          return 'Passwords do not match';
        }
        return undefined;
      },
    },
  });

  const handleSetPassword = () => {
    const isValid = passwordForm.validateForm();
    if (!isValid) {
      // Mark all fields as touched to show errors
      passwordForm.setTouched('password', true);
      passwordForm.setTouched('confirmPassword', true);
      return;
    }

    setPasswordMutation.mutate(
      {
        password: passwordForm.values.password,
        sendNotification: passwordForm.values.sendNotification,
      },
      {
        onSuccess: () => {
          addAlert({
            type: 'success',
            message: passwordForm.values.sendNotification ? 'Password set successfully! User has been notified via email.' : 'Password set successfully!',
          });
          onClose();
          passwordForm.reset();
        },
        onError: () => {
          addAlert({
            type: 'error',
            message: 'Failed to set password',
          });
        },
      }
    );
  };

  const handleClose = () => {
    onClose();
    passwordForm.reset();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className={styles.modalTitle}>
          <FaKey />
          <span>Set Custom Password</span>
        </div>
      }
      footer={
        <div className={styles.modalFooter}>
          <Button variant="outline" tone="neutral" onClick={handleClose}>
            Cancel
          </Button>
          <Button tone="purple" onClick={handleSetPassword} disabled={setPasswordMutation.isPending}>
            {setPasswordMutation.isPending ? 'Setting...' : 'Set Password'}
          </Button>
        </div>
      }
    >
      <Form form={passwordForm} className={styles.passwordModalForm}>
        <div className={styles.formRow}>
          <FormField name="password">
            {(field) => (
              <TextField
                id={field.id}
                label="New Password"
                type="password"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                placeholder="Enter new password (min 8 characters)"
                disabled={setPasswordMutation.isPending}
              />
            )}
          </FormField>
        </div>

        <div className={styles.formRow}>
          <FormField name="confirmPassword">
            {(field) => (
              <TextField
                id={field.id}
                label="Confirm Password"
                type="password"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                placeholder="Confirm new password"
                disabled={setPasswordMutation.isPending}
              />
            )}
          </FormField>
        </div>

        <div className={styles.formRow}>
          <FormField name="sendNotification">
            {(field) => (
              <div className={styles.switcherField}>
                <label htmlFor={field.id} className={styles.switcherLabel}>
                  Notify User
                  <span className={styles.fieldHint}>Send an email notification about the password change</span>
                </label>
                <Switcher id={field.id} checked={field.value as boolean} onChange={field.onChange} disabled={setPasswordMutation.isPending} size="md" />
              </div>
            )}
          </FormField>
        </div>
      </Form>
    </Modal>
  );
}
