import { Suspense } from 'react';
import { Loader } from '@tapestry/ui';
import PortalShell from '@/components/portalShell/PortalShell.component';
import PublicGate from '@/components/publicGate/PublicGate.component';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Loader size="lg" tone="gold" />
        </div>
      }
    >
      <PublicGate>{children}</PublicGate>
    </Suspense>
  );
}
