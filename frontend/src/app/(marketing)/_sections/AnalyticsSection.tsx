import Section from "../_components/Section";
import Card from "../_components/Card";
import { cn } from "@/utils/common";
import { Clock, BarChart2, Flame, FileText, Star } from "lucide-react";

export default function AnalyticsSection() {
  return (
    <Section background="background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-3">
            <span className="text-secondary text-foreground-secondary uppercase tracking-wide text-sm">
              Analytics
            </span>
          </div>
          <h2 className={cn(
            "text-2xl sm:text-3xl lg:text-page-title",
            "font-semibold tracking-tight mb-4"
          )}>
            Understand your focus habits
          </h2>
          <p className={cn(
            "text-primary text-foreground-secondary",
            "leading-relaxed max-w-2xl mx-auto"
          )}>
            Track your progress, identify patterns, and build better focus habits with detailed analytics and visual insights.
          </p>
        </div>

        {/* Feature Blocks */}
        <div className="space-y-20">
          {/* Feature 1: Daily Focus Tracking */}
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-3">
                    Daily Focus Tracking
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    Track your daily focus time and sessions. See your progress at a glance with detailed breakdowns of your work patterns.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="flex gap-4">
                {/* Today's Focus Card */}
                <div className="flex-1">
                  <Card padding="md" className="bg-info/10 border-info/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center">
                        <Clock className="text-info" size={16} />
                      </div>
                      <span className="text-secondary text-foreground-secondary text-sm">Today&apos;s Focus</span>
                    </div>
                    <p className="text-2xl font-semibold text-info tracking-tight">2h 30m</p>
                  </Card>
                </div>
                
                {/* Sessions Card */}
                <div className="flex-1">
                  <Card padding="md" className="bg-purple-100/50 border-purple-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-200/50 rounded-lg flex items-center justify-center">
                        <FileText className="text-purple-600" size={16} />
                      </div>
                      <span className="text-secondary text-foreground-secondary text-sm">Sessions</span>
                    </div>
                    <p className="text-2xl font-semibold text-purple-600 tracking-tight">4</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Visualize Your Progress */}
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="text-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-3">
                    Visualize Your Progress
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    Get a clear overview of your focus patterns and track your consistency over time with our intuitive analytics dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <Card padding="md" className="bg-surface">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-section-title font-medium">December 2025</h4>
                </div>
                
                {/* Calendar Grid */}
                <div className="mb-4">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-tertiary text-foreground-secondary py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before Dec 1 */}
                    {Array.from({ length: 0 }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    
                    {/* Days 1-31 */}
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const activeDays = [1, 2, 4, 6, 7, 8, 12, 13, 14, 16];
                      const highActivityDays = [12, 13];
                      const isActive = activeDays.includes(day);
                      const isHighActivity = highActivityDays.includes(day);
                      const isToday = day === 16;
                      
                      return (
                        <div
                          key={day}
                          className={cn(
                            "aspect-square rounded-lg flex items-center justify-center text-sm font-medium",
                            isActive && isHighActivity && "bg-accent-green text-white",
                            isActive && !isHighActivity && "bg-green-light text-accent-green",
                            !isActive && "text-foreground-secondary",
                            isToday && !isActive && "border-2 border-accent-green"
                          )}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                  <div className="bg-green-light rounded-lg p-3 text-center">
                    <span className="text-tertiary text-accent-green block mb-1">Days Focused</span>
                    <span className="text-section-title font-semibold text-accent-green">10 of 17</span>
                  </div>
                  <div className="bg-green-light rounded-lg p-3 text-center">
                    <span className="text-tertiary text-accent-green block mb-1">Avg Focus Day</span>
                    <span className="text-section-title font-semibold text-accent-green">1h 44m</span>
                  </div>
                  <div className="bg-green-light rounded-lg p-3 text-center">
                    <span className="text-tertiary text-accent-green block mb-1">Total Focus</span>
                    <span className="text-section-title font-semibold text-accent-green">17h 23m</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Feature 3: Focus Streaks */}
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Flame className="text-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-section-title font-medium mb-3">
                    Focus Streaks
                  </h3>
                  <p className="text-secondary text-foreground-secondary leading-relaxed">
                    Build momentum with daily focus streaks. Each day you hit 5+ minutes of focused work, your streak grows.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="flex gap-4">
                {/* Current Streak Card */}
                <div className="flex-1">
                  <Card padding="md" className="bg-warning/10 border-warning/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                        <Flame className="text-warning" size={16} />
                      </div>
                      <span className="text-secondary text-foreground-secondary text-sm">Current Streak</span>
                    </div>
                    <p className="text-2xl font-semibold text-warning tracking-tight">7 days</p>
                  </Card>
                </div>
                
                {/* Best Streak Card */}
                <div className="flex-1">
                  <Card padding="md" className="bg-yellow-100/50 border-yellow-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-yellow-200/50 rounded-lg flex items-center justify-center">
                        <Star className="text-yellow-600" size={16} />
                      </div>
                      <span className="text-secondary text-foreground-secondary text-sm">Best Streak</span>
                    </div>
                    <p className="text-2xl font-semibold text-yellow-600 tracking-tight">14 days</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

