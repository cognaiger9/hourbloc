import Button from "../_components/Button";
import { cn } from "@/utils/common";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className={cn("px-6 lg:px-16 pt-16 pb-8")}>
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className={cn(
            "text-4xl sm:text-5xl lg:text-heading-landing",
            "font-semibold tracking-tight mb-6"
          )}>
            Track your time. Allocate it strategically.
          </h1>
          <p className={cn(
            "text-primary text-foreground-secondary",
            "leading-relaxed mb-8 max-w-2xl mx-auto"
          )}>
            A minimalist time-blocking tool for solo knowledge workers 
            with fragmented schedules - track your time and allocate it strategically without the complexity of enterprise tools.   
          </p>
          <Button href="/login" variant="primary">
            Start tracking for free
          </Button>
        </div>
        
        {/* Calendar Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="relative w-full">
            <Image
              src="/calendar_preview2.png"
              alt="HourBloc calendar preview showing weekly time-blocking interface"
              width={1792}
              height={0}
              className="w-full h-auto"
              priority
              quality={100}
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 896px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

