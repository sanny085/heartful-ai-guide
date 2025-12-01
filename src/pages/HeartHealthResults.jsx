import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Calendar, Activity, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";

const HeartHealthResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState(location.state?.assessment || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssessment = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      // If assessment was passed via state, use it
      if (location.state?.assessment) {
        setAssessment(location.state.assessment);
        setLoading(false);
        return;
      }

      // Otherwise, load the latest assessment
      try {
        const { data, error } = await supabase
          .from("heart_health_assessments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          // No assessment found, redirect to form
          navigate("/heart-health");
          return;
        }

        setAssessment(data);
      } catch (error) {
        console.error("Error loading assessment:", error);
        navigate("/heart-health");
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [user, location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assessment) {
    return null; // Will redirect
  }

  const insights = assessment.ai_insights || {};
  const dietPlan = assessment.diet_plan ? JSON.parse(assessment.diet_plan) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/health-checkup")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Health Assessment Report</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(assessment.created_at), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Heart Age</h3>
              </div>
              <p className="text-3xl font-bold text-primary">
                {assessment.heart_age || assessment.age || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">years</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Risk Score</h3>
              </div>
              <p className="text-3xl font-bold text-primary">
                {assessment.risk_score ? `${assessment.risk_score.toFixed(1)}%` : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">cardiovascular risk</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">BMI</h3>
              </div>
              <p className="text-3xl font-bold text-primary">
                {assessment.bmi ? assessment.bmi.toFixed(1) : "N/A"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">body mass index</p>
            </Card>
          </div>

          {/* AI Insights Summary */}
          {insights.summary && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Health Summary</h2>
              <p className="text-muted-foreground leading-relaxed">{insights.summary}</p>
            </Card>
          )}

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
              <div className="space-y-4">
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold mb-1">{rec.title || `Recommendation ${idx + 1}`}</h3>
                    <p className="text-muted-foreground">{rec.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Diet Plan */}
          {dietPlan && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Personalized Diet Plan</h2>
              {dietPlan.summary && (
                <p className="text-muted-foreground mb-4">{dietPlan.summary}</p>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {dietPlan.foods_to_eat && dietPlan.foods_to_eat.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-green-600">Foods to Eat</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {dietPlan.foods_to_eat.map((food, idx) => (
                        <li key={idx}>{food}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {dietPlan.foods_to_avoid && dietPlan.foods_to_avoid.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-red-600">Foods to Avoid</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {dietPlan.foods_to_avoid.map((food, idx) => (
                        <li key={idx}>{food}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/heart-health")}
              className="flex-1"
            >
              Create New Assessment
            </Button>
            <Button
              onClick={() => navigate("/chat")}
              variant="outline"
              className="flex-1"
            >
              Chat with AI Doctor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeartHealthResults;


