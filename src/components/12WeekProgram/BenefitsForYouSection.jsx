import { Heart, ArrowRight, Sparkles, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

const AssessmentForm = () => {
  return (
    <section
      id="assessment-form"
      className="section-padding bg-[#276852] overflow-hidden relative"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/30 rounded-full px-5 py-2.5 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-primary-foreground">
              Transform Your Health in 12 Weeks wellness program
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4 leading-tight">
            Ready to Start Your
            <span className="block text-secondary">Health Transformation?</span>
          </h2>

          <p className="text-md text-primary-foreground/85 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join our comprehensive 12-week wellness program designed specifically for busy professionals. Get
            personalized guidance, continuous support, and proven natural methods.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Clock className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">12-Week wellness Program</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Users className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">1-on-1 Coaching</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Heart className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">100% Natural</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link to="/wellness-program/apply" className="btn-cta text-sm px-10 py-5 animate-pulse-glow group inline-flex">
            <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Start wellness program
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Urgency Text */}
          <p className="text-primary-foreground/70 text-sm mt-6">⚡ Limited spots available • Next batch starts soon</p>
        </div>
      </div>
    </section>
  );
};

export default AssessmentForm;
