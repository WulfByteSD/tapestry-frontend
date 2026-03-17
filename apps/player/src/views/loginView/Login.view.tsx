"use client";

import Link from "next/link";
import { useLogin } from "@/lib/auth-hooks";
import { LoginScreen } from "@tapestry/ui";

export default function LoginView() {
  return (
    <LoginScreen
      useLoginHook={useLogin}
      title="Welcome back"
      brandImageSrc="https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
      brandImageAlt="Tapestry Logo"
      auxiliaryLinks={[
        { href: "/forgot-password", label: "Forgot your password?" },
        { href: "/register", label: "New here? Create an account" },
      ]}
      LinkComponent={Link}
      showAlertContainer={false}
    />
  );
}
