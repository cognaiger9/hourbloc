import Section from "../_components/Section";
import { cn } from "@/utils/common";
import Image from "next/image";
import { PlayCircle, Settings, CheckCircle } from "lucide-react";

export default function FocusTimerSection() {
  return (
    <Section background="surface">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-3">
            <span className="text-secondary text-foreground-secondary uppercase tracking-wide text-sm">
              Focus Sessions
            </span>
          </div>
          <h2 className={cn(
            "text-2xl sm:text-3xl lg:text-page-title",
            "font-semibold tracking-tight mb-4"
          )}>
            Your focus, your way
          </h2>
          <p className={cn(
            "text-primary text-foreground-secondary",
            "leading-relaxed max-w-2xl mx-auto"
          )}>
            Choose between structured timer-based sessions or flexible stopwatch mode. Customize your work intervals, break durations, and session goals.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Features Content */}
          <div className="lg:w-1/2">
            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="text-foreground" size={20} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-2">
                    Timer or Stopwatch
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    Choose timer mode for structured intervals (like Pomodoro) or stopwatch for flexible focus periods that match your flow.
                  </p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Settings className="text-foreground" size={20} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-2">
                    Fully Customizable
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    Set your ideal work duration, break length, and number of sessions. Adjust settings anytime to match your energy levels.
                  </p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-foreground" size={20} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-2">
                    Session Completion
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    Track completed sessions with optional sound notifications. Each session contributes to your daily focus streak when you hit 5+ minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timer Visualization */}
          <div className="lg:w-1/2">
            <div className="relative">
              {/* Timer Image */}
              <div className="relative w-full max-w-md mx-auto">
                <Image
                  src="/timer-demo.png"
                  alt="Focus timer visualization showing timer interface"
                  width={0}
                  height={0}
                  className="w-full h-auto"
                  priority
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

