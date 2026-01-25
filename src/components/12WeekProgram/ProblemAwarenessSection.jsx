import { AlertTriangle, Laptop, Clock, Coffee, Moon, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import problemStyles from "./wellness-program.module.css"

const problems = [
  {
    icon: Laptop,
    title: "12+ Hours at Desk",
    description: "Sitting all day destroys your metabolism and spine",
  },
  {
    icon: Clock,
    title: "No Time for Health",
    description: "Meetings, deadlines, promotions - health always comes last",
  },
  {
    icon: Coffee,
    title: "Stress-Fueled Life",
    description: "Tea, coffee, late nights, and anxiety are your daily routine",
  },
  {
    icon: Moon,
    title: "Poor Sleep Quality",
    description: "Screen time till midnight, waking up exhausted",
  },
  {
    icon: AlertTriangle,
    title: "Ignoring Warning Signs",
    description: "BP spikes, sugar creeping up, Pcos, weight gain, mental stress, Anxiety - 'I'll manage later",
  },
  {
    icon: Heart,
    title: "Fear of Medicine",
    description: "You don't want to be on pills for life, but see no other option",
  },
];

const ProblemsSection = () => {

  const navigate = useNavigate()

  return (
    <section id="problems" className="section-padding bg-[#F2EDE3]">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-[#276852] font-semibold text-sm uppercase tracking-wider mb-4">
            The Silent Crisis
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 text-[#1D3029]">
            Does This Sound Like Your Life?
          </h2>
          <p className="text-lg text-[#628478] leading-relaxed ">
            You're not alone. 8 out of 10 corporate professionals in India are silently walking towards heart disease,
            diabetes, and chronic illness - without even knowing it.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className={`${problemStyles["card-wellness"]} flex items-start gap-4 hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#DF20201A] flex items-center justify-center">
                <problem.icon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1D3029] text-lg mb-2">{problem.title}</h3>
                <p className="text-muted-foreground text-[#628478]">{problem.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Emotional Hook */}
        <div className="bg-[#276852] rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            The body keeps the score. And it's warning you.
          </h3>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Every ignored symptom, every "I'll start Monday," every skipped health check - they all add up. The question
            isn't <em>if</em> it will catch up, but <em>when</em>.
          </p>
          <button onClick={() => navigate("/wellness-program/apply")} className="btn-cta">
            Check My Health Risk Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProblemsSection;
