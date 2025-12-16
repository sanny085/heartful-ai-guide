import { Card } from "@/components/ui/card";
import review1 from "@/assets/review-1.jpeg";
import review2 from "@/assets/review-2.jpeg";
import review3 from "@/assets/review-3.jpeg";
import review4 from "@/assets/review-4.jpeg";
import review5 from "@/assets/review-5.jpeg";
import review6 from "@/assets/review-6.jpeg";
import review7 from "@/assets/review-7.jpeg";
import review8 from "@/assets/review-8.jpeg";
import review9 from "@/assets/review-9.jpeg";
import review10 from "@/assets/review-10.jpeg";
import review11 from "@/assets/review-11.jpeg";

const Reviews = () => {
  const reviews = [
    {
      image: review1,
      feedback: "I tested the Heart Health Checker and it showed my BMI instantly with clear insights.",
    },
    {
      image: review2,
      feedback: "Very accurate and helpful. The heart score and diet suggestions really made sense.",
    },
    {
      image: review11,
      feedback: "The weekly progress insights are amazing. It keeps me accountable and motivated to maintain a healthy routine.",
    },
    {
      image: review3,
      feedback: "Clean UI and fast results. Loved how simple the whole heart health check felt.",
    },
    {
      image: review4,
      feedback: "Amazing experience! Got personalized recommendations that helped improve my lifestyle.",
    },
    {
      image: review5,
      feedback: "The heart age feature really opened my eyes. It motivated me to start walking daily!",
    },
    {
      image: review6,
      feedback: "Loved how it predicted my risk level in seconds. The guidance felt personalized and practical.",
    },
    {
      image: review7,
      feedback: "I didn't know my BMI and diet score could be analyzed so accurately. Very user-friendly tool.",
    },
    {
      image: review8,
      feedback: "The lifestyle tips were spot on! I made small changes and already feel more energetic.",
    },
    {
      image: review9,
      feedback: "Super helpful for beginners. Clear explanation of CB score and what I should improve.",
    },
    {
      image: review10,
      feedback: "This made health tracking so simple. I shared it with my family and they loved it too!",
    },
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            These are our <span className="text-primary">trusted users</span> — We tested this feature on{" "}
            <span className="text-accent">1000+ people</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Here are real users who tested our Heart Health Checker and shared their feedback.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-border opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[3/4]">
                <img
                  src={review.image}
                  alt={`User review ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with Feedback */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6 pt-20">
                  <p className="text-white font-semibold text-sm md:text-base leading-relaxed">
                    {review.feedback}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground text-lg mb-6">
            Join thousands of users who are taking control of their heart health
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reviews;