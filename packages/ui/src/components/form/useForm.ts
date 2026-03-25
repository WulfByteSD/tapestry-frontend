'use client';

import * as React from 'react';

export type FormValues = Record<string, unknown>;
export type FieldName<T extends FormValues> = Extract<keyof T, string>;
export type FieldErrorMap<T extends FormValues> = Partial<Record<FieldName<T>, string>>;
export type FieldTouchedMap<T extends FormValues> = Partial<Record<FieldName<T>, boolean>>;
export type FieldDirtyMap<T extends FormValues> = Partial<Record<FieldName<T>, boolean>>;

export type MaybePromise<T> = T | Promise<T>;

export type FieldValidator<T extends FormValues, K extends FieldName<T>> = (value: T[K], values: T) => string | undefined;

export type FormValidators<T extends FormValues> = Partial<{
  [K in FieldName<T>]: FieldValidator<T, K> | Array<FieldValidator<T, K>>;
}>;

export type SetFieldValueOptions = {
  validate?: boolean;
  touch?: boolean;
};

export type SetFieldTouchedOptions = {
  validate?: boolean;
};

export type SetValuesOptions = {
  validate?: boolean;
  touch?: boolean;
  updateInitialValues?: boolean;
  markAsDirty?: boolean;
};

export type UseFormOptions<T extends FormValues> = {
  initialValues: T;
  validators?: FormValidators<T>;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  onSubmit?: (values: T, api: UseFormReturn<T>) => MaybePromise<void>;
};

