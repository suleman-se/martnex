import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export const metadata = {
  title: 'Register - Martnex',
  description: 'Create your Martnex account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Martnex</h1>
          <h2 className="mt-6 text-3xl font-semibold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our marketplace as a buyer or seller
          </p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
