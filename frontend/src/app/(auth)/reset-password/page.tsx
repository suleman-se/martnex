import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password - Martnex',
  description: 'Create a new password',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Martnex
        </h1>
        <h2 className="mt-4 text-2xl font-semibold text-white">Create new password</h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your new password below
        </p>
      </div>

      <ResetPasswordForm token={resolvedParams.token} />
    </div>
  );
}
