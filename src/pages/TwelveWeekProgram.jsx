import HeroSection from "@/components/12WeekProgram/HeroSection";
import ProblemAwarenessSection from "@/components/12WeekProgram/ProblemAwarenessSection";
import MedicineEducationSection from "@/components/12WeekProgram/MedicineEducationSection";
import SolutionSection from "@/components/12WeekProgram/SolutionSection";
import ProgramStructureSection from "@/components/12WeekProgram/ProgramStructureSection";
import WhoIsThisForSection from "@/components/12WeekProgram/WhoIsThisForSection";
import TrustSection from "@/components/12WeekProgram/TrustSection";
import BenefitsForYouSection from "@/components/12WeekProgram/BenefitsForYouSection";
import PlansSection from "@/components/12WeekProgram/PlansSection";
import TestimonialsSection from "@/components/12WeekProgram/TestimonialsSection";
import ValueSection from "@/components/12WeekProgram/ValueSection";

const TwelveWeekProgram = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Problem Awareness Section */}
      <ProblemAwarenessSection />

      {/* Medicine Education Section */}
      <MedicineEducationSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* Program Structure Section */}
      <ProgramStructureSection />

      {/* Who Is This For Section */}
      <WhoIsThisForSection />

      {/* Trust Section */}
      <TrustSection />

      {/* Benefits For You Section */}
      <BenefitsForYouSection />

      {/* Plans Section */}
      <PlansSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Value Section */}
      <ValueSection />
    </div>
  );
};

export default TwelveWeekProgram;
