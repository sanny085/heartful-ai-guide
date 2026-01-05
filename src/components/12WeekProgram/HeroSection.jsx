import { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Leaf, Shield, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleCTAClick, CTA_BUTTON_CLASSES, CTA_BUTTON_CONTENT_CLASSES, CTA_BUTTON_TEXT_CLASSES, CTA_BUTTON_SHINE_CLASSES } from "./programUtils";
import ProblemStatement from "./ProblemStatement";
import review1 from "@/assets/review-1.jpeg";
import review2 from "@/assets/review-2.jpeg";
import review3 from "@/assets/review-3.jpeg";
import review4 from "@/assets/review-4.jpeg";
import review5 from "@/assets/review-5.jpeg";
import review6 from "@/assets/review-6.jpeg";
import review7 from "@/assets/review-7.jpeg";
import review8 from "@/assets/review-8.jpeg";

const REVIEW_IMAGES = [
  review1,
  review2,
  review3,
  review4,
  review5,
  review6,
  review7,
  review8,
];

const BACKGROUND_IMAGE_COUNT = 200;

const HeroSection = memo(() => {
  const navigate = useNavigate();
  
  const reviewImages = useMemo(() => REVIEW_IMAGES, []);
  
  const backgroundImages = useMemo(() => 
    Array.from({ length: BACKGROUND_IMAGE_COUNT }, (_, index) => ({
      id: index,
      imageIndex: index % reviewImages.length,
      image: reviewImages[index % reviewImages.length],
    }))
  , [reviewImages.length]);
  
  const handleButtonClick = useCallback(() => {
    handleCTAClick(navigate);
  }, [navigate]);
  
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] flex items-center bg-green-50/50 overflow-hidden">
      {/* Background Pattern with Small Images - Full Width and Height */}
      <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full overflow-hidden">
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 w-full h-full gap-0">
          {backgroundImages.map((item) => {
            const { id, image } = item ?? {};
            return (
            <div key={id} className="relative w-full h-[120px] m-0 p-0 overflow-hidden">
              <img
                src={image}
                alt={`Review pattern ${id + 1}`}
                className="w-full h-full object-cover opacity-50 shadow-lg"
                loading="lazy"
                style={{ display: 'block', margin: 0, padding: 0 }}
              />
            </div>
            );
          })}
        </div>
      </div>
      
      {/* Dark background shadow overlay */}
      <div className="absolute inset-0 bg-black/50 z-[5]"></div>
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 lg:py-12 relative z-10">
        <div className="space-y-4 md:space-y-5 lg:space-y-6 max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl border border-white/50 ring-1 ring-white/30">
          {/* Main Headline - Centered in Page */}
          <div className="space-y-1 md:space-y-2 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-800 whitespace-nowrap">
              Transform Your Health
            </h1>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-green-400 whitespace-nowrap">
              in 12 Weeks
            </h1>
          </div>

          {/* Description - Centered in Page */}
          <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto text-center">
            Non-surgical, doctor-led and clinically proven program tailored for every body type.
          </p>
          
          {/* Centered Content */}
          <div className="space-y-4 md:space-y-5 lg:space-y-6 text-center">

            <div className="flex flex-col items-center justify-center gap-2 md:gap-3 py-2 md:py-4 text-center">
              {["BP keeps fluctuating despite medications?", "No time for lifestyle changes?", "Tried everything — nothing lasts?"].map((text, index) => (
                <ProblemStatement key={index} text={text} />
              ))}
            </div>

            {/* Solution Box - Green with checkmark - Centered */}
            <div className="bg-green-50 border-l-4 border-green-400 p-2.5 md:p-3 lg:p-4 rounded-lg flex items-center justify-center gap-2 md:gap-3 text-center">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-green-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-800 font-semibold leading-relaxed text-start">
                10000hearts creates personalized, doctor-led lifestyle plans to save you from heart attack risks and help you achieve visible health results naturally, reducing dependency on lifelong medicines.
              </p>
            </div>

            {/* Three Features - Greenery themed - Centered */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 pt-1 md:pt-2 justify-center">
              <div className="relative p-1.5 sm:p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-green-50 to-yellow-50 border-2 border-green-200 text-center group hover:shadow-lg hover:scale-105 transition-all">
                <Leaf className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400 mx-auto mb-0.5 sm:mb-1" />
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-800 block leading-tight">100% Natural</span>
              </div>
              <div className="relative p-1.5 sm:p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-green-50 to-yellow-50 border-2 border-green-200 text-center group hover:shadow-lg hover:scale-105 transition-all">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400 mx-auto mb-0.5 sm:mb-1" />
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-800 block leading-tight">Science-backed</span>
              </div>
              <div className="relative p-1.5 sm:p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-yellow-100 to-emerald-50 border-2 border-yellow-300 text-center group hover:shadow-lg hover:scale-105 transition-all">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-600 mx-auto mb-0.5 sm:mb-1" />
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-gray-800 block leading-tight">Indian Lifestyle</span>
              </div>
            </div>

            <div className="pt-2 md:pt-3 lg:pt-4 flex justify-center">
              <Button
                onClick={handleButtonClick}
                className={CTA_BUTTON_CLASSES}
                size="lg"
              >
                <span className={CTA_BUTTON_CONTENT_CLASSES}>
                  <span className={CTA_BUTTON_TEXT_CLASSES}>Check if this program is right for me</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1 sm:ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className={CTA_BUTTON_SHINE_CLASSES}></div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
