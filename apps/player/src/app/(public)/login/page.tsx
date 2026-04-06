import { Suspense } from 'react';
import { Loader } from '@tapestry/ui';
import LoginView from '@/views/loginView/Login.view';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Loader size="lg" tone="gold" />
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}
