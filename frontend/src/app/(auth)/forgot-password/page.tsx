import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';
import { AuthContainer } from '@/components/ui/auth-container';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Forgot Password - Martnex',
  description: 'Recovery options for your Martnex account.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthContainer
      title="Forgot Password"
      description="Enter your email to reset your password."
    >
      <ForgotPasswordForm />

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
