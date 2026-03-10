"use client";

import * as React from "react";
import type { RegisterDraft, RegisterStepKey } from "./register.types";

type RegisterContextValue = {
  step: RegisterStepKey;
  values: RegisterDraft;
  setValues: (updater: (prev: RegisterDraft) => RegisterDraft) => void;
  goToStep: (step: RegisterStepKey) => void;
  reset: () => void;
};

const initialValues: RegisterDraft = {
  player: {
    firstName: "",
    lastName: "",
    displayName: "",
    bio: "",
    country: "USA",
    region: "",
    timezone: "",
  },
  auth: {
    email: "",
    password: "",
    confirmPassword: "",
  },
};

const RegisterContext = React.createContext<RegisterContextValue | null>(null);

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = React.useState<RegisterStepKey>("profile");
  const [values, setState] = React.useState<RegisterDraft>(initialValues);

  const setValues = React.useCallback((updater: (prev: RegisterDraft) => RegisterDraft) => {
    setState((prev: any) => updater(prev));
  }, []);

  const reset = React.useCallback(() => {
    setState(initialValues);
    setStep("profile");
  }, []);

  const value = React.useMemo(
    () => ({
      step,
      values,
      setValues,
      goToStep: setStep,
      reset,
    }),
    [step, values, setValues, reset],
  );

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export function useRegisterContext() {
  const ctx = React.useContext(RegisterContext);
  if (!ctx) {
    throw new Error("useRegisterContext must be used inside RegisterProvider");
  }
  return ctx;
}
