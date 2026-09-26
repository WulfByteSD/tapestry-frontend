'use client';

import React, { useRef } from 'react';
import { Modal, TextField, TextAreaField, SelectField, Form, FormField, useForm } from '@tapestry/ui';
import type { AxiosInstance } from 'axios';
import { useCreateTicket, useSupportGroups } from '@tapestry/hooks';
import styles from './CreateTicketModal.module.scss';

interface CreateTicketModalProps {
  api: AxiosInstance;
  open: boolean;
  onClose: () => void;
}

type TicketFormValues = {
  subject: string;
  category: string[];
  message: string;
};

const DEFAULT_VALUES: TicketFormValues = {
  subject: '',
  category: [],
  message: '',
};

export function CreateTicketModal({ api, open, onClose }: CreateTicketModalProps) {
  const { mutate: createTicket, isPending } = useCreateTicket(api);
  const { data: groups } = useSupportGroups(api);
  const categoryOptions = (groups ?? []).filter((g) => g.isActive).map((g) => ({ label: g.name, value: g.name }));

  const submitHandlerRef = useRef<((values: TicketFormValues) => Promise<void>) | null>(null);

  const form = useForm<TicketFormValues>({
    initialValues: DEFAULT_VALUES,
    validateOnBlur: true,
    validators: {
      subject: (v) => (v?.trim() ? undefined : 'Subject is required.'),
      message: (v) => (v?.trim() ? undefined : 'Message is required.'),
    },
    onSubmit: (values) => submitHandlerRef.current?.(values) ?? Promise.resolve(),
  });

  submitHandlerRef.current = async (values: TicketFormValues) => {
    await new Promise<void>((resolve) => {
      createTicket(
        { subject: values.subject, category: values.category, message: values.message },
        {
          onSuccess: () => {
            form.reset();
            onClose();
            resolve();
          },
          onError: () => resolve(),
        }
      );
    });
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal open={open} title="New Support Request" onCancel={handleCancel} onOk={() => form.handleSubmit()} okText="Submit Ticket" cancelText="Cancel" confirmLoading={isPending}>
      <Form form={form}>
        <div className={styles.form}>
          <FormField name="subject">
            {(field) => (
              <TextField
                label="Subject"
                floatingLabel
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                placeholder="Briefly describe your issue"
              />
            )}
          </FormField>
          <FormField name="category">
            {(field) => (
              <SelectField
                mode="multiple"
                floatingLabel
                label="Category"
                value={field.value as string[]}
                onChange={(val) => field.setValue(val as string[])}
                options={categoryOptions}
                placeholder="Select one or more categories"
              />
            )}
          </FormField>
          <FormField name="message">
            {(field) => (
              <TextAreaField
                label="Message"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                placeholder="Describe your issue in detail"
                rows={5}
                resize="vertical"
              />
            )}
          </FormField>
        </div>
      </Form>
    </Modal>
  );
}
