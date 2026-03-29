// Input.component.tsx
'use client';

import React, { useId, useState } from 'react';
import { FormControlShell, type FormControlSize } from './FormControlShell.component';
import { FormFieldFrame } from './FormFieldFrame.component';
import styles from './Input.module.scss';

export type InputSize = FormControlSize;
export type InputChangeValue = string | number | undefined;

type InputBaseProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  size?: InputSize;
  hasError?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  showPasswordToggle?: boolean;
  label?: string;
  hint?: string;
  error?: string;
};

type RawInputProps = InputBaseProps & {
  valueMode?: 'raw';
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

type NumericInputProps = InputBaseProps & {
  valueMode: 'number';
  onChange?: (value: InputChangeValue) => void;
};

export type InputProps = RawInputProps | NumericInputProps;

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {visible ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', hasError = false, leftSlot, rightSlot, showPasswordToggle = false, valueMode = 'raw', className, type, onChange, label, hint, error, id, disabled, ...rest },
  ref
) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;
  const hasErrorState = Boolean(error) || hasError;

  const inputType = showPasswordToggle ? (passwordVisible ? 'text' : 'password') : type;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;

    if (valueMode === 'number') {
      const nextValue = event.target.value;
      const parsedValue = nextValue === '' ? undefined : event.target.valueAsNumber;
      (onChange as NumericInputProps['onChange'])?.(Number.isNaN(parsedValue as number) ? undefined : parsedValue);
      return;
    }

    (onChange as RawInputProps['onChange'])?.(event);
  };

  const renderInput = ({
    controlClassName,
    describedBy,
  }: {
    controlClassName?: string;
    describedBy?: string;
  } = {}) => {
    const composedRightSlot =
      showPasswordToggle || rightSlot ? (
        <>
          {showPasswordToggle ? (
            <button
              type="button"
              onClick={() => setPasswordVisible((value) => !value)}
              className={styles.passwordToggle}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
              disabled={disabled}
            >
              <EyeIcon visible={passwordVisible} />
            </button>
          ) : null}
          {rightSlot}
        </>
      ) : undefined;

    return (
      <FormControlShell size={size as any} hasError={hasErrorState} disabled={disabled} leftSlot={leftSlot} rightSlot={composedRightSlot} className={controlClassName ?? className}>
        <input ref={ref} id={inputId} className={styles.input} type={inputType} disabled={disabled} aria-describedby={describedBy} {...rest} onChange={handleChange} />
      </FormControlShell>
    );
  };

  if (label || hint || error) {
    return (
      <FormFieldFrame
        id={inputId}
        label={label}
        hint={hint}
        error={error}
        className={className}
        hasError={hasErrorState}
        renderControl={({ describedBy }) => renderInput({ describedBy })}
      />
    );
  }

  return renderInput();
});
