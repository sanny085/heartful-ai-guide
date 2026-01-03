import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Smile } from "lucide-react";
import SectionHeader from "./SectionHeader";
import review1 from "@/assets/review-1.jpeg";
import review2 from "@/assets/review-2.jpeg";
import review3 from "@/assets/review-3.jpeg";
import review4 from "@/assets/review-4.jpeg";
import review5 from "@/assets/review-5.jpeg";
import review6 from "@/assets/review-6.jpeg";
import review7 from "@/assets/review-7.jpeg";
import review8 from "@/assets/review-8.jpeg";

const TestimonialsSection = memo(() => {
  const testimonials = useMemo(() => [
    {
      text: "My BP is now stable and I've reduced my medicine dosage by half. The lifestyle changes work!",
      image: review1,
    },
    {
      text: "Personalized guidance made all the difference. Highly recommend this program!",
      image: review2,
    },
    {
      text: "12 weeks later, my BP is under control and I feel more energetic. Life-changing!",
      image: review3,
    },
    {
      text: "The lifestyle modifications have been game-changers. Thank you, 10000Hearts!",
      image: review4,
    },
    {
      text: "My BP is now normal, and I feel healthier than I have in years.",
      image: review5,
    },
    {
      text: "I now understand my body better and can make informed decisions. Exceptional support!",
      image: review6,
    },
    {
      text: "The 12-week journey was transformative. I've maintained my results. Truly life-changing!",
      image: review7,
    },
    {
      text: "This program gave me the tools to take control. The weekly sessions were incredibly supportive.",
      image: review8,
    },
  ], []);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badgeIcon={Smile}
            badgeText="Success Stories"
            title="What Our Participants Say"
            description="Real stories from people who transformed their health with our 12-week program"
          />

          {/* Testimonials Grid - Matching Reviews page style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => {
              const { text, image } = testimonial ?? {};
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-border opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative w-full aspect-[3/4]">
                    <img
                      src={image}
                      alt="Testimonial"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 md:p-4 lg:p-6 pt-12 md:pt-14 lg:pt-16">
                      <p className="text-white font-semibold text-xs md:text-sm lg:text-base leading-relaxed">
                        {text}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});

TestimonialsSection.displayName = "TestimonialsSection";

export default TestimonialsSection;
