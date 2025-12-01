import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

// Assessment form route - should show a form to collect assessment data
// Since the user mentioned the codebase already has the form code,
// this component should display that form view
const HeartHealthAssessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // For now, show a placeholder that indicates the form should be here
  // The actual form component should be integrated here
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

        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center space-y-4">
            <Heart className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Heart Health Assessment</h1>
            <p className="text-muted-foreground">
              The assessment form should be displayed here. 
              Please integrate your existing form component or create one based on the database schema.
            </p>
            <p className="text-sm text-muted-foreground">
              The form should collect: age, gender, height, weight, lifestyle data, 
              medical history, blood pressure, symptoms, and other assessment fields.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HeartHealthAssessment;


