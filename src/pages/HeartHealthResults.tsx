import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Phone, Home, Activity } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Assessment {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  bmi: number | null;
  heart_age: number | null;
  risk_score: number | null;
  systolic: number | null;
  diastolic: number | null;
  ai_insights: any;
  created_at: string;
}

export default function HeartHealthResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get("id");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assessmentId) {
      toast.error("No assessment found");
      navigate("/heart-health");
      return;
    }

    loadAssessment();
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from("heart_health_assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (error) throw error;
      setAssessment(data);
    } catch (error) {
      console.error("Error loading assessment:", error);
      toast.error("Failed to load assessment results");
    } finally {
      setLoading(false);
    }
  };

  const calculateCardiovascularScore = () => {
    if (!assessment) return 0;
    // Simple scoring algorithm (can be enhanced)
    let score = 100;
    if (assessment.bmi && assessment.bmi > 25) score -= 10;
    if (assessment.systolic && assessment.systolic > 140) score -= 15;
    if (assessment.risk_score) score -= assessment.risk_score * 2;
    return Math.max(0, Math.round(score));
  };

  const getBPCategory = () => {
    if (!assessment?.systolic || !assessment?.diastolic) return "Unknown";
    const sys = assessment.systolic;
    const dia = assessment.diastolic;
    
    if (sys < 120 && dia < 80) return "Normal";
    if (sys < 130 && dia < 80) return "Elevated";
    if (sys < 140 || dia < 90) return "High (Stage 1)";
    return "High (Stage 2)";
  };

  const getBMICategory = () => {
    if (!assessment?.bmi) return "Unknown";
    const bmi = assessment.bmi;
    
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-accent animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No assessment found</p>
          <Button onClick={() => navigate("/heart-health")} className="mt-4">
            Take Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-12 h-12 text-accent fill-accent" />
            <div>
              <h2 className="text-2xl font-bold">Hi {assessment.name},</h2>
              <h1 className="text-3xl font-bold">Here's a snapshot of your heart health report</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button className="pb-4 px-4 border-b-2 border-accent text-accent font-medium">
            Heart Health
          </button>
          <button className="pb-4 px-4 text-muted-foreground hover:text-foreground">
            Insights
          </button>
          <button className="pb-4 px-4 text-muted-foreground hover:text-foreground">
            Risk Contributors
          </button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 text-center space-y-2 shadow-md">
            <div className="text-4xl font-bold text-foreground">
              {assessment.bmi ? assessment.bmi.toFixed(1) : "N/A"}
            </div>
            <h3 className="text-lg font-semibold text-accent">BMI</h3>
            <p className="text-xs text-muted-foreground">{getBMICategory()}</p>
          </Card>

          <Card className="p-6 text-center space-y-2 shadow-md">
            <div className="text-4xl font-bold text-foreground">
              {calculateCardiovascularScore()}
            </div>
            <h3 className="text-lg font-semibold text-accent">CV Score</h3>
            <p className="text-xs text-muted-foreground">points</p>
          </Card>

          <Card className="p-6 text-center space-y-2 shadow-md">
            <div className="text-4xl font-bold text-foreground">
              {assessment.heart_age || assessment.age || "N/A"}
            </div>
            <h3 className="text-lg font-semibold text-accent">Heart Age</h3>
            <p className="text-xs text-muted-foreground">years</p>
          </Card>

          <Card className="p-6 text-center space-y-2 shadow-md">
            <div className="text-4xl font-bold text-foreground">
              {assessment.risk_score ? assessment.risk_score.toFixed(1) : "N/A"}
            </div>
            <h3 className="text-lg font-semibold text-accent">Risk</h3>
            <p className="text-xs text-muted-foreground">%</p>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-accent">Blood Pressure</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Systolic:</span>
                <span className="font-semibold">{assessment.systolic || "N/A"} mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diastolic:</span>
                <span className="font-semibold">{assessment.diastolic || "N/A"} mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold">{getBPCategory()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-accent">Body Composition</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BMI:</span>
                <span className="font-semibold">{assessment.bmi ? assessment.bmi.toFixed(1) : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold">{getBMICategory()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age:</span>
                <span className="font-semibold">{assessment.age || "N/A"} years</span>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        {assessment.ai_insights && (
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-semibold text-accent mb-4">AI-Powered Health Insights</h3>
            <div className="space-y-4">
              {assessment.ai_insights.summary && (
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-muted-foreground">{assessment.ai_insights.summary}</p>
                </div>
              )}
              {assessment.ai_insights.recommendations && assessment.ai_insights.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {assessment.ai_insights.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-muted-foreground">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button
            onClick={() => navigate("/chat")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
            size="lg"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Start Chat
          </Button>
          <Button
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10 px-8"
            size="lg"
          >
            <Phone className="mr-2 h-5 w-5" />
            Call Us
          </Button>
        </div>

        {/* Social Share */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Invite your friends & family to take the test</p>
          <div className="flex gap-3 justify-center">
            {[
              { icon: "🟢", label: "WhatsApp" },
              { icon: "📷", label: "Instagram" },
              { icon: "👍", label: "Facebook" },
              { icon: "✖️", label: "X" },
              { icon: "💼", label: "LinkedIn" }
            ].map((social) => (
              <button
                key={social.label}
                className="w-12 h-12 rounded-full bg-card border border-border hover:border-accent hover:shadow-md transition-all flex items-center justify-center"
                aria-label={social.label}
              >
                <span className="text-xl">{social.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          Copyright © 2024 10,000 hearts | All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
