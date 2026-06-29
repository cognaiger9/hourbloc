import Section from "../_components/Section";
import Card from "../_components/Card";
import { cn } from "@/utils/common";
import { Calendar, Clock, Edit3, Zap } from "lucide-react";

export default function TimeBlockPlanningSection() {
  return (
    <Section id="features" background="background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-3">
            <span className="text-secondary text-foreground-secondary uppercase tracking-wide text-sm">
              Time Block Planning
            </span>
          </div>
          <h2 className={cn(
            "text-2xl sm:text-3xl lg:text-page-title",
            "font-semibold tracking-tight mb-4"
          )}>
            Plan your day with intention
          </h2>
          <p className={cn(
            "text-primary text-foreground-secondary",
            "leading-relaxed max-w-2xl mx-auto"
          )}>
            Design your ideal day using time blocks. Protect what matters, build sustainable routines, and see your plan come to life as you track your time.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Visual Time Block Representation */}
          <div className="lg:w-1/2">
            <div className="relative">
              <Card padding="lg" className="bg-surface">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-section-title font-medium">Today</h3>
                    <span className="text-secondary text-foreground-secondary">Mon, Nov 11</span>
                  </div>
                  
                  {/* Time Block Visualization */}
                  <div className="space-y-2">
                    {/* 9:00 AM - 10:00 AM */}
                    <div className="flex items-center gap-3">
                      <span className="text-tertiary text-foreground-secondary w-16 flex-shrink-0">9:00</span>
                      <div className="flex-1 h-12 bg-accent-green/20 border border-green-border rounded-lg flex items-center px-4">
                        <span className="text-secondary font-medium">Deep Work</span>
                      </div>
                    </div>
                    
                    {/* 10:00 AM - 11:30 AM */}
                    <div className="flex items-center gap-3">
                      <span className="text-tertiary text-foreground-secondary w-16 flex-shrink-0">10:00</span>
                      <div className="flex-1 h-12 bg-accent-green/30 border border-green-border rounded-lg flex items-center px-4">
                        <span className="text-secondary font-medium">Deep Work</span>
                      </div>
                    </div>
                    
                    {/* 11:30 AM - 12:00 PM */}
                    <div className="flex items-center gap-3">
                      <span className="text-tertiary text-foreground-secondary w-16 flex-shrink-0">11:30</span>
                      <div className="flex-1 h-8 bg-foreground-secondary/20 border border-border rounded-lg flex items-center px-4">
                        <span className="text-secondary text-foreground-secondary text-sm">Break</span>
                      </div>
                    </div>
                    
                    {/* 12:00 PM - 1:00 PM */}
                    <div className="flex items-center gap-3">
                      <span className="text-tertiary text-foreground-secondary w-16 flex-shrink-0">12:00</span>
                      <div className="flex-1 h-12 bg-foreground-secondary/20 border border-border rounded-lg flex items-center px-4">
                        <span className="text-secondary text-foreground-secondary">Lunch</span>
                      </div>
                    </div>
                    
                    {/* 1:00 PM - 2:00 PM */}
                    <div className="flex items-center gap-3">
                      <span className="text-tertiary text-foreground-secondary w-16 flex-shrink-0">1:00</span>
                      <div className="flex-1 h-12 bg-accent-green/25 border border-green-border rounded-lg flex items-center px-4">
                        <span className="text-secondary font-medium">Meetings</span>
                      </div>
                    </div>
                    
                    {/* 2:00 PM - 3:30 PM */}
                    <div className="flex items-center gap-3">
                      <span className="text-tertiary text-foreground-secondary w-16 flex-shrink-0">2:00</span>
                      <div className="flex-1 h-16 bg-accent-green/30 border border-green-border rounded-lg flex items-center px-4">
                        <span className="text-secondary font-medium">Deep Work</span>
                      </div>
                    </div>
                    
                    {/* Empty slot */}
                    <div className="flex items-center gap-3">
                      <span className="text-tertiary text-foreground-secondary w-16 flex-shrink-0">3:30</span>
                      <div className="flex-1 h-8 border-2 border-dashed border-border rounded-lg"></div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-accent-green" size={16} />
                    <span className="text-tertiary text-foreground-secondary">6 blocks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-accent-green" size={16} />
                    <span className="text-tertiary text-foreground-secondary">5.5h planned</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Features Content */}
          <div className="lg:w-1/2">
            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Edit3 className="text-foreground" size={20} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-2">
                    Drag and drop planning
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    Create time blocks by simply dragging on your calendar. Adjust durations, move blocks around, and plan your day visually.
                  </p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Zap className="text-foreground" size={20} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-2">
                    Quick templates
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    Save your favorite time block patterns as templates. Start your day with one click and customize as needed.
                  </p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-foreground" size={20} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-2">
                    Weekly overview
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    See your entire week at a glance. Plan ahead, spot patterns, and ensure balance across your schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

