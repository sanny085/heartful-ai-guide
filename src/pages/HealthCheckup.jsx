import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function HealthCheckup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatestAssessment = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("heart_health_assessments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setLatestAssessment(data);
      } catch (error) {
        console.error("Error loading latest assessment:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLatestAssessment();
  }, [user]);

  const handleStartAssessment = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/heart-health");
  };

  const handleViewReport = () => {
    if (latestAssessment) {
      navigate("/heart-health-results", { state: { assessment: latestAssessment } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Landing Page View - Show when no user or no assessment */}
        {(!user || !latestAssessment) && (
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full border border-primary/20">
              <Activity className="h-5 w-5" />
              <span className="font-medium">Your AI Health Companion</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent leading-tight">
              Discover Your Heart Health
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Answer a few simple questions to reveal your heart age and cardiovascular risk. Then chat with
              our AI physician for personalized health guidance.
            </p>

            {/* CTA Button */}
            <div className="pt-8">
              <Button
                onClick={handleStartAssessment}
                size="lg"
                className="px-8 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <Heart className="mr-2 h-5 w-5" />
                View/Update Health Report
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="p-6 bg-card/50 backdrop-blur">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1">Quick Assessment</h3>
                <p className="text-sm text-muted-foreground">Complete in under 5 minutes</p>
              </Card>
              <Card className="p-6 bg-card/50 backdrop-blur">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold mb-1">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">Get personalized insights</p>
              </Card>
              <Card className="p-6 bg-card/50 backdrop-blur">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-semibold mb-1">Private & Secure</h3>
                <p className="text-sm text-muted-foreground">Your data is protected</p>
              </Card>
            </div>
          </div>
        )}

        {/* Welcome Back View - Show when user has existing assessment */}
        {user && latestAssessment && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Welcome Back!</h2>
                <p className="text-muted-foreground">
                  You have an existing health report from{" "}
                  {format(new Date(latestAssessment.created_at), "dd/MM/yyyy")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  onClick={handleViewReport}
                  size="lg"
                  className="px-8"
                >
                  View Latest Report
                </Button>
                <Button
                  onClick={handleStartAssessment}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Create New Report
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
