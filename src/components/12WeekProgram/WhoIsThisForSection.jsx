import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight, Leaf, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleCTAClick, CTA_BUTTON_CLASSES, CTA_BUTTON_CONTENT_CLASSES, CTA_BUTTON_TEXT_CLASSES, CTA_BUTTON_SHINE_CLASSES } from "./programUtils";
import SectionHeader from "./SectionHeader";

const WhoIsThisForSection = memo(() => {
  const navigate = useNavigate();
  
  const forList = useMemo(() => [
    "Adults with BP or pre-hypertension diagnosis",
    "Busy professionals dealing with chronic stress",
    "Those worried about rising sugar levels",
    "People serious about lifestyle change",
    "Anyone seeking natural, long-term solutions",
  ], []);

  const notForList = useMemo(() => [
    "Those looking for quick fixes or magic pills",
    "People unwilling to follow a structured routine",
    "Anyone expecting results without effort",
  ], []);

  const handleButtonClick = useCallback(() => {
    handleCTAClick(navigate);
  }, [navigate]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badgeIcon={Leaf}
            badgeText="Program Fit"
            title="Is This Program Your Perfect Match?"
            titleIcon={Heart}
            description="This program is designed for committed individuals ready for real change"
          />

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* This is for you */}
            <Card className="relative p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 border-4 border-green-300 rounded-3xl overflow-hidden shadow-xl group">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-200 rounded-full flex items-center justify-center border-2 border-green-400">
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-green-400" />
                </div>
                <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-extrabold text-gray-800">This is for you if:</h3>
              </div>
              <ul className="space-y-3 md:space-y-4 relative z-10">
                {forList.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3 relative pl-6 md:pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 md:w-5 md:h-5 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-300">
                      <CheckCircle2 className="w-2 h-2 md:w-3 md:h-3 text-green-400" />
                    </div>
                    <span className="text-xs md:text-sm lg:text-base text-gray-800 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* This is NOT for you */}
            <Card className="relative p-8 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-4 border-gray-300 rounded-3xl overflow-hidden group">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-400">
                  <XCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-500" />
                </div>
                <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-extrabold text-gray-700">This is NOT for you if:</h3>
              </div>
              <ul className="space-y-3 md:space-y-4 relative z-10">
                {notForList.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3 relative pl-6 md:pl-8">
                    <div className="absolute left-0 top-1 w-4 h-4 md:w-5 md:h-5 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-400">
                      <XCircle className="w-2 h-2 md:w-3 md:h-3 text-gray-500" />
                    </div>
                    <span className="text-xs md:text-sm lg:text-base text-gray-800 font-semibold">{item}</span>
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
                <span className={CTA_BUTTON_TEXT_CLASSES}>Apply Now for a Healthier Future! ✨</span>
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

WhoIsThisForSection.displayName = "WhoIsThisForSection";

export default WhoIsThisForSection;
