import { Heart, ArrowRight, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-wellness.jpg";
import tcs from "../../assets/tcs.png"
import accenture from "../../assets/accenture.png"
import birlaSoft from "../../assets/birla-soft.png"
import cgi from "../../assets/cgi.png"
import cognizant from "../../assets/cognizant.jpg"
import cigniti from "../../assets/cigniti.webp"
import ibm from "../../assets/ibm.png"
import infosys from "../../assets/infosys.jpg"
import wipro from "../../assets/wipro.png"

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center py-2 overflow-hidden xl:mt-[-40px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/70 to-foreground/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide px-4 md:px-6 ">
        <div className="max-w-3xl">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-[#DA20201A] border border-[#DA20201A] rounded-full px-4 py-1 mb-2 animate-fade-up">
            <Heart className="w-4 h-4 text-[#DF2020] animate-heartbeat" />
            <span className="text-sm font-medium text-primary-foreground">Limited Slots Available This Month</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif text-2xl md:text-4xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-3 animate-fade-up-delay-1">
            Transform Your Health, Don't Wait for a <span className="text-[#DF2020]">Heart Attack</span>
          </h1>

          {/* <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-up-delay-1">
            Your Heart Deserves a Second Chance - <span className="text-cta">Before the First Crisis</span>
          </h1> */}

          {/* Subheadline */}
          <p className="text-md md:text-xl text-primary-foreground/90 leading-relaxed mb-4 animate-fade-up-delay-2">
            You work 12+ hours, skip meals, live on stress - and deep down, you know something is wrong.
            <span className="font-semibold text-primary-foreground"> We understand.</span> Let us help you reverse
            lifestyle diseases
            <span className="text-secondary"> naturally</span>, before it's too late.
          </p>

          {/* Trust Points */}
          <div className="flex flex-wrap gap-4 mb-4 animate-fade-up-delay-3">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">100% Natural Methods</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">Personalized Plans</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-sm">Doctor Supervised</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up-delay-3">
            <button onClick={() => navigate("/wellness-program/apply")} className="btn-cta animate-pulse-glow group text-md">
              Get My Health Assessment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#process"
              className="btn-secondary-wellness bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              See How It Works
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-5 pt-4 border-t border-primary-foreground/20 animate-fade-up-delay-3">
            <p className="text-primary-foreground/70 text-sm mb-3">Trusted by professionals from</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
              {[tcs , cognizant , infosys , wipro , ibm ,accenture , cgi , cigniti , birlaSoft].map((logo, index) => (
                <div key={index} className="flex items-center justify-center bg-white rounded-md px-5 py-2 h-10 w-full">
                  <img src={logo} alt={logo} className="h-10 w-auto max-w-[50px] object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <div className="w-6 h-10 border-2 border-primary-foreground/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
