import VerifyEmailForm from '@/components/auth/VerifyEmailForm';

export const metadata = {
  title: 'Verify Email - Martnex',
  description: 'Verify your email address',
};

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Martnex</h1>
          <h2 className="mt-6 text-3xl font-semibold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Confirm your email address to activate your account
          </p>
        </div>

        <VerifyEmailForm token={searchParams.token} />
      </div>
    </div>
  );
}
