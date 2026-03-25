import { Suspense } from "react";
import { createAdminPageMetadata } from "@/app/pageMetadata";
import LoginView from "@/views/loginView/Login.view";

export const metadata = createAdminPageMetadata({
  title: "Sign In",
  description: "Authenticate with your admin account to enter the Tapestry storyweaver workspace.",
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginView />
    </Suspense>
  );
}
