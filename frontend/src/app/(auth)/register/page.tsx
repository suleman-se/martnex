import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export const metadata = {
  title: 'Register - Martnex',
  description: 'Create your Martnex account',
};

export default function RegisterPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Martnex
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-white">Create your account</h2>
        <p className="mt-2 text-sm text-slate-400">
          Join our marketplace as a buyer or seller
        </p>
      </div>

      <RegisterForm />

      <div className="text-center text-sm mt-6">
        <span className="text-slate-400">Already have an account? </span>
        <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}
