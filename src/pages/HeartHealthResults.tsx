import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Phone, Home, Activity, CheckCircle, AlertCircle } from "lucide-react";
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
  exercise: string | null;
  smoking: string | null;
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

        <Tabs defaultValue="health" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="health">Heart Health</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="risk">Risk Contributors</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid md:grid-cols-4 gap-6">
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
            <div className="grid md:grid-cols-2 gap-6">
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
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {assessment.ai_insights ? (
              <div className="space-y-6">
                <Card className="p-8 bg-card border-accent/20">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-8 h-8 text-accent" />
                    <h2 className="text-3xl font-bold text-foreground">Your Personalized Health Insights</h2>
                  </div>
                  
                  {assessment.ai_insights.summary && (
                    <div className="mb-8 pb-6 border-b border-border">
                      <p className="text-lg leading-relaxed text-foreground">
                        {assessment.ai_insights.summary}
                      </p>
                    </div>
                  )}

                  {assessment.ai_insights.recommendations && assessment.ai_insights.recommendations.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-semibold text-foreground mb-4">Recommended Actions</h3>
                      <div className="space-y-4">
                        {assessment.ai_insights.recommendations.map((rec: any, idx: number) => {
                          const title = typeof rec === 'object' ? rec.title : `Recommendation ${idx + 1}`;
                          const description = typeof rec === 'string' ? rec : (rec.description || rec.title || '');
                          
                          return (
                            <Card key={idx} className="p-6 bg-muted/30 border-l-4 border-accent">
                              <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                  <CheckCircle className="w-6 h-6 text-accent" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-foreground mb-2">{title}</h4>
                                  <p className="text-base leading-relaxed text-foreground/90">{description}</p>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  No personalized insights available yet. Please check back later.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Risk Factors</h2>
              <div className="space-y-4">
                {assessment.exercise && (
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-base text-muted-foreground">Exercise Level:</span>
                    <span className="text-base font-semibold text-foreground">{assessment.exercise}</span>
                  </div>
                )}
                {assessment.smoking && (
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-base text-muted-foreground">Smoking Status:</span>
                    <span className="text-base font-semibold text-foreground">{assessment.smoking}</span>
                  </div>
                )}
                {assessment.systolic && assessment.systolic > 120 && (
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-base text-muted-foreground">Blood Pressure:</span>
                    <span className="text-base font-semibold text-accent">{getBPCategory()}</span>
                  </div>
                )}
                {assessment.bmi && assessment.bmi > 25 && (
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-base text-muted-foreground">Body Weight:</span>
                    <span className="text-base font-semibold text-accent">{getBMICategory()}</span>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <MessageCircle className="w-12 h-12 text-accent" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Chat with Our Health Expert</h3>
                <p className="text-sm text-muted-foreground mb-4">Get personalized guidance</p>
                <Button onClick={() => navigate("/chat")} className="w-full">
                  Start Chat
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Phone className="w-12 h-12 text-accent" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Talk to Our Team</h3>
                <p className="text-sm text-muted-foreground mb-4">Speak with a health advisor</p>
                <Button variant="outline" className="w-full">
                  Schedule Call
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2024 10000hearts. All rights reserved.</p>
          <p className="mt-2">
            This assessment is for informational purposes only and does not constitute medical advice.
            Please consult with a healthcare professional for medical concerns.
          </p>
        </div>
      </div>
    </div>
  );
}