export type FormFieldApi<T extends FormValues, K extends FieldName<T>> = {
  name: K;
  id: string;
  value: T[K];
  error?: string;
  touched: boolean;
  dirty: boolean;
  shouldShowError: boolean;
  setValue: (value: T[K], options?: SetFieldValueOptions) => void;
  setTouched: (touched?: boolean, options?: SetFieldTouchedOptions) => void;
  onChange: (eventOrValue: T[K] | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (event?: React.FocusEvent<HTMLElement>) => void;
  reset: () => void;
};

export type UseFormReturn<T extends FormValues> = {
  formId: string;
  values: T;
  errors: FieldErrorMap<T>;
  touched: FieldTouchedMap<T>;
  dirtyFields: FieldDirtyMap<T>;
  submitCount: number;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  canSubmit: boolean;
  setValue: <K extends FieldName<T>>(name: K, value: T[K], options?: SetFieldValueOptions) => void;
  setValues: (values: Partial<T>, options?: SetValuesOptions) => void;
  setTouched: <K extends FieldName<T>>(name: K, touched?: boolean, options?: SetFieldTouchedOptions) => void;
  setError: <K extends FieldName<T>>(name: K, error?: string) => void;
  getValue: <K extends FieldName<T>>(name: K) => T[K];
  field: <K extends FieldName<T>>(name: K) => FormFieldApi<T, K>;
  validateField: <K extends FieldName<T>>(name: K, nextValues?: T) => boolean;
  validateForm: (nextValues?: T) => boolean;
  reset: (nextValues?: T) => void;
  resetField: <K extends FieldName<T>>(name: K) => void;
  replaceValues: (nextValues: T) => void;
  handleSubmit: (event?: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

function toValidatorArray<T extends FormValues, K extends FieldName<T>>(validator?: FormValidators<T>[K]): Array<FieldValidator<T, K>> {
  if (!validator) return [];
  return Array.isArray(validator) ? validator : [validator];
}

function getFieldError<T extends FormValues, K extends FieldName<T>>(validators: FormValidators<T> | undefined, name: K, values: T): string | undefined {
  const fieldValidators = toValidatorArray<T, K>(validators?.[name]);

  for (const validator of fieldValidators) {
    const error = validator(values[name], values);
    if (error) return error;
  }

  return undefined;
}

function getAllErrors<T extends FormValues>(validators: FormValidators<T> | undefined, values: T): FieldErrorMap<T> {
  if (!validators) return {};

  const nextErrors: FieldErrorMap<T> = {};

  for (const key of Object.keys(values) as Array<FieldName<T>>) {
    const error = getFieldError(validators, key, values);
    if (error) nextErrors[key] = error;
  }

  return nextErrors;
}

function getAllTouched<T extends FormValues>(values: T): FieldTouchedMap<T> {
  const nextTouched: FieldTouchedMap<T> = {};

  for (const key of Object.keys(values) as Array<FieldName<T>>) {
    nextTouched[key] = true;
  }

  return nextTouched;
}

function isChangeEvent<T extends FormValues, K extends FieldName<T>>(
  value: T[K] | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
): value is React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  return typeof value === 'object' && value !== null && 'target' in value;
}

function getEventValue(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  const target = event.target;

  if ('type' in target && target.type === 'checkbox' && 'checked' in target) {
    return target.checked;
  }

  return target.value;
}

export function useForm<T extends FormValues>({ initialValues, validators, validateOnBlur = true, validateOnChange = false, onSubmit }: UseFormOptions<T>): UseFormReturn<T> {
  const formId = React.useId();

  const initialValuesRef = React.useRef(initialValues);

  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<FieldErrorMap<T>>({});
  const [touched, setTouchedState] = React.useState<FieldTouchedMap<T>>({});
  const [dirtyFields, setDirtyFields] = React.useState<FieldDirtyMap<T>>({});
  const [submitCount, setSubmitCount] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const valuesRef = React.useRef(values);
  const errorsRef = React.useRef(errors);
  const touchedRef = React.useRef(touched);
  const dirtyFieldsRef = React.useRef(dirtyFields);
  const submitCountRef = React.useRef(submitCount);
  const apiRef = React.useRef<UseFormReturn<T> | null>(null);

  React.useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  React.useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);

  React.useEffect(() => {
    touchedRef.current = touched;
  }, [touched]);

  React.useEffect(() => {
    dirtyFieldsRef.current = dirtyFields;
  }, [dirtyFields]);

  React.useEffect(() => {
    submitCountRef.current = submitCount;
  }, [submitCount]);

  const currentValidationErrors = React.useMemo(() => getAllErrors(validators, values), [validators, values]);

  const isValid = Object.keys(currentValidationErrors).length === 0;
  const isDirty = Object.values(dirtyFields).some(Boolean);
  const canSubmit = !isSubmitting && isValid;

  const setError = React.useCallback(<K extends FieldName<T>>(name: K, error?: string) => {
    setErrors((prev) => {
      const next = { ...prev };

      if (error) {
        next[name] = error;
      } else {
        delete next[name];
      }

      errorsRef.current = next;
      return next;
    });
  }, []);

  const validateField = React.useCallback(
    <K extends FieldName<T>>(name: K, nextValues?: T) => {
      const resolvedValues = nextValues ?? valuesRef.current;
      const error = getFieldError(validators, name, resolvedValues);

      setErrors((prev) => {
        const next = { ...prev };

        if (error) {
          next[name] = error;
        } else {
          delete next[name];
        }

        errorsRef.current = next;
        return next;
      });

      return !error;
    },
    [validators]
  );

  const validateForm = React.useCallback(
    (nextValues?: T) => {
      const resolvedValues = nextValues ?? valuesRef.current;
      const nextErrors = getAllErrors(validators, resolvedValues);

      errorsRef.current = nextErrors;
      setErrors(nextErrors);

      return Object.keys(nextErrors).length === 0;
    },
    [validators]
  );

  const setTouched = React.useCallback(
    <K extends FieldName<T>>(name: K, nextTouched = true, options?: SetFieldTouchedOptions) => {
      setTouchedState((prev) => {
        const next = { ...prev, [name]: nextTouched };
        touchedRef.current = next;
        return next;
      });

      const shouldValidate = nextTouched && (options?.validate ?? validateOnBlur);

      if (shouldValidate) {
        validateField(name);
      }
    },
    [validateField, validateOnBlur]
  );

  const setValue = React.useCallback(
    <K extends FieldName<T>>(name: K, value: T[K], options?: SetFieldValueOptions) => {
      const nextValues = { ...valuesRef.current, [name]: value } as T;

      valuesRef.current = nextValues;
      setValues(nextValues);

      setDirtyFields((prev) => {
        const next = {
          ...prev,
          [name]: !Object.is(initialValuesRef.current[name], value),
        };
        dirtyFieldsRef.current = next;
        return next;
      });

      if (options?.touch) {
        setTouchedState((prev) => {
          const next = { ...prev, [name]: true };
          touchedRef.current = next;
          return next;
        });
      }

      const shouldValidate = options?.validate ?? (validateOnChange || Boolean(touchedRef.current[name]) || submitCountRef.current > 0);

      if (shouldValidate) {
        validateField(name, nextValues);
      }
    },
    [validateField, validateOnChange]
  );

  const setMultipleValues = React.useCallback(
    (updates: Partial<T>, options?: SetValuesOptions) => {
      const nextValues = { ...valuesRef.current, ...updates } as T;

      valuesRef.current = nextValues;
      setValues(nextValues);

      if (options?.updateInitialValues) {
        initialValuesRef.current = { ...initialValuesRef.current, ...updates } as T;
      }

      setDirtyFields((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(updates) as Array<FieldName<T>>) {
          if (options?.markAsDirty) {
            next[key] = true;
          } else {
            next[key] = !Object.is(initialValuesRef.current[key], updates[key]);
          }
        }
        dirtyFieldsRef.current = next;
        return next;
      });

      if (options?.touch) {
        setTouchedState((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(updates) as Array<FieldName<T>>) {
            next[key] = true;
          }
          touchedRef.current = next;
          return next;
        });
      }

      const shouldValidate = options?.validate ?? false;

      if (shouldValidate) {
        validateForm(nextValues);
      }
    },
    [validateForm]
  );

  const getValue = React.useCallback(<K extends FieldName<T>>(name: K) => valuesRef.current[name], []);

  const reset = React.useCallback((nextValues?: T) => {
    const resolvedValues = (nextValues ?? initialValuesRef.current) as T;

    valuesRef.current = resolvedValues;
    errorsRef.current = {};
    touchedRef.current = {};
    dirtyFieldsRef.current = {};
    submitCountRef.current = 0;

    setValues(resolvedValues);
    setErrors({});
    setTouchedState({});
    setDirtyFields({});
    setSubmitCount(0);
    setIsSubmitting(false);
  }, []);

  const replaceValues = React.useCallback(
    (nextValues: T) => {
      initialValuesRef.current = nextValues;
      reset(nextValues);
    },
    [reset]
  );

  const resetField = React.useCallback(<K extends FieldName<T>>(name: K) => {
    const initialValue = initialValuesRef.current[name];
    const nextValues = {
      ...valuesRef.current,
      [name]: initialValue,
    } as T;

    valuesRef.current = nextValues;
    setValues(nextValues);

    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      errorsRef.current = next;
      return next;
    });

    setTouchedState((prev) => {
      const next = { ...prev };
      delete next[name];
      touchedRef.current = next;
      return next;
    });

    setDirtyFields((prev) => {
      const next = { ...prev };
      delete next[name];
      dirtyFieldsRef.current = next;
      return next;
    });
  }, []);

  const field = React.useCallback(
    <K extends FieldName<T>>(name: K): FormFieldApi<T, K> => {
      const error = errors[name];
      const isTouched = Boolean(touched[name]);
      const isDirtyField = Boolean(dirtyFields[name]);

      return {
        name,
        id: `${formId}-${name}`,
        value: values[name],
        error,
        touched: isTouched,
        dirty: isDirtyField,
        shouldShowError: Boolean(error) && (isTouched || submitCount > 0),
        setValue: (nextValue, options) => setValue(name, nextValue, options),
        setTouched: (nextTouched = true, options) => setTouched(name, nextTouched, options),
        onChange: (eventOrValue) => {
          if (isChangeEvent<T, K>(eventOrValue)) {
            setValue(name, getEventValue(eventOrValue) as T[K]);
            return;
          }

          setValue(name, eventOrValue);
        },
        onBlur: () => {
          setTouched(name, true);
        },
        reset: () => {
          resetField(name);
        },
      };
    },
    [dirtyFields, errors, formId, resetField, setTouched, setValue, submitCount, touched, values]
  );

  const handleSubmit = React.useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      const nextSubmitCount = submitCountRef.current + 1;
      submitCountRef.current = nextSubmitCount;
      setSubmitCount(nextSubmitCount);

      const nextTouched = getAllTouched(valuesRef.current);
      touchedRef.current = nextTouched;
      setTouchedState(nextTouched);

      const isFormValid = validateForm(valuesRef.current);
      if (!isFormValid) return;

      if (!onSubmit || !apiRef.current) return;

      try {
        setIsSubmitting(true);
        await onSubmit(valuesRef.current, apiRef.current);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validateForm]
  );

  const api: UseFormReturn<T> = {
    formId,
    values,
    errors,
    touched,
    dirtyFields,
    submitCount,
    isDirty,
    isSubmitting,
    isValid,
    canSubmit,
    setValue,
    setValues: setMultipleValues,
    setTouched,
    setError,
    getValue,
    field,
    validateField,
    validateForm,
    reset,
    resetField,
    replaceValues,
    handleSubmit,
  };

  apiRef.current = api;

  return api;
}
