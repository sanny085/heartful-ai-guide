import { Droplets, Leaf, Stethoscope, Dumbbell, Apple, Sun, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import servicesStyles from "./wellness-program.module.css"
import drop from "../../assets/water-droplets.jpg"
import sun from "../../assets/sun.avif"
import skethoscope from "../../assets/skethoscope.webp"
import apple from "../../assets/apple.webp"
import dumble from "../../assets/dumble.jpg"
import leaf from "../../assets/leaf.jpg"

const services = [
  {
    icon: drop,
    title: "Guided Water Fasting",
    description:
      "Safe, customized fasting protocols that reset your metabolism and accelerate healing under expert supervision.",
    benefits: ["Cellular detox", "Insulin reset", "Mental clarity"],
  },
  {
    icon: leaf,
    title: "Natural Home Remedies",
    description: "Time-tested Indian remedies adapted to your lifestyle - simple, effective, and easy to follow.",
    benefits: ["Kitchen-based", "No side effects", "Cost-effective"],
  },
  {
    icon: skethoscope,
    title: "Doctor Observation",
    description: "Continuous monitoring by wellness doctors who track your progress and adjust your plan in real-time.",
    benefits: ["Weekly check-ins", "Report analysis", "Emergency support"],
  },
  {
    icon: dumble,
    title: "Fitness Guidance",
    description:
      "Custom exercise plans that fit your schedule, fitness level, and health conditions — no gym required.",
    benefits: ["Home workouts", "Office exercises", "Yoga & breathing"],
  },
  {
      icon: apple,
      title: "Personalized Diet Plans",
    description:
      "Diet is EVERYTHING. We create meal plans based on your food preferences, family structure, and health goals.",
    benefits: ["Indian cuisine", "Family-friendly", "Sustainable"],
  },
  {
    icon: sun,
    title: "Lifestyle Correction",
    description:
      "Sleep optimization, stress management, hydration habits, and daily routine restructuring for lasting change.",
    benefits: ["Sleep hygiene", "Stress tools", "Daily rituals"],
  },
];

const ServicesSection = () => {
  const navigate = useNavigate()
  return (
    <section id="services" className="section-padding bg-white">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-[#276852] font-semibold text-sm uppercase tracking-wider mb-4">
            Our Natural Approach
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 text-[#1D3029]">
            6 Pillars of <span className={`${servicesStyles["text-gradient"]}`}>Natural Healing</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-[#628478]">
            No pills. No shortcuts. No generic plans. Just science-backed natural methods, personalized for your unique
            body, lifestyle, and goals.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group ${servicesStyles["card-wellness"]} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#2768521A] flex items-center justify-center mb-6 group-hover:bg-[#276852] group-hover:scale-110 transition-all duration-300">
                <img
                  src={service.icon}
                  alt={service.title}
                  className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors"
                />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 text-[#1D3029]">{service.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-[#628478]">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.benefits.map((benefit, i) => (
                  <span
                    key={i}
                    className="inline-block text-xs font-medium bg-[#288A7A1A] text-[#288A7A] px-3 py-1 rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="text-center mt-10">
          <p className="text-[#628478] text-lg mb-2">
            All services are included in your personalized wellness plan
          </p>
            <div className="text-center mt-10">
              <button className="btn-cta" onClick={() => navigate("/wellness-program/apply")}>
                Check Your Health
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

