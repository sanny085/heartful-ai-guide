import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from "https://esm.sh/xlsx@0.18.5?no-check";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FRAMINGHAM_COEFFICIENTS = {
  men: {
    lnAge: 3.06117,
    lnBMI: 0.905964,
    lnSBP: 1.93303,
    smoking: 0.65451,
    diabetes: 0.57367,
    meanBetaX: 23.9802,
    baselineSurvival: 0.88936,
  },
  women: {
    lnAge: 2.32888,
    lnBMI: 0.857314,
    lnSBP: 2.76157,
    smoking: 0.52873,
    diabetes: 0.69154,
    meanBetaX: 26.1931,
    baselineSurvival: 0.95012,
  },
};

function calculateFraminghamRisk(assessment) {
  const gender = (assessment.gender || "male").toLowerCase();
  const age = parseFloat(assessment.age) || 30;
  const systolic = parseFloat(assessment.systolic) || 120;
  const bmi = parseFloat(assessment.bmi) || 24;
  const isSmoker = assessment.smoking === "regularly" || assessment.smoking === "occasionally" || assessment.smoking === "yes" || assessment.smoking === true;
  const hasDiabetes = assessment.diabetes === "yes" || assessment.diabetes === true;

  const coeffs = gender === "female" || gender === "other" ? FRAMINGHAM_COEFFICIENTS.women : FRAMINGHAM_COEFFICIENTS.men;

  let betaX = (coeffs.lnAge * Math.log(age)) +
    (coeffs.lnBMI * Math.log(bmi)) +
    (coeffs.lnSBP * Math.log(systolic)) +
    (isSmoker ? coeffs.smoking : 0) +
    (hasDiabetes ? coeffs.diabetes : 0);

  const risk = 1 - Math.pow(coeffs.baselineSurvival, Math.exp(betaX - coeffs.meanBetaX));
  return risk * 100;
}

function calculateHeartAge(assessment) {
  const actualAge = parseFloat(assessment.age) || 30;
  const riskPercent = calculateFraminghamRisk(assessment);

  const idealPerson = {
    gender: assessment.gender,
    bmi: 22.5,
    systolic: 115,
    smoking: false,
    diabetes: false,
  };

  let minDiff = Number.MAX_VALUE;
  let calculatedHeartAge = actualAge;

  for (let age = 20; age <= 90; age++) {
    idealPerson.age = age;
    const idealRisk = calculateFraminghamRisk(idealPerson);
    const diff = Math.abs(idealRisk - riskPercent);
    if (diff < minDiff) {
      minDiff = diff;
      calculatedHeartAge = age;
    }
  }

  let modifier = 0;
  if (assessment.sleep_hours) {
    if (assessment.sleep_hours < 6 || assessment.sleep_hours > 9) modifier += 1;
    else modifier -= 1;
  }
  if (assessment.diet) {
    const d = assessment.diet.toLowerCase();
    if (d.includes("high-carb") || d.includes("irregular")) modifier += 2;
    else if (d.includes("balanced") || d.includes("restrict")) modifier -= 2;
  }
  if (assessment.exercise) {
    const e = assessment.exercise.toLowerCase();
    if (e.includes("sedentary")) modifier += 2;
    else if (e.includes("active") || e.includes("workout")) modifier -= 2;
  }
  if (assessment.chest_pain) modifier += 2;
  if (assessment.shortness_of_breath) modifier += 1;
  if (assessment.family_history) modifier += 2;

  return Math.max(18, Math.min(100, calculatedHeartAge + modifier));
}

function calculateRiskScore(assessment) {
  let riskPercent = calculateFraminghamRisk(assessment);
  if (assessment.ldl && assessment.ldl > 160) riskPercent *= 1.3;
  if (assessment.hdl && assessment.hdl < 40) riskPercent *= 1.2;
  if (assessment.family_history) riskPercent *= 1.2;
  if (assessment.chest_pain) riskPercent *= 1.3;
  return parseFloat(Math.min(99.9, riskPercent).toFixed(1));
}

function findVal(row, keys) {
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    const normalizedK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = rowKeys.find(rk => {
      const normalizedRK = rk.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedRK === normalizedK || normalizedRK.includes(normalizedK) || normalizedK.includes(normalizedRK);
    });
    if (found) return row[found];
  }
  return null;
}

