import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { AuthContainer } from '@/components/ui/auth-container';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Reset Password - Martnex',
  description: 'Security update for your Martnex account.',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  
  return (
    <AuthContainer
      title="Reset Password"
      description="Create a new password for your account."
    >
      <ResetPasswordForm token={token} />

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
