import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login - Martnex',
  description: 'Sign in to your Martnex account',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Martnex
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-white">Sign in to your account</h2>
        <p className="mt-2 text-sm text-slate-400">
          Welcome back to our marketplace
        </p>
      </div>

      {resolvedParams.message && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
          {resolvedParams.message}
        </div>
      )}

      <LoginForm />

      <div className="flex items-center justify-between text-sm mt-6">
        <Link
          href="/forgot-password"
          className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          Forgot password?
        </Link>
        <div>
          <span className="text-slate-400">Don't have an account? </span>
          <Link href="/register" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
