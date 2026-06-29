import Section from "../_components/Section";
import Button from "../_components/Button";
import FeatureItem from "../_components/FeatureItem";
import { cn } from "@/utils/common";
import { 
  Timer, 
  BarChart2, 
  LayoutGrid
} from "lucide-react";

export default function HowItWorksSection() {
  return (
    <Section id="how-it-works" background="surface">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2">
          <h2 className={cn(
            "text-2xl sm:text-3xl lg:text-page-title",
            "font-semibold tracking-tight mb-4"
          )}>
            How it works
          </h2>
          <p className={cn(
            "text-primary text-foreground-secondary",
            "leading-relaxed mb-6"
          )}>
            Three simple steps to time awareness. No complicated setup, no learning curve — just start tracking and let the insights emerge naturally.
          </p>
          <Button href="/login" variant="primary" className="px-5 py-2.5">
            Get started
          </Button>
        </div>
        
        <div className="lg:w-1/2 space-y-6">
          <FeatureItem
            icon={LayoutGrid}
            title="Plan with intention"
            description="Design your ideal day using time blocks. Protect what matters and build sustainable routines."
          />
          
          <FeatureItem
            icon={Timer}
            title="Track naturally"
            description="Start a timer or log time after. No pressure, no complexity. Just honest tracking that fits your flow."
          />
          
          <FeatureItem
            icon={BarChart2}
            title="Understand patterns"
            description="See weekly insights that reveal where your time actually goes. No judgment, just clarity."
          />
          
        </div>
      </div>
    </Section>
  );
}

