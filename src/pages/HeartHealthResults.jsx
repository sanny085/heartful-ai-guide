// import React from "react";
// import HealthCheckup from "./HealthCheckup";

// // Placeholder wrapper so existing imports and routes continue to work
// // You can replace the inner component later if you design a dedicated results page
// const HeartHealthResults = (props) => {
//   return <HealthCheckup {...props} />;
// };

// export default HeartHealthResults;


import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Phone, Home, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// const Assessment = {
//   id,
//   name,
//   age,
//   gender,
//   bmi,
//   heart_age,
//   risk_score,
//   systolic,
//   diastolic,
//   ai_insights,
//   created_at,
//   exercise,
//   smoking,
//   // New fields from revamp
//   chest_pain,
//   shortness_of_breath,
//   dizziness,
//   fatigue,
//   ldl,
//   hdl,
//   fasting_sugar,
//   post_meal_sugar,
//   swelling,
//   palpitations,
//   family_history,
//   user_notes,
//   diet_plan,
// }

export default function HeartHealthResults() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get("id");
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allAssessments, setAllAssessments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to view your results");
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!assessmentId) {
      toast.error("No assessment found");
      navigate("/heart-health");
      return;
    }

    if (user) {
      loadAssessment();
      loadUserAndAssessments();
    }
  }, [assessmentId, user]);

  const loadUserAndAssessments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data, error } = await supabase
          .from("heart_health_assessments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAllAssessments(data || []);
      }
    } catch (error) {
      console.error("Error loading assessments:", error);
    }
  };

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

  const getCVRiskLevel = () => {
    const score = calculateCardiovascularScore();
    if (score >= 90) return { level: "Very High Risk", color: "text-warning" };
    if (score >= 70) return { level: "High Risk", color: "text-warning" };
    if (score >= 50) return { level: "Moderate Risk", color: "text-health-orange" };
    return { level: "Low Risk", color: "text-success" };
  };

  const getHeartAgeMessage = () => {
    const heartAge = assessment?.heart_age || assessment?.age || 0;
    const actualAge = assessment?.age || 0;
    if (heartAge > actualAge) {
      return `Your heart is behaving ${heartAge - actualAge} years older than your actual age`;
    } else if (heartAge < actualAge) {
      return `Your heart is ${actualAge - heartAge} years younger than your actual age!`;
    }
    return "Your heart age matches your actual age";
  };

  const getRiskCategory = () => {
    const risk = assessment?.risk_score || 0;
    if (risk < 5) return { level: "Excellent", color: "text-success" };
    if (risk < 10) return { level: "Good", color: "text-health-green" };
    if (risk < 20) return { level: "Moderate", color: "text-health-orange" };
    return { level: "High", color: "text-warning" };
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
        <Button variant="ghost" onClick={() => (window.location.href = "https://10000hearts.com/")} className="mb-4">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-12 h-12 text-accent fill-accent" />
            <div>
              <h2 className="text-2xl font-bold">Hi {assessment.name},</h2>
              <h1 className="text-3xl font-bold">Heart Health Reports</h1>
            </div>
          </div>
        </div>

        {/* Report History Section - Now at the top */}
        {allAssessments.length > 0 && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Your Reports</h3>
              <Button onClick={() => navigate("/heart-health")} size="sm" className="bg-accent hover:bg-accent/90">
                + Create New Report
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAssessments.map((item, index) => (
                <Card
                  key={item.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    item.id === assessmentId
                      ? "border-accent border-2 bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => navigate(`/heart-health-results?id=${item.id}`)}
                >
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-bold text-foreground text-lg">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm text-muted-foreground">Report #{allAssessments.length - index}</h4>
                        {item.id === assessmentId && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                            Viewing
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Date</span>
                        <span className="text-xs font-medium text-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Heart Age</span>
                        <span className="text-xs font-medium text-foreground">{item.heart_age || "N/A"}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Risk</span>
                        <span className="text-xs font-medium text-foreground">
                          {item.risk_score ? `${item.risk_score.toFixed(1)}%` : "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">BMI</span>
                        <span className="text-xs font-medium text-foreground">
                          {item.bmi ? item.bmi.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>

                    {item.id !== assessmentId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/heart-health-results?id=${item.id}`);
                        }}
                      >
                        View Report
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Current Report Details */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Report Details - {new Date(assessment.created_at).toLocaleDateString()}
          </h2>
        </div>

        <Tabs defaultValue="health" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="health">Heart Health</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="risk">Risk Contributors</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment.bmi ? assessment.bmi.toFixed(1) : "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">BMI</h3>
                <p className="text-xs text-muted-foreground">{getBMICategory()}</p>
                <p className="text-xs text-muted-foreground mt-2">Body Mass Index</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">{calculateCardiovascularScore()}</div>
                <h3 className="text-lg font-semibold text-accent">CV Score</h3>
                <p className={`text-xs font-medium ${getCVRiskLevel().color}`}>{getCVRiskLevel().level}</p>
                <p className="text-xs text-muted-foreground mt-2">Cardiovascular Risk</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment.heart_age || assessment.age || "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Age</h3>
                <p className="text-xs text-muted-foreground">vs {assessment.age} years</p>
                <p className="text-xs text-muted-foreground mt-2">Biological Age</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment.risk_score ? assessment.risk_score.toFixed(1) : "N/A"}%
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Risk</h3>
                <p className={`text-xs font-medium ${getRiskCategory().color}`}>{getRiskCategory().level}</p>
                <p className="text-xs text-muted-foreground mt-2">10-Year Risk</p>
              </Card>
            </div>

            {/* Metric Explanations */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* BMI Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">📊 What is BMI?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  BMI (Body Mass Index) tells whether your weight is healthy for your height.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">18.5 - 24.9</span>
                    <span className="font-medium text-success">Normal</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">25 - 29.9</span>
                    <span className="font-medium text-health-orange">Overweight</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-muted-foreground">30+</span>
                    <span className="font-medium text-warning">Obese</span>
                  </div>
                </div>
                {assessment.bmi && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Your BMI: {assessment.bmi.toFixed(1)} → {getBMICategory()}
                    </p>
                  </div>
                )}
              </Card>

              {/* CV Score Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">❤️ What is CV Score?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cardiovascular Risk Score combines factors like blood pressure, BMI, lifestyle, and more.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">0 - 50</span>
                    <span className="font-medium text-success">Low Risk</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">50 - 70</span>
                    <span className="font-medium text-health-orange">Moderate Risk</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-muted-foreground">70+</span>
                    <span className="font-medium text-warning">High Risk</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    Your Score: {calculateCardiovascularScore()} → {getCVRiskLevel().level}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Reversible with lifestyle improvements</p>
                </div>
              </Card>

              {/* Heart Age Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">💓 What is Heart Age?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Heart Age tells you how old your heart behaves biologically, not your actual age.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  If your heart age is higher than your real age, it means higher risk due to factors like weight,
                  activity, sleep, or nutrition.
                </p>
                {assessment.heart_age && assessment.age && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Your Heart Age: {assessment.heart_age} years
                    </p>
                    <p className="text-sm font-medium text-foreground">Your Actual Age: {assessment.age} years</p>
                    <p className="text-xs text-muted-foreground mt-2">{getHeartAgeMessage()}</p>
                  </div>
                )}
              </Card>

              {/* Risk Percentage Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">⚠️ What is Heart Risk %?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This is your chance of developing a heart problem in the next 10 years.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">&lt; 5%</span>
                    <span className="font-medium text-success">Excellent</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">5 - 10%</span>
                    <span className="font-medium text-health-green">Good</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">10 - 20%</span>
                    <span className="font-medium text-health-orange">Moderate</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-muted-foreground">&gt; 20%</span>
                    <span className="font-medium text-warning">High</span>
                  </div>
                </div>
                {assessment.risk_score && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Your Risk: {assessment.risk_score.toFixed(1)}% → {getRiskCategory().level}
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Blood Pressure Details */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-accent mb-4">🩺 Blood Pressure Reading</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Blood pressure shows the force of blood against your artery walls.
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">Systolic</span>
                        <span className="text-2xl font-bold text-accent">{assessment.systolic || "N/A"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pressure when heart beats</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">Diastolic</span>
                        <span className="text-2xl font-bold text-accent">{assessment.diastolic || "N/A"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pressure when heart relaxes</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Your BP: {assessment.systolic}/{assessment.diastolic} mmHg
                    </p>
                    <p className="text-sm font-medium text-foreground">Category: {getBPCategory()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">BP Categories:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">&lt;120/80</span>
                      <span className="font-medium text-success">Normal</span>
                    </div>
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">120-129/&lt;80</span>
                      <span className="font-medium text-health-orange">Elevated</span>
                    </div>
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">130-139/80-89</span>
                      <span className="font-medium text-health-orange">Stage 1 High</span>
                    </div>
                    <div className="flex justify-between text-sm pb-2">
                      <span className="text-muted-foreground">≥140/≥90</span>
                      <span className="font-medium text-warning">Stage 2 High</span>
                    </div>
                  </div>
                  {getBPCategory() === "Normal" && assessment.systolic && assessment.systolic < 100 && (
                    <div className="mt-4 p-3 bg-health-lightBlue rounded-lg">
                      <p className="text-xs text-foreground">
                        💡 Low-normal BP is common in athletes and active individuals. If you experience dizziness or
                        fatigue, consult your doctor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Cholesterol Section */}
            {(assessment.ldl || assessment.hdl) && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">🧪 Cholesterol Levels</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      {assessment.ldl && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">LDL (Bad Cholesterol)</span>
                            <span
                              className={`text-2xl font-bold ${
                                assessment.ldl > 160
                                  ? "text-warning"
                                  : assessment.ldl > 130
                                    ? "text-health-orange"
                                    : "text-success"
                              }`}
                            >
                              {assessment.ldl}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">mg/dL</p>
                          <div className="mt-2 text-sm font-medium">
                            {assessment.ldl < 100 && <span className="text-success">✓ Optimal</span>}
                            {assessment.ldl >= 100 && assessment.ldl < 130 && (
                              <span className="text-health-green">Near Optimal</span>
                            )}
                            {assessment.ldl >= 130 && assessment.ldl < 160 && (
                              <span className="text-health-orange">⚠ Borderline High</span>
                            )}
                            {assessment.ldl >= 160 && assessment.ldl < 190 && (
                              <span className="text-warning">⚠ High</span>
                            )}
                            {assessment.ldl >= 190 && <span className="text-warning">⚠ Very High</span>}
                          </div>
                        </div>
                      )}

                      {assessment.hdl && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">HDL (Good Cholesterol)</span>
                            <span
                              className={`text-2xl font-bold ${
                                assessment.hdl < 40
                                  ? "text-warning"
                                  : assessment.hdl < 60
                                    ? "text-health-orange"
                                    : "text-success"
                              }`}
                            >
                              {assessment.hdl}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">mg/dL</p>
                          <div className="mt-2 text-sm font-medium">
                            {assessment.hdl < 40 && <span className="text-warning">⚠ Low (Risk Factor)</span>}
                            {assessment.hdl >= 40 && assessment.hdl < 60 && (
                              <span className="text-health-orange">Normal</span>
                            )}
                            {assessment.hdl >= 60 && <span className="text-success">✓ High (Protective)</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Understanding Cholesterol:</h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="p-3 bg-warning/10 rounded-lg">
                        <p className="font-medium text-foreground mb-1">LDL (Bad Cholesterol):</p>
                        <p>High levels can build up in arteries and increase heart disease risk. Keep it low!</p>
                      </div>
                      <div className="p-3 bg-success/10 rounded-lg">
                        <p className="font-medium text-foreground mb-1">HDL (Good Cholesterol):</p>
                        <p>Helps remove bad cholesterol from arteries. Higher is better!</p>
                      </div>
                    </div>

                    {assessment.ai_insights?.cholesterol_advice && (
                      <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">💡 Recommendation:</p>
                        <p className="text-sm text-foreground/90">{assessment.ai_insights.cholesterol_advice}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Summary Section */}
            <Card className="p-6 bg-accent/5">
              <h3 className="text-2xl font-bold text-accent mb-4">📋 Your Health Summary</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">BMI</span>
                    <span className="text-sm font-bold text-accent">
                      {assessment.bmi?.toFixed(1)} - {getBMICategory()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">CV Score</span>
                    <span className="text-sm font-bold text-accent">
                      {calculateCardiovascularScore()} - {getCVRiskLevel().level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Heart Age</span>
                    <span className="text-sm font-bold text-accent">
                      {assessment.heart_age || assessment.age} years
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">10-Year Risk</span>
                    <span className="text-sm font-bold text-accent">
                      {assessment.risk_score?.toFixed(1)}% - {getRiskCategory().level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Blood Pressure</span>
                    <span className="text-sm font-bold text-accent">
                      {assessment.systolic}/{assessment.diastolic} - {getBPCategory()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Age</span>
                    <span className="text-sm font-bold text-accent">{assessment.age} years</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Key Metrics Cards - Also shown on Insights tab */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment.bmi ? assessment.bmi.toFixed(1) : "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">BMI</h3>
                <p className="text-xs text-muted-foreground">{getBMICategory()}</p>
                <p className="text-xs text-muted-foreground mt-2">Body Mass Index</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">{calculateCardiovascularScore()}</div>
                <h3 className="text-lg font-semibold text-accent">CV Score</h3>
                <p className={`text-xs font-medium ${getCVRiskLevel().color}`}>{getCVRiskLevel().level}</p>
                <p className="text-xs text-muted-foreground mt-2">Cardiovascular Risk</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment.heart_age || assessment.age || "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Age</h3>
                <p className="text-xs text-muted-foreground">vs {assessment.age} years</p>
                <p className="text-xs text-muted-foreground mt-2">Biological Age</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment.risk_score ? assessment.risk_score.toFixed(1) : "N/A"}%
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Risk</h3>
                <p className={`text-xs font-medium ${getRiskCategory().color}`}>{getRiskCategory().level}</p>
                <p className="text-xs text-muted-foreground mt-2">10-Year Risk</p>
              </Card>
            </div>

            {assessment.ai_insights ? (
              <div className="space-y-6">
                {/* Summary Section */}
                {assessment.ai_insights.summary && (
                  <Card className="p-8 bg-card border-accent/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-8 h-8 text-accent" />
                      <h2 className="text-2xl font-bold text-foreground">Summary of Patient</h2>
                    </div>
                    <div className="p-6 bg-muted/20 rounded-lg">
                      <p className="text-lg leading-relaxed text-foreground">{assessment.ai_insights.summary}</p>
                    </div>
                  </Card>
                )}

                {/* Recommendation Cards */}
                {assessment.ai_insights.recommendations && assessment.ai_insights.recommendations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-foreground">Recommended Actions</h3>
                    {assessment.ai_insights.recommendations
                      .map((rec, idx) => {
                        let title = "";
                        let description = "";

                        if (typeof rec === "object" && rec !== null) {
                          title = rec.title || "";
                          description = rec.description || "";
                        } else if (typeof rec === "string") {
                          description = rec;
                          title = `Recommendation ${idx + 1}`;
                        }

                        // Clean up all metadata and JSON artifacts
                        title = title
                          .replace(/[{}\[\]"']/g, "")
                          .replace(/^(title|recommendations)\s*:\s*/i, "")
                          .trim();
                        description = description
                          .replace(/[{}\[\]"']/g, "")
                          .replace(/^description\s*:\s*/i, "")
                          .trim();

                        if (!title || !description || title.length < 2 || description.length < 5) return null;

                        return (
                          <Card key={idx} className="p-6 bg-background border border-accent/20">
                            <h4 className="text-xl font-semibold text-foreground mb-3">{title}</h4>
                            <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
                          </Card>
                        );
                      })
                      .filter(Boolean)}
                  </div>
                )}

                {/* Diet Plan Card - Separate */}
                {assessment.ai_insights.diet_plan && (
                  <Card className="p-8 bg-gradient-to-br from-health-lightBlue/20 to-accent/5">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">🥗</span>
                      <h3 className="text-2xl font-semibold text-foreground">Your Personalized Diet Plan</h3>
                    </div>

                    {assessment.ai_insights.diet_plan.summary && (
                      <div className="mb-6">
                        <p className="text-lg leading-relaxed text-foreground/90">
                          {assessment.ai_insights.diet_plan.summary}
                        </p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Foods to Eat */}
                      {assessment.ai_insights.diet_plan.foods_to_eat &&
                        Array.isArray(assessment.ai_insights.diet_plan.foods_to_eat) &&
                        assessment.ai_insights.diet_plan.foods_to_eat.length > 0 && (
                          <Card className="p-6 bg-success/5 border-l-4 border-success">
                            <div className="flex items-center gap-2 mb-4">
                              <CheckCircle className="w-5 h-5 text-success" />
                              <h4 className="text-lg font-semibold text-success">Foods to Include</h4>
                            </div>
                            <ul className="space-y-2">
                              {assessment.ai_insights.diet_plan.foods_to_eat.map((food, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-foreground">
                                  <span className="text-success mt-0.5">✓</span>
                                  <span>{food}</span>
                                </li>
                              ))}
                            </ul>
                          </Card>
                        )}

                      {/* Foods to Avoid */}
                      {assessment.ai_insights.diet_plan.foods_to_avoid &&
                        Array.isArray(assessment.ai_insights.diet_plan.foods_to_avoid) &&
                        assessment.ai_insights.diet_plan.foods_to_avoid.length > 0 && (
                          <Card className="p-6 bg-warning/5 border-l-4 border-warning">
                            <div className="flex items-center gap-2 mb-4">
                              <AlertCircle className="w-5 h-5 text-warning" />
                              <h4 className="text-lg font-semibold text-warning">Foods to Limit/Avoid</h4>
                            </div>
                            <ul className="space-y-2">
                              {assessment.ai_insights.diet_plan.foods_to_avoid.map((food, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-foreground">
                                  <span className="text-warning mt-0.5">✗</span>
                                  <span>{food}</span>
                                </li>
                              ))}
                            </ul>
                          </Card>
                        )}
                    </div>

                    {assessment.risk_score && assessment.risk_score > 20 && (
                      <div className="mt-6 p-4 bg-warning/10 border-l-4 border-warning rounded">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                          <div>
                            <p className="font-semibold text-warning mb-1">Important Note:</p>
                            <p className="text-sm text-foreground/90">
                              Based on your risk score, we strongly recommend consulting with a healthcare provider or
                              registered dietitian for a comprehensive dietary plan tailored to your specific needs.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Meal Suggestions Card - Separate */}
                {assessment.ai_insights.diet_plan?.meal_suggestions &&
                  Array.isArray(assessment.ai_insights.diet_plan.meal_suggestions) &&
                  assessment.ai_insights.diet_plan.meal_suggestions.length > 0 && (
                    <Card className="p-8 bg-gradient-to-br from-accent/10 to-background">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">🍽️</span>
                        <h3 className="text-2xl font-semibold text-foreground">Sample Meal Suggestions</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        {assessment.ai_insights.diet_plan.meal_suggestions.map((meal, idx) => (
                          <Card key={idx} className="p-4 bg-background border border-accent/20">
                            <p className="text-sm text-foreground">{meal}</p>
                          </Card>
                        ))}
                      </div>
                    </Card>
                  )}

                {/* DON'Ts Section - Two separate cards at bottom */}
                {assessment.ai_insights.donts &&
                  Array.isArray(assessment.ai_insights.donts) &&
                  assessment.ai_insights.donts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-foreground">Important Precautions</h3>

                      {/* Mild Cautions - Green/Yellow Card */}
                      <Card className="p-6 bg-success/10 border-l-4 border-success">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="w-6 h-6 text-success" />
                          <h4 className="text-xl font-semibold text-success">Things to Be Careful About</h4>
                        </div>
                        <div className="space-y-3">
                          {assessment.ai_insights.donts
                            .slice(0, Math.ceil(assessment.ai_insights.donts.length / 2))
                            .map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-start">
                                <span className="text-success mt-1">⚠</span>
                                <p className="text-base text-foreground">{item}</p>
                              </div>
                            ))}
                        </div>
                      </Card>

                      {/* Strict Warnings - Orange/Red Card */}
                      <Card className="p-6 bg-destructive/10 border-l-4 border-destructive">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="w-6 h-6 text-destructive" />
                          <h4 className="text-xl font-semibold text-destructive">Strictly Avoid</h4>
                        </div>
                        <div className="space-y-3">
                          {assessment.ai_insights.donts
                            .slice(Math.ceil(assessment.ai_insights.donts.length / 2))
                            .map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-start">
                                <span className="text-destructive mt-1">✗</span>
                                <p className="text-base text-foreground">{item}</p>
                              </div>
                            ))}
                        </div>
                      </Card>
                    </div>
                  )}
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
              <h2 className="text-2xl font-bold text-foreground mb-6">Risk Contributors</h2>
              <p className="text-muted-foreground mb-6">
                These factors are currently contributing to your heart health risk:
              </p>
              <div className="space-y-4">
                {/* Only show actual risk contributors (negative factors) */}
                {assessment.smoking && assessment.smoking !== "No" && assessment.smoking !== "Never" && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Smoking Status</h4>
                        <p className="text-sm text-muted-foreground">{assessment.smoking}</p>
                        <p className="text-sm text-warning mt-2">
                          ⚠️ Smoking significantly increases cardiovascular risk
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.systolic && assessment.systolic > 120 && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Elevated Blood Pressure</h4>
                        <p className="text-sm text-muted-foreground">
                          {assessment.systolic}/{assessment.diastolic} mmHg - {getBPCategory()}
                        </p>
                        <p className="text-sm text-warning mt-2">
                          ⚠️ High blood pressure strains your heart and arteries
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.bmi && assessment.bmi > 25 && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Body Weight</h4>
                        <p className="text-sm text-muted-foreground">
                          BMI: {assessment.bmi.toFixed(1)} - {getBMICategory()}
                        </p>
                        <p className="text-sm text-warning mt-2">⚠️ Excess weight increases risk of heart disease</p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.exercise &&
                  (assessment.exercise === "Sedentary" ||
                    assessment.exercise === "Light" ||
                    assessment.exercise === "None") && (
                    <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">Low Physical Activity</h4>
                          <p className="text-sm text-muted-foreground">{assessment.exercise}</p>
                          <p className="text-sm text-warning mt-2">⚠️ Lack of exercise weakens cardiovascular health</p>
                        </div>
                      </div>
                    </div>
                  )}

                {assessment.ldl && assessment.ldl > 130 && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">High LDL Cholesterol</h4>
                        <p className="text-sm text-muted-foreground">LDL: {assessment.ldl} mg/dL</p>
                        <p className="text-sm text-warning mt-2">⚠️ High bad cholesterol can clog arteries</p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.hdl && assessment.hdl < 40 && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Low HDL Cholesterol</h4>
                        <p className="text-sm text-muted-foreground">HDL: {assessment.hdl} mg/dL</p>
                        <p className="text-sm text-warning mt-2">⚠️ Low good cholesterol reduces heart protection</p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.family_history && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Family History</h4>
                        <p className="text-sm text-muted-foreground">Family history of heart disease</p>
                        <p className="text-sm text-warning mt-2">⚠️ Genetic factors increase your risk</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show message if no significant risk factors */}
                {!(
                  (assessment.smoking && assessment.smoking !== "No" && assessment.smoking !== "Never") ||
                  (assessment.systolic && assessment.systolic > 120) ||
                  (assessment.bmi && assessment.bmi > 25) ||
                  (assessment.exercise &&
                    (assessment.exercise === "Sedentary" ||
                      assessment.exercise === "Light" ||
                      assessment.exercise === "None")) ||
                  (assessment.ldl && assessment.ldl > 130) ||
                  (assessment.hdl && assessment.hdl < 40) ||
                  assessment.family_history
                ) && (
                  <div className="p-6 bg-success/5 border-l-4 border-success rounded-lg text-center">
                    <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                    <h4 className="font-semibold text-foreground mb-2">Great News!</h4>
                    <p className="text-sm text-muted-foreground">
                      No major risk contributors identified. Keep up the good work!
                    </p>
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open("https://10000hearts.com/wellness-campaign", "_blank")}
                >
                  Schedule Call
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 10000hearts. All rights reserved.</p>
          <p className="mt-2">
            This assessment is for informational purposes only and does not constitute medical advice. Please consult
            with a healthcare professional for medical concerns.
          </p>
        </div>
      </div>
    </div>
  );
}


