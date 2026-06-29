import Link from "next/link";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/logo-trans.png"
                alt="hourbloc logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-medium tracking-tighter text-foreground">hourbloc</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-semibold text-foreground mb-4">Terms of Service</h1>
        <p className="text-sm text-foreground-secondary mb-8">Last updated: January 9, 2026</p>

        <div className="prose prose-sm max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              By accessing and using hourbloc ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              hourbloc is a time management and productivity platform designed for knowledge workers. The Service provides tools for strategic time allocation, planning, and execution tracking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Data and Privacy</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              Your use of the Service is also governed by our Privacy Policy. We collect and process your data as described in our Privacy Policy to provide and improve the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Acceptable Use</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service. You agree not to attempt to gain unauthorized access to any part of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by hourbloc and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              In no event shall hourbloc, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Termination</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to Terms</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by updating the "Last updated" date at the top of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:benjamintr@benjamintr.com" className="text-foreground hover:text-black hover:underline underline-offset-2 transition-colors">
                benjamintr@benjamintr.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E5E5]">
          <Link
            href="/login"
            className="text-sm text-foreground hover:text-black hover:underline underline-offset-2 transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </main>
    </div>
  );
}
