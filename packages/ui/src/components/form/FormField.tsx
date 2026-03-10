"use client";

import * as React from "react";
import { useFormContext } from "./Form.context";
import type { FieldName, FormFieldApi, FormValues, UseFormReturn } from "./useForm";

export type FormFieldProps<T extends FormValues, K extends FieldName<T>> = {
  name: K;
  children: (field: FormFieldApi<T, K>, form: UseFormReturn<T>) => React.ReactNode;
};

export function useFormField<T extends FormValues, K extends FieldName<T>>(name: K) {
  const form = useFormContext<T>();
  return form.field(name);
}

export function FormField<T extends FormValues, K extends FieldName<T>>({ name, children }: FormFieldProps<T, K>) {
  const form = useFormContext<T>();
  const field = form.field(name);

  return <>{children(field, form)}</>;
}
