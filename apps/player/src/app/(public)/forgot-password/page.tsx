import { Suspense } from 'react';
import { Loader } from '@tapestry/ui';
import ForgotPasswordView from '@/views/forgotPasswordView';

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Loader size="lg" tone="gold" />
        </div>
      }
    >
      <ForgotPasswordView />
    </Suspense>
  );
}
