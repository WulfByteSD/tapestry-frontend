import NextTopLoader from "nextjs-toploader";
import AuthGate from "@/components/authGate/AuthGate.component";
import ProfileGate from "@/components/profileGate/ProfileGate.component";
import PortalShell from "@/components/portalShell/PortalShell.component";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <NextTopLoader
        color="var(--accent)"
        height={3}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px var(--accent),0 0 5px var(--accent)"
      />

      <PortalShell>
        <ProfileGate>{children}</ProfileGate>
      </PortalShell>
    </AuthGate>
  );
}
