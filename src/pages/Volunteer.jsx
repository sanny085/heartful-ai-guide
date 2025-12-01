import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const Volunteer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    district: "",
    email: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }
    
    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.from("volunteer_support").insert([
        {
          full_name: formData.full_name.trim(),
          mobile: formData.mobile.trim(),
          district: formData.district.trim(),
          email: formData.email.trim() || null,
        },
      ]);

      if (error) throw error;

      toast.success("Thank you for volunteering to support 10000hearts! Our team will contact you soon.", {
        duration: 5000,
      });
      
      setFormData({
        full_name: "",
        mobile: "",
        district: "",
        email: "",
      });
      
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error submitting volunteer form:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <img
            src={logo}
            alt="10000Hearts Logo"
            className="h-12 md:h-16 w-auto cursor-pointer"
            onClick={() => navigate("/")}
          />
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Icon & Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Heart className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join the <span className="text-accent">10,000 Hearts</span> Mission
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              If you want to support the 10,000 Hearts mission, fill out your details below. Together, we can make a difference in healthcare for everyone.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-base">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={errors.full_name ? "border-destructive" : ""}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-base">
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  className={errors.mobile ? "border-destructive" : ""}
                />
                {errors.mobile && (
                  <p className="text-sm text-destructive">{errors.mobile}</p>
                )}
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label htmlFor="district" className="text-base">
                  District <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="district"
                  name="district"
                  type="text"
                  placeholder="Enter your district"
                  value={formData.district}
                  onChange={handleChange}
                  className={errors.district ? "border-destructive" : ""}
                />
                {errors.district && (
                  <p className="text-sm text-destructive">{errors.district}</p>
                )}
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email <span className="text-muted-foreground text-sm">(Optional)</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Submitting...
                  </span>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Submit Volunteer Registration
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Info Text */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            By submitting this form, you agree to be contacted by our team regarding volunteer opportunities.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Volunteer;
