import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronDown, Leaf, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getColorClasses, handleCTAClick, CTA_BUTTON_CLASSES, CTA_BUTTON_CONTENT_CLASSES, CTA_BUTTON_TEXT_CLASSES, CTA_BUTTON_SHINE_CLASSES } from "./programUtils";
import SectionHeader from "./SectionHeader";

const ProgramStructureSection = memo(() => {
  const navigate = useNavigate();
  
  const phases = useMemo(() => [
    {
      phase: "Phase 1",
      weeks: "Week 1-2",
      title: "Awareness & Understanding",
      description: "Understand your BP patterns, triggers, and current lifestyle gaps through detailed assessment.",
      color: "green",
    },
    {
      phase: "Phase 2",
      weeks: "Week 3-6",
      title: "Body Reset",
      description: "Structured food guidance, fasting protocols, and physical activity tailored to your body.",
      color: "emerald",
    },
    {
      phase: "Phase 3",
      weeks: "Week 7-9",
      title: "Mind & Sleep Mastery",
      description: "Stress management techniques, sleep optimization, and mental wellness practices.",
      color: "teal",
    },
    {
      phase: "Phase 4",
      weeks: "Week 10-12",
      title: "Independence Building",
      description: "Develop sustainable habits and create your personalized long-term control blueprint.",
      color: "lime",
    },
  ], []);

  const handleButtonClick = useCallback(() => {
    handleCTAClick(navigate);
  }, [navigate]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badgeIcon={Leaf}
            badgeText="Program Journey"
            title="Your Amazing 12-Week Journey!"
            titleIcon={Target}
            description="A structured, phase-wise approach to lasting results."
          />

          {/* Phases */}
          <div className="space-y-6">
            {phases.map((phase, index) => {
              const { color, phase: phaseLabel, weeks, title, description } = phase ?? {};
              const { badgeBg = "", badgeBorder = "", badgeText = "", chevron = "", bg = "", border = "", hoverBorder = "" } = getColorClasses(color) ?? {};
              return (
                <div key={index} className="relative">
                  <Card className={`w-full p-6 md:p-8 bg-gradient-to-br ${bg} border-4 ${border} rounded-3xl transition-all group shadow-none ring-0 ${hoverBorder}`}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <Badge className={`px-2 py-1 md:px-3 md:py-1.5 lg:px-4 rounded-full ${badgeBg} border-2 ${badgeBorder} text-[10px] md:text-xs font-extrabold ${badgeText}`}>
                          {phaseLabel}
                        </Badge>
                        <span className="text-xs md:text-sm text-gray-600 font-bold">
                          {weeks}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-800 mb-2 md:mb-3">
                        {title}
                      </h3>
                      <p className="text-sm md:text-base lg:text-lg text-gray-600">
                        {description}
                      </p>
                    </div>
                  </Card>

                  {/* Arrow connector for mobile */}
                  {index < phases.length - 1 && (
                    <div className="md:hidden flex justify-center py-4">
                      <ChevronDown className={`w-8 h-8 ${chevron}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Additional Buttons */}
          <div className="text-center mt-12 space-y-3 md:space-y-4">
            {/* More Button and Bonus Button */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Button
              onClick={handleButtonClick}
              className="bg-gradient-to-r from-green-200 to-emerald-200 hover:from-green-300 hover:to-emerald-300 text-white px-4 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 text-xs sm:text-sm md:text-base font-semibold rounded-full shadow-lg border-2 border-green-200/50 relative overflow-hidden group w-full sm:w-auto"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center">
                More
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Button>
            
            <Button
              onClick={handleButtonClick}
              className="bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 text-white px-4 py-2.5 md:px-6 md:py-3 lg:px-8 lg:py-4 text-xs sm:text-sm md:text-base font-semibold rounded-full shadow-lg border-2 border-yellow-200/50 relative overflow-hidden group w-full sm:w-auto"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center">
                Bonus (Excitement) ✨
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Button>
          </div>

          {/* Main CTA Button */}
          <Button
            onClick={handleButtonClick}
            className={CTA_BUTTON_CLASSES}
            size="lg"
          >
            <span className={CTA_BUTTON_CONTENT_CLASSES}>
              <span className={CTA_BUTTON_TEXT_CLASSES}>Start Your 12-Week Journey 🎉</span>
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

ProgramStructureSection.displayName = "ProgramStructureSection";

export default ProgramStructureSection;
