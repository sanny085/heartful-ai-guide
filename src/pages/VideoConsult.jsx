import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Video,
  Clock,
  Shield,
  Heart,
  Building2,
  Stethoscope,
  Microscope,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-health.jpg";

const VideoConsult = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-accent" />,
      title: "Save Time",
      description: "No travel required. Consult from the comfort of your home or office.",
    },
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: "Safe & Secure",
      description: "Private and secure consultations with certified healthcare professionals.",
    },
    {
      icon: <Heart className="w-8 h-8 text-accent" />,
      title: "Expert Care",
      description: "Access experienced doctors, specialists, and healthcare facilities.",
    },
  ];

  const categories = [
    {
      icon: <Building2 className="w-12 h-12 text-accent" />,
      title: "Hospitals",
      description: "Connect with trusted hospitals",
      route: "/hospitals",
    },
    {
      icon: <Stethoscope className="w-12 h-12 text-accent" />,
      title: "Clinics",
      description: "Find experienced doctors and clinics",
      route: "/clinics",
    },
    {
      icon: <Microscope className="w-12 h-12 text-accent" />,
      title: "Diagnostic Centers",
      description: "Access diagnostic services",
      route: "/diagnostics",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-health-bg/95 via-background/90 to-health-lightBlue/95"></div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent/20 flex items-center justify-center backdrop-blur-sm">
                <Video className="w-10 h-10 md:w-12 md:h-12 text-accent" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Video <span className="text-accent">Consultation</span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience seamless healthcare from anywhere. Connect with our partner hospitals, clinics, and diagnostic centers for expert medical consultations through secure video calls.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button
                onClick={() => navigate("/hospitals")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Find Hospitals
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/clinics")}
                className="border-accent text-accent hover:bg-accent/10 px-8 py-6 text-lg"
                size="lg"
              >
                Find Clinics
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/diagnostics")}
                className="border-accent text-accent hover:bg-accent/10 px-8 py-6 text-lg"
                size="lg"
              >
                Find Diagnostic Centers
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-health-bg via-background to-health-lightBlue py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Video <span className="text-accent">Consultation?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Modern healthcare solutions for your convenience and safety
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 md:p-8 text-center hover:shadow-xl transition-shadow border-2 hover:border-accent/50">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse by <span className="text-accent">Category</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our trusted network of healthcare providers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-xl transition-all cursor-pointer border-2 hover:border-accent/50 hover:scale-105"
                onClick={() => navigate(category.route)}
              >
                <div className="flex justify-center mb-6">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{category.title}</h3>
                <p className="text-muted-foreground mb-6">{category.description}</p>
                <Button
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(category.route);
                  }}
                >
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-health-bg via-background to-health-lightBlue py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-accent">Works</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Browse Providers",
                  description: "Explore our network of hospitals, clinics, and diagnostic centers.",
                },
                {
                  step: "2",
                  title: "Select & Book",
                  description: "Choose your preferred healthcare provider and book a consultation.",
                },
                {
                  step: "3",
                  title: "Video Consultation",
                  description: "Connect via secure video call for your medical consultation.",
                },
                {
                  step: "4",
                  title: "Follow-up Care",
                  description: "Receive prescriptions, reports, and follow-up recommendations.",
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-accent">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-accent/10 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your <span className="text-accent">Consultation?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of patients who trust our network for quality healthcare
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => navigate("/hospitals")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg"
              size="lg"
            >
              Browse Hospitals
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/clinics")}
              className="border-accent text-accent hover:bg-accent/10 px-8 py-6 text-lg"
              size="lg"
            >
              Browse Clinics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConsult;

