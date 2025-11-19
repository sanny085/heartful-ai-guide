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

    // Generate AI insights
    const prompt = `You are a compassionate health advisor. Based on this health assessment data, provide personalized insights and recommendations:

BMI: ${assessment.bmi?.toFixed(1) || "N/A"}
Blood Pressure: ${assessment.systolic}/${assessment.diastolic} mmHg
Diet: ${assessment.diet || "Not specified"}
Exercise: ${assessment.exercise || "Not specified"}
Sleep: ${assessment.sleep_hours} hours
Smoking: ${assessment.smoking || "Not specified"}
Diabetes: ${assessment.diabetes || "Not specified"}
Age: ${assessment.age || "Not specified"}
Gender: ${assessment.gender || "Not specified"}

Provide a comprehensive health assessment with:
1. A brief summary (3-4 sentences) describing their overall health status in an encouraging, supportive tone
2. 4-5 specific, actionable recommendations for improving heart health

Return ONLY valid JSON (no markdown formatting, no code blocks) with this exact structure:
{
  "summary": "A brief encouraging summary of their health status",
  "recommendations": [
    {
      "title": "Clear recommendation title",
      "description": "Detailed explanation of what they should do and why"
    }
  ]
}

Keep the tone warm, professional, and motivating. Focus on practical, achievable actions.`;

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
      
      // Clean up recommendations array - remove any invalid entries
      insights.recommendations = insights.recommendations
        .filter((rec: any) => {
          // Must be an object with both title and description
          return rec && 
                 typeof rec === 'object' && 
                 rec.title && 
                 rec.description &&
                 typeof rec.title === 'string' && 
                 typeof rec.description === 'string';
        })
        .map((rec: any) => ({
          title: rec.title.trim(),
          description: rec.description.trim()
        }));
      
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

    // Update assessment with calculated values and insights
    const { error: updateError } = await supabase
      .from("heart_health_assessments")
      .update({
        heart_age: heartAge,
        risk_score: riskScore,
        ai_insights: insights
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