serve(async (req) => {
  console.log("Edge Function 'process-excel-report' received a request");
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, action = "parse", data: incomingData } = await req.json();
    
    // If action is calculate and we already have data, just calculate
    if (action === "calculate" && incomingData) {
      const results = incomingData.map(item => {
        const heightM = (parseFloat(item.height) || 160) / 100;
        const weight = parseFloat(item.weight) || 60;
        const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        const calculations = { ...item, bmi };
        calculations.risk = calculateRiskScore(calculations);
        calculations.heart_age = Math.round(calculateHeartAge(calculations));
        return calculations;
      });
      return new Response(JSON.stringify({ data: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!url) throw new Error("URL is required");

    console.log("Fetching Excel from:", url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // defval ensures empty cells are included

    // Discovery tracking
    const discoveredFields = {
      name: false,
      mobile: false,
      email: false,
      age: false,
      bp: false,
      pulse: false,
      sugar: false,
      bmi_input: false,
    };

    const isYes = (val) => {
      if (val === undefined || val === null) return false;
      const s = val.toString().toLowerCase().trim();
      return s === "yes" || s === "y" || s === "1" || s === "true" || s === "present";
    };

    console.log(`Found ${rows.length} raw rows in the sheet.`);
    if (rows.length > 0) {
      console.log("First row keys:", Object.keys(rows[0]));
      console.log("First row sample data:", JSON.stringify(rows[0]).substring(0, 200));
    }

    const processedData = rows.map((row, index) => {
      const field_name = findVal(row, ["full name", "patient name", "fullname", "name", "patient", "first name", "firstname", "candidate name", "employee name"]);
      const field_mobile = findVal(row, ["mobile number", "mobile", "phone", "contact"]);
      const field_email = findVal(row, ["email", "e-mail", "mail"]);
      const field_age = findVal(row, ["age", "years", "yrs"]);
      const field_height = findVal(row, ["height (cm)", "height", "heightcm"]);
      const field_weight = findVal(row, ["weight (kg)", "weight", "weightkg"]);
      const field_pulse = findVal(row, ["blood pressure pulse rate (bpm)", "pulse rate", "pulse", "heart rate"]);
      const field_fbs = findVal(row, ["fasting sugar", "fbs", "sugar level"]);
      const field_ppbs = findVal(row, ["post meal sugar", "ppbs"]);
      const field_sleep = findVal(row, ["average sleep hours per night", "sleep hours", "sleep"]);
      const field_diet = findVal(row, ["how would you define your diet?", "diet"]);
      const field_smoking = findVal(row, ["do you smoke?", "smoking", "smoke"]);
      const field_diabetes = findVal(row, ["do you have diabetes?", "diabetes", "diabetic"]);
      const field_lipids = findVal(row, ["do you know your lipid levels?", "lipid levels", "knows lipids"]);
      const field_initial_symptoms = findVal(row, ["initial symptoms", "symptoms"]);
      const field_additional_symptoms = findVal(row, ["additional symptoms"]);
      const field_notes = findVal(row, ["health notes (optional)", "health notes", "notes"]);
      const field_water_intake = findVal(row, ["water intake", "water", "daily water intake", "water consumption"]);
      const field_profession = findVal(row, ["profession", "occupation", "job", "work"]);
      
      const bpRaw = findVal(row, ["blood pressure systolic (upper number) / diastolic (lower number)", "blood pressure", "bp"]);
      
      // Update discovery status for any row that has the field
      if (field_name) discoveredFields.name = true;
      if (field_mobile) discoveredFields.mobile = true;
      if (field_email) discoveredFields.email = true;
      if (field_age) discoveredFields.age = true;
      if (bpRaw || findVal(row, ["systolic", "sys", "bp high"])) discoveredFields.bp = true;
      if (field_pulse) discoveredFields.pulse = true;
      if (field_fbs || field_ppbs) discoveredFields.sugar = true;
      if (field_height || field_weight) discoveredFields.bmi_input = true;

      const hasAnyData = Object.values(row).some(v => {
        if (v === null || v === undefined || v === "" || v === " ") return false;
        return true;
      });
      
      if (!hasAnyData) {
        console.log(`Row ${index} skipped: no data`);
        return null;
      }
      
      const nameStr = field_name ? field_name.toString().trim() : `Patient ${index + 1}`;
      
      if (index < 3) {
        console.log(`Row ${index} - Name: ${nameStr}, Age: ${field_age}, BP: ${bpRaw}, Mobile: ${field_mobile}`);
      }

      // BP Parser
      let systolic = 120;
      let diastolic = 80;
      if (bpRaw && bpRaw.toString().includes("/")) {
        const parts = bpRaw.toString().split("/");
        systolic = parseFloat(parts[0]) || 120;
        diastolic = parseFloat(parts[1]) || 80;
      } else {
        const sysVal = findVal(row, ["systolic", "sys", "bp high", "sbp"]);
        const diaVal = findVal(row, ["diastolic", "dia", "bp low", "dbp"]);
        if (sysVal !== null) systolic = parseFloat(sysVal) || 120;
        if (diaVal !== null) diastolic = parseFloat(diaVal) || 80;
      }

      // Symptoms & Sleep parsing
      const initialSymptoms = (field_initial_symptoms || "").toString().toLowerCase();
      const additionalSymptoms = (field_additional_symptoms || "").toString().toLowerCase();
      const combSymptoms = initialSymptoms + " " + additionalSymptoms;
      
      let sleep = 7;
      if (field_sleep) {
        const matches = field_sleep.toString().match(/\d+/);
        if (matches) sleep = parseFloat(matches[0]);
      }

      const pData = {
        name: nameStr,
        mobile: field_mobile ? field_mobile.toString().trim() : "",
        age: parseFloat(field_age) || 30,
        gender: (findVal(row, ["gender", "sex", "m/f"]) || "male").toLowerCase(),
        height: parseFloat(field_height) || 165,
        weight: parseFloat(field_weight) || 65,
        diet: field_diet || "Balanced",
        exercise: findVal(row, ["exercise", "activity", "physical activity"]) || "Active",
        sleep_hours: sleep,
        water_intake: parseFloat(field_water_intake) || null,
        profession: field_profession || "",
        smoking: field_smoking || "no",
        tobacco_use: isYes(findVal(row, ["tobacco use", "tobacco", "chewing tobacco", "gutka"])),
        knows_lipids: isYes(field_lipids),
        high_cholesterol: isYes(findVal(row, ["high cholesterol", "cholesterol", "high lipids"])),
        diabetes: field_diabetes || "no",
        systolic: systolic,
        diastolic: diastolic,
        pulse: parseFloat(field_pulse) || 72,
        fasting_sugar: parseFloat(field_fbs) || null,
        post_meal_sugar: parseFloat(field_ppbs) || null,
        ldl: parseFloat(findVal(row, ["ldl", "bad cholesterol", "ldl cholesterol"])) || null,
        hdl: parseFloat(findVal(row, ["hdl", "good cholesterol", "hdl cholesterol"])) || null,
        chest_pain: isYes(findVal(row, ["chest pain", "angina", "cp"])) || combSymptoms.includes("chest pain"),
        shortness_of_breath: isYes(findVal(row, ["sob", "shortness of breath"])) || combSymptoms.includes("shortness of breath"),
        dizziness: isYes(findVal(row, ["dizziness", "fainting"])) || combSymptoms.includes("dizziness") || combSymptoms.includes("fainting"),
        fatigue: isYes(findVal(row, ["fatigue", "tiredness"])) || combSymptoms.includes("fatigue") || combSymptoms.includes("tiredness"),
        swelling: isYes(findVal(row, ["swelling", "edema"])) || combSymptoms.includes("swelling"),
        palpitations: isYes(findVal(row, ["palpitations", "heart racing"])) || combSymptoms.includes("palpitations") || combSymptoms.includes("heart racing"),
        family_history: isYes(findVal(row, ["family history", "fh"])) || combSymptoms.includes("family history"),
        user_notes: field_notes || "",
        email: field_email ? field_email.toString().trim().toLowerCase() : "",
      };

      if (action === "calculate") {
        const heightM = pData.height / 100;
        pData.bmi = parseFloat((pData.weight / (heightM * heightM)).toFixed(1));
        pData.risk_score = calculateRiskScore(pData);
        pData.heart_age = Math.round(calculateHeartAge(pData));
      }

      return pData;
    }).filter(p => p !== null);

    console.log(`Processed ${processedData.length} patients from ${rows.length} rows`);

    let diagnostic = "";
    if (processedData.length === 0) {
      if (rows.length === 0) {
        diagnostic = "The spreadsheet appears to be empty or in an unrecognized format.";
      } else {
        diagnostic = "Found data rows, but could not recognize any patient names. Ensure you have a 'Full Name' or 'Name' column.";
      }
    }

    return new Response(JSON.stringify({ data: processedData, discovery: discoveredFields, diagnostic }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing Excel:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
