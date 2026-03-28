// SelectField.component.tsx
'use client';

import React, { useId, useRef, useState } from 'react';
import { Select, SelectOption, SelectProps, SelectSize } from './Select.component';
import { MultiSelect } from './MultiSelect.component';
import { FormFieldFrame } from './FormFieldFrame.component';

type BaseSelectFieldProps = {
  label?: string;
  hint?: string;
  className?: string;
  helpText?: string;
  error?: string;
  floatingLabel?: boolean;
  options?: SelectOption[];
};

type SingleSelectFieldProps = BaseSelectFieldProps &
  SelectProps & {
    mode?: 'single';
  };

type MultiSelectFieldProps = BaseSelectFieldProps & {
  mode: 'multiple';
  size?: SelectSize;
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
};

export type SelectFieldProps = SingleSelectFieldProps | MultiSelectFieldProps;

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== '';
}

export function SelectField(props: SelectFieldProps) {
  const generatedId = useId();
  const controlId = props.id ?? generatedId;

  const { label, hint, helpText, error, className, floatingLabel = false, options, mode = 'single' } = props;

  const displayHint = helpText ?? hint;
  const hasError = Boolean(error) || Boolean(props.hasError);

  if (mode === 'multiple') {
    const { value = [], onChange, onFocus, onBlur, disabled, placeholder, size = 'md' } = props as MultiSelectFieldProps;

    const [isFocused, setIsFocused] = useState(false);
    const isFloating = isFocused || hasValue(value);

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      setIsFocused(false);
      onBlur?.(event);
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
          <MultiSelect
            id={controlId}
            value={value}
            onChange={(nextValue) => onChange?.(nextValue)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            showPlaceholder={showPlaceholder}
            hasError={hasError}
            options={options || []}
            size={size}
            className={controlClassName}
            aria-describedby={describedBy}
          />
        )}
      />
    );
  }

  const {
    mode: _mode,
    label: _label,
    hint: _hint,
    helpText: _helpText,
    error: _error,
    floatingLabel: _floatingLabel,
    options: _options,
    className: _className,
    hasError: _hasError,
    children,
    ...selectProps
  } = props as SingleSelectFieldProps;

  const selectRef = useRef<HTMLSelectElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const hasSelectedOptionLabel = hasValue(selectProps.value) && (options || []).some((option) => option.value === selectProps.value && option.label.trim().length > 0);

  const isFloating = isFocused || hasValue(selectProps.value) || hasSelectedOptionLabel;

  const handleFocus = (event: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    selectProps.onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    selectProps.onBlur?.(event);
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
        <Select
          ref={selectRef}
          id={controlId}
          {...selectProps}
          hasError={hasError}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={controlClassName}
          options={options}
          aria-describedby={describedBy}
          hideDisplayWhenEmpty={!showPlaceholder}
        >
          {children}
        </Select>
      )}
    />
  );
}
