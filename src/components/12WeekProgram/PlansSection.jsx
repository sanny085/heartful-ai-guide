import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getColorClasses } from "./programUtils";
import SectionHeader from "./SectionHeader";

const PlansSection = memo(() => {
  const navigate = useNavigate();

  const plans = useMemo(() => [
    {
      title: "BP Control",
      badge: "Popular Plan",
      features: [
        "12-week structured BP control program",
        "Doctor-led lifestyle change guidance",
        "Personalized diet plan",
        "Weekly progress check-up (phone/video call)",
        "Stress and sleep management",
        "Reduce medicine dependency",
        "Long-term health maintenance",
      ],
      highlighted: false,
      color: "green",
    },
    {
      title: "Diabetes Reversal",
      badge: "Best Value",
      features: [
        "Diabetes reversal program (12 weeks)",
        "Intensive lifestyle intervention (food, exercise, fasting)",
        "HbA1c improvement tracking",
        "Comprehensive health monitoring (BP, sugar, cholesterol)",
        "Long-term maintenance strategy (for lifetime)",
        "Doctor-supervised progress (weekly check)",
      ],
      highlighted: true,
      color: "emerald",
    },
    {
      title: "PCOS / PCOD / THYROID",
      badge: "Comprehensive",
      features: [
        "Hormone balance program (12 weeks)",
        "Special diet for PCOS/PCOD (with regular meals)",
        "Thyroid management support (TSH, T3, T4 tracking)",
        "Weight management strategies",
        "Hormone level tracking (monthly check)",
        "Lifestyle optimization (food, exercise, sleep)",
        "Expert medical supervision (women's health)",
      ],
      highlighted: false,
      color: "teal",
    },
    {
      title: "Weight Loss",
      badge: "Premium",
      features: [
        "12-week structured weight loss program",
        "Personalized diet plan with Indian foods",
        "Exercise and activity guidance (home-based)",
        "Weekly weight and body measurements tracking",
        "Metabolism boost strategies (natural methods)",
        "Sustainable weight loss (no crash diets)",
        "Doctor-supervised progress (weekly check)",
      ],
      highlighted: false,
      color: "lime",
    },
    {
      title : "Mental Stress",
      badge : "Preventive Care",
      features : [
        "12-week structured mental stress reduction program",
        "Stress-related heart attack prevention approach",
        "Guidence stress-control challenges",
        "Blood pressure & heart stress monitoring",
        "Doctor-led lifestyle & stress management guidance",
        "Sleep, anxiety & emotional balance support",
        "Work, family & lifestyle stress handling strategies"
      ],
      highlighted: false,
      color:"green"
    },
    {
    title: "Energy Boost Plan",
    badge: "Complete Plan",
    badgeColor: "gray",
    highlighted: false,
    features: [
      "12-week personalized lifestyle transformation plan",
      // "Low energy, fatigue & burnout recovery support",
      "Restore energy, overcome fatigue, and recover from burnout naturally",
      "Root-cause analysis of lifestyle-related health issues",
      "Customized Indian diet plan (home food, no extreme diets)",
      "Daily routine optimization (sleep, meals, movement, stress)",
      "Physical activity & mobility guidance (home-based, age-appropriate)",
      "Stress, anxiety & mental wellness support",
    ],
  },
  ], []);

  const handleButtonClick = useCallback((programTitle) => {
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
    navigate?.(`/wellness-program/apply?program=${encodeURIComponent(programTitle)}`);
  }, [navigate]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Choose Your Program"
            description="Select the right program for your health concern. Designed for Indian lifestyle with our traditional foods."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const { title, badge, features, highlighted, color } = plan ?? {};
              const { badge: badgeClass = "", border = "", checkmark = "", button = "", buttonHover = "" } = getColorClasses(color) ?? {};
              return (
                <Card
                  key={index}
                  className={`relative p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all flex flex-col ${
                    highlighted
                      ? `border-4 ${border}`
                      : "border-2 border-gray-200"
                  }`}
                >
                  {badge && (
                    <Badge
                      className={`${badgeClass} absolute top-4 right-4 text-white text-xs px-3 py-1 rounded-full font-semibold border-0`}
                    >
                      {badge}
                    </Badge>
                  )}

                  <p className="text-xl md:text-2xl font-extrabold text-gray-800 mb-6 mt-2 pr-20">
                    {title}
                  </p>

                  <ul className="space-y-3 mb-6 flex-grow">
                    {features?.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`w-5 h-5 ${checkmark} flex-shrink-0 mt-0.5`}
                        />
                        <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleButtonClick(title)}
                    className={`w-full bg-gradient-to-r ${button} ${buttonHover} text-white py-3 md:py-4 text-sm md:text-base font-bold rounded-lg shadow-lg transition-all mt-auto`}
                    size="lg"
                  >
                    Get Started
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

PlansSection.displayName = "PlansSection";

export default PlansSection;

