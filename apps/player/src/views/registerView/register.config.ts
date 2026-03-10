import RegisterProfileStep from "./steps/RegisterProfileStep.component";
import RegisterAccountStep from "./steps/RegisterAccountStep.component";
import type { RegisterStepKey } from "./register.types";

export type RegisterStepDefinition = {
  key: RegisterStepKey;
  title: string;
  subtitle: string;
  component: React.ComponentType<any>;
  next?: RegisterStepKey;
  back?: RegisterStepKey;
};

export const REGISTER_STEPS: RegisterStepDefinition[] = [
  {
    key: "profile",
    title: "Profile",
    subtitle: "Tell us who you are in Tapestry.",
    component: RegisterProfileStep,
    next: "account",
  },
  {
    key: "account",
    title: "Account",
    subtitle: "Set up your login credentials.",
    component: RegisterAccountStep,
    back: "profile",
  },
];

export function getRegisterStep(step: RegisterStepKey) {
  return REGISTER_STEPS.find((item) => item.key === step)!;
}
