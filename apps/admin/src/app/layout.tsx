import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./QueryProvider";
import { AuthProviderWrapper } from "./AuthProviderWrapper";

export const metadata: Metadata = {
  title: "Tapestry Admin",
  description: "Manage content, products, and tables",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProviderWrapper>{children}</AuthProviderWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}
