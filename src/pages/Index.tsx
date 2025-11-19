import { Button } from "@/components/ui/button";
import { Heart, Activity, MessageCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
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
        </header>

        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center space-y-8 mb-20">
          <div className="inline-flex items-center gap-2 bg-health-lightBlue px-4 py-2 rounded-full text-sm font-medium text-primary">
            <Activity className="w-4 h-4" />
            Your AI Health Companion
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
            Discover Your Heart Health
            <br />
            <span className="text-accent">Begin Your Journey Now</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Answer a few simple questions to reveal your heart age and cardiovascular risk. 
            Then chat with our AI physician for personalized health guidance.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button
              onClick={() => navigate("/heart-health")}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              Take Heart Health Test
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(user ? "/chat" : "/auth")}
              className="border-primary text-primary hover:bg-primary/5 px-8"
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat with AI Doctor
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Heart Health Assessment</h3>
            <p className="text-muted-foreground">
              Comprehensive evaluation of your cardiovascular health with instant results and personalized insights.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">AI Health Companion</h3>
            <p className="text-muted-foreground">
              Chat with our AI physician 24/7. Get answers to your health questions with personalized recommendations.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-health-blue/10 rounded-2xl flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-health-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Track Your Progress</h3>
            <p className="text-muted-foreground">
              Monitor your health metrics over time and receive actionable insights to improve your wellbeing.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 py-12 border-t border-border">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">10,000+</div>
              <div className="text-muted-foreground">Health Assessments Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">AI Support Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-health-blue mb-2">95%</div>
              <div className="text-muted-foreground">User Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
