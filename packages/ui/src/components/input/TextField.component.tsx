// TextField.component.tsx
'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Input, InputChangeValue, InputProps } from './Input.component';
import { FormFieldFrame } from './FormFieldFrame.component';

export type TextFieldProps = InputProps & {
  label?: string;
  hint?: string;
  helpText?: string;
  error?: string;
  floatingLabel?: boolean;
};

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== '';
}

export function TextField({ id, label, hint, helpText, error, className, floatingLabel = false, valueMode = 'raw', ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const displayHint = helpText ?? hint;
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [fieldHasValue, setFieldHasValue] = useState(hasValue(inputProps.value) || hasValue(inputProps.defaultValue));

  const hasError = Boolean(error) || Boolean(inputProps.hasError);
  const isFloating = isFocused || fieldHasValue;

  useEffect(() => {
    const checkAutofill = () => {
      if (!inputRef.current) return;

      const hasAutofill = inputRef.current.matches(':-webkit-autofill');
      const currentValue = inputRef.current.value;

      if (hasAutofill || currentValue) {
        setFieldHasValue(true);
      }
    };

    checkAutofill();
    const timer = setTimeout(checkAutofill, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    inputProps.onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setFieldHasValue(hasValue(event.target.value));
    inputProps.onBlur?.(event);
  };

  const handleChange = (nextValue: React.ChangeEvent<HTMLInputElement> | InputChangeValue) => {
    if (valueMode === 'number') {
      setFieldHasValue(hasValue(nextValue));
      (inputProps.onChange as ((value: InputChangeValue) => void) | undefined)?.(nextValue as InputChangeValue);
      return;
    }

    const event = nextValue as React.ChangeEvent<HTMLInputElement>;
    setFieldHasValue(hasValue(event.target.value));
    (inputProps.onChange as ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined)?.(event);
  };

  return (
    <FormFieldFrame
      id={controlId}
      label={label}
      hint={displayHint}
      error={error}
      className={className}
      floatingLabel={floatingLabel}
      isFloating={isFloating}
      hasError={hasError}
      renderControl={({ controlClassName, describedBy, showPlaceholder }) => (
        <Input
          ref={inputRef}
          id={controlId}
          {...inputProps}
          valueMode={valueMode}
          hasError={hasError}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={controlClassName}
          aria-describedby={describedBy}
          placeholder={showPlaceholder ? inputProps.placeholder : undefined}
        />
      )}
    />
  );
}
