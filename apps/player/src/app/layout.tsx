import "./globals.css";
import QueryProvider from "./QueryProvider";
import { AuthProviderWrapper } from "./AuthProviderWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tapestry Player Portal",
  description: "Access your stories, products, and tables on the go",
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
