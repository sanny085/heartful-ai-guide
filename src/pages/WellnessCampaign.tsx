import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const wellnessSchema = z.object({
  fullName: z.string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  countryCode: z.string().default("+91"),
  mobile: z.string()
    .trim()
    .regex(/^\d{10}$/, { message: "Mobile number must be exactly 10 digits" }),
  age: z.coerce.number()
    .int()
    .min(18, { message: "Age must be between 18 and 120" })
    .max(120, { message: "Age must be between 18 and 120" }),
  gender: z.string()
    .min(1, { message: "Please select your gender" }),
  state: z.string()
    .min(1, { message: "Please select your state" }),
  healthChallenges: z.string()
    .trim()
    .max(500, { message: "Health challenges must be less than 500 characters" })
    .optional(),
  healthConditions: z.string()
    .trim()
    .max(1000, { message: "Health conditions must be less than 1000 characters" })
    .optional(),
});

type WellnessFormData = z.infer<typeof wellnessSchema>;

const WellnessCampaign = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WellnessFormData>({
    resolver: zodResolver(wellnessSchema),
    defaultValues: {
      countryCode: "+91",
    },
  });

  const gender = watch("gender");
  const state = watch("state");

  const onSubmit = async (data: WellnessFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("wellness_leads").insert({
        full_name: data.fullName,
        country_code: data.countryCode,
        mobile: data.mobile,
        age: data.age,
        gender: data.gender,
        state: data.state,
        health_challenges: data.healthChallenges || null,
        health_conditions: data.healthConditions || null,
      });

      if (error) throw error;

      toast.success("Registration submitted successfully!", {
        description: "We'll be in touch with you soon.",
      });
      
      // Redirect to home after successful submission
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit registration", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Heart className="w-10 h-10 text-accent fill-accent" />
            <span className="text-3xl font-bold text-primary">10000Hearts</span>
          </button>
        </div>
      </header>

      {/* Form Section */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join Our <span className="text-accent">Wellness Campaign</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Become one of our <span className="text-accent font-semibold">first 100 citizens</span> to test and experience our
              revolutionary AI-powered wellness companion.
            </p>
            <p className="text-muted-foreground">
              Help us understand your health needs better so we can provide you with
              personalized care and support. Your feedback will shape the future of
              preventive healthcare.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="required">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name (minimum 3 characters)"
                {...register("fullName")}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Country Code and Mobile */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="countryCode">Country Code *</Label>
                <Select
                  value={watch("countryCode")}
                  onValueChange={(value) => setValue("countryCode", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="+91 (India)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">+91 (India)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  placeholder="Enter exactly 10 digits"
                  {...register("mobile")}
                  maxLength={10}
                  className={errors.mobile ? "border-destructive" : ""}
                />
                {errors.mobile && (
                  <p className="text-sm text-destructive mt-1">{errors.mobile.message}</p>
                )}
              </div>
            </div>

            {/* Age and Gender */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age (18-120)"
                  {...register("age")}
                  className={errors.age ? "border-destructive" : ""}
                />
                {errors.age && (
                  <p className="text-sm text-destructive mt-1">{errors.age.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={gender} onValueChange={(value) => setValue("gender", value)}>
                  <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive mt-1">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* State */}
            <div>
              <Label htmlFor="state">State *</Label>
              <Select value={state} onValueChange={(value) => setValue("state", value)}>
                <SelectTrigger className={errors.state ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((stateName) => (
                    <SelectItem key={stateName} value={stateName}>
                      {stateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
              )}
            </div>

            {/* Health Challenges */}
            <div>
              <Label htmlFor="healthChallenges">
                What health challenges are you currently facing?
              </Label>
              <Input
                id="healthChallenges"
                placeholder="E.g., Managing blood pressure, staying active, healthy eating"
                {...register("healthChallenges")}
                className={errors.healthChallenges ? "border-destructive" : ""}
              />
              {errors.healthChallenges && (
                <p className="text-sm text-destructive mt-1">{errors.healthChallenges.message}</p>
              )}
            </div>

            {/* Health Conditions */}
            <div>
              <Label htmlFor="healthConditions">
                Please describe any specific health conditions or diseases you're dealing with
              </Label>
              <Textarea
                id="healthConditions"
                placeholder="Share details about your health conditions, symptoms, or concerns. This helps us provide better personalized care."
                {...register("healthConditions")}
                rows={4}
                className={errors.healthConditions ? "border-destructive" : ""}
              />
              {errors.healthConditions && (
                <p className="text-sm text-destructive mt-1">{errors.healthConditions.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default WellnessCampaign;
