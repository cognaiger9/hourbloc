import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 lg:px-16 py-16 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-12">
          {/* Brand */}
          <div className="lg:w-1/3">
            <span className="text-lg font-semibold tracking-tight">hourbloc</span>
            <p className="text-sm text-foreground-secondary mt-3 max-w-xs">
              Strategic time-blocking for intentional work.
            </p>
          </div>
          
          {/* Links */}
          <div className="flex gap-16 lg:gap-24">
            <div>
              <h4 className="text-sm font-medium mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#how-it-works" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground-secondary">© 2025 Hourbloc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

