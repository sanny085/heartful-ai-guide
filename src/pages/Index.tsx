import { Button } from "@/components/ui/button";
import { Heart, Activity, MessageCircle, User, Users, Brain, Shield, MessageSquare, Mic, Lightbulb, TrendingUp, Smile, UsersRound, Globe, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-health.jpg";
import aiDashboard from "@/assets/ai-dashboard.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasAssessment, setHasAssessment] = useState(false);

  useEffect(() => {
    if (user) {
      checkExistingAssessment();
    }
  }, [user]);

  const checkExistingAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("heart_health_assessments")
        .select("id")
        .eq("user_id", user?.id)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setHasAssessment(true);
      }
    } catch (error) {
      console.error("Error checking assessment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-10 h-10 text-accent fill-accent" />
            <span className="text-3xl font-bold text-primary">10000Hearts</span>
          </div>
          {!loading && (
            user ? (
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="border-primary text-primary hover:bg-primary/5"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-primary text-primary hover:bg-primary/5"
              >
                Sign In
              </Button>
            )
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full text-sm font-medium text-accent">
              <Heart className="w-4 h-4" />
              Saving Hearts, Building Health
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Your AI Wellness Partner for a{" "}
              <span className="text-accent">Healthier Tomorrow</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Meet your personal AI companion that understands you in Telugu, English, and Hindi. 
              Get preventive health insights, wellness guidance, and compassionate care - available 24/7.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate(user ? "/chat" : "/auth")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Talk to Your AI Companion
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(user ? "/heart-health" : "/auth")}
                className="border-primary text-primary hover:bg-primary/5 px-8"
                size="lg"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-4xl font-bold text-accent mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Hearts Saved</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-success mb-1">3</div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-warning mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl rounded-full"></div>
            <img 
              src={heroImage}
              alt="Healthcare team with AI technology"
              className="relative rounded-3xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-background/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className="text-accent">10000Hearts</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to save Indian citizens from heart disease, diabetes, obesity, and mental 
              health challenges through AI-driven awareness and preventive care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Care & Compassion</h3>
              <p className="text-muted-foreground">
                Every interaction is designed with empathy and understanding at its core
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Accessibility for All</h3>
              <p className="text-muted-foreground">
                Healthcare guidance in your language, available to every Indian citizen
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">AI-Powered Intelligence</h3>
              <p className="text-muted-foreground">
                Advanced AI that learns and adapts to your unique health patterns
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Prevention First</h3>
              <p className="text-muted-foreground">
                Focus on awareness and prevention to save lives before emergencies
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-accent/5 rounded-3xl p-12 text-center border border-accent/20">
            <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              To create an intelligent AI ecosystem that guides every Indian toward better health, 
              combining cutting-edge technology with doctor insights and personalized wellness programs. 
              Together, we're building a healthier India, one heart at a time.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="text-accent">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, smart, and designed for you — your journey to better health starts here
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-accent/20 blur-3xl rounded-full"></div>
              <img 
                src={aiDashboard}
                alt="AI Health Dashboard"
                className="relative rounded-3xl shadow-2xl w-full h-auto"
              />
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Talk Naturally</h3>
                  <p className="text-muted-foreground">
                    Interact with your AI companion in Telugu, English, or Hindi through voice or text
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Share Your Health</h3>
                  <p className="text-muted-foreground">
                    Upload reports and share symptoms — our AI understands and analyzes your health data
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Get Insights</h3>
                  <p className="text-muted-foreground">
                    Receive personalized preventive lessons and wellness recommendations
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Stay Healthy</h3>
                  <p className="text-muted-foreground">
                    Follow daily guidance and track your wellness journey with continuous AI support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Language Support */}
      <section className="bg-background/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-success/10 px-4 py-2 rounded-full text-sm font-medium text-success mb-6">
              <Globe className="w-4 h-4" />
              Multilingual Healthcare
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Speak Your <span className="text-accent">Language</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Healthcare should never have language barriers. Talk to your AI companion in the language 
              you're most comfortable with.
            </p>
          </div>

          {/* Language Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border text-center">
              <div className="text-5xl font-bold text-accent mb-2">తెలుగు</div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">Telugu</h3>
              <p className="text-muted-foreground">
                Full support for Telugu speakers across India
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border text-center">
              <div className="text-5xl font-bold text-primary mb-2">English</div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">English</h3>
              <p className="text-muted-foreground">
                Accessible to English-speaking users nationwide
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border text-center">
              <div className="text-5xl font-bold text-success mb-2">हिन्दी</div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">Hindi</h3>
              <p className="text-muted-foreground">
                Comprehensive Hindi language support
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border text-center">
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <MessageCircle className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Text & Voice</h3>
              <p className="text-muted-foreground">
                Choose how you want to communicate — type or speak naturally
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Mic className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Emotion Detection</h3>
              <p className="text-muted-foreground">
                Our AI understands your tone and emotions for better care
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Cultural Context</h3>
              <p className="text-muted-foreground">
                Health advice that respects Indian culture and lifestyle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-warning/10 px-4 py-2 rounded-full text-sm font-medium text-warning mb-6">
              <TrendingUp className="w-4 h-4" />
              Innovation Pipeline
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What's Coming <span className="text-accent">Next</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're constantly evolving to bring you the most advanced AI healthcare solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border relative">
              <div className="absolute top-4 right-4">
                <span className="bg-success text-success-foreground text-xs px-3 py-1 rounded-full font-medium">
                  In Development
                </span>
              </div>
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">Predictive Health Analytics</h3>
              <p className="text-muted-foreground">
                AI-powered predictions to identify health risks before they become problems
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border relative">
              <div className="absolute top-4 right-4">
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                  Coming Soon
                </span>
              </div>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">Mental Health Support</h3>
              <p className="text-muted-foreground">
                Specialized AI modules for stress, anxiety, and emotional wellness
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border relative">
              <div className="absolute top-4 right-4">
                <span className="bg-warning text-warning-foreground text-xs px-3 py-1 rounded-full font-medium">
                  Planned
                </span>
              </div>
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-4">
                <UsersRound className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">Family Health Tracking</h3>
              <p className="text-muted-foreground">
                Monitor and manage health for your entire family in one place
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl p-12 text-center border border-accent/20">
            <h3 className="text-3xl font-bold mb-4">Join Our Wellness Movement</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Be part of the future of healthcare in India. Your feedback shapes what we build next.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-accent/5 via-primary/5 to-success/5 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full text-sm font-medium text-accent mb-6">
              <Heart className="w-4 h-4" />
              Start Your Wellness Journey Today
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Your <span className="text-accent">AI Health Companion</span> is Waiting
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join thousands of Indians taking control of their health with AI-powered guidance, 
              preventive care, and compassionate support — available 24/7 in your language.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button
                onClick={() => navigate(user ? "/chat" : "/auth")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Talk to Your AI Companion
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(user ? "/heart-health" : "/auth")}
                className="border-primary text-primary hover:bg-primary/5 px-8"
                size="lg"
              >
                Learn More
              </Button>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border">
                <Globe className="w-8 h-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">3 Languages</div>
                <div className="text-sm text-muted-foreground">Telugu, English, Hindi</div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border">
                <Headphones className="w-8 h-8 text-success mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">24/7 Support</div>
                <div className="text-sm text-muted-foreground">Always here for you</div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border">
                <Heart className="w-8 h-8 text-warning mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">AI-Powered Care</div>
                <div className="text-sm text-muted-foreground">Personalized wellness</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
