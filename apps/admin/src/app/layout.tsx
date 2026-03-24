import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "./QueryProvider";
import { AuthProviderWrapper } from "./AuthProviderWrapper";

export const metadata: Metadata = {
  title: {
    default: "Tapestry Admin",
    template: "%s | Tapestry Admin",
  },
  description: "Manage content, settings, and storyweaver workflows.",
  robots: {
    index: false,
    follow: false,
  },
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
