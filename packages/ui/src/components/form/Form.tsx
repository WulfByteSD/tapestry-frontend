"use client";

import * as React from "react";
import { FormProvider } from "./Form.context";
import type { FormValues, UseFormReturn } from "./useForm";

export type FormProps<T extends FormValues> = Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  form: UseFormReturn<T>;
  children: React.ReactNode;
};

export function Form<T extends FormValues>({ form, children, noValidate = true, ...rest }: FormProps<T>) {
  return (
    <FormProvider form={form}>
      <form {...rest} noValidate={noValidate} onSubmit={form.handleSubmit}>
        {children}
      </form>
    </FormProvider>
  );
}
