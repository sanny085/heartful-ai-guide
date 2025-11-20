import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  const [showExistingReport, setShowExistingReport] = useState(false);
  const [heightUnit, setHeightUnit] = useState<"cm" | "inch">("cm");
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
        return formData.diet && formData.exercise;
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

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      toast.error("Please log in to take the heart health test");
      navigate("/auth");
      return;
    }

    // Load latest assessment data to pre-fill form
    const loadLatestAssessment = async () => {
      try {
        const { data, error } = await supabase
          .from("heart_health_assessments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setLatestAssessment(data);
          setShowExistingReport(true);
          setFormData({
            name: data.name || "",
            mobile: data.mobile || "",
            age: data.age?.toString() || "",
            gender: data.gender || "",
            height: data.height?.toString() || "",
            weight: data.weight?.toString() || "",
            diet: data.diet || "",
            exercise: data.exercise || "",
            sleepHours: data.sleep_hours?.toString() || "",
            smoking: data.smoking || "",
            tobacco: data.tobacco_use || [],
            knowsLipids: data.knows_lipids || "",
            highCholesterol: data.high_cholesterol || "",
            diabetes: data.diabetes || "",
            systolic: data.systolic?.toString() || "",
            diastolic: data.diastolic?.toString() || "",
            consent: false
          });
        }
      } catch (error) {
        console.error("Error loading latest assessment:", error);
      }
    };

    loadLatestAssessment();
  }, [user, navigate]);

  const calculateBMI = (height: number, weight: number) => {
    // Convert height to cm if in inches
    const heightInCm = heightUnit === "inch" ? height * 2.54 : height;
    // Height in cm, convert to meters
    const heightInMeters = heightInCm / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit and navigate to results
      await saveAssessment();
    }
  };

  const saveAssessment = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found. Please complete your profile setup.");
        navigate("/profile-setup");
        return;
      }

      // Calculate BMI if height and weight are provided
      const bmi = formData.height && formData.weight 
        ? calculateBMI(Number(formData.height), Number(formData.weight))
        : null;

      const assessmentData = {
        user_id: profile.user_id,
        name: formData.name,
        mobile: formData.mobile,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        diet: formData.diet,
        exercise: formData.exercise,
        sleep_hours: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
        smoking: formData.smoking,
        tobacco_use: formData.tobacco,
        knows_lipids: formData.knowsLipids,
        high_cholesterol: formData.highCholesterol,
        diabetes: formData.diabetes,
        systolic: formData.systolic ? parseInt(formData.systolic) : null,
        diastolic: formData.diastolic ? parseInt(formData.diastolic) : null,
        bmi: bmi
      };

      let assessmentId: string;

      // Always create a new assessment record
      const { data, error } = await supabase
        .from("heart_health_assessments")
        .insert(assessmentData)
        .select()
        .single();

      if (error) throw error;
      assessmentId = data.id;
      toast.success("New health report created successfully!");

      // Call edge function to generate AI insights
      const { error: insightsError } = await supabase.functions.invoke("generate-health-insights", {
        body: { assessmentId }
      });

      if (insightsError) {
        console.error("Error generating insights:", insightsError);
        toast.error("Assessment saved but insights generation failed");
      }

      navigate(`/heart-health-results?id=${assessmentId}`);
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter Age"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.gender}
                  onChange={(e) => updateFormData("gender", e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="height">Height ({heightUnit})</Label>
                  <div className="flex gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setHeightUnit("cm")}
                      className={`px-2 py-1 rounded ${heightUnit === "cm" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit("inch")}
                      className={`px-2 py-1 rounded ${heightUnit === "inch" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      inch
                    </button>
                  </div>
                </div>
                <Input
                  id="height"
                  type="number"
                  placeholder={`Enter Height in ${heightUnit}`}
                  value={formData.height}
                  onChange={(e) => updateFormData("height", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter Weight in kg"
                  value={formData.weight}
                  onChange={(e) => updateFormData("weight", e.target.value)}
                />
              </div>
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

            <div className="mt-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-health-lightBlue flex items-center justify-center">
                  <span className="text-2xl">🏃</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-6">How would you describe your physical activity?</h3>
              <div className="space-y-3">
                {[
                  "Sedentary - Little to no exercise",
                  "Light activity - Exercise 1-2 times per week",
                  "Moderate activity - Exercise 3-4 times per week",
                  "Active - Exercise 5-6 times per week",
                  "Very active - Exercise daily or intense workouts"
                ].map((option) => (
                  <Card
                    key={option}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      formData.exercise === option ? "border-accent bg-accent/5" : "border-border"
                    }`}
                    onClick={() => updateFormData("exercise", option)}
                  >
                    <p className="text-sm">{option}</p>
                  </Card>
                ))}
              </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-accent fill-accent" />
                <span className="text-2xl font-bold text-primary">10000Hearts</span>
              </div>
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
                aria-label="Go to home"
              >
                <Home className="w-6 h-6 text-primary" />
              </button>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Discover Your Heart Health : Begin Now!
              </h1>
              <p className="text-muted-foreground">
                {latestAssessment 
                  ? "Create a new report or view your latest assessment" 
                  : "Answer a few simple questions to reveal your heart age and cardiovascular risk."}
              </p>
            </div>

            {/* Show existing report option */}
            {showExistingReport && latestAssessment && (
              <Card className="p-4 bg-accent/10 border-accent/20">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">You have an existing health report</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(latestAssessment.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => navigate(`/heart-health-results?id=${latestAssessment.id}`)}
                      variant="default"
                      className="w-full"
                    >
                      View Your Report
                    </Button>
                    <Button
                      onClick={() => setShowExistingReport(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Take New Assessment
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Progress Steps */}
            {!showExistingReport && (
              <div className="space-y-4">
                {STEPS.map((step, index) => (
                  <div 
                    key={step} 
                    className={`flex items-center gap-3 ${
                      index <= currentStep ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => {
                      if (index <= currentStep) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        index === currentStep
                          ? "bg-accent text-white"
                          : index < currentStep
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < currentStep ? "✓" : index + 1}
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
            )}
          </div>

          {/* Main Content */}
          {!showExistingReport && (
            <Card className="p-8 shadow-lg">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-8">
                  Take the 10000Hearts Health Test
                </h2>

                {renderStepContent()}

                <div className="mt-8 flex gap-4">
                  {currentStep > 0 && (
                    <Button
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed() || saving}
                    className={`${currentStep === 0 ? 'w-full' : 'flex-1'} bg-accent hover:bg-accent/90 text-accent-foreground`}
                    size="lg"
                  >
                    {saving ? "Saving..." : currentStep < STEPS.length - 1 ? "Next" : "Create New Report"}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
