"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
      title="Welcome back"
      brandImageSrc="https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
      brandImageAlt="Tapestry Logo"
      auxiliaryLinks={[
        { href: "/forgot-password", label: "Forgot your password?" },
        { href: "/register", label: "New here? Create an account" },
      ]}
      LinkComponent={Link}
      showAlertContainer={false}
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
