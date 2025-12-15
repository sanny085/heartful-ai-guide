import { useMemo, useCallback, memo } from "react";
import { Activity, Sparkles, MessageCircle, TrendingUp, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Atomic Component: Glucose Monitoring Mockup
const GlucoseMonitoringMockup = memo(({ message, suggestion, button, onNavigate }) => (
  <div className="p-3 md:p-4 space-y-3 md:space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-accent/20 rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-accent" />
        </div>
        <span className="font-semibold text-xs md:text-sm">AI Health Companion</span>
      </div>
      <div className="w-5 h-5 md:w-6 md:h-6 bg-muted rounded-full"></div>
    </div>
    <div className="space-y-2 md:space-y-3">
      <p className="text-xs md:text-sm font-medium text-foreground">{message}</p>
      <div className="bg-accent/5 rounded-lg p-2 md:p-3">
        <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground mb-1.5 md:mb-2">
          <span>Glucose Level</span>
          <span className="text-destructive font-semibold">150 mg/dL</span>
        </div>
        <div className="h-16 md:h-20 bg-gradient-to-r from-success via-warning to-destructive rounded flex items-end">
          <div className="w-full h-3/4 bg-accent/20 rounded-t"></div>
        </div>
        <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground mt-1.5 md:mt-2">
          <span>12:00</span>
          <span className="text-destructive font-semibold">2:00</span>
          <span>4:00</span>
        </div>
      </div>
      <p className="text-[10px] md:text-xs text-muted-foreground">{suggestion}</p>
      <Button
        size="sm"
        onClick={onNavigate}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-xs md:text-sm py-1.5 md:py-2"
      >
        <Heart className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
        <span className="hidden sm:inline">{button}</span>
        <span className="sm:hidden">Get Suggestions</span>
      </Button>
    </div>
  </div>
));
GlucoseMonitoringMockup.displayName = "GlucoseMonitoringMockup";

// Atomic Component: Health Awareness Mockup
const HealthAwarenessMockup = memo(({ awarenessTopics, preventionTips }) => {
  const { title: topicsTitle, items } = awarenessTopics;
  const { title: tipsTitle, tips } = preventionTips;

  return (
    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
      <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-success/20 rounded-full flex items-center justify-center">
          <Heart className="w-3 h-3 md:w-4 md:h-4 text-success" />
        </div>
        <h3 className="font-semibold text-xs md:text-sm">{topicsTitle}</h3>
      </div>
      <div className="space-y-1.5 md:space-y-2">
        {items.map(({ topic, risk, icon: TopicIcon }, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 bg-muted/30 rounded-lg"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <TopicIcon className="w-4 h-4 md:w-5 md:h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs font-medium truncate">{topic}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground">Risk Level: {risk}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-3 md:pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 md:w-4 md:h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-xs md:text-sm">{tipsTitle}</h3>
        </div>
        <div className="grid grid-cols-2 gap-1.5 md:gap-2">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-primary/5 rounded-lg p-1.5 md:p-2 text-center"
            >
              <Shield className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-0.5 md:mb-1" />
              <p className="text-[10px] md:text-xs font-medium break-words">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
HealthAwarenessMockup.displayName = "HealthAwarenessMockup";

// Atomic Component: Chat Interface Mockup
const ChatInterfaceMockup = memo(({ quickActions }) => (
  <div className="p-3 md:p-4 space-y-3 md:space-y-4">
    <div className="mb-3 md:mb-4">
      <div className="flex items-center gap-1.5 md:gap-2">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/20 rounded-full flex items-center justify-center">
          <Shield className="w-3 h-3 md:w-4 md:h-4 text-primary" />
        </div>
        <h3 className="text-sm md:text-lg font-semibold">Health Awareness Topics</h3>
      </div>
    </div>
    <div className="space-y-1.5 md:space-y-2">
      {quickActions.map(({ text, icon: ActionIcon }, idx) => (
        <button
          key={idx}
          className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors text-left"
        >
          <ActionIcon className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
          <span className="text-[10px] md:text-xs font-medium break-words">{text}</span>
        </button>
      ))}
    </div>
  </div>
));
ChatInterfaceMockup.displayName = "ChatInterfaceMockup";

// Atomic Component: Mobile Frame Wrapper
const MobileFrame = memo(({ children }) => (
  <div className="relative bg-card rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-3 md:p-4 lg:p-6 border border-border/50">
    <div className="bg-background rounded-xl md:rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-muted/50 px-3 py-1.5 md:px-4 md:py-2"></div>
      {children}
    </div>
    <div className="absolute -z-10 inset-0 bg-gradient-to-br from-accent/20 to-primary/20 blur-2xl md:blur-3xl rounded-2xl md:rounded-3xl"></div>
  </div>
));
MobileFrame.displayName = "MobileFrame";

// Atomic Component: Feature Card
const FeatureCard = memo(({ feature, index, onNavigate }) => {
  const { icon: Icon, iconColor, bgColor, title, description, mockup } = feature;
  const isEven = index % 2 === 0;
  const badgeLabels = ["Health Monitoring", "Wellness Planning", "24/7 Support"];

  const renderMockup = () => {
    const { type } = mockup;
    
    if (type === "glucose") {
      const { message, suggestion, button } = mockup;
      return (
        <GlucoseMonitoringMockup
          message={message}
          suggestion={suggestion}
          button={button}
          onNavigate={onNavigate}
        />
      );
    }
    
    if (type === "health-awareness") {
      const { awarenessTopics, preventionTips } = mockup;
      return (
        <HealthAwarenessMockup
          awarenessTopics={awarenessTopics}
          preventionTips={preventionTips}
        />
      );
    }
    
    if (type === "chat") {
      const { quickActions } = mockup;
      return <ChatInterfaceMockup quickActions={quickActions} />;
    }
    
    return null;
  };

  return (
    <div
      className={`grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center ${
        !isEven ? "lg:grid-flow-dense" : ""
      }`}
    >
      <div className={`relative ${!isEven ? "lg:col-start-2" : ""}`}>
        <MobileFrame>{renderMockup()}</MobileFrame>
      </div>

      <div className={`space-y-4 md:space-y-5 lg:space-y-6 ${!isEven ? "lg:col-start-1 lg:row-start-1" : ""}`}>
        <div className={`inline-flex items-center gap-2 ${bgColor} px-3 py-1.5 md:px-4 md:py-2 rounded-full`}>
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${iconColor}`} />
          <span className={`text-xs md:text-sm font-medium ${iconColor}`}>
            {badgeLabels[index]}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{title}</h3>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">{description}</p>
        <div className="pt-2 md:pt-4">
          <Button
            onClick={onNavigate}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary/5 text-sm md:text-base"
          >
            Try It Now
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
});
FeatureCard.displayName = "FeatureCard";

// Atomic Component: CTA Section
const CTASection = memo(({ onNavigate }) => (
  <div className="mt-12 md:mt-16 lg:mt-20 text-center">
    <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 border border-accent/20 max-w-4xl mx-auto">
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4 px-2">Start Your Wellness Journey Today</h3>
      <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
        Join thousands of Indians taking control of their health with AI-powered guidance, preventive care, and compassionate support—available 24/7 in your language.
      </p>
      <Button
        onClick={onNavigate}
        size="sm"
        className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 md:px-6 lg:px-8 py-2 md:py-2.5 shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
      >
        <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
        <span className="hidden sm:inline">Talk to Your AI Companion</span>
        <span className="sm:hidden">Get Started</span>
      </Button>
    </div>
  </div>
));
CTASection.displayName = "CTASection";

// Main Component
const AIHealthFeaturesShowcase = () => {
  const navigate = useNavigate();

  // Memoized features data
  const features = useMemo(
    () => [
      {
        title: "Real-Time Health Monitoring & Guidance",
        description:
          "Your AI companion continuously monitors your health patterns and provides timely insights. Get proactive recommendations based on your health data, helping you make informed decisions for better wellness.",
        icon: Activity,
        iconColor: "text-accent",
        bgColor: "bg-accent/10",
        mockup: {
          type: "glucose",
          message: "I noticed your glucose levels are higher than usual after lunch today",
          suggestion:
            "Would you like me to suggest some light activities to help manage this? Or I can recommend lunch options that are better for maintaining stable glucose levels.",
          button: "Get Personalized Suggestions",
        },
      },
      {
        title: "Health Awareness & Prevention Guidance",
        description:
          "Stay informed about heart health, diabetes prevention, and wellness awareness. Get personalized insights on risk factors, preventive measures, and early warning signs tailored to your health profile.",
        icon: Shield,
        iconColor: "text-success",
        bgColor: "bg-success/10",
        mockup: {
          type: "health-awareness",
          awarenessTopics: {
            title: "Health Awareness Topics",
            items: [
              { topic: "Heart Attack Prevention", risk: "Moderate Risk", icon: Heart },
              { topic: "Diabetes Awareness", risk: "Low Risk", icon: Activity },
              { topic: "Blood Pressure Management", risk: "Monitor", icon: Activity },
            ],
          },
          preventionTips: {
            title: "Prevention Tips",
            tips: ["Regular Checkups", "Healthy Lifestyle", "Stress Management", "Exercise Daily"],
          },
        },
      },
      {
        title: "24/7 AI Health Companion Support",
        description:
          "Chat with your AI health companion anytime, anywhere. Get answers to your health questions, wellness guidance, and compassionate support in Telugu, Hindi, or English—available round the clock.",
        icon: MessageCircle,
        iconColor: "text-primary",
        bgColor: "bg-primary/10",
        mockup: {
          type: "chat",
          quickActions: [
            { text: "Heart attack prevention tips", icon: Heart },
            { text: "Diabetes awareness guide", icon: Activity },
            { text: "Blood pressure management", icon: Activity },
            { text: "Early warning signs to watch", icon: Shield },
          ],
        },
      },
    ],
    []
  );

  // Memoized navigation handler
  const handleNavigate = useCallback(() => {
    navigate("/wellness-campaign");
  }, [navigate]);

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium text-primary border border-primary/20 mb-4 md:mb-6">
            <Activity className="w-3 h-3 md:w-4 md:h-4" />
            Your AI Health Companion
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-2">
            How Your <span className="text-accent">AI Companion</span> Supports You
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Experience personalized preventive health guidance, wellness insights, and compassionate care—designed for Indian lifestyles and available 24/7 in your language.
          </p>
        </div>

        <div className="space-y-12 md:space-y-16 lg:space-y-24">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        <CTASection onNavigate={handleNavigate} />
      </div>
    </section>
  );
};

export default AIHealthFeaturesShowcase;
