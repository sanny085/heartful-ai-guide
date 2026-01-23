import { Star, Quote } from "lucide-react";
import styles from "./wellness-program.module.css"
import { useNavigate } from "react-router-dom";
import rating01 from "../../assets/rating-01.webp"
import rating02 from "../../assets/rating-02.webp"
import rating03 from "../../assets/rating-03.webp"
import rating04 from "../../assets/rating-04.webp"

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Senior Software Engineer, TCS",
    age: 30,
    image: rating01,
    quote:
      "My BP was 150/100 for 3 years. Doctors said lifetime medication. In 90 days with 10000hearts, I'm at 120/80 with ZERO medicines. My wife still can't believe it.",
    result: "BP normalized in 90 days",
    highlight: "Off medication",
    rating: 4.5,
  },
  {
    name: "Priya Sharma",
    role: "Bank Manager, HDFC",
    age: 28,
    image: rating02,
    quote:
      "PCOD, thyroid, and 15kg overweight. I tried everything keto, gym, expensive supplements. Nothing worked. The personalized approach here finally cracked the code for my body.",
    result: "Lost 12kg in 4 months",
    highlight: "PCOD symptoms reversed",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "IT Director, Infosys",
    age: 35,
    image: rating03,
    quote:
      "Pre-diabetic with HbA1c at 6.4. The fasting protocol and diet changes brought it down to 5.2. The best part? I'm eating MORE than before, just the right things.",
    result: "HbA1c: 6.4 → 5.2",
    highlight: "Pre-diabetes reversed",
    rating: 4,
  },
  {
    name: "Sunita Verma",
    role: "CA, Private Practice",
    age: 33,
    image: rating04,
    quote:
      "Working 16-hour days during tax season destroyed my health. Constant fatigue, poor sleep, anxiety. The lifestyle correction program gave me my energy and life back.",
    result: "Energy levels transformed",
    highlight: "Better sleep in 2 weeks",
    rating: 4.5,
  },
];

const ReviewsTestominials = () => {
  const navigate = useNavigate()

  return (
    <section id="testimonials" className={`${styles['section-padding']} bg-[#F2EDE3]`}>
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-[#276852] font-semibold text-sm uppercase tracking-wider mb-4">
            Real Transformations
            </span>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold ${styles['text-foreground']} mb-4`}>
            Stories of <span className={styles['text-gradient']}>Lives Saved</span>
            </h2>
          <p className={`text-lg ${styles['text-muted-foreground']} leading-relaxed`}>
            These aren't just success stories - they're people who were exactly where you are now. Stressed, struggling,
            and searching for answers.
            </p>
          </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`${styles['card-wellness']} rounded-[10px] relative overflow-hidden`}>
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />

              {/* Stars */}
              {/* <div className="flex gap-1 mb-4">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${styles['text-star-filled']}`} />
                ))}
              </div> */}

              <div className="flex gap-1">
                <StarRating rating={testimonial.rating} />
                </div>
                
              {/* Quote */}
              <p className={`${styles['text-foreground']} leading-relaxed mb-6 relative z-10`}>"{testimonial.quote}"</p>

              {/* Results Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`inline-block text-xs font-semibold bg-[#276852] text-[#FCFAF8] px-3 py-1.5 rounded-full`}>
                  {testimonial.result}
                </span>
                <span className="inline-block text-xs font-semibold bg-[#DF20201A] text-[#DF2020] px-3 py-1.5 rounded-full">
                  {testimonial.highlight}
                  </span>
                </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className={`font-semibold ${styles['text-foreground']}`}>{testimonial.name}</p>
                  <p className={`text-sm ${styles['text-muted-foreground']}`}>
                    {testimonial.role} • Age {testimonial.age}
                  </p>
                </div>
              </div>
            </div>
            ))}
          </div>

        {/* CTA */}
          <div className="text-center">
          <p className="text-muted-foreground mb-4">Ready to write your own success story?</p>
          <button onClick={() => navigate("/wellness-program/apply")} className="btn-cta">
            Book My Free Consultation
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReviewsTestominials;

export const Stats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 m-8">
      <div className="text-center p-4 rounded-2xl bg-[#F8F6F2]/50 border border-border/50">
        <p className="text-3xl md:text-4xl font-extrabold text-[#276852] mb-1">100+</p>
        <p className="text-[#628478]">Lives Transformed</p>
      </div>
      <div className="text-center p-4 rounded-2xl bg-[#F8F6F2]/50 border border-border/50">
        <p className="text-3xl md:text-4xl font-extrabold text-[#276852] mb-1">92%</p>
        <p className="text-[#628478]">Success Rate</p>
      </div>
      <div className="text-center p-4 rounded-2xl bg-[#F8F6F2]/50 border border-border/50">
        <p className="text-3xl md:text-4xl font-extrabold text-[#276852] mb-1">45+</p>
        <p className="text-[#628478]">Off Medication</p>
      </div>
      <div className="text-center p-4 rounded-2xl bg-[#F8F6F2]/50 border border-border/50">
        <p className="text-3xl md:text-4xl font-extrabold text-[#276852] mb-1">4.9</p>
        <p className="text-[#628478]">Client Rating</p>
      </div>
    </div>
  );
};

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        if (rating >= star) {
          // Full star
          return <Star key={star} className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
        }

        if (rating >= star - 0.5) {
          // Half star
          return (
            <div key={star} className="relative w-5 h-5">
              <Star className="absolute w-5 h-5 text-gray-300" />
              <Star
                className="absolute w-5 h-5 text-yellow-500 fill-yellow-500"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            </div>
          );
        }

        // Empty star
        return <Star key={star} className="w-5 h-5 text-gray-300" />;
      })}
    </div>
  );
};
