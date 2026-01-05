import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, XCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleCTAClick, CTA_BUTTON_CLASSES, CTA_BUTTON_CONTENT_CLASSES, CTA_BUTTON_TEXT_CLASSES, CTA_BUTTON_SHINE_CLASSES } from "./programUtils";
import SectionHeader from "./SectionHeader";

const SolutionSection = memo(() => {
  const navigate = useNavigate();
  
  const notList = useMemo(() => [
    "A generic diet plan",
    "Just another yoga class",
    "Quick-fix supplements",
    "One-size-fits-all approach",
  ], []);

  const isList = useMemo(() => [
    "Structured lifestyle correction",
    "Personalized guidance",
    "Doctor-monitored progress",
    "Path to long-term independence",
  ], []);

  const handleButtonClick = useCallback(() => {
    handleCTAClick(navigate);
  }, [navigate]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badgeIcon={Star}
            badgeText="Introducing"
            title="Your Solution Awaits! ✨"
            description="A doctor-led, science-backed program designed specifically for Indian lifestyles to help you take control of your health—naturally."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {/* This is NOT */}
            <Card className="relative pt-4 pb-8 px-8 bg-gradient-to-br from-gray-100 to-gray-50 border-4 border-gray-300 rounded-3xl overflow-hidden group shadow-xl">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 mt-0 relative z-10">
                <XCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-500" />
                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-gray-800">This is NOT:</h3>
              </div>
              <ul className="space-y-3 md:space-y-4 relative z-10">
                {notList.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3 relative pl-6 md:pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 md:w-5 md:h-5 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-400">
                      <XCircle className="w-2 h-2 md:w-3 md:h-3 text-gray-500" />
                    </div>
                    <span className="text-sm md:text-base lg:text-lg text-gray-800 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* This IS */}
            <Card className="relative pt-4 pb-8 px-8 bg-gradient-to-br from-green-50 via-yellow-50 to-emerald-50 border-4 border-green-300 rounded-3xl overflow-hidden group shadow-xl">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 mt-0 relative z-10">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-green-400" />
                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold text-gray-800">This IS:</h3>
              </div>
              <ul className="space-y-3 md:space-y-4 relative z-10">
                {isList.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3 relative pl-6 md:pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 md:w-5 md:h-5 bg-yellow-200 rounded-full flex items-center justify-center border-2 border-yellow-400">
                      <CheckCircle2 className="w-2 h-2 md:w-3 md:h-3 text-yellow-600" />
                    </div>
                    <span className="text-sm md:text-base lg:text-lg text-gray-800 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={handleButtonClick}
              className={CTA_BUTTON_CLASSES}
              size="lg"
            >
              <span className={CTA_BUTTON_CONTENT_CLASSES}>
                <span className={CTA_BUTTON_TEXT_CLASSES}>Join the Program 🚀</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1 sm:ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className={CTA_BUTTON_SHINE_CLASSES}></div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

SolutionSection.displayName = "SolutionSection";

export default SolutionSection;
