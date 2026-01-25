import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const programs = [
  {
    title: "BP Control",
    badge: "Popular Plan",
    badgeColor: "bg-orange-500",
    highlighted: false,
    features: [
      "12-week structured BP control program",
      "Doctor-led lifestyle change guidance",
      "Personalized diet plan",
      "Weekly progress check-up (phone/video call)",
      "Stress and sleep management",
      "Reduce medicine dependency",
      "Long-term health maintenance",
    ],
  },
  {
    title: "Diabetes Reversal",
    badge: "Best Value",
    badgeColor: "bg-teal-500",
    highlighted: true,
    features: [
      "Diabetes reversal program (12 weeks)",
      "Intensive lifestyle intervention (food, exercise, fasting)",
      "HbA1c improvement tracking",
      "Comprehensive health monitoring (BP, sugar, cholesterol)",
      "Long-term maintenance strategy (for lifetime)",
      "Doctor-supervised progress (weekly check)",
    ],
  },
  {
    title: "PCOS / PCOD / THYROID",
    badge: "Comprehensive",
    badgeColor: "bg-emerald-600",
    highlighted: false,
    features: [
      "Hormone balance program (12 weeks)",
      "Special diet for PCOS/PCOD (with regular meals)",
      "Thyroid management support (TSH, T3, T4 tracking)",
      "Weight management strategies",
      "Hormone level tracking (monthly check)",
      "Lifestyle optimization (food, exercise, sleep)",
      "Expert medical supervision (women's health)",
    ],
  },
  {
    title: "Weight Loss",
    badge: "Premium",
    badgeColor: "bg-emerald-500",
    highlighted: false,
    features: [
      "12-week structured weight loss program",
      "Personalized diet plan with Indian foods",
      "Exercise and activity guidance (home-based)",
      "Weekly weight and body measurements tracking",
      "Metabolism boost strategies (natural methods)",
      "Sustainable weight loss (no crash diets)",
      "Doctor-supervised progress (weekly check)",
    ],
  },
  {
    title: "Mental Stress",
    badge: "Preventive Care",
    badgeColor: "bg-teal-500",
    highlighted: false,
    features: [
      "12-week structured mental stress reduction program",
      "Stress-related heart attack prevention approach",
      "Guidance stress-control challenges",
      "Blood pressure & heart stress monitoring",
      "Doctor-led lifestyle & stress management guidance",
      "Sleep, anxiety, & emotional balance support",
      "Work, family & lifestyle stress handling strategies",
    ],
  },
  {
    title: "Personalized Lifestyle Blueprint (12 Weeks)",
    badge: "Complete Plan",
    badgeColor: "bg-primary",
    highlighted: false,
    features: [
      "12-week personalized lifestyle transformation plan",
      "Deep health assessment (BP, sugar trends, weight, stress, sleep, habits)",
      "Root-cause analysis of lifestyle-related health issues",
      "Customized Indian diet plan (home food, no extreme diets)",
      "Daily routine optimization (sleep, meals, movement, stress)",
      "Physical activity & mobility guidance (home-based, age-appropriate)",
      "Stress, anxiety & mental wellness support",
      // "Habit-building system for long-term consistency",
      // "Weekly progress tracking & lifestyle corrections",
      // "Doctor-led guidance & lifestyle coaching",
      // "Preventive approach to reduce future heart attack risk",
      // "Long-term maintenance roadmap (beyond 12 weeks)",
    ],
  },
];

const ChooseProgramSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/12-week-program");
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-accent/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">Choose Your Program</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the right program for your health concern. Designed for Indian lifestyle with our traditional foods.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {programs.map((program, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                program.highlighted ? "border-teal-500 shadow-lg scale-[1.02]" : "border-border hover:border-primary/50"
              }`}
            >
              {/* Badge */}
              <span
                className={`absolute -top-3 right-4 ${program.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}
              >
                {program.badge}
              </span>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-4 pr-16 text-[#1D3029]">{program.title}</h3>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {program.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground text-[#628478]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={handleGetStarted}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChooseProgramSection;
