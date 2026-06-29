'use client';

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useGoogleLogin } from "../hooks/useGoogleLogin";

export default function LoginForm() {
  const searchParams = useSearchParams();
  
  // Check for error in URL params
  const errorParam = searchParams.get('error');
  const error = errorParam === 'auth_failed' ? 'Authentication failed. Please try again.' : null;

  const { handleGoogleLogin, isLoading, loginError } = useGoogleLogin();
  
  const displayError = loginError || error;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-[500px] flex flex-col items-center">
      {/* Logo / Heading 1 */}
      {/* Figma: SemiBold (600) -> Thinner: Medium (500) */}
      {/* Size: 36px -> text-4xl */}
      {/* Spacing to next element: ~48px */}
      <h1 className="text-4xl font-medium tracking-tighter text-center text-foreground mb-12 flex items-center justify-center gap-1.5">
        <div className="w-11 h-11 flex items-center justify-center">
          <Image 
            src="/logo-trans.png" 
            alt="hourbloc logo" 
            width={44} 
            height={44}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        hourbloc
      </h1>

      {/* Heading 2 */}
      {/* Figma: Medium (500) -> Thinner: Regular (400) */}
      {/* Size: 20px -> text-xl */}
      {/* Spacing to next: ~12px */}
      <h2 className="text-xl font-normal text-center text-foreground leading-snug mb-3 px-4">
        Strategic time allocation for knowledge workers
      </h2>

      {/* Description Text */}
      {/* Figma: Regular (400) -> Thinner: Light (300) */}
      {/* Size: 14px -> text-sm */}
      {/* Color: #6D6D6D (foreground-secondary) */}
      {/* Width constrained to match line break: "Track execution with / focus" */}
      {/* Spacing to button: ~40px */}
      <p className="text-sm font-light text-center text-foreground-secondary leading-relaxed mb-10 max-w-[340px]">
        Plan your day with intention. Track execution with focus.
      </p>

      {/* Error Message */}
      {displayError && (
        <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 text-center">{displayError}</p>
        </div>
      )}

      {/* Google Login Button */}
      {/* Figma: Medium (500) -> Thinner: Regular (400) */}
      {/* Height: 48px, Radius: 6px */}
      {/* Spacing to footer: ~24px */}
      
      <button 
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full h-12 bg-surface border border-[#E5E5E5] rounded-md flex items-center justify-center gap-3 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="text-sm font-normal text-foreground">Redirecting...</span>
        ) : (
          <>
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-sm font-normal text-foreground">Continue with Google</span>
          </>
        )}
      </button>

      {/* Footer Terms */}
      {/* Figma: Regular (400) -> Thinner: Light (300) */}
      {/* Size: 12px -> text-xs */}
      {/* Color: #9E9E9E (Gray 400/500 equivalent) */}
      <div className="mt-6 flex flex-wrap justify-center items-center gap-x-[3px] text-xs font-light text-gray-500">
        <span>By signing in, you agree to our</span>
        <Link href="/terms" className="text-foreground hover:text-black hover:underline decoration-[#E5E5E5] underline-offset-2 transition-colors">
          Terms
        </Link>
        <span>&amp;</span>
        <Link href="/privacy-policy" className="text-foreground hover:text-black hover:underline decoration-[#E5E5E5] underline-offset-2 transition-colors">
          Privacy Policy
        </Link>
      </div>
      </main>
    </div>
  );
}

