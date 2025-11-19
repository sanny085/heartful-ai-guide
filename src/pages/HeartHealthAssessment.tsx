import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  "Profile",
  "Diet & Activity",
  "Sleep Patterns & Tobacco Use",
  "Lipid Levels",
  "Blood Glucose Levels",
  "Blood Pressure Levels"
];

export default function HeartHealthAssessment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    diet: "",
    exercise: "",
    sleepHours: "",
    smoking: "",
    tobacco: [],
    knowsLipids: "",
    highCholesterol: "",
    diabetes: "",
    systolic: "",
    diastolic: "",
    consent: false
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.mobile;
      case 1:
        return formData.diet;
      case 2:
        return formData.sleepHours;
      case 3:
        return formData.knowsLipids;
      case 4:
        return formData.diabetes;
      case 5:
        return formData.systolic && formData.diastolic;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit and navigate to results
      navigate("/heart-health-results");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile No*</Label>
              <Input
                id="mobile"
                placeholder="Enter Mobile no."
                value={formData.mobile}
                onChange={(e) => updateFormData("mobile", e.target.value)}
              />
            </div>
            {formData.name && formData.mobile && (
              <div className="flex items-start space-x-3 pt-4">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => updateFormData("consent", checked)}
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  I agree to be contacted by 10000Hearts through call, email, WhatsApp, SMS and to be added to 10000Hearts WhatsApp group
                </Label>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-health-lightBlue flex items-center justify-center">
                <span className="text-2xl">🍎</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-6">How would you define your diet?</h3>
            <div className="space-y-3">
              {[
                "I mostly choose high-carb foods, ocassional vegetables or fruits",
                "I choose both high and low carb foods equally with moderate consumption of fruits and vegetables",
                "I limit or restrict high-carb foods most of the time and consume vegetables, sprouts and fruits regularly",
                "I choose a balanced diet all the time",
                "I have irregular dietary patterns"
              ].map((option) => (
                <Card
                  key={option}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    formData.diet === option ? "border-accent bg-accent/5" : "border-border"
                  }`}
                  onClick={() => updateFormData("diet", option)}
                >
                  <p className="text-sm">{option}</p>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sleep">Average Sleep Hours per Night</Label>
              <Input
                id="sleep"
                type="number"
                placeholder="Enter hours"
                value={formData.sleepHours}
                onChange={(e) => updateFormData("sleepHours", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smoking">Do you smoke?</Label>
              <select
                id="smoking"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.smoking}
                onChange={(e) => updateFormData("smoking", e.target.value)}
              >
                <option value="">Select</option>
                <option value="never">Never</option>
                <option value="occasionally">Occasionally</option>
                <option value="regularly">Regularly</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">Lipid Levels</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Do you know your lipid levels?</Label>
                <div className="flex gap-4">
                  <Button
                    variant={formData.knowsLipids === "yes" ? "default" : "outline"}
                    onClick={() => updateFormData("knowsLipids", "yes")}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={formData.knowsLipids === "no" ? "default" : "outline"}
                    onClick={() => updateFormData("knowsLipids", "no")}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Have you been told you have high cholesterol?</Label>
                <div className="flex gap-4">
                  <Button
                    variant={formData.highCholesterol === "yes" ? "default" : "outline"}
                    onClick={() => updateFormData("highCholesterol", "yes")}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={formData.highCholesterol === "no" ? "default" : "outline"}
                    onClick={() => updateFormData("highCholesterol", "no")}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">Blood Glucose Levels</h3>
            <div className="space-y-2">
              <Label>Do you have diabetes?</Label>
              <div className="flex gap-4">
                <Button
                  variant={formData.diabetes === "yes" ? "default" : "outline"}
                  onClick={() => updateFormData("diabetes", "yes")}
                  className="flex-1"
                >
                  Yes
                </Button>
                <Button
                  variant={formData.diabetes === "no" ? "default" : "outline"}
                  onClick={() => updateFormData("diabetes", "no")}
                  className="flex-1"
                >
                  No
                </Button>
                <Button
                  variant={formData.diabetes === "never_tested" ? "default" : "outline"}
                  onClick={() => updateFormData("diabetes", "never_tested")}
                  className="flex-1"
                >
                  Never Tested
                </Button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">Blood Pressure Levels</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systolic">Systolic (mmHg)</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="Enter systolic pressure"
                  value={formData.systolic}
                  onChange={(e) => updateFormData("systolic", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="Enter diastolic pressure"
                  value={formData.diastolic}
                  onChange={(e) => updateFormData("diastolic", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-health-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Left Sidebar */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-accent fill-accent" />
              <span className="text-2xl font-bold text-primary">10000Hearts</span>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Discover Your Heart Health : Begin Now!
              </h1>
              <p className="text-muted-foreground">
                Answer a few simple questions to reveal your heart age and cardiovascular risk.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-4">
              {STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      index === currentStep
                        ? "bg-accent text-white"
                        : index < currentStep
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? "✓" : ""}
                  </div>
                  <span
                    className={`text-sm ${
                      index === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <Card className="p-8 shadow-lg">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Take the Fitterfly Heart Health Test</h2>

              {renderStepContent()}

              <div className="mt-8">
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  {currentStep < STEPS.length - 1 ? "Next" : "View Results"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
