export type RegisterStepKey = "profile" | "account";
export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  country: string;
  region: string;
  timezone: string;
  email: string;
  password: string;
  confirmPassword: string;
};
export type RegisterDraft = {
  player: {
    firstName: string;
    lastName: string;
    displayName: string;
    bio: string;
    country: string;
    region: string;
    timezone: string;
  };
  auth: {
    email: string;
    password: string;
    confirmPassword: string;
  };
};
