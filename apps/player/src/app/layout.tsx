import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import AuthGate from "@/components/authGate/AuthGate"; 
import QueryProvider from "./QueryProvider";

export const metadata: Metadata = {
  title: "Tapestry Portal",
  description: "Character sheets and rolls",
};

const tabs = [
  { href: "/", label: "Sheet" },
  { href: "/rolls", label: "Rolls" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto max-w-md min-h-dvh pb-16">
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="px-4 py-3 font-semibold">Tapestry Portal</div>
          </header>

          <main className="px-4 py-4">
            <QueryProvider>
              <AuthGate>{children}</AuthGate>
            </QueryProvider>
          </main>

          <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
            <div className="mx-auto max-w-md grid grid-cols-3">
              {tabs.map((t) => (
                <Link key={t.href} href={t.href} className="py-3 text-center text-sm hover:bg-muted">
                  {t.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
