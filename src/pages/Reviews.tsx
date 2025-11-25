import { Card } from "@/components/ui/card";
import review1 from "@/assets/review-1.jpeg";
import review2 from "@/assets/review-2.jpeg";
import review3 from "@/assets/review-3.jpeg";
import review4 from "@/assets/review-4.jpeg";

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
      image: review3,
      feedback: "Clean UI and fast results. Loved how simple the whole heart health check felt.",
    },
    {
      image: review4,
      feedback: "Amazing experience! Got personalized recommendations that helped improve my lifestyle.",
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
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-border animate-fade-in"
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
