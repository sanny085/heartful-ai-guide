import { ClipboardCheck, Users, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Free Health Assessment",
    description:
      "Share your health reports, lifestyle details, and concerns. We analyze everything deeply - not just numbers, but your complete health story.",
    duration: "15 min form + 30 min call",
  },
  {
    number: "02",
    icon: Users,
    title: "Personalized Roadmap",
    description:
      "Based on your assessment, we create a 100% customized healing plan - diet, exercise, remedies, and lifestyle changes tailored just for you.",
    duration: "Delivered in 48 hours",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Guided Transformation",
    description:
      "Execute your plan with continuous doctor observation, weekly check-ins, adjustments, and unwavering support until you see real results.",
    duration: "90-day transformation",
  },
];

const ProcessSection = () => {
  const navigate = useNavigate()

  return (
    <section id="process" className="section-padding bg-[#276852] text-primary-foreground">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block font-semibold text-sm uppercase tracking-wider mb-4 text-[#288A7A]">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Your Journey to <span className="text-secondary">Natural Health</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            No confusion. No overwhelm. Just a clear path from where you are to where you want to be.
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-1/2 -translate-x-1/2 w-[60%] h-0.5 bg-primary-foreground/20" />

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/20 h-full">
                  {/* Step Number */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-5xl font-extrabold text-secondary/40">{step.number}</span>
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-foreground" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-primary-foreground/80 leading-relaxed mb-6">{step.description}</p>
                  <div className="inline-block bg-primary-foreground/10 px-4 py-2 rounded-full text-sm font-medium">
                    {step.duration}
                  </div>
                </div>

                {/* Arrow - Mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRight className="w-6 h-6 text-primary-foreground/40 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <button onClick={() => navigate("/wellness-program/apply")} className="btn-cta">
            Start My Health Journey Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
