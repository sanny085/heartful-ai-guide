import HeroSection from "@/components/12WeekProgram/HeroSection";
import ProblemAwarenessSection from "@/components/12WeekProgram/ProblemAwarenessSection";
import MedicineEducationSection from "@/components/12WeekProgram/MedicineEducationSection";
import SolutionSection from "@/components/12WeekProgram/SolutionSection";
// import ProgramStructureSection , {Stats} from "@/components/12WeekProgram/ProgramStructureSection";
import WhoIsThisForSection from "@/components/12WeekProgram/WhoIsThisForSection";
import TrustSection from "@/components/12WeekProgram/TrustSection";
import BenefitsForYouSection from "@/components/12WeekProgram/BenefitsForYouSection";
import PlansSection from "@/components/12WeekProgram/PlansSection";
import TestimonialsSection from "@/components/12WeekProgram/TestimonialsSection";
import ValueSection from "@/components/12WeekProgram/ValueSection";
import ServicesSection from "../components/12WeekProgram/MedicineEducationSection";
import ProcessSection from "../components/12WeekProgram/SolutionSection";
import ReviewsTestominials, { Stats } from "../components/12WeekProgram/ProgramStructureSection";
import WhatsAppTestimonialsSection from "../components/12WeekProgram/WhoIsThisForSection";
import ChooseProgramSection from "../components/12WeekProgram/TrustSection";
import AssessmentForm from "../components/12WeekProgram/BenefitsForYouSection";
import ProblemsSection from "../components/12WeekProgram/ProblemAwarenessSection";
const TwelveWeekProgram = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats */}
      <Stats />

      {/* Problem Awareness Section */}
      <ProblemsSection />

      {/* Plans Section */}
      <PlansSection />

      {/* Medicine Education Section */}
      <ServicesSection />

      {/* Solution Section */}
      <ProcessSection />

      {/* Program Structure Section */}
      <ReviewsTestominials />

      {/* Who Is This For Section */}
      <WhatsAppTestimonialsSection />

      {/* Trust Section */}
      {/* <ChooseProgramSection /> */}

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Benefits For You Section */}
      <AssessmentForm />

      {/* Value Section */}
      {/* <ValueSection /> */}
    </div>
  );
};

export default TwelveWeekProgram;
