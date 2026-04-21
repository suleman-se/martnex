import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { AuthContainer } from '@/components/ui/auth-container';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Sign In - Martnex',
  description: 'Access your Martnex account to manage your storefront or shopping experience.',
};

const GoogleLogo = () => (
  <svg className="w-4 h-4 mr-3" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.834.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34a853"/>
    <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.589.102-1.166.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#fbbc05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#ea4335"/>
  </svg>
);

const AppleLogo = () => (
  <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.671-1.48 3.674-2.948 1.166-1.712 1.637-3.355 1.663-3.446-.04-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
  </svg>
);

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  return (
    <AuthContainer
      title="Login"
      description="Welcome back to Martnex marketplace"
    >
      <div className="-mt-4 mb-8">
        {searchParams.message && (
          <div className="p-4 bg-indigo-50/50 text-primary rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-3 border border-indigo-100">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
             {searchParams.message}
          </div>
        )}
      </div>

      <LoginForm />

      <div className="mt-8 pt-8 border-t border-border/10 flex flex-col items-center gap-6">
        <Link
          href="/forgot-password"
          className="text-xs font-bold text-primary hover:opacity-70 transition-opacity uppercase tracking-widest"
        >
          Forgot password?
        </Link>

        {/* Social tier - subtle secondary options */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button variant="secondary" size="sm" className="bg-secondary/50 font-black text-[10px] uppercase tracking-widest h-12 rounded-xl">
            <GoogleLogo />
            Google ID
          </Button>
          <Button variant="secondary" size="sm" className="bg-secondary/50 font-black text-[10px] uppercase tracking-widest h-12 rounded-xl">
            <AppleLogo />
            Apple ID
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground font-medium tracking-tight">
          New to Martnex?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4 ml-1">
            Register now
          </Link>
        </p>
      </div>
    </AuthContainer>
  );
}
