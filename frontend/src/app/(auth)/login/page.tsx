'use client';

import { Suspense } from "react";
import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <main className="w-full max-w-[500px] flex flex-col items-center">
          <div className="text-sm text-foreground-secondary">Loading...</div>
        </main>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

