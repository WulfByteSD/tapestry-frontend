"use client";

import * as React from "react";
import type { FormValues, UseFormReturn } from "./useForm";

const FormContext = React.createContext<UseFormReturn<FormValues> | null>(null);

export function FormProvider<T extends FormValues>({
  form,
  children,
}: {
  form: UseFormReturn<T>;
  children: React.ReactNode;
}) {
  return (
    <FormContext.Provider value={form as UseFormReturn<FormValues>}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext<T extends FormValues>() {
  const context = React.useContext(FormContext);

  if (!context) {
    throw new Error("useFormContext must be used inside a <Form />.");
  }

  return context as UseFormReturn<T>;
}