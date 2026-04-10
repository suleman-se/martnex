import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';

export const metadata = {
  title: 'Forgot Password - Martnex',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Martnex
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-white">Reset your password</h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="text-center mt-6">
        <Link
          href="/login"
          className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
