import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-4xl font-semibold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-sm text-foreground-secondary mb-8">Last updated: January 9, 2026</p>

        <div className="prose prose-sm max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              Welcome to hourbloc. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-foreground-secondary leading-relaxed mb-4 space-y-2">
              <li>Account information (name, email address) when you register through Google authentication</li>
              <li>Time tracking data, tasks, and schedules you create in the Service</li>
              <li>Usage data and analytics about how you interact with the Service</li>
              <li>Device information and browser type for service optimization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-foreground-secondary leading-relaxed mb-4 space-y-2">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process and complete your time tracking and planning activities</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Storage and Security</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption methods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Third-Party Services</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We use Google OAuth for authentication. When you sign in with Google, we receive basic profile information (name, email) as permitted by your Google account settings. Please review Google's Privacy Policy to understand how they handle your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We retain your personal data only for as long as necessary to provide you with the Service and for legitimate business purposes. You can request deletion of your account and associated data at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-foreground-secondary leading-relaxed mb-4 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze Service usage. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              Our Service is not intended for users under the age of 13. We do not knowingly collect personal data from children under 13. If we become aware of such collection, we will take steps to delete the information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to Privacy Policy</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the "Last updated" date and, where appropriate, by sending you an email notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact Us</h2>
            <p className="text-foreground-secondary leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us at{" "}
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
