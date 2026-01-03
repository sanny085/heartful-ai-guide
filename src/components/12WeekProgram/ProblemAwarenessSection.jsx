import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, XCircle, Leaf, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleCTAClick, CTA_BUTTON_CLASSES, CTA_BUTTON_CONTENT_CLASSES, CTA_BUTTON_TEXT_CLASSES, CTA_BUTTON_SHINE_CLASSES, getColorClasses } from "./programUtils";
import SectionHeader from "./SectionHeader";

const ProblemAwarenessSection = memo(() => {
  const navigate = useNavigate();
  
  const problems = useMemo(() => [
    { text: "BP keeps fluctuating despite medications", color: "green" },
    { text: "Fear of lifelong tablets and side effects", color: "emerald" },
    { text: "Stress, anxiety, and poor sleep patterns", color: "teal" },
    { text: "Sugar levels slowly creeping up", color: "lime" },
    { text: "No clear lifestyle guidance from anyone", color: "cyan" },
  ], []);

  const handleButtonClick = useCallback(() => {
    handleCTAClick(navigate);
  }, [navigate]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badgeIcon={Leaf}
            badgeText="Common Challenges"
            title="We Understand Your Challenges"
            titleIcon={Heart}
            description="You're not alone. These are the struggles of millions of Indians."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {problems.map((problem, index) => {
              const { text, color } = problem ?? {};
              const { border = "", hoverBorder = "", bg = "" } = getColorClasses(color) ?? {};
              return (
                <Card
                  key={index}
                  className={`relative p-6 bg-white hover:shadow-xl transition-all border-2 ${border} rounded-2xl group overflow-hidden ${hoverBorder}`}
                >
                  <div className="flex items-start gap-3 md:gap-4 relative z-10">
                    <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center flex-shrink-0 border-2 ${border} group-hover:scale-110 transition-transform`}>
                      <XCircle className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-red-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm md:text-base lg:text-lg text-gray-800 font-semibold pt-1 md:pt-2 flex-1">
                      {text}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quote Banner */}
          <Card className="relative p-4 md:p-6 lg:p-8 xl:p-10 bg-gradient-to-r from-green-50 via-yellow-50 to-emerald-50 border-l-4 border-green-400 rounded-2xl mb-8 md:mb-10 shadow-lg overflow-hidden">
            <div>
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-extrabold text-gray-800 text-center">
                "BP is not the problem. Lifestyle is. Your Success Path Starts Here! ✨"
              </p>
            </div>
          </Card>

          <div className="text-center">
            <Button
              onClick={handleButtonClick}
              className={CTA_BUTTON_CLASSES}
              size="lg"
            >
              <span className={CTA_BUTTON_CONTENT_CLASSES}>
                <span className={CTA_BUTTON_TEXT_CLASSES}>Ready to Change Your Lifestyle? 🎉</span>
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

ProblemAwarenessSection.displayName = "ProblemAwarenessSection";

export default ProblemAwarenessSection;
