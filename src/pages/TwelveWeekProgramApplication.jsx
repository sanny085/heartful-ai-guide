import { useEffect } from "react";
import ApplicationForm from "@/components/12WeekProgram/ApplicationForm";

const TwelveWeekProgramApplication = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <ApplicationForm />
      </div>
    </div>
  );
};

export default TwelveWeekProgramApplication;

