import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Activity } from "lucide-react";

export default function HeartHealthResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const assessment = location.state?.assessment;

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="mb-4">No assessment data found.</p>
          <Button onClick={() => navigate("/health-checkup")}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const getRiskLevel = (bmi, systolic, smoking) => {
    if (bmi > 30 || systolic > 140 || smoking === "current") return "High";
    if (bmi > 25 || systolic > 130 || smoking === "former") return "Medium";
    return "Low";
  };

  const riskLevel = getRiskLevel(assessment.bmi, assessment.systolic, assessment.smoking);
  const riskColor = riskLevel === "High" ? "text-destructive" : riskLevel === "Medium" ? "text-yellow-600" : "text-green-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/health-checkup")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Your Heart Health Report</h1>
                <p className="text-muted-foreground">Assessment completed</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {assessment.name}</p>
                  <p><span className="text-muted-foreground">Age:</span> {assessment.age}</p>
                  <p><span className="text-muted-foreground">Gender:</span> {assessment.gender}</p>
                  <p><span className="text-muted-foreground">Mobile:</span> {assessment.mobile}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Physical Metrics</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Height:</span> {assessment.height} cm</p>
                  <p><span className="text-muted-foreground">Weight:</span> {assessment.weight} kg</p>
                  <p><span className="text-muted-foreground">BMI:</span> {assessment.bmi}</p>
                  <p><span className="text-muted-foreground">Blood Pressure:</span> {assessment.systolic}/{assessment.diastolic} mmHg</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Lifestyle Factors</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Smoking:</span> {assessment.smoking}</p>
                  <p><span className="text-muted-foreground">Exercise:</span> {assessment.exercise}</p>
                  <p><span className="text-muted-foreground">Diet:</span> {assessment.diet}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Risk Assessment</h3>
                <div className="flex items-center gap-2">
                  <Activity className={`h-6 w-6 ${riskColor}`} />
                  <span className={`text-2xl font-bold ${riskColor}`}>{riskLevel} Risk</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on your health metrics and lifestyle factors
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Recommendations
            </h3>
            <ul className="space-y-2 text-sm">
              {assessment.bmi > 25 && (
                <li>• Consider a balanced diet and regular exercise to achieve a healthy BMI</li>
              )}
              {assessment.systolic > 130 && (
                <li>• Monitor your blood pressure regularly and consult with a healthcare provider</li>
              )}
              {assessment.smoking === "current" && (
                <li>• Quitting smoking significantly reduces cardiovascular risk</li>
              )}
              {assessment.exercise === "none" && (
                <li>• Aim for at least 150 minutes of moderate exercise per week</li>
              )}
              {riskLevel === "Low" && (
                <li>• Keep up the good work! Maintain your healthy lifestyle habits</li>
              )}
            </ul>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => navigate("/chat")} className="flex-1">
              Chat with AI Doctor
            </Button>
            <Button variant="outline" onClick={() => navigate("/heart-health")} className="flex-1">
              Take New Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
