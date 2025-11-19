import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessment } = await req.json();

    // Calculate heart age and risk score
    const heartAge = calculateHeartAge(assessment);
    const riskScore = calculateRiskScore(assessment);

    // Generate AI insights
    const prompt = `You are a compassionate health advisor. Based on this health assessment data, provide personalized insights and recommendations:

BMI: ${assessment.bmi?.toFixed(1) || "N/A"}
Blood Pressure: ${assessment.systolic}/${assessment.diastolic} mmHg
Diet: ${assessment.diet}
Exercise: ${assessment.exercise || "Not specified"}
Sleep: ${assessment.sleep_hours} hours
Smoking: ${assessment.smoking}
Diabetes: ${assessment.diabetes}
Age: ${assessment.age || "Not specified"}

Provide:
1. A brief summary (2-3 sentences) of their overall health status
2. 4-5 specific, actionable recommendations to improve heart health

Keep the tone encouraging and supportive. Format as JSON with "summary" and "recommendations" array.`;

    const response = await fetch("https://api.lovable.app/v1/chat/completions", {
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
      throw new Error(`Lovable AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    // Try to parse as JSON, fallback to creating structure
    let insights;
    try {
      insights = JSON.parse(aiContent);
    } catch {
      insights = {
        summary: aiContent.split("\n")[0],
        recommendations: aiContent.split("\n").filter((line: string) => line.trim().length > 0).slice(1)
      };
    }

    return new Response(
      JSON.stringify({
        insights,
        heart_age: heartAge,
        risk_score: riskScore
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
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

  // Diabetes impact
  if (assessment.diabetes === "yes") ageModifier += 8;

  // Sleep impact
  if (assessment.sleep_hours < 6 || assessment.sleep_hours > 9) ageModifier += 3;

  // Diet impact (simplified)
  if (assessment.diet?.includes("high-carb") || assessment.diet?.includes("irregular")) {
    ageModifier += 4;
  }

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
  if (assessment.diabetes === "yes") score += 15;

  // Sleep risk (0-10 points)
  if (assessment.sleep_hours < 5 || assessment.sleep_hours > 10) score += 10;
  else if (assessment.sleep_hours < 6 || assessment.sleep_hours > 9) score += 5;

  return Math.min(100, score); // Cap at 100
}
