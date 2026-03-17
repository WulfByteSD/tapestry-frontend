import { Suspense } from "react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div />}>{children}</Suspense>;
}
