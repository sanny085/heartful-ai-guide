import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function HeartHealthAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    systolic: "",
    diastolic: "",
    smoking: "",
    exercise: "",
    diet: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bmi = (parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1);
      
      const { data, error } = await supabase
        .from("heart_health_assessments")
        .insert({
          user_id: user.id,
          name: formData.name,
          mobile: formData.mobile,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          bmi: parseFloat(bmi),
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
          smoking: formData.smoking,
          exercise: formData.exercise,
          diet: formData.diet,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Assessment submitted successfully!");
      navigate("/heart-health-results", { state: { assessment: data } });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/health-checkup")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Heart Health Assessment</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
            <div className="w-full bg-muted h-2 rounded-full mt-4">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="systolic">Blood Pressure - Systolic</Label>
                  <Input
                    id="systolic"
                    name="systolic"
                    type="number"
                    value={formData.systolic}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="diastolic">Blood Pressure - Diastolic</Label>
                  <Input
                    id="diastolic"
                    name="diastolic"
                    type="number"
                    value={formData.diastolic}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="smoking">Smoking Status</Label>
                  <select
                    id="smoking"
                    name="smoking"
                    value={formData.smoking}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="never">Never</option>
                    <option value="former">Former</option>
                    <option value="current">Current</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="exercise">Exercise Frequency</Label>
                  <select
                    id="exercise"
                    name="exercise"
                    value={formData.exercise}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    required
                  >
                    <option value="">Select frequency</option>
                    <option value="none">None</option>
                    <option value="1-2 times/week">1-2 times/week</option>
                    <option value="3-4 times/week">3-4 times/week</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="diet">Diet Quality</Label>
                  <select
                    id="diet"
                    name="diet"
                    value={formData.diet}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    required
                  >
                    <option value="">Select diet quality</option>
                    <option value="poor">Poor</option>
                    <option value="average">Average</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={handleNext} className="ml-auto">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="ml-auto">
                  {loading ? "Submitting..." : "Submit Assessment"}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
