import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Moon, UtensilsCrossed, Clock, ArrowRight, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleCTAClick, CTA_BUTTON_CLASSES, CTA_BUTTON_CONTENT_CLASSES, CTA_BUTTON_TEXT_CLASSES, CTA_BUTTON_SHINE_CLASSES, getColorClasses } from "./programUtils";
import SectionHeader from "./SectionHeader";

const MedicineEducationSection = memo(() => {
  const navigate = useNavigate();
  
  const factors = useMemo(() => [
    {
      icon: Activity,
      title: "Chronic Stress",
      color: "green",
    },
    {
      icon: Moon,
      title: "Poor Sleep",
      color: "emerald",
    },
    {
      icon: UtensilsCrossed,
      title: "Food Timing",
      color: "teal",
    },
    {
      icon: Clock,
      title: "Routine Imbalance",
      color: "lime",
    },
  ], []);

  const handleButtonClick = useCallback(() => {
    handleCTAClick(navigate);
  }, [navigate]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badgeIcon={Lightbulb}
            badgeText="Understanding Root Causes"
            title="Why Medicine Alone Is Not Enough"
          />

          {/* Main Content Card */}
          <Card className="relative p-8 md:p-12 bg-white shadow-2xl border-4 border-green-100 rounded-3xl overflow-hidden">
            <div className="space-y-8 mb-10 relative z-10">
              <div className="relative pl-4 md:pl-6 border-l-4 border-green-400">
                <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 leading-relaxed font-medium">
                  Medicines are important—they help control your numbers. But they don't address the{" "}
                  <span className="text-gray-800 font-extrabold relative">
                    root causes
                  </span>{" "}
                  that created the problem in the first place.
                </p>
              </div>

              <div className="relative pl-4 md:pl-6 border-l-4 border-emerald-400">
                <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-700 leading-relaxed font-medium">
                  Blood pressure doesn't rise overnight. It's the result of years of accumulated stress, irregular routines, poor sleep, and unhealthy eating patterns. To truly control BP, we need to correct these underlying factors.
                </p>
              </div>
            </div>

            {/* Factor Cards - Greenery Grid with distinct colors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {factors.map((factor, index) => {
                const { icon: Icon, title, color } = factor ?? {};
                const { bg = "", border = "", hoverBorder = "", iconBg = "", iconBorder = "" } = getColorClasses(color) ?? {};
                return (
                  <Card
                    key={index}
                    className={`relative p-5 bg-gradient-to-br ${bg} text-center border-2 ${border} rounded-2xl group hover:shadow-xl transition-all overflow-hidden ${hoverBorder}`}
                  >
                    <div className="relative z-10">
                      <div className="flex justify-center items-center mb-2 md:mb-3">
                        <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center border-2 ${iconBorder} group-hover:scale-110 transition-transform mx-auto`}>
                          {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm lg:text-base font-extrabold text-gray-800 text-center">
                        {title}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Solution Block */}
            <Card className="relative p-4 md:p-6 lg:p-8 bg-gradient-to-r from-green-50 via-yellow-50 to-emerald-50 border-l-4 border-green-400 rounded-2xl mb-6 md:mb-8 overflow-hidden">
              <p className="text-sm md:text-base lg:text-lg xl:text-xl font-extrabold text-gray-800">
                The solution? A structured lifestyle correction program that addresses all these factors together. 🚀
              </p>
            </Card>

            <div className="text-center">
              <Button
                onClick={handleButtonClick}
                className={CTA_BUTTON_CLASSES}
                size="lg"
              >
                <span className={CTA_BUTTON_CONTENT_CLASSES}>
                  <span className={CTA_BUTTON_TEXT_CLASSES}>Start Your Lifestyle Reset 🎉</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1 sm:ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className={CTA_BUTTON_SHINE_CLASSES}></div>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
});

MedicineEducationSection.displayName = "MedicineEducationSection";

export default MedicineEducationSection;
