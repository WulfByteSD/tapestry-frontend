import { Suspense } from 'react';
import { Loader } from '@tapestry/ui';
import ResetPasswordView from '@/views/resetPasswordView';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Loader size="lg" tone="gold" />
        </div>
      }
    >
      <ResetPasswordView />
    </Suspense>
  );
}
