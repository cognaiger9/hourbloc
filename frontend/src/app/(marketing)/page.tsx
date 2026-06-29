import Header from "./_components/Header";
import Footer from "./_components/Footer";
import HeroSection from "./_sections/HeroSection";
import HowItWorksSection from "./_sections/HowItWorksSection";
import TimeBlockPlanningSection from "./_sections/TimeBlockPlanningSection";
import FocusTimerSection from "./_sections/FocusTimerSection";
import AnalyticsSection from "./_sections/AnalyticsSection";
import CTASection from "./_sections/CTASection";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <TimeBlockPlanningSection />
      <FocusTimerSection />
      <AnalyticsSection />
      <CTASection />
      <Footer />
    </div>
  );
}

