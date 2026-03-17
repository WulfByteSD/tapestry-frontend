"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LoginScreen } from "@tapestry/ui";
import { useLogout, useMe } from "@/lib/auth-hooks";

function getSafeNextTarget(value: string | null) {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  return value;
}

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading, isError } = useMe();
  const logout = useLogout();
  const nextTarget = getSafeNextTarget(searchParams.get("next"));

  return (
    <LoginScreen
      eyebrow="Tapestry Admin"
      title="Sign in to continue"
      subtitle="Authenticate with your admin account to enter the storyweaver workspace."
      brandImageSrc="https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
      brandImageAlt="Tapestry Logo"
      fullHeight
      authState={{
        user,
        isLoading,
        isError,
        nextTarget,
        onAuthError: logout,
        onAuthenticated: (target) => router.replace(target),
      }}
    />
  );
}
