import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Heart,
  TrendingDown,
  Shield,
  Clock,
  Users,
  Sparkles,
  Leaf,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleCTAClick, CTA_BUTTON_CLASSES, CTA_BUTTON_CONTENT_CLASSES, CTA_BUTTON_TEXT_CLASSES, CTA_BUTTON_SHINE_CLASSES, getColorClasses } from "./programUtils";
import SectionHeader from "./SectionHeader";

const BenefitsForYouSection = memo(() => {
  const navigate = useNavigate();
  
  const benefits = useMemo(() => [
    { icon: Heart, title: "Better Heart Health", description: "Reduce BP naturally and improve overall cardiovascular wellness", color: "green" },
    { icon: TrendingDown, title: "Reduced Medicine Dependency", description: "Gradually decrease reliance on medications with lifestyle changes", color: "emerald" },
    { icon: Shield, title: "Long-term Protection", description: "Build sustainable habits to prevent future health complications", color: "teal" },
    { icon: Clock, title: "Time-Efficient Approach", description: "Structured program that fits into your busy lifestyle", color: "lime" },
    { icon: Users, title: "Expert Support", description: "Get personalized guidance from medical professionals", color: "cyan" },
    { icon: Sparkles, title: "Improved Quality of Life", description: "Experience more energy, better sleep, and reduced stress", color: "green" },
  ], []);

  const handleButtonClick = useCallback(() => {
    handleCTAClick(navigate);
  }, [navigate]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badgeIcon={Leaf}
            badgeText="Benefits"
            title="Benefits for You"
            titleIcon={Star}
            description="Discover how this program can transform your health and lifestyle"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((benefit, index) => {
              const { icon: Icon, title, description, color } = benefit ?? {};
              const { border = "", hoverBorder = "", bg = "", iconBorder = "" } = getColorClasses(color) ?? {};
              return (
                <Card
                  key={index}
                  className={`relative p-6 bg-white border-4 ${border} ${hoverBorder} hover:shadow-2xl transition-all rounded-3xl overflow-hidden group`}
                >
                  <div className="flex justify-center items-center mb-3 md:mb-4 relative z-10">
                    <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${bg} rounded-2xl flex items-center justify-center border-4 ${iconBorder} shadow-lg group-hover:scale-110 transition-transform mx-auto`}>
                      {Icon && <Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />}
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-800 text-center mb-2 md:mb-3">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-sm md:text-base text-gray-700 text-center leading-relaxed">
                      {description}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={handleButtonClick}
              className={CTA_BUTTON_CLASSES}
              size="lg"
            >
              <span className={CTA_BUTTON_CONTENT_CLASSES}>
                <span className={CTA_BUTTON_TEXT_CLASSES}>Start Your Journey Today! ✨</span>
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

BenefitsForYouSection.displayName = "BenefitsForYouSection";

export default BenefitsForYouSection;

