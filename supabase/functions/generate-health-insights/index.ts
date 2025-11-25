import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentId } = await req.json();

    if (!assessmentId) {
      throw new Error("assessmentId is required");
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load assessment from database
    const { data: assessment, error: fetchError } = await supabase
      .from("heart_health_assessments")
      .select("*")
      .eq("id", assessmentId)
      .single();

    if (fetchError || !assessment) {
      throw new Error("Assessment not found");
    }

    console.log("Loaded assessment:", assessment.id);

    // Calculate heart age and risk score
    const heartAge = calculateHeartAge(assessment);
    const riskScore = calculateRiskScore(assessment);

    console.log("Calculated heart age:", heartAge, "risk score:", riskScore);

    // Generate comprehensive AI insights including diet plan
    const symptomsText = [
      assessment.chest_pain && "chest pain",
      assessment.shortness_of_breath && "shortness of breath",
      assessment.dizziness && "dizziness",
      assessment.fatigue && "fatigue",
      assessment.swelling && "leg/feet swelling",
      assessment.palpitations && "palpitations",
      assessment.family_history && "family history of heart disease"
    ].filter(Boolean).join(", ") || "none reported";

    const lipidInfo = assessment.ldl && assessment.hdl 
      ? `LDL: ${assessment.ldl} mg/dL, HDL: ${assessment.hdl} mg/dL`
      : "Lipid levels not provided";
    
    const diabetesInfo = assessment.diabetes === "yes" && assessment.fasting_sugar && assessment.post_meal_sugar
      ? `Fasting: ${assessment.fasting_sugar} mg/dL, Post-meal: ${assessment.post_meal_sugar} mg/dL`
      : assessment.diabetes === "yes" ? "Has diabetes (levels not specified)" : "No diabetes";

    const prompt = `You are a compassionate health advisor. Based on this comprehensive health assessment, provide personalized insights and a diet plan:

PATIENT PROFILE:
Age: ${assessment.age || "Not specified"}
Gender: ${assessment.gender || "Not specified"}
BMI: ${assessment.bmi?.toFixed(1) || "N/A"}

SYMPTOMS: ${symptomsText}

VITALS & LAB VALUES:
Blood Pressure: ${assessment.systolic}/${assessment.diastolic} mmHg
${lipidInfo}
${diabetesInfo}

LIFESTYLE:
Diet: ${assessment.diet || "Not specified"}
Exercise: ${assessment.exercise || "Not specified"}
Sleep: ${assessment.sleep_hours} hours per night
Smoking: ${assessment.smoking || "Not specified"}

USER NOTES: ${assessment.user_notes || "None provided"}

CALCULATED METRICS:
Heart Age: ${heartAge} years (Actual: ${assessment.age})
Risk Score: ${riskScore}%

Provide a comprehensive assessment with:
1. A brief summary (3-4 sentences) describing overall health status in an encouraging tone
2. 4-5 specific, actionable recommendations for improving heart health
3. Cholesterol interpretation with status (Normal/Borderline/High) and specific advice
4. A personalized diet plan with specific foods to eat and avoid based on their conditions
5. If risk score is above 10%, include specific do's and don'ts

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "summary": "Brief encouraging health status summary",
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed actionable advice"
    }
  ],
  "cholesterol_status": "Normal|Borderline|High",
  "cholesterol_advice": "Specific advice about cholesterol management",
  "diet_plan": {
    "summary": "Brief overview of recommended diet approach",
    "foods_to_eat": ["Specific food 1", "Specific food 2", "..."],
    "foods_to_avoid": ["Specific food 1", "Specific food 2", "..."],
    "meal_suggestions": ["Breakfast idea", "Lunch idea", "Dinner idea"]
  },
  "dos": ["Specific action to do"],
  "donts": ["Specific action to avoid"]
}

Keep tone warm, professional, and motivating. Focus on practical, achievable actions tailored to their specific conditions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      throw new Error(`Lovable AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let aiContent = data.choices[0].message.content;
    
    console.log("Raw AI response:", aiContent);

    // Remove markdown code blocks only
    aiContent = aiContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    console.log("After markdown removal:", aiContent);

    // Try to parse as JSON
    let insights;
    try {
      insights = JSON.parse(aiContent);
      
      // Validate and clean the structure
      if (!insights.summary || !insights.recommendations || !Array.isArray(insights.recommendations)) {
        throw new Error("Invalid structure");
      }
      
      // Clean up recommendations array
      insights.recommendations = insights.recommendations
        .filter((rec: any) => rec && typeof rec === 'object' && rec.title && rec.description)
        .map((rec: any) => ({
          title: rec.title.trim(),
          description: rec.description.trim()
        }));

      // Ensure diet_plan structure exists
      if (insights.diet_plan && typeof insights.diet_plan === 'object') {
        insights.diet_plan.foods_to_eat = Array.isArray(insights.diet_plan.foods_to_eat) ? insights.diet_plan.foods_to_eat : [];
        insights.diet_plan.foods_to_avoid = Array.isArray(insights.diet_plan.foods_to_avoid) ? insights.diet_plan.foods_to_avoid : [];
        insights.diet_plan.meal_suggestions = Array.isArray(insights.diet_plan.meal_suggestions) ? insights.diet_plan.meal_suggestions : [];
      }
      
      console.log("Successfully parsed insights with", insights.recommendations.length, "recommendations");
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Create a structured fallback
      const lines = aiContent.split("\n").filter((line: string) => line.trim().length > 0);
      insights = {
        summary: lines[0] || "Based on your assessment, we have generated personalized recommendations for you.",
        recommendations: lines.slice(1).map((line: string, idx: number) => ({
          title: `Recommendation ${idx + 1}`,
          description: line.replace(/^[-*]\s*/, "").trim()
        }))
      };
    }

    // Extract diet plan from insights to store separately
    const dietPlan = insights.diet_plan ? JSON.stringify(insights.diet_plan) : null;

    // Update assessment with calculated values, insights, and diet plan
    const { error: updateError } = await supabase
      .from("heart_health_assessments")
      .update({
        heart_age: heartAge,
        risk_score: riskScore,
        ai_insights: insights,
        diet_plan: dietPlan
      })
      .eq("id", assessmentId);

    if (updateError) {
      console.error("Error updating assessment:", updateError);
      throw updateError;
    }

    console.log("Successfully updated assessment with insights");

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        heart_age: heartAge,
        risk_score: riskScore
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-health-insights:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculateHeartAge(assessment: any): number {
  const actualAge = assessment.age || 30;
  let ageModifier = 0;

  // BMI impact
  if (assessment.bmi) {
    if (assessment.bmi > 30) ageModifier += 8;
    else if (assessment.bmi > 25) ageModifier += 4;
    else if (assessment.bmi < 18.5) ageModifier += 3;
  }

  // Blood pressure impact
  if (assessment.systolic && assessment.diastolic) {
    if (assessment.systolic >= 140 || assessment.diastolic >= 90) ageModifier += 10;
    else if (assessment.systolic >= 130 || assessment.diastolic >= 80) ageModifier += 5;
  }

  // Smoking impact
  if (assessment.smoking === "regularly") ageModifier += 10;
  else if (assessment.smoking === "occasionally") ageModifier += 5;

  // Diabetes impact - enhanced with sugar levels
  if (assessment.diabetes === "yes") {
    ageModifier += 8;
    if (assessment.fasting_sugar > 125 || assessment.post_meal_sugar > 180) ageModifier += 5;
  }

  // Lipid impact
  if (assessment.ldl > 160 || (assessment.hdl && assessment.hdl < 40)) ageModifier += 5;

  // Sleep impact
  if (assessment.sleep_hours < 6 || assessment.sleep_hours > 9) ageModifier += 3;

  // Diet impact
  if (assessment.diet?.includes("high-carb") || assessment.diet?.includes("irregular")) {
    ageModifier += 4;
  }

  // Symptoms impact
  if (assessment.chest_pain) ageModifier += 3;
  if (assessment.shortness_of_breath) ageModifier += 3;
  if (assessment.palpitations) ageModifier += 2;
  if (assessment.family_history) ageModifier += 5;

  return Math.max(actualAge, actualAge + ageModifier);
}

function calculateRiskScore(assessment: any): number {
  let score = 0;

  // BMI risk (0-25 points)
  if (assessment.bmi) {
    if (assessment.bmi > 35) score += 25;
    else if (assessment.bmi > 30) score += 20;
    else if (assessment.bmi > 25) score += 10;
    else if (assessment.bmi < 18.5) score += 8;
  }

  // Blood pressure risk (0-30 points)
  if (assessment.systolic && assessment.diastolic) {
    if (assessment.systolic >= 180 || assessment.diastolic >= 120) score += 30;
    else if (assessment.systolic >= 140 || assessment.diastolic >= 90) score += 20;
    else if (assessment.systolic >= 130 || assessment.diastolic >= 80) score += 10;
  }

  // Smoking risk (0-20 points)
  if (assessment.smoking === "regularly") score += 20;
  else if (assessment.smoking === "occasionally") score += 10;

  // Diabetes risk (0-15 points)
  if (assessment.diabetes === "yes") {
    score += 15;
    // Additional risk for uncontrolled diabetes
    if (assessment.fasting_sugar > 125 || assessment.post_meal_sugar > 180) score += 5;
  }

  // Lipid risk (0-15 points)
  if (assessment.ldl) {
    if (assessment.ldl > 190) score += 15;
    else if (assessment.ldl > 160) score += 10;
    else if (assessment.ldl > 130) score += 5;
  }
  if (assessment.hdl && assessment.hdl < 40) score += 5;

  // Sleep risk (0-10 points)
  if (assessment.sleep_hours < 5 || assessment.sleep_hours > 10) score += 10;
  else if (assessment.sleep_hours < 6 || assessment.sleep_hours > 9) score += 5;

  // Symptoms risk (0-15 points)
  if (assessment.chest_pain) score += 5;
  if (assessment.shortness_of_breath) score += 4;
  if (assessment.palpitations) score += 3;
  if (assessment.swelling) score += 3;
  
  // Family history (0-10 points)
  if (assessment.family_history) score += 10;

  return Math.min(100, score); // Cap at 100
}
