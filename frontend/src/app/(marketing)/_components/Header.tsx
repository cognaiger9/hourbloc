import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 lg:px-16">
        <div className="flex items-center justify-between h-[76px]">
          <div className="flex items-center gap-1.5">
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
            <span className="text-2xl font-semibold tracking-tight">hourbloc</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#about" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#how-it-works" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="#features" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-foreground-secondary hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="bg-accent-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-hover transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

