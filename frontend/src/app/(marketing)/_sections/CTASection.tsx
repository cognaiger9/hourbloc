import Section from "../_components/Section";
import { cn } from "@/utils/common";
import Link from "next/link";

export default function CTASection() {
  return (
    <Section id="cta" maxWidth="3xl" background="background">
      <div className="text-center">
        <h2 className={cn(
          "text-2xl sm:text-3xl lg:text-page-title",
          "font-semibold tracking-tight mb-4"
        )}>
          Start understanding your time today
        </h2>
        <p className={cn("text-primary text-foreground-secondary mb-8")}>
          Build more intentional days with better time awareness.
        </p>

        <Link
          href="/login"
          className="bg-accent-green text-white text-base font-semibold px-8 py-3 rounded-lg hover:bg-green-hover transition-colors inline-block"
        >
          Try for Free
        </Link>
      </div>
    </Section>
  );
}

