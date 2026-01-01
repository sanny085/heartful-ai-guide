import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Microscope, Sparkles, Clock, CheckCircle2, ArrowLeft, Beaker } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-health.jpg";

const Diagnostics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      {/* Hero Section with Image */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-health-bg/95 via-background/90 to-health-lightBlue/95"></div>
        
        {/* Back to Video Consult Button */}
        <div className="relative z-20 container mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/videoconsult")}
            className="text-foreground hover:text-accent hover:bg-background/50 backdrop-blur-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Video Consult
          </Button>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-accent border border-accent/30">
              <Microscope className="w-4 h-4" />
              Advanced Diagnostic Services
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Diagnostic <span className="text-accent">Centers</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Access state-of-the-art diagnostic facilities and comprehensive health testing services from trusted medical laboratories.
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 md:p-12 text-center border-2 border-accent/20 bg-gradient-to-br from-card via-card to-card/95 shadow-2xl">
            {/* Animated Icon */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mx-auto shadow-lg">
                  <Microscope className="w-16 h-16 text-accent" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Beaker className="w-6 h-6 text-primary animate-bounce" />
                </div>
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 px-6 py-3 rounded-full mb-6 border border-accent/30">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-lg font-semibold text-accent">Coming Soon</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              We're Building Something <span className="text-accent">Amazing</span>
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Our diagnostic centers feature is currently under development. We're working hard to bring you access to premium diagnostic services, lab tests, and health screenings from trusted medical facilities.
            </p>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Lab Tests</p>
                <p className="text-xs text-muted-foreground mt-1">Comprehensive testing</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Health Screenings</p>
                <p className="text-xs text-muted-foreground mt-1">Preventive care</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Quick Results</p>
                <p className="text-xs text-muted-foreground mt-1">Fast & accurate</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => navigate("/videoconsult")}
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Video Consult
              </Button>
              <Button
                onClick={() => navigate("/clinics")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Browse Clinics
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;

