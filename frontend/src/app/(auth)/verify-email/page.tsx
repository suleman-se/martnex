import VerifyEmailForm from '@/components/auth/VerifyEmailForm';
import { AuthContainer } from '@/components/ui/auth-container';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Verify Email - Martnex',
  description: 'Confirm your email to activate your account.',
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthContainer
      title="Verify Email"
      description="Click the button below to confirm your account."
    >
      <VerifyEmailForm token={token} />

      <div className="mt-8 pt-8 border-t border-border/10 flex justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </AuthContainer>
  );
}
