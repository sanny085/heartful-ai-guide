import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VoiceRecorder from "@/components/VoiceRecorder";
import { envConfig } from "@/lib/envApi";

const STEPS = [
  "Initial Symptoms",
  "Patient Details",
  "Diet & Activity",
  "Sleep & Tobacco",
  "Blood Pressure",
  "Blood Glucose",
  "Lipid Levels",
  "Additional Symptoms",
  "Personal Notes"
];

export default function HeartHealthAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [showExistingReport, setShowExistingReport] = useState(false);
  const [heightUnit, setHeightUnit] = useState("cm");
  const [formData, setFormData] = useState({
    // Initial symptoms
    chestPain: false,
    shortnessOfBreath: false,
    dizziness: false,
    fatigue: false,
    // Patient details
    name: "",
    mobile: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    // Lifestyle
    diet: "",
    exercise: "",
    sleepHours: "",
    smoking: "",
    tobacco: [],
    // Lipid levels
    knowsLipids: "",
    ldl: "",
    hdl: "",
    // Diabetes
    diabetes: "",
    fastingSugar: "",
    postMealSugar: "",
    // Blood pressure
    systolic: "",
    diastolic: "",
    pulse: "",
    // Additional symptoms
    swelling: false,
    palpitations: false,
    familyHistory: false,
    // User notes
    userNotes: "",
    consent: false
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetFormData = () => {
    localStorage.removeItem("heartHealthAssessmentDraft");
    setFormData({
      // Initial symptoms
      chestPain: false,
      shortnessOfBreath: false,
      dizziness: false,
      fatigue: false,
      // Patient details
      name: "",
      mobile: "",
      age: "",
      gender: "",
      height: "",
      weight: "",
      // Lifestyle
      diet: "",
      exercise: "",
      sleepHours: "",
      smoking: "",
      tobacco: [],
      // Lipid levels
      knowsLipids: "",
      ldl: "",
      hdl: "",
      // Diabetes
      diabetes: "",
      fastingSugar: "",
      postMealSugar: "",
      // Blood pressure
      systolic: "",
      diastolic: "",
      pulse: "",
      // Additional symptoms
      swelling: false,
      palpitations: false,
      familyHistory: false,
      // User notes
      userNotes: "",
      consent: false
    });
    setCurrentStep(0);
    setHeightUnit("cm");
  };

  const loadPreviousAssessment = () => {
    if (!latestAssessment) return;

    setFormData({
      // Initial symptoms
      chestPain: latestAssessment.chest_pain || false,
      shortnessOfBreath: latestAssessment.shortness_of_breath || false,
      dizziness: latestAssessment.dizziness || false,
      fatigue: latestAssessment.fatigue || false,
      // Patient details
      name: latestAssessment.name || "",
      mobile: latestAssessment.mobile || "",
      age: latestAssessment.age?.toString() || "",
      gender: latestAssessment.gender || "",
      height: latestAssessment.height?.toString() || "",
      weight: latestAssessment.weight?.toString() || "",
      // Lifestyle
      diet: latestAssessment.diet || "",
      exercise: latestAssessment.exercise || "",
      sleepHours: latestAssessment.sleep_hours?.toString() || "",
      smoking: latestAssessment.smoking || "",
      tobacco: latestAssessment.tobacco_use || [],
      // Lipid levels
      knowsLipids: latestAssessment.knows_lipids || "",
      ldl: latestAssessment.ldl?.toString() || "",
      hdl: latestAssessment.hdl?.toString() || "",
      // Diabetes
      diabetes: latestAssessment.diabetes || "",
      fastingSugar: latestAssessment.fasting_sugar?.toString() || "",
      postMealSugar: latestAssessment.post_meal_sugar?.toString() || "",
      // Blood pressure
      systolic: latestAssessment.systolic?.toString() || "",
      diastolic: latestAssessment.diastolic?.toString() || "",
      pulse: latestAssessment.pulse?.toString() || "",
      // Additional symptoms
      swelling: latestAssessment.swelling || false,
      palpitations: latestAssessment.palpitations || false,
      familyHistory: latestAssessment.family_history || false,
      // User notes
      userNotes: latestAssessment.user_notes || "",
      consent: false
    });
    setShowExistingReport(false);
    toast.success("Previous assessment data loaded. You can now update and submit.");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Symptoms are optional
      case 1: return formData.name && formData.mobile;
      case 2: return formData.diet && formData.exercise;
      case 3: return formData.sleepHours;
      case 4: return formData.systolic && formData.diastolic; // Blood Pressure
      case 5: return formData.diabetes; // Blood Glucose
      case 6: return formData.knowsLipids; // Lipid Levels
      case 7: return true; // Additional symptoms optional
      case 8: return true; // Notes optional
      default: return true;
    }
  };

  // Load draft from local storage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("heartHealthAssessmentDraft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Only load if we have valid data
        if (parsed.formData && Object.keys(parsed.formData).length > 0) {
          setFormData(parsed.formData);
          if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
          if (parsed.heightUnit) setHeightUnit(parsed.heightUnit);
          toast.info("Resumed from your saved draft");
        }
      } catch (e) {
        console.error("Failed to load draft", e);
        localStorage.removeItem("heartHealthAssessmentDraft");
      }
    }
  }, []); // Only run once on mount

  // Save to local storage whenever state changes
  useEffect(() => {
    // Debounce or just save directly (localstorage is fast enough for this amount of data)
    const draft = {
      formData,
      currentStep,
      heightUnit
    };
    localStorage.setItem("heartHealthAssessmentDraft", JSON.stringify(draft));
  }, [formData, currentStep, heightUnit]);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to take the heart health test");
      navigate("/auth");
      return;
    }

    const loadLatestAssessment = async () => {
      try {
        const { data, error } = await supabase
          .from(envConfig.heart_health_assessments)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setLatestAssessment(data);
          setShowExistingReport(true);
          // Removed form pre-filling to ensure clean form for new assessments
        }
      } catch (error) {
        console.error("Error loading latest assessment:", error);
      }
    };

    loadLatestAssessment();
  }, [user, navigate]);

  const calculateBMI = (height, weight) => {
    const heightInCm = heightUnit === "inch" ? height * 2.54 : height;
    const heightInMeters = heightInCm / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await saveAssessment();
    }
  };

  const saveAssessment = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { data: profile } = await supabase
        .from(envConfig.profiles)
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found. Please complete your profile setup.");
        navigate("/profile");
        return;
      }

      const bmi = formData.height && formData.weight
        ? calculateBMI(Number(formData.height), Number(formData.weight))
        : null;

      const assessmentData = {
        user_id: profile.user_id,
        // Initial symptoms
        chest_pain: formData.chestPain,
        shortness_of_breath: formData.shortnessOfBreath,
        dizziness: formData.dizziness,
        fatigue: formData.fatigue,
        // Patient details
        name: formData.name,
        mobile: formData.mobile,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        // Lifestyle
        diet: formData.diet,
        exercise: formData.exercise,
        sleep_hours: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
        smoking: formData.smoking,
        tobacco_use: formData.tobacco,
        // Lipids
        knows_lipids: formData.knowsLipids,
        ldl: formData.ldl ? parseInt(formData.ldl) : null,
        hdl: formData.hdl ? parseInt(formData.hdl) : null,
        // Diabetes
        diabetes: formData.diabetes,
        fasting_sugar: formData.fastingSugar ? parseInt(formData.fastingSugar) : null,
        post_meal_sugar: formData.postMealSugar ? parseInt(formData.postMealSugar) : null,
        // Blood pressure
        systolic: formData.systolic ? parseInt(formData.systolic) : null,
        diastolic: formData.diastolic ? parseInt(formData.diastolic) : null,
        pulse: formData.pulse ? parseInt(formData.pulse) : null,
        // Additional symptoms
        swelling: formData.swelling,
        palpitations: formData.palpitations,
        family_history: formData.familyHistory,
        // User notes
        user_notes: formData.userNotes,
        bmi: bmi
      };

      const { data, error } = await supabase
        .from(envConfig.heart_health_assessments)
        .insert(assessmentData)
        .select()
        .single();

      if (error) throw error;
      toast.success("New health report created successfully!");

      const { error: insightsError } = await supabase.functions.invoke("generate-health-insights", {
        body: { assessmentId: data.id }
      });

      if (insightsError) {
        console.error("Error generating insights:", insightsError);
        toast.error("Assessment saved but insights generation failed");
      } else {
        toast.success("Health insights generated successfully!");
      }

      // Reset form data after successful submission
      resetFormData();

      navigate(`/heart-health-results?id=${data.id}`);
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
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Initial Symptoms</h3>
              <p className="text-muted-foreground">Are you experiencing any of these symptoms?</p>
            </div>

            <div className="space-y-4">
              <Card className={`p-4 cursor-pointer transition-all ${formData.chestPain ? "border-accent bg-accent/5" : ""}`}
                onClick={() => updateFormData("chestPain", !formData.chestPain)}>
                <div className="flex items-center justify-between">
                  <span>Chest pain or discomfort</span>
                  <Checkbox checked={formData.chestPain} />
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer transition-all ${formData.shortnessOfBreath ? "border-accent bg-accent/5" : ""}`}
                onClick={() => updateFormData("shortnessOfBreath", !formData.shortnessOfBreath)}>
                <div className="flex items-center justify-between">
                  <span>Shortness of breath</span>
                  <Checkbox checked={formData.shortnessOfBreath} />
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer transition-all ${formData.dizziness ? "border-accent bg-accent/5" : ""}`}
                onClick={() => updateFormData("dizziness", !formData.dizziness)}>
                <div className="flex items-center justify-between">
                  <span>Dizziness or fainting</span>
                  <Checkbox checked={formData.dizziness} />
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer transition-all ${formData.fatigue ? "border-accent bg-accent/5" : ""}`}
                onClick={() => updateFormData("fatigue", !formData.fatigue)}>
                <div className="flex items-center justify-between">
                  <span>Tiredness or fatigue</span>
                  <Checkbox checked={formData.fatigue} />
                </div>
              </Card>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold">Patient Details</h3>
            </div>

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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                      className={`px-2 py-1 rounded ${heightUnit === "cm" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeightUnit("inch")}
                      className={`px-2 py-1 rounded ${heightUnit === "inch" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
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
                  I agree to be contacted by 10000Hearts through call, email, WhatsApp, SMS
                </Label>
              </div>
            )}
          </div>
        );

      case 2:
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
                "Mostly high-carb foods, occasional vegetables or fruits",
                "Both high and low carb foods equally with moderate consumption of fruits and vegetables",
                "Limit or restrict high-carb foods most of the time and consume vegetables, sprouts and fruits regularly",
                "Balanced diet all the time",
                "Have irregular dietary patterns"
              ].map((option) => (
                <Card
                  key={option}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${formData.diet === option ? "border-accent bg-accent/5" : "border-border"
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
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${formData.exercise === option ? "border-accent bg-accent/5" : "border-border"
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

      case 3:
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

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">Blood Pressure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systolic">Systolic (Upper Number)</Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="e.g., 120"
                  value={formData.systolic}
                  onChange={(e) => updateFormData("systolic", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Diastolic (Lower Number)</Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="e.g., 80"
                  value={formData.diastolic}
                  onChange={(e) => updateFormData("diastolic", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <Label htmlFor="pulse">Pulse Rate (bpm)</Label>
              <Input
                id="pulse"
                type="number"
                placeholder="e.g., 72"
                value={formData.pulse}
                onChange={(e) => updateFormData("pulse", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Normal resting pulse: 60-100 bpm</p>
            </div>
            <p className="text-sm text-muted-foreground text-center">Normal BP: &lt;120/80 mmHg</p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">Blood Glucose Levels</h3>
            <div className="space-y-2">
              <Label>Do you have diabetes?</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={formData.diabetes === "yes" ? "default" : "outline"}
                  onClick={() => updateFormData("diabetes", "yes")}
                  className="flex-1"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={formData.diabetes === "no" ? "default" : "outline"}
                  onClick={() => updateFormData("diabetes", "no")}
                  className="flex-1"
                >
                  No
                </Button>
              </div>
            </div>

            {formData.diabetes === "yes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fasting">Fasting Sugar (before food) mg/dL</Label>
                  <Input
                    id="fasting"
                    type="number"
                    placeholder="Enter fasting sugar"
                    value={formData.fastingSugar}
                    onChange={(e) => updateFormData("fastingSugar", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Normal: 70-100 mg/dL</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postmeal">Post-meal Sugar (after food) mg/dL</Label>
                  <Input
                    id="postmeal"
                    type="number"
                    placeholder="Enter post-meal sugar"
                    value={formData.postMealSugar}
                    onChange={(e) => updateFormData("postMealSugar", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Normal: &lt;140 mg/dL</p>
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center mb-6">Lipid Levels</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Do you know your lipid levels?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.knowsLipids === "yes" ? "default" : "outline"}
                    onClick={() => updateFormData("knowsLipids", "yes")}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={formData.knowsLipids === "no" ? "default" : "outline"}
                    onClick={() => updateFormData("knowsLipids", "no")}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>

              {formData.knowsLipids === "yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="ldl">LDL (Bad Cholesterol) mg/dL</Label>
                    <Input
                      id="ldl"
                      type="number"
                      placeholder="Enter LDL value"
                      value={formData.ldl}
                      onChange={(e) => updateFormData("ldl", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Normal: &lt;100 mg/dL</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hdl">HDL (Good Cholesterol) mg/dL</Label>
                    <Input
                      id="hdl"
                      type="number"
                      placeholder="Enter HDL value"
                      value={formData.hdl}
                      onChange={(e) => updateFormData("hdl", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Normal: &gt;40 mg/dL (men), &gt;50 mg/dL (women)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Additional Symptoms</h3>
              <p className="text-muted-foreground">Any other symptoms you're experiencing?</p>
            </div>

            <div className="space-y-4">
              <Card className={`p-4 cursor-pointer transition-all ${formData.swelling ? "border-accent bg-accent/5" : ""}`}
                onClick={() => updateFormData("swelling", !formData.swelling)}>
                <div className="flex items-center justify-between">
                  <span>Swelling in legs or feet</span>
                  <Checkbox checked={formData.swelling} />
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer transition-all ${formData.palpitations ? "border-accent bg-accent/5" : ""}`}
                onClick={() => updateFormData("palpitations", !formData.palpitations)}>
                <div className="flex items-center justify-between">
                  <span>Irregular heartbeat or palpitations</span>
                  <Checkbox checked={formData.palpitations} />
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer transition-all ${formData.familyHistory ? "border-accent bg-accent/5" : ""}`}
                onClick={() => updateFormData("familyHistory", !formData.familyHistory)}>
                <div className="flex items-center justify-between">
                  <span>Family history of heart disease</span>
                  <Checkbox checked={formData.familyHistory} />
                </div>
              </Card>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Share Additional Information</h3>
              <p className="text-muted-foreground">Tell us anything else about your health</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Health Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Share any health concerns, medications, or relevant information..."
                  value={formData.userNotes}
                  onChange={(e) => updateFormData("userNotes", e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="border-t pt-4">
                <Label className="mb-2 block">Or Record a Voice Note</Label>
                <VoiceRecorder
                  onTranscriptionComplete={(text) => {
                    const newNotes = formData.userNotes
                      ? `${formData.userNotes}\n\n${text}`
                      : text;
                    updateFormData("userNotes", newNotes);
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Your voice will be converted to text automatically
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showExistingReport && latestAssessment) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="p-8 text-center">
            <Heart className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
            <p className="text-muted-foreground mb-6">
              You have an existing health report from {new Date(latestAssessment.created_at).toLocaleDateString()}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate(`/heart-health-results?id=${latestAssessment.id}`)}>
                View Latest Report
              </Button>
              <Button variant="outline" onClick={loadPreviousAssessment}>
                Continue from Previous Assessment
              </Button>
              <Button variant="outline" onClick={() => setShowExistingReport(false)}>
                Start Fresh Assessment
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid lg:grid-cols-[300px_1fr] min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-card border-r">
          <div className="p-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-accent" />
                <h2 className="text-lg font-semibold">Heart Health Assessment</h2>
              </div>

              {STEPS.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${index === currentStep
                      ? "bg-accent/10 border-l-4 border-accent"
                      : index < currentStep
                        ? "bg-muted/50"
                        : ""
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium
                    ${index === currentStep ? "bg-accent text-accent-foreground" :
                      index < currentStep ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
                    {index < currentStep ? "✓" : index + 1}
                  </div>
                  <span className={`text-sm ${index === currentStep ? "font-semibold" : ""}`}>{step}</span>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="p-6 lg:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="lg:hidden mb-6">
              <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                <Home className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{STEPS[currentStep]}</h2>
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1}/{STEPS.length}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <Card className="p-8">
              {renderStepContent()}

              <div className="flex justify-between items-center mt-8 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset the form? All entered data will be cleared.")) {
                      resetFormData();
                      toast.success("Form has been reset");
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Reset Form
                </Button>
                <span className="text-xs text-muted-foreground">
                  Clear all data and start over
                </span>
              </div>

              <div className="flex gap-4">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : currentStep === STEPS.length - 1 ? "Generate Report" : "Next"}
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


