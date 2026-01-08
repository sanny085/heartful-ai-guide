import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heart, Home, Eye, Search, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import VoiceRecorder from "@/components/VoiceRecorder";
import { envConfig } from "@/lib/envApi";
import { read, utils } from 'xlsx';

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

const ADMIN_EMAIL = ["subahan.official@gmail.com" , "10000heartsteam@gmail.com" , "bhavanidevi0101@gmail.com","sannykumar085@gmail.com","sannyert848@gmail.com","sriradha2dart@gmail.com","abdul9676511756@gmail.com"];

export default function HeartHealthAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [allAssessments, setAllAssessments] = useState([]);
  const [showExistingReport, setShowExistingReport] = useState(false);
  const [heightUnit, setHeightUnit] = useState("cm");
  
  // Import State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [reportsTableOpen, setReportsTableOpen] = useState(false);
  const [excelDataPreview, setExcelDataPreview] = useState(null);
  const [showGenerationTable, setShowGenerationTable] = useState(false);
  const [discoveryStatus, setDiscoveryStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const userEmail = user?.email?.toLowerCase().trim();
  const isAdmin = userEmail && ADMIN_EMAIL.some(email => email.toLowerCase().trim() === userEmail);
  
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
    waterIntake: "",
    profession: "",
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
    email: "",
    consent: false,
    // Calculated (for display)
    heart_age: null,
    risk_score: null
  });

  const processExcelData = async (buffer) => {
    try {
      const wb = read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = utils.sheet_to_json(ws);

      if (!data || data.length === 0) {
        throw new Error("The file is empty or formatted incorrectly.");
      }

      const findVal = (item, keys) => {
        for (const k of keys) {
          if (item[k] !== undefined) return item[k];
          const lowerKey = Object.keys(item).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
          if (lowerKey) return item[lowerKey];
        }
        return "";
      };

      const nameKeys = ["name", "patient name", "full name", "patient", "name of patient", "pname", "patient_name", "user", "name of user", "names"];

      const validRows = data.filter(row => {
        // Only process rows that have at least one value that isn't just whitespace
        // and ideally check if it has more than just technical keys
        const rowKeys = Object.keys(row);
        return rowKeys.some(k => {
          const val = row[k];
          return val !== null && val !== undefined && val.toString().trim() !== "";
        });
      });

      if (validRows.length === 0) {
        throw new Error("No data found in the file.");
      }

      let successCount = 0;
      let lastId = null;

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        const mappedData = { ...formData };

        // Strictly use the name from the row
        const rawName = findVal(row, nameKeys);
        if (!rawName) continue; // Skip if no name found in the row
        
        mappedData.name = rawName.toString() || "Patient";
        
        mappedData.mobile = findVal(row, ["mobile", "phone", "contact", "mobile no", "phone no", "cell", "pno", "mno"])?.toString() || "";
        mappedData.age = findVal(row, ["age", "years", "yrs", "age (yrs)", "age (years)"])?.toString() || "";
        mappedData.gender = findVal(row, ["gender", "sex", "m/f", "male/female", "g"])?.toString()?.toLowerCase() || "";
        mappedData.height = findVal(row, ["height", "ht", "height cm", "height (cm)", "h"])?.toString() || "";
        mappedData.weight = findVal(row, ["weight", "wt", "weight kg", "weight (kg)", "w"])?.toString() || "";
        
        mappedData.systolic = findVal(row, ["systolic", "sys", "bp high", "blood pressure high", "bps", "systolic bp"])?.toString() || "";
        mappedData.diastolic = findVal(row, ["diastolic", "dia", "bp low", "blood pressure low", "bpd", "diastolic bp"])?.toString() || "";
        mappedData.pulse = findVal(row, ["pulse", "heart rate", "hr", "pulse rate", "p"])?.toString() || "";
        
        const isYes = (val) => {
          if (!val) return false;
          const s = val.toString().toLowerCase().trim();
          return s === "yes" || s === "y" || s === "1" || s === "true" || s === "present";
        };

        mappedData.chestPain = isYes(findVal(row, ["chest pain", "angina", "cp"]));
        mappedData.shortnessOfBreath = isYes(findVal(row, ["sob", "shortness of breath", "breathlessness"]));
        mappedData.dizziness = isYes(findVal(row, ["dizziness", "fainting"]));
        mappedData.fatigue = isYes(findVal(row, ["fatigue", "tiredness"]));
        
        mappedData.diabetes = findVal(row, ["diabetes", "dm", "diabetic", "status", "diabetes status"])?.toString() || "";
        mappedData.fastingSugar = findVal(row, ["fasting sugar", "fbs", "fasting", "sugar fasting", "fb-sugar", "fbsugar"])?.toString() || "";
        mappedData.postMealSugar = findVal(row, ["post meal sugar", "ppbs", "pp", "sugar pp", "pp-sugar", "ppsugar"])?.toString() || "";
        
        mappedData.ldl = findVal(row, ["ldl", "bad cholesterol", "cholesterol ldl", "ldl-chol", "ldl cholesterol"])?.toString() || "";
        mappedData.hdl = findVal(row, ["hdl", "good cholesterol", "cholesterol hdl", "hdl-chol", "hdl cholesterol"])?.toString() || "";
        mappedData.knowsLipids = (mappedData.ldl || mappedData.hdl) ? "yes" : "";

        mappedData.diet = findVal(row, ["diet", "food", "diet type", "veg/non-veg"])?.toString() || "";
        mappedData.exercise = findVal(row, ["exercise", "activity", "physical activity", "workout"])?.toString() || "";
        mappedData.smoking = findVal(row, ["smoking", "smoker", "smoke"])?.toString() || "";
        mappedData.tobacco = findVal(row, ["tobacco", "tobacco use", "tobacco_use", "tobaccoUse"])?.toString().split(",").map(i => i.trim()).filter(i => i) || [];
        mappedData.sleepHours = findVal(row, ["sleep", "sleep hours", "sleeping hours", "rest"])?.toString() || "";
        mappedData.familyHistory = isYes(findVal(row, ["family history", "heart history", "fh", "family hx"]));
        mappedData.swelling = isYes(findVal(row, ["swelling", "edema", "legs swelling"]));
        mappedData.palpitations = isYes(findVal(row, ["palpitations", "heart racing", "racing heart"]));
        mappedData.userNotes = findVal(row, ["notes", "remarks", "comments", "user notes"])?.toString() || "";

        toast.loading(`Processing ${i + 1}/${validRows.length}: ${mappedData.name}...`, { id: "import-toast" });
        const result = await saveAssessment(mappedData, true);
        if (result) {
          successCount++;
          lastId = result.id;
        }
      }

      if (successCount > 0) {
        toast.success(`Generated ${successCount} reports successfully!`, { id: "import-toast" });
        loadAssessments();
        setImportModalOpen(false);
        setImportUrl("");
        
        // Redirect: If 1 report -> Go to detail. If multiple -> Go to dashboard.
        setTimeout(() => {
          if (successCount === 1 && lastId) {
            navigate(`/heart-health-results?id=${lastId}`);
          } else {
            navigate(`/heart-health-results`);
          }
        }, 1500);
      } else {
        toast.error("Failed to generate reports. Please check your data format.", { id: "import-toast" });
      }
    } catch (error) {
      console.error("Process Error:", error);
      setImportError(error.message);
      toast.error("Import Failed", { id: "import-toast" });
    } finally {
      setImporting(false);
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportError("");
    const arrayBuffer = await file.arrayBuffer();
    await processExcelData(arrayBuffer);
  };

  // handleImportFromUrl implementation
  const handleImportFromUrl = async () => {
    if (!importUrl) {
      toast.error("Please enter a valid URL");
      return;
    }

    setImporting(true);
    setImportError("");

    try {
      let processedUrl = importUrl.trim();
      
      // Handle Google Sheets/Drive links logic restoration
      if (processedUrl.includes("docs.google.com/spreadsheets") || processedUrl.includes("drive.google.com")) {
         // Handle /edit URLs
         if (processedUrl.includes("/edit")) {
            processedUrl = processedUrl.replace(/\/edit.*$/, "/export?format=xlsx");
         }
         // Handle /d/ ID extraction if needed (basic export replacement matches most cases)
      }

      // 1. Fetch and Parse
      const { data, error } = await supabase.functions.invoke("process-excel-report", {
        body: { url: processedUrl }
      });

      if (error) throw error;
      if (!data || !data.data || data.data.length === 0) throw new Error("No valid data found in the file");

      toast.success(`Loaded ${data.data.length} records. Calculating...`);

      // 2. Calculate AI Metrics for all items
      const { data: calculatedData, error: calcError } = await supabase.functions.invoke("process-excel-report", {
        body: { 
          action: "calculate",
          data: data.data 
        }
      });

      if (calcError) throw calcError;
      
      // 3. Auto-save all reports
      toast.loading("Generating reports...", { id: "auto-save" });
      await saveProcessedData(calculatedData.data);
      toast.success("All reports generated successfully!", { id: "auto-save" });

    } catch (error) {
      console.error("Import/Process error:", error);
      setImportError(error.message || "Failed to process data");
      toast.error("Import failed. Please check the URL.");
    } finally {
      setImporting(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!excelDataPreview || excelDataPreview.length === 0) {
      toast.error("Please load data first");
      return;
    }
    
    setImporting(true);
    toast.loading("Calculating AI Risk & Heart Age...", { id: "calc-ai" });
    
    try {
      const { data, error } = await supabase.functions.invoke("process-excel-report", {
        body: { 
          action: "calculate",
          data: excelDataPreview 
        }
      });

      if (error) throw error;
      
      setExcelDataPreview(data.data);
      setShowGenerationTable(true);
      toast.success("Analysis Complete!", { id: "calc-ai" });
    } catch (error) {
      console.error("Calculation Error:", error);
      toast.error("Failed to analyze data", { id: "calc-ai" });
    } finally {
      setImporting(false);
    }
  };

  const saveProcessedData = async (dataList) => {
    if (!dataList || dataList.length === 0) return;

    setImporting(true);
    toast.loading(`Saving ${dataList.length} reports...`, { id: "save-import" });
    
    let successCount = 0;
    let lastId = null;

    try {
      for (let i = 0; i < dataList.length; i++) {
        const item = dataList[i];
        
        // Map the item to the form structure
        const mappedData = {
          ...formData,
          name: item.name,
          mobile: item.mobile,
          age: item.age,
          gender: item.gender,
          height: item.height,
          weight: item.weight,
          systolic: item.systolic,
          diastolic: item.diastolic,
          pulse: item.pulse,
          ldl: item.ldl,
          hdl: item.hdl,
          fastingSugar: item.fasting_sugar,
          postMealSugar: item.post_meal_sugar,
          smoking: item.smoking,
          diabetes: item.diabetes,
          diet: item.diet,
          exercise: item.exercise,
          sleepHours: item.sleep_hours,
          chestPain: item.chest_pain,
          shortnessOfBreath: item.shortness_of_breath,
          dizziness: item.dizziness,
          fatigue: item.fatigue,
          swelling: item.swelling,
          palpitations: item.palpitations,
          familyHistory: item.family_history,
          userNotes: item.user_notes,
          heart_age: item.heart_age,
          risk_score: item.risk_score || item.risk,
          
          // Mapped new fields
          waterIntake: item.water_intake,
          profession: item.profession,
          tobacco: Array.isArray(item.tobacco_use) ? item.tobacco_use : (item.tobacco_use ? [item.tobacco_use] : [])
        };

        const result = await saveAssessment(mappedData, true);
        if (result) {
          successCount++;
          lastId = result.id;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} reports!`, { id: "save-import" });
        loadAssessments();
        setImportModalOpen(false);
        setExcelDataPreview(null);
        setImportUrl("");
        
        setTimeout(() => {
          if (successCount === 1 && lastId) {
            navigate(`/heart-health-results?id=${lastId}`);
          } else {
            navigate(`/heart-health-results`);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Save Success Error:", error);
      toast.error("Failed to save all reports", { id: "save-import" });
    } finally {
      setImporting(false);
    }
  };

  const handleSaveImportPreview = async () => {
    await saveProcessedData(excelDataPreview);
  };

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
      waterIntake: "",
      profession: "",
      // User notes
      userNotes: "",
      email: user?.email || "",
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
      waterIntake: latestAssessment.water_intake?.toString() || "",
      profession: latestAssessment.profession || "",
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
      email: latestAssessment.email || user?.email || "",
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

  const loadAssessments = useCallback(async () => {
    if (!user || !isAdmin) {
      setAllAssessments([]);
      return;
    }
    
    try {
      let query = supabase
        .from(envConfig.heart_health_assessments)
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        setLatestAssessment(data[0]);
        setAllAssessments(data);
        setShowExistingReport(true);
      }
    } catch (error) {
      console.error("Error loading assessments:", error);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to take the heart health test");
      navigate("/auth");
      return;
    }

    loadAssessments();
  }, [user, navigate, loadAssessments]);




  const calculateBMI = (height, weight) => {
    const heightInCm = heightUnit === "inch" ? height * 2.54 : height;
    const heightInMeters = heightInCm / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const calcCVScore = useCallback((item) => {
    if (!item) return 0;
    const scoreReductions = [
      { condition: (item.bmi ?? 0) > 25, reduction: 10 },
      { condition: (item.systolic ?? 0) > 140, reduction: 15 },
      { condition: item.risk_score, reduction: (item.risk_score ?? 0) * 2 }
    ];
    const totalReduction = scoreReductions
      .filter(r => r.condition)
      .reduce((sum, r) => sum + r.reduction, 0);
    return Math.max(0, Math.round(100 - totalReduction));
  }, []);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await saveAssessment();
    }
  };

  const saveAssessment = async (overrideData = null, skipRedirect = false) => {
    if (!user) return;
    
    // Use overridden data (from import) or current state
    const currentData = overrideData || formData;

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
          return null;
        }

      // Duplicate Check: Removed by User Request
      // We now allow duplicate name/mobile entries and rows without names.


      const safeNum = (val, type = "int") => {
        if (val === null || val === undefined || val === "") return null;
        const num = type === "int" ? parseInt(val) : parseFloat(val);
        return isNaN(num) ? null : num;
      };

      const rawBmi = currentData.height && currentData.weight
        ? calculateBMI(Number(currentData.height), Number(currentData.weight))
        : null;
      const bmi = isNaN(rawBmi) || !isFinite(rawBmi) ? null : rawBmi;

      // Check if we have any actual data to save (other than defaults/user_id)
      const meaningfulFields = [
        'name', 'mobile', 'age', 'height', 'weight', 'ldl', 'hdl', 
        'fastingSugar', 'postMealSugar', 'systolic', 'diastolic', 'pulse',
        'diet', 'exercise', 'sleepHours', 'waterIntake', 'smoking', 'tobacco', 'profession'
      ];
      
      const hasAnyData = meaningfulFields.some(field => {
        const value = currentData[field];
        return value !== null && value !== undefined && value !== "";
      });

      if (!hasAnyData) {
        return null; // Skip rows that are essentially empty or only have defaults
      }

      const assessmentData = {
        user_id: profile.user_id,
        // Patient details
        name: currentData.name || "Patient",
        mobile: currentData.mobile || "",
        age: safeNum(currentData.age),
        gender: currentData.gender || "",
        height: safeNum(currentData.height, "float"),
        weight: safeNum(currentData.weight, "float"),
        // Lifestyle
        diet: currentData.diet || "",
        exercise: currentData.exercise || "",
        sleep_hours: safeNum(currentData.sleepHours || currentData.sleep_hours, "float"),
        water_intake: safeNum(currentData.waterIntake || currentData.water_intake, "float"),
        profession: currentData.profession || "",
        smoking: currentData.smoking || "",
        tobacco_use: Array.isArray(currentData.tobacco) ? currentData.tobacco : [],
        // Lipids
        knows_lipids: currentData.knowsLipids === true || currentData.knowsLipids === "true" || currentData.knowsLipids === "yes",
        high_cholesterol: currentData.highCholesterol === true || currentData.highCholesterol === "true" || currentData.highCholesterol === "yes",
        ldl: safeNum(currentData.ldl),
        hdl: safeNum(currentData.hdl),
        // Diabetes
        diabetes: currentData.diabetes || "",
        fasting_sugar: safeNum(currentData.fastingSugar),
        post_meal_sugar: safeNum(currentData.postMealSugar),
        // Blood pressure
        systolic: safeNum(currentData.systolic),
        diastolic: safeNum(currentData.diastolic),
        pulse: safeNum(currentData.pulse),
        // Symptoms
        chest_pain: currentData.chestPain === true || currentData.chestPain === "true" || currentData.chestPain === "yes",
        shortness_of_breath: currentData.shortnessOfBreath === true || currentData.shortnessOfBreath === "true" || currentData.shortnessOfBreath === "yes",
        dizziness: currentData.dizziness === true || currentData.dizziness === "true" || currentData.dizziness === "yes",
        fatigue: currentData.fatigue === true || currentData.fatigue === "true" || currentData.fatigue === "yes",
        swelling: currentData.swelling === true || currentData.swelling === "true" || currentData.swelling === "yes",
        palpitations: currentData.palpitations === true || currentData.palpitations === "true" || currentData.palpitations === "yes",
        family_history: currentData.familyHistory === true || currentData.familyHistory === "true" || currentData.familyHistory === "yes",
        // User notes
        user_notes: currentData.userNotes || "",
        // Calculated values
        bmi: bmi,
        heart_age: currentData.heart_age || null,
        risk_score: currentData.risk_score || null,
        email: currentData.email || user.email
      };

      const { data, error } = await supabase
        .from(envConfig.heart_health_assessments)
        .insert(assessmentData)
        .select()
        .single();

      if (error) {
        console.error("Supabase Insert Error:", error);
        throw error;
      }
      // toast.success("Report generated successfully!");

      const { error: insightsError } = await supabase.functions.invoke("generate-health-insights", {
        body: { assessmentId: data.id }
      });

      if (insightsError) {
        console.error("Error generating insights:", insightsError);
      }

      if (!skipRedirect) {
        toast.success("Report generated successfully!");
        resetFormData();
        navigate(`/heart-health-results?id=${data.id}`);
      }
      
      return data;
    } catch (error) {
      console.error("Error saving assessment:", error);
      const errMsg = error.message || error.details || "Validation Error";
      toast.error(`Save failed for ${currentData.name || "Patient"}: ${errMsg}`);
      return null;
    } finally {
      if (!skipRedirect) setSaving(false);
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

            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                placeholder="Enter Profession"
                value={formData.profession}
                onChange={(e) => updateFormData("profession", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waterIntake">Daily Water Intake (Liters)</Label>
              <Input
                id="waterIntake"
                type="number"
                placeholder="e.g. 2.5"
                value={formData.waterIntake}
                onChange={(e) => updateFormData("waterIntake", e.target.value)}
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
                "I mostly choose high-carb foods, occasional vegetables or fruits",
                "I choose both high and low carb foods equally with moderate consumption of fruits and vegetables",
                "I limit or restrict high-carb foods most of the time and consume vegetables, sprouts and fruits regularly",
                "I choose a balanced diet all the time",
                "I have irregular dietary patterns"
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-4xl py-12">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <Card className="p-8 mb-8 text-center bg-card border-accent/20">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Welcome Back</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                 size="lg" 
                 className="bg-accent hover:bg-accent/90"
                 onClick={() => {
                   resetFormData();
                   setShowExistingReport(false);
                 }}
              >
                Start New Assessment
              </Button>
              
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-accent text-accent hover:bg-accent/10"
                  onClick={() => setImportModalOpen(true)}
                >
                  Import from Excel
                </Button>
              )}

              {latestAssessment && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={loadPreviousAssessment}
                >
                  Continue Previous
                </Button>
              )}

              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-accent text-accent hover:bg-accent/10"
                  onClick={() => setReportsTableOpen(true)}
                >
                  View Patient Reports
                </Button>
              )}
            </div>

          </Card>
        </div>
        {/* Import Modal - Available in this view too */}
        <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Data from Excel</DialogTitle>
              <DialogDescription>
                Choose a method to import your patient data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <span className="bg-accent/10 text-accent rounded-full w-5 h-5 flex items-center justify-center text-[10px]">1</span>
                  Upload File (Recommended)
                </Label>
                <Input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground">Most reliable method. Supports .xlsx and .csv</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or use Link</span></div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <span className="bg-accent/10 text-accent rounded-full w-5 h-5 flex items-center justify-center text-[10px]">2</span>
                  Excel / Google Sheets Link
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://docs.google.com/spreadsheets/..." 
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    disabled={importing}
                    className="flex-1"
                  />
                  <Button onClick={handleImportFromUrl} disabled={importing || !importUrl}>
                    {importing ? "..." : "Load"}
                  </Button>
                </div>
                {importError && <p className="text-destructive text-[11px] font-medium bg-destructive/5 p-2 rounded">{importError}</p>}
              </div>

              <div className="text-[10px] text-muted-foreground p-3 bg-muted rounded-md border border-accent/10">
                <strong>Tip:</strong> Ensure your Excel has columns like <strong>"Name"</strong> and <strong>"Mobile"</strong>.
              </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" size="sm" onClick={() => setImportModalOpen(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reports Table Modal - Available in this view too */}
        <Dialog open={reportsTableOpen} onOpenChange={setReportsTableOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background border-accent/20">
            {isAdmin ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Eye className="h-6 w-6 text-accent" />
                    Patient Reports Dashboard
                  </DialogTitle>
                  <DialogDescription>
                    View and manage all patient assessments in a structured format.
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-md border border-accent/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-accent/5 hover:bg-accent/5">
                        <TableHead className="font-bold text-foreground">Name</TableHead>
                        <TableHead className="font-bold text-foreground">Date</TableHead>
                        <TableHead className="font-bold text-foreground">Mobile</TableHead>
                        <TableHead className="font-bold text-foreground">BMI</TableHead>
                        <TableHead className="font-bold text-foreground text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAssessments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <Heart className="h-8 w-8 opacity-20" />
                              <span>No reports found yet</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        allAssessments.map((assessment) => (
                          <TableRow key={assessment.id} className="hover:bg-accent/5 cursor-pointer transition-colors" onClick={() => navigate(`/heart-health-results?id=${assessment.id}`)}>
                            <TableCell className="font-medium text-foreground">{assessment.name || "Patient"}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(assessment.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{assessment.mobile || "-"}</TableCell>
                            <TableCell>
                              {assessment.bmi ? (
                                <span className={`${parseFloat(assessment.bmi) > 25 ? "text-orange-500" : "text-success"}`}>
                                  {parseFloat(assessment.bmi).toFixed(1)}
                                </span>
                              ) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-accent hover:text-accent hover:bg-accent/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/heart-health-results?id=${assessment.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <DialogFooter className="sm:justify-between items-center border-t border-accent/10 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Showing {allAssessments.length} records
                  </p>
                  <Button variant="outline" onClick={() => setReportsTableOpen(false)}>Close Dashboard</Button>
                </DialogFooter>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground italic">
                You do not have permission to view the patient directory.
              </div>
            )}
          </DialogContent>
        </Dialog>
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

              {isAdmin && (
                !excelDataPreview ? (
                  <Button 
                    variant="outline" 
                    className="w-full mb-6 border-accent text-accent hover:bg-accent/10 justify-start"
                    onClick={() => setImportModalOpen(true)}
                  >
                    <span className="mr-2">⚡</span> Import from Excel
                  </Button>
                ) : (
                  <div className="space-y-2 mb-6">
                    <div className="bg-success/10 border border-success/20 rounded-md p-3 text-sm">
                      <div className="flex items-center gap-2 text-success font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        {excelDataPreview.length} Patients Analyzed
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        AI calculations complete. Ready to save.
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[10px]" 
                      onClick={() => {
                        setExcelDataPreview(null);
                        setImportUrl("");
                      }}
                    >
                      Clear Loaded Data ({excelDataPreview?.length || 0})
                    </Button>
                  </div>
                )
              )}

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
              {isAdmin && (
                <div className="mt-8 pt-6 border-t border-accent/20 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-accent border-accent hover:bg-accent/10"
                    onClick={() => setReportsTableOpen(true)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import from Excel
                  </Button>
                </div>
              )}
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

      {/* Import Modal - Always Available */}
      <Dialog open={importModalOpen} onOpenChange={(open) => {
        setImportModalOpen(open);
        if (!open) {
          setExcelDataPreview(null);
          setShowGenerationTable(false);
          setImportUrl("");
          setImportError("");
        }
      }}>
        <DialogContent className={showGenerationTable ? "max-w-4xl" : "max-w-md"}>
          <DialogHeader>
            <DialogTitle>Import Data from Excel</DialogTitle>
            <DialogDescription>
              {showGenerationTable 
                ? `System analyzed ${excelDataPreview.length} patients. Review and save below.` 
                : "Enter an Excel link to load patient data."}
            </DialogDescription>
          </DialogHeader>

          {showGenerationTable ? (
            <div className="space-y-4">
              <div className="border rounded-md overflow-x-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-accent/5">
                      <TableHead># Name</TableHead>
                      <TableHead>Email / Phone</TableHead>
                      <TableHead>BP (S/D)</TableHead>
                      <TableHead>Sugar</TableHead>
                      <TableHead>BMI / Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excelDataPreview.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium whitespace-nowrap">{idx + 1}. {item.name}</TableCell>
                        <TableCell className="text-[10px]">
                          <div className="text-muted-foreground">{item.mobile}</div>
                        </TableCell>
                        <TableCell>{item.systolic}/{item.diastolic}</TableCell>
                        <TableCell>{item.fasting_sugar || "-"}</TableCell>
                        <TableCell>
                          <div className="font-bold">{item.bmi} / {item.risk_score}%</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowGenerationTable(false)}>Back</Button>
                <Button onClick={() => saveProcessedData(excelDataPreview)} disabled={importing}>
                  {importing ? "Saving..." : `Save & Finalize all Reports`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {/* Option 2: Link (Main flow for this requirement) */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Paste Excel (.xls/.xlsx) URL</Label>
                  <Input 
                    placeholder="https://docs.google.com/spreadsheets/..." 
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    disabled={importing}
                  />
                  {importError && <p className="text-destructive text-[11px] font-medium bg-destructive/5 p-2 rounded">{importError}</p>}
                </div>

                {!excelDataPreview ? (
                  <Button 
                    onClick={handleImportFromUrl} 
                    disabled={importing || !importUrl}
                    className="w-full"
                  >
                    {importing ? "Fetching..." : "Load Data"}
                  </Button>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-success/5 border border-success/20 rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-success flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Mapping Successful
                        </span>
                        <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold">
                          {excelDataPreview?.length || 0} Patients
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {[
                          { id: 'name', label: 'Patient Name' },
                          { id: 'email', label: 'Email Address' },
                          { id: 'mobile', label: 'Phone Number' },
                          { id: 'bp', label: 'Blood Pressure' },
                          { id: 'sugar', label: 'Sugar/Diabetes' },
                          { id: 'pulse', label: 'Pulse Rate' },
                          { id: 'bmi_input', label: 'Height/Weight' },
                          { id: 'age', label: 'Age/Gender' },
                        ].map((field) => (
                          <div key={field.id} className="flex items-center gap-2 text-foreground/80">
                            {discoveryStatus?.[field.id] ? (
                              <Check className="h-3 w-3 text-success font-bold" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-muted-foreground/30" />
                            )}
                            <span className={discoveryStatus?.[field.id] ? "font-medium" : "text-muted-foreground"}>
                              {field.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={handleGenerateReport} 
                        disabled={importing}
                        className="w-full bg-accent text-white hover:bg-accent/90"
                      >
                        Proceed to Analyze Results
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px]" 
                        onClick={() => {
                          setExcelDataPreview(null);
                          setDiscoveryStatus(null);
                        }}
                      >
                        Reset & Try another link
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or upload file</span></div>
              </div>

              <div className="space-y-2">
                <Input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="cursor-pointer text-xs"
                />
              </div>
            </div>
          )}

          {!showGenerationTable && (
            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setImportModalOpen(false)}>Cancel</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Reports Table Modal - Always Available */}
      <Dialog open={reportsTableOpen} onOpenChange={setReportsTableOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background border-accent/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Eye className="h-6 w-6 text-accent" />
              Patient Reports Dashboard
            </DialogTitle>
            <DialogDescription>
              View and manage all patient assessments in a structured format.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 mt-2">
            <div className="relative w-full md:w-72">
               <Input
                 placeholder="Search by Name or Mobile..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-8"
               />
               <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground opacity-50" />
            </div>
             <Button 
              variant="default" 
              size="sm" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 ml-auto"
              onClick={() => {
                setReportsTableOpen(false);
                // navigate("/"); // If actual navigation is needed, uncomment
              }}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="rounded-md border border-accent/20 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/5 hover:bg-accent/5">
                  <TableHead className="font-bold text-foreground">Name</TableHead>
                  <TableHead className="font-bold text-foreground">Date</TableHead>
                  <TableHead className="font-bold text-foreground">Age/Sex</TableHead>
                  <TableHead className="font-bold text-foreground">Mobile</TableHead>
                  <TableHead className="font-bold text-foreground">BP (S/D)</TableHead>
                  <TableHead className="font-bold text-foreground">Pulse</TableHead>
                  <TableHead className="font-bold text-foreground">BMI</TableHead>
                  <TableHead className="font-bold text-foreground">Sugar (F/P)</TableHead>
                  <TableHead className="font-bold text-foreground">Lipids (L/H)</TableHead>
                  <TableHead className="font-bold text-foreground">Symptoms</TableHead>
                  <TableHead className="font-bold text-foreground">Smoking/Tobacco</TableHead>
                  <TableHead className="font-bold text-foreground">Diet</TableHead>
                  <TableHead className="font-bold text-foreground">Exercise</TableHead>
                  <TableHead className="font-bold text-foreground">Heart Risk</TableHead>
                  <TableHead className="font-bold text-foreground">Heart Age</TableHead>
                  <TableHead className="font-bold text-foreground">CV Score</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={17} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Heart className="h-8 w-8 opacity-20" />
                        <span>No reports found yet</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  allAssessments
                    .filter(item => {
                      const query = searchQuery.toLowerCase();
                      return (
                        (item.name && item.name.toLowerCase().includes(query)) ||
                        (item.mobile && item.mobile.toString().includes(query))
                      );
                    })
                    .map((assessment) => (
                    <TableRow key={assessment.id} className="hover:bg-accent/5 cursor-pointer transition-colors" onClick={() => navigate(`/heart-health-results?id=${assessment.id}`)}>
                      <TableCell className="font-medium text-foreground">{assessment.name || "Patient"}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {assessment.age || "-"}/{assessment.gender?.charAt(0)?.toUpperCase() || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{assessment.mobile || "-"}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {assessment.systolic || "-"}/{assessment.diastolic || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {assessment.pulse || "-"}
                      </TableCell>
                      <TableCell>
                        {assessment.bmi ? (
                          <span className={`${parseFloat(assessment.bmi) > 25 ? "text-orange-500" : "text-success"}`}>
                            {parseFloat(assessment.bmi).toFixed(1)}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {assessment.fasting_sugar || "-"}/{assessment.post_meal_sugar || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {assessment.ldl || "-"}/{assessment.hdl || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {[
                          assessment.chest_pain,
                          assessment.shortness_of_breath,
                          assessment.dizziness,
                          assessment.fatigue,
                          assessment.swelling,
                          assessment.palpitations
                        ].filter(Boolean).length}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {assessment.smoking || "-"}
                        {Array.isArray(assessment.tobacco_use) && assessment.tobacco_use.length > 0 ? ` (${assessment.tobacco_use.join(", ")})` : (typeof assessment.tobacco_use === 'string' && assessment.tobacco_use ? ` (${assessment.tobacco_use})` : "")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate" title={assessment.diet}>
                        {assessment.diet || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate" title={assessment.exercise}>
                        {assessment.exercise || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {assessment.risk_score ? `${assessment.risk_score.toFixed(1)}%` : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {assessment.heart_age ? `${assessment.heart_age} yrs` : (assessment.age ? `${assessment.age} yrs` : "-")}
                      </TableCell>
                      <TableCell className="font-bold text-accent whitespace-nowrap">
                        {calcCVScore(assessment)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-accent hover:text-accent hover:bg-accent/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/heart-health-results?id=${assessment.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="sm:justify-between items-center border-t border-accent/10 pt-4">
            <p className="text-xs text-muted-foreground">
              Showing {allAssessments.length} records
            </p>
            <Button variant="outline" onClick={() => setReportsTableOpen(false)}>Close Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
