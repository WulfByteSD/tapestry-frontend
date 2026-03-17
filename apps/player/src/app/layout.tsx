import "./globals.css";
import QueryProvider from "./QueryProvider";
import { AuthProviderWrapper } from "./AuthProviderWrapper";

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
