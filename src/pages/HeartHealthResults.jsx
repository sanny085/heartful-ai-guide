import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Phone, Home, Activity, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";

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

  const bpChart = [
    {
      category: "High Blood Pressure - Stage 4",
      label: "Hypertensive Crisis",
      systolic: { min: 210, max: null, condition: "above" },
      diastolic: { min: 120, max: null, condition: "above" }
    },
    {
      category: "High Blood Pressure - Stage 3",
      label: "Hypertensive Crisis",
      systolic: { min: 180, max: 210 },
      diastolic: { min: 110, max: 120 }
    },
    {
      category: "High Blood Pressure - Stage 2",
      label: "Hypertension",
      systolic: { min: 160, max: 179 },
      diastolic: { min: 100, max: 109 }
    },
    {
      category: "High Blood Pressure - Stage 1",
      label: "Hypertension",
      systolic: { min: 140, max: 159 },
      diastolic: { min: 90, max: 99 }
    },
    {
      category: "Pre-High Blood Pressure",
      label: "Pre-Hypertension",
      systolic: { min: 130, max: 139 },
      diastolic: { min: 85, max: 89 }
    },
    {
      category: "High Normal Blood Pressure",
      label: "Normal",
      systolic: { min: 121, max: 129 },
      diastolic: { min: 81, max: 84 }
    },
    {
      category: "Normal Blood Pressure",
      label: "Ideal Blood Pressure",
      systolic: { min: 100, max: 120 },
      diastolic: { min: 65, max: 80 }
    },
    {
      category: "Low Normal Blood Pressure",
      label: "Normal",
      systolic: { min: 90, max: 99 },
      diastolic: { min: 60, max: 64 }
    },
    {
      category: "Low Blood Pressure",
      label: "Moderate Hypotension",
      systolic: { min: 70, max: 89 },
      diastolic: { min: 40, max: 59 }
    },
    {
      category: "Too Low Blood Pressure",
      label: "Severe Hypotension",
      systolic: { min: 50, max: 69 },
      diastolic: { min: 35, max: 39 }
    },
    {
      category: "Extremely Low Blood Pressure",
      label: "Extremely Severe Hypotension",
      systolic: { min: null, max: 50, condition: "below" },
      diastolic: { min: null, max: 35, condition: "below" }
    }
  ];

  const matchesRange = (value, range) => {
    if (value == null) return false;
    const min = range.min ?? -Infinity;
    const max = range.max ?? Infinity;
    if (range.condition === "above") return value >= min;
    if (range.condition === "below") return value <= max;
    return value >= min && value <= max;
  };

  const findLevel = (value, type = "systolic") => {
    for (let i = 0; i < bpChart.length; i++) {
      if (matchesRange(value, bpChart[i][type])) {
        return { index: i, ...bpChart[i] };
      }
    }
    return null;
  };

  const getBPCategory = () => {
    if (assessment?.systolic == null || assessment?.diastolic == null) {
      return { category: "Unknown", label: "Not enough data", detail: "Add both systolic and diastolic values." };
    }

    const sysLevel = findLevel(assessment.systolic, "systolic");
    const diaLevel = findLevel(assessment.diastolic, "diastolic");

    if (!sysLevel && !diaLevel) {
      return { category: "Unknown", label: "Out of chart", detail: "Values are outside expected ranges." };
    }

    // Pick the more severe (smaller index in the ordered chart)
    const picked = !sysLevel ? diaLevel : !diaLevel ? sysLevel : (sysLevel.index <= diaLevel.index ? sysLevel : diaLevel);

    let detail = "";
    if (sysLevel && diaLevel) {
      if (sysLevel.index === diaLevel.index) {
        detail = `Systolic and diastolic are both in ${picked.label.toLowerCase()} range.`;
      } else if (sysLevel.index < diaLevel.index) {
        detail = `Systolic is higher (${sysLevel.label.toLowerCase()}) while diastolic is ${diaLevel.label.toLowerCase()}.`;
      } else {
        detail = `Diastolic is higher (${diaLevel.label.toLowerCase()}) while systolic is ${sysLevel.label.toLowerCase()}.`;
      }
    } else if (sysLevel) {
      detail = `Only systolic available: ${sysLevel.label}`;
    } else if (diaLevel) {
      detail = `Only diastolic available: ${diaLevel.label}`;
    }

    return {
      category: picked.category,
      label: picked.label,
      detail,
      severityIndex: picked.index,
    };
  };

  const getWeightRecommendation = () => {
    if (!assessment?.height || !assessment?.weight) return null;
    const heightMeters = assessment.height / 100;
    if (!heightMeters || heightMeters <= 0) return null;
    const idealMin = 18.5 * heightMeters * heightMeters;
    const idealMax = 24.9 * heightMeters * heightMeters;
    if (assessment.weight > idealMax) {
      const kgToLose = assessment.weight - idealMax;
      return { action: "lose", kg: kgToLose, range: [idealMin, idealMax] };
    }
    if (assessment.weight < idealMin) {
      const kgToGain = idealMin - assessment.weight;
      return { action: "gain", kg: kgToGain, range: [idealMin, idealMax] };
    }
    return { action: "maintain", kg: 0, range: [idealMin, idealMax] };
  };

  const bpInfo = getBPCategory();
  const weightRec = getWeightRecommendation();

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

  const downloadPDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * 5);
    };

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Heart Health Assessment Report", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Patient Information
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${assessment.name}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Age: ${assessment.age}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Gender: ${assessment.gender}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Report Date: ${new Date(assessment.created_at).toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    // Key Metrics
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Key Health Metrics", 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`BMI: ${assessment.bmi ? assessment.bmi.toFixed(1) : "N/A"} (${getBMICategory()})`, 20, yPosition);
    yPosition += 10;

    // Weight Recommendation
    if (weightRec) {
      if (weightRec.action === "lose") {
        doc.text(`Weight Recommendation: Lose ${weightRec.kg.toFixed(1)} kg (Ideal range: ${weightRec.range[0].toFixed(1)}-${weightRec.range[1].toFixed(1)} kg)`, 20, yPosition);
      } else if (weightRec.action === "gain") {
        doc.text(`Weight Recommendation: Gain ${weightRec.kg.toFixed(1)} kg (Ideal range: ${weightRec.range[0].toFixed(1)}-${weightRec.range[1].toFixed(1)} kg)`, 20, yPosition);
      } else {
        doc.text(`Weight Status: Maintain current weight (Ideal range: ${weightRec.range[0].toFixed(1)}-${weightRec.range[1].toFixed(1)} kg)`, 20, yPosition);
      }
      yPosition += 10;
    }

    doc.text(`Heart Age: ${assessment.heart_age || assessment.age || "N/A"} years`, 20, yPosition);
    yPosition += 10;
    doc.text(`Heart Risk Score: ${assessment.risk_score ? assessment.risk_score.toFixed(1) + "%" : "N/A"} (${getRiskCategory().level})`, 20, yPosition);
    yPosition += 10;
    doc.text(`Cardiovascular Score: ${calculateCardiovascularScore()} (${getCVRiskLevel().level})`, 20, yPosition);
    yPosition += 20;

    // Blood Pressure Analysis
    if (assessment.systolic && assessment.diastolic) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Blood Pressure Analysis", 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Current Reading: ${assessment.systolic}/${assessment.diastolic} mmHg`, 20, yPosition);
      yPosition += 10;
      doc.text(`Category: ${bpInfo.category}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Severity: ${bpInfo.label}`, 20, yPosition);
      yPosition += 10;
      if (bpInfo.detail) {
        yPosition = addWrappedText(`Details: ${bpInfo.detail}`, 20, yPosition, pageWidth - 40);
        yPosition += 10;
      }

      // BP Range Reference
      doc.setFont("helvetica", "bold");
      doc.text("Blood Pressure Ranges Reference:", 20, yPosition);
      yPosition += 10;
      doc.setFont("helvetica", "normal");
      doc.text("• Normal: < 120/80 mmHg", 30, yPosition);
      yPosition += 8;
      doc.text("• Elevated: 120-129/< 80 mmHg", 30, yPosition);
      yPosition += 8;
      doc.text("• High Blood Pressure Stage 1: 130-139/80-89 mmHg", 30, yPosition);
      yPosition += 8;
      doc.text("• High Blood Pressure Stage 2: ≥ 140/≥ 90 mmHg", 30, yPosition);
      yPosition += 8;
      doc.text("• Hypertensive Crisis: > 180/> 120 mmHg", 30, yPosition);
      yPosition += 20;
    }

    // Risk Analysis
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Risk Analysis", 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yPosition = addWrappedText(getHeartAgeMessage(), 20, yPosition, pageWidth - 40);
    yPosition += 10;

    // AI Insights Summary
    if (assessment.ai_insights?.summary) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("AI Health Summary", 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      yPosition = addWrappedText(assessment.ai_insights.summary, 20, yPosition, pageWidth - 40);
      yPosition += 20;
    }

    // Recommendations
    if (assessment.ai_insights?.recommendations && assessment.ai_insights.recommendations.length > 0) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Personalized Recommendations", 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      assessment.ai_insights.recommendations.forEach((rec, idx) => {
        let title = "";
        let description = "";

        if (typeof rec === "object" && rec !== null) {
          title = rec.title || "";
          description = rec.description || "";
        } else if (typeof rec === "string") {
          description = rec;
          title = `Recommendation ${idx + 1}`;
        }

        title = title.replace(/[{}\[\]"']/g, "").replace(/^(title|recommendations)\s*:\s*/i, "").trim();
        description = description.replace(/[{}\[\]"']/g, "").replace(/^description\s*:\s*/i, "").trim();

        if (title && description) {
          doc.setFont("helvetica", "bold");
          yPosition = addWrappedText(`${idx + 1}. ${title}`, 20, yPosition, pageWidth - 40);
          doc.setFont("helvetica", "normal");
          yPosition = addWrappedText(description, 30, yPosition, pageWidth - 50);
          yPosition += 10;
        }
      });
      yPosition += 10;
    }

    // Diet Plan
    if (assessment.ai_insights?.diet_plan) {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Diet Plan", 20, yPosition);
      yPosition += 15;

      if (assessment.ai_insights.diet_plan.summary) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        yPosition = addWrappedText(assessment.ai_insights.diet_plan.summary, 20, yPosition, pageWidth - 40);
        yPosition += 15;
      }

      // Foods to Eat
      if (assessment.ai_insights.diet_plan.foods_to_eat && Array.isArray(assessment.ai_insights.diet_plan.foods_to_eat)) {
        doc.setFont("helvetica", "bold");
        doc.text("Foods to Include:", 20, yPosition);
        yPosition += 10;

        doc.setFont("helvetica", "normal");
        assessment.ai_insights.diet_plan.foods_to_eat.forEach((food) => {
          doc.text(`• ${food}`, 30, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }

      // Foods to Avoid
      if (assessment.ai_insights.diet_plan.foods_to_avoid && Array.isArray(assessment.ai_insights.diet_plan.foods_to_avoid)) {
        doc.setFont("helvetica", "bold");
        doc.text("Foods to Limit/Avoid:", 20, yPosition);
        yPosition += 10;

        doc.setFont("helvetica", "normal");
        assessment.ai_insights.diet_plan.foods_to_avoid.forEach((food) => {
          doc.text(`• ${food}`, 30, yPosition);
          yPosition += 8;
        });
      }
    }

    // Patient Suggestions & Areas for Improvement
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Suggestions & Areas for Improvement", 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const suggestions = [];

    // BMI/Weight suggestions
    if (assessment.bmi) {
      if (assessment.bmi < 18.5) {
        suggestions.push(`• Weight Management: Your BMI indicates underweight status. Consider consulting a nutritionist for healthy weight gain strategies.`);
      } else if (assessment.bmi >= 25 && assessment.bmi < 30) {
        suggestions.push(`• Weight Management: Your BMI indicates overweight status. Aim to lose ${weightRec ? weightRec.kg.toFixed(1) : 'some'} kg through healthy diet and exercise.`);
      } else if (assessment.bmi >= 30) {
        suggestions.push(`• Weight Management: Your BMI indicates obesity. Consult a healthcare provider for a comprehensive weight management plan. Target weight loss of ${weightRec ? weightRec.kg.toFixed(1) : 'significant amount'} kg.`);
      }
    }

    // Blood Pressure suggestions
    if (bpInfo.category !== "Normal Blood Pressure" && bpInfo.category !== "High Normal Blood Pressure") {
      if (bpInfo.category.includes("High Blood Pressure")) {
        suggestions.push(`• Blood Pressure Control: Your blood pressure is in the ${bpInfo.category.toLowerCase()} range. Monitor regularly, reduce salt intake, and consult your doctor about medication if needed.`);
      } else if (bpInfo.category.includes("Low")) {
        suggestions.push(`• Blood Pressure Monitoring: Your blood pressure is lower than normal. Stay hydrated, avoid sudden position changes, and consult your doctor if you experience dizziness or fatigue.`);
      }
    }

    // Risk score suggestions
    const riskLevel = getRiskCategory().level;
    if (riskLevel === "High") {
      suggestions.push(`• Cardiovascular Risk: Your heart risk score is high. Schedule regular check-ups with a cardiologist and follow all recommended lifestyle changes.`);
    } else if (riskLevel === "Moderate") {
      suggestions.push(`• Cardiovascular Risk: Your heart risk score is moderate. Focus on preventive measures and regular health monitoring.`);
    }

    // Lifestyle suggestions
    if (assessment.smoking && assessment.smoking !== "Never") {
      suggestions.push(`• Smoking Cessation: Smoking significantly increases heart disease risk. Consider smoking cessation programs and consult your doctor for support.`);
    }

    if (assessment.exercise === "Sedentary" || assessment.exercise === "Light activity") {
      suggestions.push(`• Physical Activity: Increase your physical activity level. Aim for at least 150 minutes of moderate exercise per week.`);
    }

    if (assessment.diet === "Poor" || assessment.diet === "Average") {
      suggestions.push(`• Dietary Improvements: Focus on a heart-healthy diet rich in fruits, vegetables, whole grains, and lean proteins. Reduce processed foods and saturated fats.`);
    }

    // Symptom-based suggestions
    if (assessment.chest_pain) {
      suggestions.push(`• Chest Pain: Seek immediate medical attention for chest pain symptoms. Do not ignore this warning sign.`);
    }

    if (assessment.shortness_of_breath) {
      suggestions.push(`• Breathing Difficulties: Shortness of breath requires medical evaluation. Consult your doctor promptly.`);
    }

    if (assessment.dizziness) {
      suggestions.push(`• Dizziness: Frequent dizziness should be evaluated by a healthcare provider to rule out cardiovascular causes.`);
    }

    if (assessment.fatigue) {
      suggestions.push(`• Fatigue: Persistent fatigue may indicate underlying health issues. Discuss with your doctor.`);
    }

    // Lipid profile suggestions
    if (assessment.knows_lipids === "Yes") {
      if (assessment.ldl && assessment.ldl > 100) {
        suggestions.push(`• Cholesterol Management: Your LDL cholesterol is elevated. Follow dietary changes and consult your doctor about cholesterol-lowering medications.`);
      }
      if (assessment.hdl && assessment.hdl < 40) {
        suggestions.push(`• HDL Cholesterol: Your HDL (good) cholesterol is low. Focus on exercise and healthy fats to improve this.`);
      }
    }

    // Diabetes suggestions
    if (assessment.diabetes === "Yes" || (assessment.fasting_sugar && assessment.fasting_sugar > 100)) {
      suggestions.push(`• Blood Sugar Management: Monitor your blood sugar levels regularly and follow your diabetes management plan.`);
    }

    // Family history
    if (assessment.family_history) {
      suggestions.push(`• Family History: With a family history of heart disease, regular cardiovascular screening and preventive measures are essential.`);
    }

    // Additional symptoms
    if (assessment.swelling) {
      suggestions.push(`• Edema: Leg swelling should be evaluated to rule out heart-related causes.`);
    }

    if (assessment.palpitations) {
      suggestions.push(`• Heart Palpitations: Irregular heartbeats require medical evaluation. Keep a symptom diary and consult your cardiologist.`);
    }

    if (suggestions.length > 0) {
      suggestions.forEach((suggestion) => {
        yPosition = addWrappedText(suggestion, 20, yPosition, pageWidth - 40);
        yPosition += 5;
      });
    } else {
      doc.text("• No major concerns identified. Continue maintaining your current healthy lifestyle.", 20, yPosition);
      yPosition += 10;
    }

    yPosition += 15;

    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Generated by 10000hearts.com - AI-Powered Heart Health Assessment", pageWidth / 2, footerY, { align: "center" });

    // Save the PDF
    const fileName = `Heart_Health_Report_${assessment.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success("PDF report downloaded successfully!");
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Report Details - {new Date(assessment.created_at).toLocaleDateString()}
          </h2>
          <Button onClick={downloadPDFReport} className="bg-accent hover:bg-accent/90">
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
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
                    <p className="text-sm font-medium text-foreground">
                      Category: {bpInfo.category} ({bpInfo.label})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{bpInfo.detail}</p>
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
                  {bpInfo.category.includes("Normal") && assessment.systolic && assessment.systolic < 100 && (
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
                          {assessment.systolic}/{assessment.diastolic} - {bpInfo.category}
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

                {weightRec && weightRec.action !== "maintain" && (
                  <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Weight Adjustment</h4>
                        <p className="text-sm text-muted-foreground">
                          You should aim to {weightRec.action} approximately {Math.round(weightRec.kg * 10) / 10} kg to reach a healthy BMI range.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Target weight range: {weightRec.range[0].toFixed(1)} kg - {weightRec.range[1].toFixed(1)} kg
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
                          {assessment.systolic}/{assessment.diastolic} mmHg - {bpInfo.category}
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


