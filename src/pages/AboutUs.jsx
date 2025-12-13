import { useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Heart,
  Users,
  Brain,
  Shield,
  Target,
  Lightbulb,
  Globe,
  Activity,
  Award,
  TrendingUp,
  MessageCircle,
  HandHeart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import heroImage from "@/assets/hero-health.jpg";
import aiDashboard from "@/assets/ai-dashboard.jpg";

// Atomic Component: Value Card
const ValueCard = memo(({ icon: Icon, title, description, iconColor, bgColor }) => (
  <Card className="p-6 md:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group">
    <CardContent className="p-0">
      <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <CardTitle className="text-xl font-semibold mb-3">{title}</CardTitle>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
));
ValueCard.displayName = "ValueCard";

// Atomic Component: Stat Card
const StatCard = memo(({ value, label, icon: Icon, iconColor }) => (
  <div className="text-center">
    <div className={`w-16 h-16 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{value}</div>
    <div className="text-sm md:text-base text-muted-foreground font-medium">{label}</div>
  </div>
));
StatCard.displayName = "StatCard";

// Atomic Component: Feature Item
const FeatureItem = memo(({ text }) => (
  <div className="flex items-start gap-3">
    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">{text}</p>
  </div>
));
FeatureItem.displayName = "FeatureItem";

const AboutUs = () => {
  const navigate = useNavigate();

  // Memoized values data
  const values = useMemo(
    () => [
      {
        icon: Heart,
        title: "Care & Compassion",
        description: "Every interaction is designed with empathy and understanding at its core. We believe healthcare should feel human, even when powered by AI.",
        iconColor: "text-accent",
        bgColor: "bg-accent/10",
      },
      {
        icon: Users,
        title: "Accessibility for All",
        description: "Healthcare guidance in your language, available to every Indian citizen. We break down barriers to make health information universally accessible.",
        iconColor: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        icon: Brain,
        title: "AI-Powered Intelligence",
        description: "Advanced AI that learns and adapts to your unique health patterns. Technology that understands context, culture, and individual needs.",
        iconColor: "text-success",
        bgColor: "bg-success/10",
      },
      {
        icon: Shield,
        title: "Prevention First",
        description: "Focus on awareness and prevention to save lives before emergencies. We believe the best treatment is prevention, and the best medicine is knowledge.",
        iconColor: "text-warning",
        bgColor: "bg-warning/10",
      },
    ],
    []
  );

  // Memoized stats data
  const stats = useMemo(
    () => [
      { value: "1000+", label: "Hearts Saved", icon: Heart, iconColor: "bg-accent" },
      { value: "3", label: "Languages Supported", icon: Globe, iconColor: "bg-success" },
      { value: "24/7", label: "AI Support Available", icon: MessageCircle, iconColor: "bg-primary" },
      { value: "50K+", label: "Health Assessments", icon: Activity, iconColor: "bg-warning" },
    ],
    []
  );

  // Memoized features data
  const features = useMemo(
    () => [
      "Multilingual AI support in Telugu, Hindi, and English",
      "24/7 availability for health guidance and support",
      "Personalized preventive health insights",
      "Cultural context-aware health recommendations",
      "Evidence-based medical information",
      "Privacy-first approach to health data",
    ],
    []
  );

  const handleNavigateToWellness = useMemo(() => () => navigate("/wellness-campaign"), [navigate]);
  const handleNavigateToVolunteer = useMemo(() => () => navigate("/volunteer"), [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-accent to-primary/80 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Decorative Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-warning/30 rounded-full blur-3xl opacity-50"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20 mb-6">
                <Heart className="w-4 h-4" />
                Our Story
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                About <span className="text-accent-foreground">10000Hearts</span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8">
                We're on a mission to save Indian citizens from heart disease, diabetes, obesity, and mental health challenges through AI-driven awareness and preventive care.
              </p>
            </div>

            {/* Visual Element */}
            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl blur-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                  <div className="grid grid-cols-3 gap-4">
                    {[Heart, Users, Brain, Shield, Activity, Globe].map((Icon, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:scale-110 transition-transform"
                      >
                        <Icon className="w-8 h-8 text-white/60" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-2 text-white/70">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">AI-Powered Health Platform</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Mission */}
            <Card className="relative bg-gradient-to-br from-accent/5 to-primary/5 rounded-3xl border-accent/20 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Target className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="text-3xl md:text-4xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  To democratize healthcare access across India by providing AI-powered preventive health guidance, wellness insights, and compassionate support in multiple languages. We aim to save lives through early awareness, education, and personalized preventive care that respects Indian culture and lifestyle.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="relative bg-gradient-to-br from-primary/5 to-success/5 rounded-3xl border-primary/20 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Lightbulb className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl md:text-4xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  To create an intelligent AI ecosystem that guides every Indian toward better health, combining cutting-edge technology with doctor insights and personalized wellness programs. Together, we're building a healthier India, one heart at a time—where prevention is prioritized, and health knowledge is accessible to all.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-success/5 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border/50 shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {stats.map((stat, index) => {
                  const { value, label, icon, iconColor } = stat;
                  return <StatCard key={index} value={value} label={label} icon={icon} iconColor={iconColor} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-background/50 py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary mb-6">
              <Heart className="w-4 h-4" />
              Our Journey
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Building a <span className="text-accent">Healthier India</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              From a vision to save lives through prevention, to a platform serving thousands of Indians
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 blur-3xl rounded-full"></div>
              <img src={heroImage} alt="Healthcare team" className="relative rounded-3xl shadow-2xl w-full h-auto" />
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Why We Started</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  India faces a growing health crisis with rising cases of heart disease, diabetes, and obesity. Traditional healthcare often comes too late, after conditions have already developed. We recognized the urgent need for preventive care and early awareness.
                </p>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Language barriers, lack of access to quality health information, and cultural disconnect in health advice were preventing millions from taking proactive steps toward better health. That's when 10000Hearts was born.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">What We Do</h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  We leverage cutting-edge AI technology to provide personalized health guidance, preventive insights, and wellness support. Our AI companion understands Telugu, Hindi, and English, making health information accessible to millions.
                </p>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Through heart health assessments, real-time health monitoring, and evidence-based blog content, we empower Indians to take control of their health before problems arise.
                </p>
              </div>
            </div>

            <div className="relative order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-accent/20 blur-3xl rounded-full"></div>
              <img src={aiDashboard} alt="AI Health Dashboard" className="relative rounded-3xl shadow-2xl w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-success/10 px-4 py-2 rounded-full text-sm font-medium text-success mb-6">
              <Award className="w-4 h-4" />
              Our Core Values
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              What <span className="text-accent">Drives Us</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              The principles that guide every decision we make and every feature we build
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {values.map((value, index) => {
              const { icon, title, description, iconColor, bgColor } = value;
              return <ValueCard key={index} icon={icon} title={title} description={description} iconColor={iconColor} bgColor={bgColor} />;
            })}
          </div>
        </div>
      </section>

      {/* Technology & Innovation Section */}
      <section className="bg-background/50 py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-warning/10 px-4 py-2 rounded-full text-sm font-medium text-warning mb-6">
                <Brain className="w-4 h-4" />
                Technology & Innovation
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Powered by <span className="text-accent">Advanced AI</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Our platform combines artificial intelligence with medical expertise to deliver personalized health guidance
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <Card className="rounded-3xl shadow-lg border-primary/20">
                <CardContent className="p-8 md:p-10">
                  <div className="grid md:grid-cols-1 gap-6">
                    {features.map((feature, index) => (
                      <FeatureItem key={index} text={feature} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technology Visual */}
              <div className="relative order-first lg:order-last">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
                <div className="relative bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm rounded-3xl p-6 border border-primary/20 shadow-2xl">
                  <img 
                    src={aiDashboard} 
                    alt="AI Technology Dashboard" 
                    className="rounded-2xl w-full h-auto shadow-xl"
                  />
                  <div className="mt-6 flex items-center justify-center gap-3 text-primary">
                    <Brain className="w-6 h-6" />
                    <span className="text-sm font-semibold">Advanced AI Technology</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Future Section */}
      <section className="py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full text-sm font-medium text-accent mb-6">
                <TrendingUp className="w-4 h-4" />
                Our Impact
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Making a <span className="text-accent">Real Difference</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Together, we're building a healthier future for India
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/20 to-success/20 rounded-3xl blur-2xl opacity-50"></div>
              <Card className="relative bg-gradient-to-br from-accent/10 via-primary/10 to-success/10 rounded-3xl border-accent/20 shadow-2xl">
                <CardContent className="p-8 md:p-12">
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left: Text Content */}
                    <div className="text-center lg:text-left space-y-6">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20 mb-4">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-foreground font-semibold">Our Impact</span>
                      </div>
                      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        Since our launch, we've helped <span className="font-bold text-accent">thousands of Indians</span> take proactive steps toward better health. Our AI companion has provided <span className="font-bold text-primary">millions of health insights</span>, conducted <span className="font-bold text-success">thousands of heart health assessments</span>, and empowered countless families with preventive health knowledge.
                      </p>
                      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        But this is just the beginning. We're continuously evolving our platform, adding new features, and expanding our reach to ensure every Indian has access to quality preventive healthcare guidance.
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                        <Button onClick={handleNavigateToWellness} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 shadow-lg hover:shadow-xl transition-all">
                          Start Your Health Journey
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button onClick={handleNavigateToVolunteer} variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5 px-8">
                          <HandHeart className="w-4 h-4 mr-2" />
                          Join Our Mission
                        </Button>
                      </div>
                    </div>

                    {/* Right: Visual Stats */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl blur-xl"></div>
                      <div className="relative bg-white/5 dark:bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 dark:border-border">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="text-center p-4 bg-white/5 dark:bg-card rounded-xl border border-white/10 dark:border-border">
                            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">1000+</div>
                            <div className="text-xs md:text-sm text-muted-foreground">Hearts Saved</div>
                          </div>
                          <div className="text-center p-4 bg-white/5 dark:bg-card rounded-xl border border-white/10 dark:border-border">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
                            <div className="text-xs md:text-sm text-muted-foreground">Assessments</div>
                          </div>
                          <div className="text-center p-4 bg-white/5 dark:bg-card rounded-xl border border-white/10 dark:border-border">
                            <div className="text-3xl md:text-4xl font-bold text-success mb-2">3</div>
                            <div className="text-xs md:text-sm text-muted-foreground">Languages</div>
                          </div>
                          <div className="text-center p-4 bg-white/5 dark:bg-card rounded-xl border border-white/10 dark:border-border">
                            <div className="text-3xl md:text-4xl font-bold text-warning mb-2">24/7</div>
                            <div className="text-xs md:text-sm text-muted-foreground">AI Support</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default memo(AboutUs);

