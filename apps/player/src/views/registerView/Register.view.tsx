"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRegister } from "@/lib/auth-hooks";
import styles from "./Register.module.scss";
import ProgressIndicator from "./ProgressIndicator.component";
import { RegisterProvider, useRegisterContext } from "./Register.context";
import { getRegisterStep, REGISTER_STEPS } from "./register.config";

function RegisterInner() {
  const reg = useRegister();
  const { step, values } = useRegisterContext();

  const current = getRegisterStep(step);
  const StepComponent = current.component;

  const labels = useMemo(() => REGISTER_STEPS.map((item) => item.title), []);
  const currentStepIndex = REGISTER_STEPS.findIndex((item) => item.key === step) + 1;

  const handleComplete = async () => {
    await reg.mutateAsync({
      auth: {
        email: values.auth.email.trim().toLowerCase(),
        password: values.auth.password,
      },
      player: {
        firstName: values.player.firstName.trim(),
        lastName: values.player.lastName.trim(),
        displayName: values.player.displayName.trim(),
        bio: values.player.bio.trim() || undefined,
        country: values.player.country.trim() || undefined,
        region: values.player.region.trim() || undefined,
        timezone: values.player.timezone.trim() || undefined,
        roles: ["player"],
      },
    });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>{current.subtitle}</p>
        </header>

        <ProgressIndicator currentStep={currentStepIndex} totalSteps={REGISTER_STEPS.length} labels={labels} />

        <StepComponent busy={reg.isPending} onComplete={handleComplete} />

        <div className={styles.footerText}>
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterView() {
  return (
    <RegisterProvider>
      <RegisterInner />
    </RegisterProvider>
  );
}
