import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import naveenStress from "@/assets/whatsapp-naveen-stress.png";
import rahulDiabetes from "@/assets/whatsapp-rahul-diabetes.png";
import rameshBp from "@/assets/whatsapp-ramesh-bp.png";
import bhavaniPcod from "@/assets/whatsapp-bhavani-pcod.png";
import shirishaStamina from "@/assets/whatsapp-shirisha-stamina.png";
import saiSleep from "@/assets/whatsapp-sai-sleep.png";
import kiranBp from "@/assets/whatsapp-kiran-bp.png";
import prakashDiabetic from "@/assets/whatsapp-prakash-diabetic.png";
import anushaThyroid from "@/assets/whatsapp-anusha-thyroid.png";
import sureshPrediabetic from "@/assets/whatsapp-suresh-prediabetic.png";
import { useNavigate } from "react-router-dom";

const testimonials = [
  { image: naveenStress, name: "Naveen", condition: "Lifestyle Reset" },
  { image: rahulDiabetes, name: "Rahul", condition: "Diabetes Reversed" },
  { image: rameshBp, name: "Ramesh Kumar", condition: "BP Normalized" },
  { image: bhavaniPcod, name: "Bhavani", condition: "PCOD Managed" },
  { image: shirishaStamina, name: "Shirisha", condition: "Weight & Energy Improved" },
  { image: saiSleep, name: "Sai", condition: "Sleep & Anxiety Better" },
  { image: kiranBp, name: "Kiran", condition: "BP Stabilized" },
  { image: prakashDiabetic, name: "Prakash", condition: "6 Years Diabetes Controlled" },
  { image: anushaThyroid, name: "Anusha", condition: "Thyroid Managed" },
  { image: sureshPrediabetic, name: "Suresh", condition: "Pre-Diabetes Prevented" },
];

const WhatsAppTestimonialsSection = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollToForm = () => {
    document.getElementById("assessment-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const navigate = useNavigate()

  return (
    <section className="py-12 bg-[#E0EBE64C]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
            Real Conversations, <span className="text-[#2b9281]">Real Results</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our members share with us — unfiltered messages of gratitude and transformation
          </p>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center transition-all duration-200 ${
              canScrollLeft
                ? "opacity-100 hover:bg-[#276852] hover:text-primary-foreground cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-12 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[200px] md:w-[220px] group relative bg-background rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[9/16] overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={`${testimonial.name}'s WhatsApp testimonial`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center transition-all duration-200 ${
              canScrollRight
                ? "opacity-100 hover:bg-[#276852] hover:text-primary-foreground cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/wellness-program/apply")}
            className="btn-cta inline-flex items-center gap-2 text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Your Transformation Today
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppTestimonialsSection;
