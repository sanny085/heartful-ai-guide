import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
// const OPENAI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
      assessment.family_history && "family history of heart disease",
    ]
      .filter(Boolean)
      .join(", ") || "none reported";

    const lipidInfo =
      assessment.ldl && assessment.hdl
        ? `LDL: ${assessment.ldl} mg/dL, HDL: ${assessment.hdl} mg/dL`
        : "Lipid levels not provided";

    const diabetesInfo =
      assessment.diabetes === "yes" &&
        assessment.fasting_sugar &&
        assessment.post_meal_sugar
        ? `Fasting: ${assessment.fasting_sugar} mg/dL, Post-meal: ${assessment.post_meal_sugar} mg/dL`
        : assessment.diabetes === "yes"
          ? "Has diabetes (levels not specified)"
          : "No diabetes";

    const tobaccoInfo = assessment.tobacco_use && Array.isArray(assessment.tobacco_use) && assessment.tobacco_use.length > 0
      ? `Additional tobacco use: ${assessment.tobacco_use.join(", ")}`
      : "No additional tobacco use reported";

    const prompt = `You are a compassionate health advisor. Based on this comprehensive health assessment, provide personalized insights and a diet plan:

PATIENT PROFILE:
Age: ${assessment.age || "Not specified"}
Gender: ${assessment.gender || "Not specified"}
Height: ${assessment.height ? `${assessment.height} cm` : "Not specified"}
Weight: ${assessment.weight ? `${assessment.weight} kg` : "Not specified"}
BMI: ${assessment.bmi?.toFixed(1) || "N/A"}

SYMPTOMS: ${symptomsText}

VITALS & LAB VALUES:
Blood Pressure: ${assessment.systolic}/${assessment.diastolic} mmHg
Heart Rate: ${assessment.pulse ? `${assessment.pulse} bpm` : "Not specified"}
${lipidInfo}
${diabetesInfo}

LIFESTYLE:
Diet: ${assessment.diet || "Not specified"}
Exercise: ${assessment.exercise || "Not specified"}
Sleep: ${assessment.sleep_hours} hours per night
Smoking: ${assessment.smoking || "Not specified"}
${tobaccoInfo}

USER NOTES: ${assessment.user_notes || "None provided"}

CALCULATED METRICS:
Heart Age: ${heartAge} years (Actual: ${assessment.age})
Risk Score: ${riskScore}% (10-year CVD Risk Probability)

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

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      // "https://api.openai.com/v1/chat/completions",
      // `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          // Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // model: "google/gemini-2.5-flash",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      },
    );

    

        // Skip Lovable API - use default insights

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI API error:", response.status, errorText);
      throw new Error(`Lovable AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let aiContent = data.choices[0].message.content;

    console.log("Raw AI response:", aiContent);

    // Remove markdown code blocks only
    aiContent = aiContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    console.log("After markdown removal:", aiContent);

    // Try to parse as JSON
    let insights;
    try {
      insights = JSON.parse(aiContent);

      // Validate and clean the structure
      if (
        !insights.summary ||
        !insights.recommendations ||
        !Array.isArray(insights.recommendations)
      ) {
        throw new Error("Invalid structure");
      }

      // Clean up recommendations array
      insights.recommendations = insights.recommendations
        .filter(
          (rec) =>
            rec &&
            typeof rec === "object" &&
            rec.title &&
            rec.description,
        )
        .map((rec) => ({
          title: rec.title.trim(),
          description: rec.description.trim(),
        }));

      // Ensure diet_plan structure exists
      if (insights.diet_plan && typeof insights.diet_plan === "object") {
        insights.diet_plan.foods_to_eat = Array.isArray(
          insights.diet_plan.foods_to_eat,
        )
          ? insights.diet_plan.foods_to_eat
          : [];
        insights.diet_plan.foods_to_avoid = Array.isArray(
          insights.diet_plan.foods_to_avoid,
        )
          ? insights.diet_plan.foods_to_avoid
          : [];
        insights.diet_plan.meal_suggestions = Array.isArray(
          insights.diet_plan.meal_suggestions,
        )
          ? insights.diet_plan.meal_suggestions
          : [];
      }

      console.log(
        "Successfully parsed insights with",
        insights.recommendations.length,
        "recommendations",
      );
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Create a structured fallback
      const lines = aiContent
        .split("\n")
        .filter((line) => line.trim().length > 0);
      insights = {
        summary:
          lines[0] ||
          "Based on your assessment, we have generated personalized recommendations for you.",
        recommendations: lines.slice(1).map((line, idx) => ({
          title: `Recommendation ${idx + 1}`,
          description: line.replace(/^[-*]\s*/, "").trim(),
        })),
      };
    }

    // Extract diet plan from insights to store separately
    const dietPlan = insights.diet_plan
      ? JSON.stringify(insights.diet_plan)
      : null;

    // Update assessment with calculated values, insights, and diet plan
    const { error: updateError } = await supabase
      .from("heart_health_assessments")
      .update({
        heart_age: heartAge,
        risk_score: riskScore,
        ai_insights: insights,
        diet_plan: dietPlan,
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
        risk_score: riskScore,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in generate-health-insights:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

const FRAMINGHAM_COEFFICIENTS = {
  men: {
    lnAge: 3.06117,
    lnBMI: 0.905964,
    lnSBP: 1.93303, // Untreated
    smoking: 0.65451,
    diabetes: 0.57367,
    meanBetaX: 23.9802,
    baselineSurvival: 0.88936,
  },
  women: {
    lnAge: 2.32888,
    lnBMI: 0.857314,
    lnSBP: 2.76157, // Untreated
    smoking: 0.52873,
    diabetes: 0.69154,
    meanBetaX: 26.1931,
    baselineSurvival: 0.95012,
  },
};

function calculateFraminghamRisk(assessment) {
  // Extract and normalize inputs
  const gender = (assessment.gender || "male").toLowerCase();
  const age = assessment.age || 30;
  const systolic = assessment.systolic || 120; // Default to normal if missing
  const bmi = assessment.bmi || 24; // Default to normal if missing
  const isSmoker = assessment.smoking === "regularly" ||
    assessment.smoking === "occasionally";
  const hasDiabetes = assessment.diabetes === "yes";

  // Select coefficients
  const coeffs = gender === "female" || gender === "other"
    ? FRAMINGHAM_COEFFICIENTS.women
    : FRAMINGHAM_COEFFICIENTS.men;

  // Calculate Beta * X
  let betaX = (coeffs.lnAge * Math.log(age)) +
    (coeffs.lnBMI * Math.log(bmi)) +
    (coeffs.lnSBP * Math.log(systolic)) +
    (isSmoker ? coeffs.smoking : 0) +
    (hasDiabetes ? coeffs.diabetes : 0);

  // Calculate Risk %
  const risk = 1 -
    Math.pow(
      coeffs.baselineSurvival,
      Math.exp(betaX - coeffs.meanBetaX),
    );

  return risk * 100; // Return as percentage
}

function calculateHeartAge(assessment) {
  const actualAge = assessment.age || 30;
  const gender = (assessment.gender || "male").toLowerCase();

  // 1. Calculate the user's Framingham Risk
  const userRisk = calculateFraminghamRisk(assessment);

  // 2. Find "Reference Heart Age"
  // We look for the age where a "healthy" person (ideal risk factors) would have the same risk as the user.
  // Ideal factors: BMI 22.5, SBP 115, No Smoking, No Diabetes
  let heartAge = actualAge;

  // Create a synthetic "Ideal Person" based on the user's gender
  const idealPerson = {
    gender: assessment.gender,
    bmi: 22.5,
    systolic: 115,
    smoking: "never",
    diabetes: "no",
  };

  // Search range: 20 to 90 years
  let minDiff = Number.MAX_VALUE;
  let calculatedHeartAge = actualAge;

  // Optimization: Start search from a reasonable bound based on risk
  for (let age = 20; age <= 90; age++) {
    idealPerson.age = age;
    const idealRisk = calculateFraminghamRisk(idealPerson);

    const diff = Math.abs(idealRisk - userRisk);
    if (diff < minDiff) {
      minDiff = diff;
      calculatedHeartAge = age;
    }
  }

  // NOTE: If user risk is extremely low, heart age might calculate as 20.
  // If user risk is extremely high, it might cap at 90.

  // 3. Apply "Hybrid" Lifestyle Modifiers
  // These adjust the clinical Heart Age based on wellness factors not in Framingham.
  let modifier = 0;

  // Sleep (+/-)
  if (assessment.sleep_hours) {
    if (assessment.sleep_hours < 6 || assessment.sleep_hours > 9) modifier += 1;
    else modifier -= 1; // Good sleep bonus
  }

  // Diet (+/-)
  if (assessment.diet) {
    if (assessment.diet.includes("high-carb") || assessment.diet.includes("irregular")) modifier += 2;
    else if (assessment.diet.includes("balanced") || assessment.diet.includes("restrict")) modifier -= 2;
  }

  // Exercise (+/-)
  if (assessment.exercise) {
    if (assessment.exercise.includes("Sedentary")) modifier += 2;
    else if (assessment.exercise.includes("Active") || assessment.exercise.includes("workouts")) modifier -= 2;
  }

  // Symptoms & Family History (+)
  if (assessment.chest_pain) modifier += 2;
  if (assessment.shortness_of_breath) modifier += 1;
  if (assessment.family_history) modifier += 2;

  // 4. Calculate Final Heart Age
  const finalHeartAge = calculatedHeartAge + modifier;

  // Sanity check bounds (keep it somewhat realistic, though "younger" is now allowed!)
  return Math.max(18, Math.min(100, finalHeartAge));
}

function calculateRiskScore(assessment) {
  // Use the Framingham 10-year CVD risk percentage as the base
  let riskPercent = calculateFraminghamRisk(assessment);

  // Apply multipliers for factors Framingham misses (Lipids if known, specific symptoms)
  // Note: Framingham BMI model doesn't use Lipids. If we have them, we should adjust.

  if (assessment.ldl && assessment.ldl > 160) riskPercent *= 1.3;
  if (assessment.hdl && assessment.hdl < 40) riskPercent *= 1.2;

  if (assessment.family_history) riskPercent *= 1.2;
  if (assessment.chest_pain) riskPercent *= 1.3; // Symptomatic adds immediate risk

  // Cap at 100% (though strict Framingham rarely exceeds 30-40%)
  // We want to return a "Risk Score" that feels intuitive to the user.
  // In many medical contexts:
  // < 10% is Low Risk
  // 10-20% is Intermediate
  // > 20% is High Risk

  // If we simply return riskPercent, a user getting "5%" might think it's very low (out of 100), 
  // but medically 5% is significant-ish depending on age.
  // However, the prompt asks for "heart year risk of cardiovascular", which implies the % chance.
  // Let's stick to the raw percentage but ensure we explain it in the frontend or insights.

  return parseFloat(Math.min(99.9, riskPercent).toFixed(1));
}


