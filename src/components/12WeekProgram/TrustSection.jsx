import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, BookOpen, Target, ArrowRight, Leaf, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleCTAClick, CTA_BUTTON_CLASSES, CTA_BUTTON_CONTENT_CLASSES, CTA_BUTTON_TEXT_CLASSES, CTA_BUTTON_SHINE_CLASSES, getColorClasses } from "./programUtils";
import SectionHeader from "./SectionHeader";

const TrustSection = memo(() => {
  const navigate = useNavigate();
  
  const credentials = useMemo(() => [
    {
      icon: Stethoscope,
      title: "Doctor-Led Approach",
      description: "Guided by medical professionals who understand both science and real-world challenges.",
      color: "green",
    },
    {
      icon: BookOpen,
      title: "Education-First",
      description: "We empower you with knowledge, not dependency. Understanding your body is key to controlling it.",
      color: "emerald",
    },
    {
      icon: Target,
      title: "Focus on Prevention",
      description: "Our goal is to help you prevent complications and reduce medicine dependency over time.",
      color: "teal",
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
            badgeIcon={Leaf}
            badgeText="Why Trust Us"
            title="Built on Trust & Excellence!"
            titleIcon={Gem}
            description="Built on medical expertise, designed for Indian lifestyles"
          />

          {/* Credentials Grid with distinct colors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {credentials.map((credential, index) => {
              const { icon: Icon, title, description, color } = credential ?? {};
              const { border = "", hoverBorder = "", bg = "", iconBorder = "" } = getColorClasses(color) ?? {};
              return (
                <Card
                  key={index}
                  className={`relative p-6 md:p-8 bg-white border-4 ${border} ${hoverBorder} hover:shadow-2xl transition-all text-center rounded-3xl overflow-hidden group`}
                >
                  <div className={`w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-br ${bg} rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 border-4 ${iconBorder} shadow-lg group-hover:scale-110 transition-transform relative z-10`}>
                    {Icon && <Icon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />}
                  </div>
                  <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-extrabold text-gray-800 mb-2 md:mb-3 relative z-10">
                    {title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 relative z-10">{description}</p>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              onClick={handleButtonClick}
              className={CTA_BUTTON_CLASSES}
              size="lg"
            >
              <span className={CTA_BUTTON_CONTENT_CLASSES}>
                <span className={CTA_BUTTON_TEXT_CLASSES}>Get Started Today! 🌟</span>
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

TrustSection.displayName = "TrustSection";

export default TrustSection;
