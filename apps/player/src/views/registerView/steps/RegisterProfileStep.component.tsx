'use client';

import { useMemo } from 'react';
import { Button, Form, FormField, Select, TextField, useForm } from '@tapestry/ui';
import { useRegisterContext } from '../Register.context';
import { TIMEZONES } from '@tapestry/types';
import { COUNTRIES } from '../data/countries';
import { getRegionsForCountry } from '../data/regions';
import styles from '../Register.module.scss';

export default function RegisterProfileStep() {
  const { values, setValues, goToStep } = useRegisterContext();

  const form = useForm({
    initialValues: {
      firstName: values.player.firstName,
      lastName: values.player.lastName,
      displayName: values.player.displayName,
      bio: values.player.bio,
      country: values.player.country || 'USA',
      region: values.player.region || '',
      timezone: values.player.timezone || '',
    },
    validators: {
      displayName: (value) => (String(value).trim() ? undefined : 'Display name is required'),
      firstName: (value) => (String(value).trim() ? undefined : 'First name is required'),
      country: (value) => (String(value).trim() ? undefined : 'Country is required'),
    },
    onSubmit: (nextValues) => {
      setValues((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          ...nextValues,
        },
      }));
      goToStep('account');
    },
  });

  const availableRegions = useMemo(() => getRegionsForCountry(form.values.country), [form.values.country]);

  return (
    <Form form={form} className={styles.form}>
      <div className={styles.row}>
        <FormField name="firstName">
          {(field) => <TextField floatingLabel id={field.id} label="First name" value={field.value as string} onChange={field.onChange} required />}
        </FormField>
        <FormField name="lastName">{(field) => <TextField floatingLabel id={field.id} label="Last name" value={field.value as string} onChange={field.onChange} />}</FormField>
      </div>

      <FormField name="displayName">
        {(field) => (
          <TextField
            floatingLabel
            id={field.id}
            label="Display name"
            value={field.value as string}
            onChange={field.onChange}
            required
            onBlur={field.onBlur}
            error={field.shouldShowError ? field.error : undefined}
          />
        )}
      </FormField>

      <FormField name="bio">{(field) => <TextField floatingLabel id={field.id} label="Bio (optional)" value={field.value as string} onChange={field.onChange} />}</FormField>

      <FormField name="country">
        {(field) => (
          <Select
            id={field.id}
            value={field.value as string}
            onChange={(e) => {
              field.onChange(e.target.value);
              form.setValue('region', '');
            }}
            required
            onBlur={field.onBlur}
            style={{ padding: '0.75rem', fontSize: '1rem' }}
          >
            <option value="">Select country...</option>
            {COUNTRIES.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      {availableRegions.length > 0 && (
        <FormField name="region">
          {(field) => (
            <Select id={field.id} value={field.value as string} onChange={field.onChange} style={{ padding: '0.75rem', fontSize: '1rem' }}>
              <option value="">Select region...</option>
              {availableRegions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      )}

      <FormField name="timezone">
        {(field) => (
          <Select id={field.id} value={field.value as string} onChange={field.onChange} style={{ padding: '0.75rem', fontSize: '1rem' }}>
            <option value="">Select timezone...</option>
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </Select>
        )}
      </FormField>

      <Button className={styles.primaryBtn} type="submit">
        Next
      </Button>
    </Form>
  );
}
