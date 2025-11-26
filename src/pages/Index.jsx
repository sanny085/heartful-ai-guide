import { Button } from "@/components/ui/button";
import {
  Heart,
  Activity,
  MessageCircle,
  User,
  Users,
  Brain,
  Shield,
  MessageSquare,
  Mic,
  Lightbulb,
  TrendingUp,
  Smile,
  UsersRound,
  Globe,
  Headphones,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-health.jpg";
import aiDashboard from "@/assets/ai-dashboard.jpg";
import logo from "@/assets/logo.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasAssessment, setHasAssessment] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (user) {
      checkExistingAssessment();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const checkProfileComplete = async () => {
    if (!user) return false;

    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();

    if (error || !data) return false;
    return true;
  };

  const handleChatClick = async () => {
    if (!user) {
      toast.error("Please sign in to chat with AI Doctor");
      navigate("/auth");
      return;
    }

    const hasProfile = await checkProfileComplete();
    if (!hasProfile) {
      toast.error("Please complete your profile first");
      navigate("/profile-setup");
      return;
    }

    navigate("/chat");
  };

  const handleHealthReportClick = async () => {
    if (!user) {
      toast.error("Please sign in to access Health Report");
      navigate("/auth");
      return;
    }

    const hasProfile = await checkProfileComplete();
    if (!hasProfile) {
      toast.error("Please complete your profile first");
      navigate("/profile-setup");
      return;
    }

    navigate("/heart-health");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border transition-all duration-300">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 mr-2" />
            <span className="text-xl font-bold">Health AI</span>
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  Solutions <ChevronDown className="ml-1 h-4 w-4" />
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                    <li className="row-span-3">
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/heart-health"
                      >
                        <Heart className="h-5 w-5 text-primary" />
                        <div className="mb-2 mt-4 text-lg font-medium">Heart Health</div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Understand your heart health risks and get personalized recommendations.
                        </p>
                      </a>
                    </li>
                    <NavigationMenuItem>
                      <a
                        className="flex items-center text-sm font-medium no-underline hover:text-accent-foreground"
                        href="/chat"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        AI Doctor
                      </a>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <a
                        className="flex items-center text-sm font-medium no-underline hover:text-accent-foreground"
                        href="#"
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        Activity Tracker (Coming Soon)
                      </a>
                    </NavigationMenuItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a className="font-medium no-underline hover:text-accent-foreground" href="#how-it-works">
                  How it Works
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a className="font-medium no-underline hover:text-accent-foreground" href="#about-us">
                  About
                </a>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="space-x-2">
            {!user && (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Sign Up
                </Button>
              </>
            )}
            {user && (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                  Profile
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Your Health, <span className="text-primary">Simplified</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Get personalized insights and proactive care with our AI-powered health platform.
            </p>
            <div className="space-x-2">
              <Button size="lg" onClick={handleChatClick}>
                Chat with AI Doctor
              </Button>
              <Button variant="outline" size="lg" onClick={handleHealthReportClick}>
                Get Health Report
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img src={heroImage} alt="Health Monitoring" className="rounded-lg shadow-md" />
          </div>
        </div>
      </section>

      {/* Language Support */}
      <section className="bg-background/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-8">Multilingual Support</h2>
          <p className="text-lg text-muted-foreground mb-4">
            We believe in making health accessible to everyone, regardless of language.
          </p>
          <div className="flex justify-center">
            <Globe className="h-10 w-10 text-primary mr-4" />
            <p className="text-lg text-muted-foreground">
              Our platform supports multiple languages to cater to a diverse user base.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Health Journey Section */}
      <section id="heart-health-section" className="container mx-auto px-4 py-16 scroll-mt-20">
        <h2 className="text-3xl font-semibold text-center mb-8">Embark on Your Heart Health Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg shadow-md p-6">
            <Heart className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Assess Your Risk</h3>
            <p className="text-muted-foreground">
              Take our quick heart health assessment to understand your risk factors.
            </p>
            <Button className="mt-4" onClick={handleHealthReportClick}>
              Start Assessment
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow-md p-6">
            <Brain className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Personalized Insights</h3>
            <p className="text-muted-foreground">
              Receive tailored recommendations based on your unique health profile.
            </p>
            <Button className="mt-4" onClick={handleHealthReportClick}>
              Get Insights
            </Button>
          </div>
          <div className="bg-card rounded-lg shadow-md p-6">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Proactive Care</h3>
            <p className="text-muted-foreground">
              Empower yourself with the knowledge to take control of your heart health.
            </p>
            <Button className="mt-4" onClick={handleHealthReportClick}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chat with AI Doctor</h3>
              <p className="text-muted-foreground">
                Our AI-powered chatbot provides instant health advice and support.
              </p>
            </div>
            <div>
              <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Get Personalized Insights</h3>
              <p className="text-muted-foreground">
                Receive tailored recommendations based on your unique health profile.
              </p>
            </div>
            <div>
              <Headphones className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">
                We're here for you around the clock to answer your health questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-background/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 id="about-us" className="text-3xl font-semibold mb-8">
            About Us
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            We are a team of healthcare professionals and AI experts dedicated to improving global health outcomes.
          </p>
          <UsersRound className="h-10 w-10 text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Our mission is to make healthcare more accessible, affordable, and personalized for everyone.
          </p>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-8">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Activity className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Activity Tracker</h3>
              <p className="text-muted-foreground">
                Track your daily activities and get insights into your fitness levels.
              </p>
            </div>
            <div>
              <Mic className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mental Health Support</h3>
              <p className="text-muted-foreground">
                Access resources and support for your mental well-being.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-accent/5 via-primary/5 to-success/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-8">Ready to Transform Your Health?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join our community and start your journey towards a healthier, happier you.
          </p>
          <div className="space-x-2">
            <Button size="lg" onClick={handleChatClick}>
              Get Started Now
            </Button>
            <Button variant="outline" size="lg" onClick={handleHealthReportClick}>
              Explore Our Solutions
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
