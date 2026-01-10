import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Heart, MessageCircle, Phone, Home, Activity, CheckCircle, AlertCircle, Download, Edit, Save, X, ArrowLeft, Eye, Search, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { envConfig } from "@/lib/envApi";
import jsPDF from "jspdf";
import logoImg from "@/assets/logo.png";

// Constants and Configuration Objects
const BP_CHART = [
  { category: "High Blood Pressure - Stage 4", label: "Hypertensive Crisis", systolic: { min: 210, max: null, condition: "above" }, diastolic: { min: 120, max: null, condition: "above" } },
  { category: "High Blood Pressure - Stage 3", label: "Hypertensive Crisis", systolic: { min: 180, max: 210 }, diastolic: { min: 110, max: 120 } },
  { category: "High Blood Pressure - Stage 2", label: "Hypertension", systolic: { min: 160, max: 179 }, diastolic: { min: 100, max: 109 } },
  { category: "High Blood Pressure - Stage 1", label: "Hypertension", systolic: { min: 140, max: 159 }, diastolic: { min: 90, max: 99 } },
  { category: "Pre-High Blood Pressure", label: "Pre-Hypertension", systolic: { min: 130, max: 139 }, diastolic: { min: 85, max: 89 } },
  { category: "High Normal Blood Pressure", label: "Normal", systolic: { min: 121, max: 129 }, diastolic: { min: 81, max: 84 } },
  { category: "Normal Blood Pressure", label: "Ideal Blood Pressure", systolic: { min: 100, max: 120 }, diastolic: { min: 65, max: 80 } },
  { category: "Low Normal Blood Pressure", label: "Normal", systolic: { min: 90, max: 99 }, diastolic: { min: 60, max: 64 } },
  { category: "Low Blood Pressure", label: "Moderate Hypotension", systolic: { min: 70, max: 89 }, diastolic: { min: 40, max: 59 } },
  { category: "Too Low Blood Pressure", label: "Severe Hypotension", systolic: { min: 50, max: 69 }, diastolic: { min: 35, max: 39 } },
  { category: "Extremely Low Blood Pressure", label: "Extremely Severe Hypotension", systolic: { min: null, max: 50, condition: "below" }, diastolic: { min: null, max: 35, condition: "below" } }
];

const BMI_CATEGORIES = [
  { max: 18.5, category: "Underweight", risks: [] },
  { max: 25, category: "Normal", risks: [] },
  { max: 30, category: "Overweight", risks: ["Type 2 diabetes", "Hypertension", "Heart disease"] },
  { max: 35, category: "Obese (Class I)", risks: ["Type 2 diabetes", "Hypertension", "Heart disease", "Fatty liver", "Joint problems"] },
  { max: 40, category: "Obese (Class II)", risks: ["Type 2 diabetes", "Hypertension", "Heart disease", "Fatty liver", "Joint problems", "Sleep apnea"] },
  { max: Infinity, category: "Obese (Class III)", risks: ["Type 2 diabetes", "Hypertension", "Heart disease", "Fatty liver", "Joint problems", "Sleep apnea", "Multiple comorbidities"] }
];

const BMI_SIMPLE_CATEGORIES = [
  { max: 18.5, category: "Underweight" },
  { max: 25, category: "Normal" },
  { max: 30, category: "Overweight" },
  { max: Infinity, category: "Obese" }
];

const CV_RISK_LEVELS = [
  { min: 90, level: "Very High Risk", color: "text-warning" },
  { min: 70, level: "High Risk", color: "text-warning" },
  { min: 50, level: "Moderate Risk", color: "text-health-orange" },
  { min: 0, level: "Low Risk", color: "text-success" }
];

const RISK_CATEGORIES = [
  { max: 5, level: "Excellent", color: "text-success" },
  { max: 10, level: "Good", color: "text-health-green" },
  { max: 20, level: "Moderate", color: "text-health-orange" },
  { max: Infinity, level: "High", color: "text-warning" }
];

const BLOOD_SUGAR_THRESHOLDS = {
  fasting: { normal: 100, preDiabetic: 126 },
  postMeal: { normal: 140, preDiabetic: 200 }
};

const BP_RISKS = ["Stroke", "Heart disease", "Kidney damage"];

const IDEAL_BMI_RANGE = { min: 18.5, max: 24.9 };

const LDL_LEVELS = [
  { max: 100, label: "✓ Optimal", color: "text-success" },
  { max: 130, label: "Near Optimal", color: "text-health-green" },
  { max: 160, label: "⚠ Borderline High", color: "text-health-orange" },
  { max: 190, label: "⚠ High", color: "text-warning" },
  { max: Infinity, label: "⚠ Very High", color: "text-warning" }
];

const HDL_LEVELS = [
  { max: 40, label: "⚠ Low (Risk Factor)", color: "text-warning" },
  { max: 60, label: "Normal", color: "text-health-orange" },
  { max: Infinity, label: "✓ High (Protective)", color: "text-success" }
];

const LOW_ACTIVITY_LEVELS = ["Sedentary", "Light", "None"];

const NON_SMOKING_VALUES = ["No", "Never"]; 

// const Assessment = {
//   id,
//   name,
//   age,
//   gender,
//   bmi,
//   heart_age,
//   risk_score,
//   systolic,
//   diastolic,
//   ai_insights,
//   created_at,
//   exercise,
//   smoking,
//   // New fields from revamp
//   chest_pain,
//   shortness_of_breath,
//   dizziness,
//   fatigue,
//   ldl,
//   hdl,
//   fasting_sugar,
//   post_meal_sugar,
//   swelling,
//   palpitations,
//   family_history,
//   user_notes,
//   diet_plan,
// }

const ADMIN_EMAIL = ["subahan.official@gmail.com" , "10000heartsteam@gmail.com" , "bhavanidevi0101@gmail.com","sannykumar085@gmail.com","sannyert848@gmail.com","sriradha2dart@gmail.com","abdul9676511756@gmail.com"];

export default function HeartHealthResults() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get("id");
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allAssessments, setAllAssessments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingData, setEditingData] = useState({});
  const [saving, setSaving] = useState(false);

  const [accessDenied, setAccessDenied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  
  const isAdmin = useMemo(() => {
    const currentEmail = user?.email?.toLowerCase().trim();
    return currentEmail && ADMIN_EMAIL.some(email => email.toLowerCase().trim() === currentEmail);
  }, [user]);

  const filteredAssessments = useMemo(() => {
    if (!searchQuery) return allAssessments;
    
    const lowerQuery = searchQuery.toLowerCase();
    return allAssessments.filter(item => 
      (item.name && item.name.toLowerCase().includes(lowerQuery)) || 
      (item.mobile && item.mobile.includes(searchQuery))
    );
  }, [allAssessments, searchQuery]);

  const paginatedAssessments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAssessments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAssessments, currentPage]);

  const totalPages = Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (assessmentId) {
      setIsModalOpen(true);
    }
  }, [assessmentId]);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to view your results");
      navigate("/auth");
      return;
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadUserAndAssessments = useCallback(async (targetUserId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUser(user);
      
      let query = supabase
        .from(envConfig.heart_health_assessments)
        .select("*")
        .order("created_at", { ascending: false });

      // Admin sees ALL reports. Regular users see ONLY their own.
      // If targetUserId is specifically passed (e.g. Admin filtering by user), we use it.
      const currentEmail = user.email?.toLowerCase().trim();
      const isAdmin = currentEmail && ADMIN_EMAIL.some(email => email.toLowerCase().trim() === currentEmail);
      
      if (!isAdmin) {
        query = query.eq("email", currentEmail);
      } else if (targetUserId) {
         // If Admin wants to see specific user history - this might need careful adjustment if we rely on email
        query = query.eq("user_id", targetUserId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAllAssessments(data || []);
    } catch (error) {
      console.error("Error loading assessments:", error);
    }
  }, []);

  const loadAssessment = useCallback(async () => {
    if (!assessmentId) return;
    
    try {
      const { data, error } = await supabase
        .from(envConfig.heart_health_assessments)
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (error) throw error;

      // Access Control Check
      const currentEmail = user.email?.toLowerCase().trim();
      const isAdmin = currentEmail && ADMIN_EMAIL.some(email => email.toLowerCase().trim() === currentEmail);
      const isRecordEmailMatch = data.email?.toLowerCase().trim() === currentEmail;

      if (!isAdmin && !isRecordEmailMatch) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      
      // Parse ai_insights if it's a string
      if (data && data.ai_insights) {
        if (typeof data.ai_insights === 'string') {
          try {
            data.ai_insights = JSON.parse(data.ai_insights);
          } catch (e) {
            console.warn("Failed to parse ai_insights:", e);
          }
        }
      }
      
      setAssessment(data);
      setEditingData(data || {});
      
      // If admin, load ALL assessments (don't filter by user).
      // If regular user, load their own.
      if (isAdmin) {
        loadUserAndAssessments(); // No ID = Fetch All
      } else {
        loadUserAndAssessments(); // No ID + !Admin = Fetch Own
      }

    } catch (error) {
      console.error("Error loading assessment:", error);
      toast.error(error.message || "Failed to load assessment results");
      navigate("/heart-health");
    } finally {
      setLoading(false);
    }
  }, [assessmentId, user, navigate, loadUserAndAssessments]);

  useEffect(() => {
    // If we have a user
    if (user) {
      if (assessmentId) {
        // Detail View: Load specific assessment (handles its own loading state)
        loadAssessment();
      } else {
        // Dashboard View: Load list and manually stop loading
        loadUserAndAssessments().finally(() => setLoading(false));
      }
    }
  }, [assessmentId, user, loadAssessment, loadUserAndAssessments]);

  const handleEdit = () => {
    setEditingData(assessment ? { ...assessment } : {});
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setEditingData(assessment ? { ...assessment } : {});
    setIsEditMode(false);
  };

  const handleFieldChange = (field, value) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const confirmDelete = async () => {
    if (!assessmentToDelete) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from(envConfig.heart_health_assessments)
        .delete()
        .eq("id", assessmentToDelete);

      if (error) throw error;

      setAllAssessments(prev => prev.filter(item => item.id !== assessmentToDelete));
      if (assessmentId === assessmentToDelete) {
        setIsModalOpen(false);
        navigate("/heart-health-results");
      }
      toast.success("Assessment deleted successfully");
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error(`Failed to delete assessment: ${error.message}`);
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
      setAssessmentToDelete(null);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setAssessmentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const markAsSent = async (id) => {
    try {
      const { error } = await supabase
        .from(envConfig.heart_health_assessments)
        .update({ is_report_send: true })
        .eq("id", id);

      if (error) throw error;

      // Update local state for all assessments
      setAllAssessments(prev => 
        prev.map(item => item.id === id ? { ...item, is_report_send: true } : item)
      );
      
      // Update individual assessment if it's the one currently being viewed
      if (assessment?.id === id) {
        setAssessment(prev => ({ ...prev, is_report_send: true }));
      }
    } catch (error) {
      console.error("Error marking as sent:", error);
    }
  };

  const handleToggleSent = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from(envConfig.heart_health_assessments)
        .update({ is_report_send: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      // Update local state for all assessments
      setAllAssessments(prev => 
        prev.map(item => item.id === id ? { ...item, is_report_send: !currentStatus } : item)
      );
      
      // Update individual assessment if it's the one currently being viewed
      if (assessment?.id === id) {
        setAssessment(prev => ({ ...prev, is_report_send: !currentStatus }));
      }

      toast.success(`Report marked as ${!currentStatus ? "sent" : "not sent"}`);
    } catch (error) {
      console.error("Error toggling sent status:", error);
      toast.error(`Failed to update status: ${error.message || "Unknown error"}`);
    }
  };

  const handleRegenerateInsights = async () => {
    if (!assessmentId) return;
    
    toast.info("Regenerating insights...");
    
    try {
      const { error } = await supabase.functions.invoke("generate-health-insights", {
        body: { assessmentId: assessmentId }
      });
      
      if (error) {
        console.error("Error generating insights:", error);
        toast.error("Failed to regenerate insights");
      } else {
        toast.success("Insights regenerated!");
        await loadAssessment();
      }
    } catch (error) {
      console.error("Error regenerating insights:", error);
      toast.error("Failed to regenerate insights");
    }
  };

  const handleSave = async () => {
    if (!assessment || !assessmentId) return;

    setSaving(true);
    try {
      // Prepare updated data with proper type conversions
      const updatedData = {
        ...editingData,
        age: editingData.age ? parseInt(editingData.age) : null,
        height: editingData.height ? parseFloat(editingData.height) : null,
        weight: editingData.weight ? parseFloat(editingData.weight) : null,
        systolic: editingData.systolic ? parseInt(editingData.systolic) : null,
        diastolic: editingData.diastolic ? parseInt(editingData.diastolic) : null,
        pulse: editingData.pulse ? parseInt(editingData.pulse) : null,
        ldl: editingData.ldl ? parseInt(editingData.ldl) : null,
        hdl: editingData.hdl ? parseInt(editingData.hdl) : null,
        fasting_sugar: editingData.fasting_sugar ? parseInt(editingData.fasting_sugar) : null,
        post_meal_sugar: editingData.post_meal_sugar ? parseInt(editingData.post_meal_sugar) : null,
        sleep_hours: editingData.sleep_hours ? parseFloat(editingData.sleep_hours) : null,
      };

      // Calculate BMI if height/weight changed
      if (updatedData.height && updatedData.weight) {
        updatedData.bmi = calculateBMI(updatedData.height, updatedData.weight);
      }

      // Update assessment in database
      const { data, error } = await supabase
        .from(envConfig.heart_health_assessments)
        .update(updatedData)
        .eq("id", assessmentId)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Assessment updated successfully!");

      // Call edge function to regenerate insights
      const { error: insightsError } = await supabase.functions.invoke("generate-health-insights", {
        body: { assessmentId: assessmentId }
      });

      if (insightsError) {
        console.error("Error generating insights:", insightsError);
        toast.error("Assessment updated but insights generation failed");
      } else {
        toast.success("Health insights regenerated successfully!");
      }

      // Reload assessment data
      await loadAssessment();
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating assessment:", error);
      toast.error("Failed to update assessment. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const calculateCardiovascularScore = () => {
    if (!assessment) return 0;
    const scoreReductions = [
      { condition: (assessment?.bmi ?? 0) > 25, reduction: 10 },
      { condition: (assessment?.systolic ?? 0) > 140, reduction: 15 },
      { condition: assessment?.risk_score, reduction: (assessment?.risk_score ?? 0) * 2 }
    ];
    const totalReduction = scoreReductions
      .filter(item => item.condition)
      .reduce((sum, item) => sum + item.reduction, 0);
    return Math.max(0, Math.round(100 - totalReduction));
  };

  // Helper functions using declarative patterns
  const matchesRange = (value, range) => {
    if (value == null) return false;
    const min = range.min ?? -Infinity;
    const max = range.max ?? Infinity;
    const conditionHandlers = {
      above: () => value >= min,
      below: () => value <= max,
      default: () => value >= min && value <= max
    };
    return (conditionHandlers[range.condition] || conditionHandlers.default)();
  };

  const findLevel = (value, type = "systolic") => {
    const level = BP_CHART.find((chart, index) => matchesRange(value, chart[type]));
    return level ? { index: BP_CHART.indexOf(level), ...level } : null;
  };

  const getBPCategory = () => {
    const systolic = assessment?.systolic;
    const diastolic = assessment?.diastolic;
    
    if (systolic == null || diastolic == null) {
      return { category: "Unknown", label: "Not enough data", detail: "Add both systolic and diastolic values." };
    }

    const sysLevel = findLevel(systolic, "systolic");
    const diaLevel = findLevel(diastolic, "diastolic");

    if (!sysLevel && !diaLevel) {
      return { category: "Unknown", label: "Out of chart", detail: "Values are outside expected ranges." };
    }

    const picked = !sysLevel ? diaLevel : !diaLevel ? sysLevel : (sysLevel?.index <= diaLevel?.index ? sysLevel : diaLevel);

    const detailMap = {
      bothEqual: () => `Systolic and diastolic are both in ${picked?.label?.toLowerCase() ?? ''} range.`,
      sysHigher: () => `Systolic is higher (${sysLevel?.label?.toLowerCase() ?? ''}) while diastolic is ${diaLevel?.label?.toLowerCase() ?? ''}.`,
      diaHigher: () => `Diastolic is higher (${diaLevel?.label?.toLowerCase() ?? ''}) while systolic is ${sysLevel?.label?.toLowerCase() ?? ''}.`,
      sysOnly: () => `Only systolic available: ${sysLevel?.label ?? ''}`,
      diaOnly: () => `Only diastolic available: ${diaLevel?.label ?? ''}`
    };

    const getDetail = () => {
      if (sysLevel && diaLevel) {
        if (sysLevel?.index === diaLevel?.index) return detailMap.bothEqual();
        if ((sysLevel?.index ?? 0) < (diaLevel?.index ?? 0)) return detailMap.sysHigher();
        return detailMap.diaHigher();
      }
      return sysLevel ? detailMap.sysOnly() : detailMap.diaOnly();
    };

    return {
      category: picked?.category ?? '',
      label: picked?.label ?? '',
      detail: getDetail(),
      severityIndex: picked?.index ?? 0,
    };
  };

  const getWeightRecommendation = () => {
    const { height, weight } = assessment || {};
    if (!height || !weight) return null;
    
    const heightMeters = height / 100;
    if (heightMeters <= 0) return null;
    
    const idealMin = IDEAL_BMI_RANGE.min * heightMeters * heightMeters;
    const idealMax = IDEAL_BMI_RANGE.max * heightMeters * heightMeters;
    
    const weightActions = {
      lose: () => ({ action: "lose", kg: weight - idealMax, range: [idealMin, idealMax] }),
      gain: () => ({ action: "gain", kg: idealMin - weight, range: [idealMin, idealMax] }),
      maintain: () => ({ action: "maintain", kg: 0, range: [idealMin, idealMax] })
    };
    
    if (weight > idealMax) return weightActions.lose();
    if (weight < idealMin) return weightActions.gain();
    return weightActions.maintain();
  };

  const getBloodSugarClassification = () => {
    const { post_meal_sugar, fasting_sugar } = assessment || {};
    
    const classifySugar = (value, thresholds, type) => {
      if (value < thresholds.normal) return { status: "Normal", value, type };
      if (value < thresholds.preDiabetic) return { status: "PRE-DIABETIC (risk)", value, type };
      return { status: "DIABETIC", value, type };
    };
    
    if (post_meal_sugar) {
      return classifySugar(post_meal_sugar, BLOOD_SUGAR_THRESHOLDS.postMeal, "2-hour Post-prandial");
    }
    
    if (fasting_sugar) {
      return classifySugar(fasting_sugar, BLOOD_SUGAR_THRESHOLDS.fasting, "Fasting");
    }
    
    return null;
  };

  const bpInfo = useMemo(() => getBPCategory(), [assessment?.systolic, assessment?.diastolic]);
  const sugarInfo = useMemo(() => getBloodSugarClassification(), [assessment?.fasting_sugar, assessment?.post_meal_sugar]);
  const weightRec = useMemo(() => getWeightRecommendation(), [assessment?.height, assessment?.weight]);

  const getBMICategory = () => {
    const bmi = assessment?.bmi;
    if (!bmi) return "Unknown";
    const category = BMI_SIMPLE_CATEGORIES.find(cat => bmi < cat.max);
    return category?.category || "Unknown";
  };

  const getCVRiskLevel = () => {
    const score = calculateCardiovascularScore();
    const level = CV_RISK_LEVELS.find(lvl => score >= lvl.min);
    return level || CV_RISK_LEVELS[CV_RISK_LEVELS.length - 1];
  };

  const getHeartAgeMessage = () => {
    const heartAge = assessment?.heart_age || assessment?.age || 0;
    const actualAge = assessment?.age || 0;
    const ageDiff = heartAge - actualAge;
    
    const messages = {
      older: () => `Your heart is behaving ${Math.abs(ageDiff)} years older than your actual age`,
      younger: () => `Your heart is ${Math.abs(ageDiff)} years younger than your actual age!`,
      same: () => "Your heart age matches your actual age"
    };
    
    if (ageDiff > 0) return messages.older();
    if (ageDiff < 0) return messages.younger();
    return messages.same();
  };

  const getRiskCategory = () => {
    const risk = assessment?.risk_score || 0;
    const category = RISK_CATEGORIES.find(cat => risk < cat.max);
    return category || RISK_CATEGORIES[RISK_CATEGORIES.length - 1];
  };

  const getBMIClassification = () => {
    const bmi = assessment?.bmi;
    if (!bmi) return null;
    const classification = BMI_CATEGORIES.find(cat => bmi < cat.max);
    return classification ? { class: classification.category, risks: classification.risks } : null;
  };

  const formatAgeSex = () => {
    const currentData = isEditMode ? editingData : assessment;
    const age = currentData?.age;
    const gender = currentData?.gender;
    if (!age) return "N/A";
    
    const genderMap = {
      male: "male",
      female: "female"
    };
    
    const normalizedGender = gender?.toString().toLowerCase();
    const genderText = genderMap[normalizedGender] || normalizedGender || "N/A";
    return `${age}-year-old ${genderText}`;
  };

  const downloadPDFReport = async (action = 'download') => {
    try {
      if (!assessment) {
        toast.error("Assessment data not available");
        return;
      }

    // Load logo image and convert to base64 data URL
    let logoDataUrl = null; // Black logo for header
    let logoWatermarkUrl = null; // Original logo with opacity for watermark (unchanged)
    try {
      const response = await fetch(logoImg);
      const blob = await response.blob();
      const imageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Convert header logo to black color (attractive black logo)
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Convert all visible pixels to black, preserving transparency
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 10) { // If pixel is visible (not transparent)
          // Convert to black, preserve alpha channel
          data[i] = 0;     // Red = black
          data[i + 1] = 0; // Green = black
          data[i + 2] = 0; // Blue = black
          // Alpha channel stays the same to preserve transparency shape
        }
      }
      ctx.putImageData(imageData, 0, 0);
      
      // Black logo for header (attractive black logo)
      logoDataUrl = canvas.toDataURL('image/png');
      
      // Watermark logo - keep original colors with opacity (light teal/muted blue)
      const watermarkCanvas = document.createElement('canvas');
      watermarkCanvas.width = img.width;
      watermarkCanvas.height = img.height;
      const watermarkCtx = watermarkCanvas.getContext('2d');
      
      // Set opacity (0.12 = 12% opacity for subtle watermark that doesn't interfere with content)
      // This creates a light, muted watermark appearance matching the image
      watermarkCtx.globalAlpha = 0.12;
      watermarkCtx.drawImage(img, 0, 0); // Use original image with medical symbols
      
      // Convert canvas to data URL for watermark
      logoWatermarkUrl = watermarkCanvas.toDataURL('image/png');
    } catch (error) {
      console.error("Error loading logo:", error);
      // Continue without logo, will use text fallback
    }

    // Create PDF with explicit format to ensure consistent size across all PDFs
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Standardized PDF Styles - All styles defined here for consistency
    const PDF_STYLES = {
      fontSize: {
        title: 14,
        sectionHeader: 14,
        subsectionHeader: 14,
        body: 10,
        small: 8,
        headerTagline: 9,
        footer: 10,
        watermark: 50
      },
      color: {
        black: [0, 0, 0],
        darkGray: [60, 60, 60],
        lightGray: [80, 80, 80],
        red: [200, 0, 0],
        white: [255, 255, 255],
        teal: [144, 238, 224],
        lightRed: [255, 240, 240],
        lightBlue: [240, 248, 255],
        skyBlue: [173, 216, 230], // Sky blue for Patient Summary background
        separatorGray: [200, 200, 200],
        watermarkGray: [220, 220, 220]
      },
      spacing: {
        afterHeader: 3, 
        afterSectionHeader: 3, 
        afterSubsectionHeader: 3, 
        betweenItems: 3,
        significantlyBetweenSpace : 6, 
        betweenSections: 3, 
        afterSubsection: 3, 
        titleTop: 30, 
        titleExtraSpace: 3,
        pageMargin: 20,
        contentIndent: 10,
        boxPadding: 3,
        headerHeight: 8,
        subsectionHeaderHeight: 5,
        headerTextOffset: 1,
        headerBoxOffset: 5,
        subsectionBoxOffset: 4,
        headerBottomMargin: 5,
        lineHeightFactor: 5
      },
      lineWidth: {
        separator: 0.5,
        headerLine: 1
      }
    };

    // Helper function to set standard subsection header style (Simple, Bold, No Background)
    const setSubsectionHeader = (text, y) => {
      // Add generous spacing before subheading
      y += 8; // Increased from 5
      checkPageBreak(15);
      
      const headerHeight = PDF_STYLES.spacing.subsectionHeaderHeight;
      
      // Calculate text vertical center (no box anymore)
      const textY = y + (headerHeight / 1.5);
      
      // Bold subheading text - Dark Gray/Black, No Background Box
      doc.setFontSize(PDF_STYLES.fontSize.subsectionHeader);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(PDF_STYLES.color.darkGray[0], PDF_STYLES.color.darkGray[1], PDF_STYLES.color.darkGray[2]);
      
      // Draw text directly
      doc.text(text, PDF_STYLES.spacing.pageMargin, textY);
      
      // Draw a line under the subsection header for separation (optional, but looks professional)
      // doc.line(PDF_STYLES.spacing.pageMargin, textY + 2, PDF_STYLES.spacing.pageMargin + 30, textY + 2);

      // Reset font
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
      
      return y + headerHeight + PDF_STYLES.spacing.afterSubsectionHeader + 2; // Extra gap after header content
    };
    
    // Helper function to check if value is abnormal and highlight it (labels are bold) - returns new Y
    const addValueWithHighlight = (label, value, isAbnormal, x, y, maxWidth = 170) => {
      // First, check if we need a page break for the label
      yPosition = y;
      checkPageBreak(5);
      const currentY = yPosition;
      
      doc.setFont("helvetica", "bold");
      const labelWidth = doc.getTextWidth(label);
      doc.text(label, x, currentY);
      doc.setFont("helvetica", "normal");
      
      const valueX = x + labelWidth + 2;
      const valueWidth = maxWidth - (labelWidth + 2);
      
      if (isAbnormal) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 0, 0);
      }
      
      const newY = addWrappedText(value.toString(), valueX, currentY, valueWidth);
      
      if (isAbnormal) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
      }
      
      return newY;
    };
    
    // Helper function to add label and value with bold label - returns new Y
    const addLabelValue = (label, value, x, y, maxWidth = 170, lineHeight = null) => {
      // First, check if we need a page break for the label
      yPosition = y;
      checkPageBreak(5);
      const currentY = yPosition;
      
      doc.setFont("helvetica", "bold");
      const labelWidth = doc.getTextWidth(label);
      doc.text(label, x, currentY);
      doc.setFont("helvetica", "normal");
      
      const valueX = x + labelWidth + 2;
      const valueWidth = maxWidth - (labelWidth + 2);
      
      return addWrappedText(value.toString(), valueX, currentY, valueWidth, PDF_STYLES.fontSize.body, lineHeight);
    };

    // Helper function to set standard body text style
    const setBodyText = () => {
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
    };

    // Helper function to add text with word wrapping and page break support
    const addWrappedText = (text, x, y, maxWidth, fontSize = 10, lineHeight = null) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      const spacing = lineHeight || (PDF_STYLES.spacing.betweenItems * 2); 
      let currentY = y;
      
      lines.forEach((line) => {
        yPosition = currentY;
        checkPageBreak(spacing);
        currentY = yPosition;
        
        doc.text(line, x, currentY);
        currentY += spacing;
      });
      
      yPosition = currentY;
      return currentY;
    };

    // Helper function to add footer to page (matching header color) - MUST be defined before checkPageBreak
    const addFooter = () => {
      const contactInfoHeight = 12; // Height of contact info band
      const disclaimerHeight = 17; // Height for disclaimer band
      const lineHeight = 1; // Height for separator line
      const bottomMargin = 1; // Minimal space from bottom
      const totalFooterHeight = contactInfoHeight + disclaimerHeight + lineHeight;
      const footerStartY = pageHeight - totalFooterHeight - bottomMargin;
      
      // Contact info (no background color - plain white background)
      // Contact info text (dark gray/black text) with icons - using dynamic color and font size
      doc.setTextColor(PDF_STYLES.color.darkGray[0], PDF_STYLES.color.darkGray[1], PDF_STYLES.color.darkGray[2]);
      doc.setFontSize(PDF_STYLES.fontSize.footer);
      doc.setFont("helvetica", "normal"); // Helvetica font
      
      // Contact info from left to right with icon symbols
      const contactY = footerStartY + (contactInfoHeight / 2) + 2; // Center vertically
      // Using simple symbols: @ for website/globe, ☎ for phone, @ for Instagram
      const contactText = "WWW.10000hearts.com  |  +91 8977757494  |  @10000hearts.ai";
      doc.text(contactText, pageWidth / 2, contactY, { align: "center" });
      
      // Thin horizontal line separator - using dynamic color and line width
      doc.setDrawColor(PDF_STYLES.color.separatorGray[0], PDF_STYLES.color.separatorGray[1], PDF_STYLES.color.separatorGray[2]);
      doc.setLineWidth(PDF_STYLES.lineWidth.separator);
      const lineY = footerStartY + contactInfoHeight;
      doc.line(PDF_STYLES.spacing.pageMargin, lineY, pageWidth - PDF_STYLES.spacing.pageMargin, lineY);
      
      // Disclaimer band (teal background matching header) - using dynamic color
      const disclaimerY = lineY;
      doc.setFillColor(PDF_STYLES.color.teal[0], PDF_STYLES.color.teal[1], PDF_STYLES.color.teal[2]);
      doc.rect(0, disclaimerY, pageWidth, disclaimerHeight, "F");
      
      // Disclaimer text (dark gray text for better readability) - using dynamic color and font size
      doc.setTextColor(PDF_STYLES.color.darkGray[0], PDF_STYLES.color.darkGray[1], PDF_STYLES.color.darkGray[2]);
      doc.setFontSize(PDF_STYLES.fontSize.footer);
      doc.setFont("helvetica", "normal"); // Helvetica normal
      const disclaimerText = "Disclaimer: The health insights provided are for general wellness and educational purposes only, based on the basic information you share. This is not medical advice or a diagnosis please consult a certified doctor for any medical concerns.";
      const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 40);
      const disclaimerTextY = disclaimerY + (disclaimerHeight / 2) - ((disclaimerLines.length - 1) * 2.5) + 2;
      doc.text(disclaimerLines, pageWidth / 2, disclaimerTextY, { align: "center" });
      
      // Reset text color - using dynamic color
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
    };

    // Helper function to add header to page (matching reference image) - MUST be defined before checkPageBreak
    const addHeader = (logoData) => {
      const bandHeight = 25; // Height of the teal band
      const leftGap = PDF_STYLES.spacing.pageMargin; // Gap from left for text - using dynamic spacing
      
      // Draw curved teal band on the right side (using rectangle with curved effect)
      const bandStartX = pageWidth * 0.4; // Band starts around 40% from left
      const bandWidth = pageWidth - bandStartX;
      
      // Draw the teal band (rounded on left side using circles for curved effect) - using dynamic color
      doc.setFillColor(PDF_STYLES.color.teal[0], PDF_STYLES.color.teal[1], PDF_STYLES.color.teal[2]);
      // Main rectangle
      doc.rect(bandStartX + 3, 0, bandWidth - 3, bandHeight, "F");
      // Rounded left edge using circles
      doc.circle(bandStartX + 3, 3, 3, "F");
      doc.circle(bandStartX + 3, bandHeight - 3, 3, "F");
      doc.rect(bandStartX, 3, 3, bandHeight - 6, "F");
      
      // Left side text (in white space) - using dynamic colors and font sizes
      doc.setTextColor(PDF_STYLES.color.darkGray[0], PDF_STYLES.color.darkGray[1], PDF_STYLES.color.darkGray[2]);
      doc.setFontSize(PDF_STYLES.fontSize.sectionHeader);
      doc.setFont("helvetica", "bold"); // Helvetica bold
      doc.text("10000 HEARTS", leftGap, 12);
      doc.setFontSize(PDF_STYLES.fontSize.headerTagline);
      doc.setFont("helvetica", "normal"); // Helvetica normal
      doc.setTextColor(PDF_STYLES.color.lightGray[0], PDF_STYLES.color.lightGray[1], PDF_STYLES.color.lightGray[2]);
      doc.text("Your Health We protect", leftGap, 18);
      
      // Black logo inside teal band (towards the right) - attractive black logo
      if (logoData) {
        try {
          const logoSize = 28; // Larger logo size for better visibility and attractiveness
          const logoX = pageWidth - logoSize - 12; // Position towards right with better spacing
          const logoY = 1; // Positioned near top for better alignment
          doc.addImage(logoData, 'PNG', logoX, logoY, logoSize, logoSize, undefined, 'FAST');
        } catch (error) {
          console.error("Error adding header logo:", error);
        }
      }
      
      // Thin straight teal line separator below
      doc.setDrawColor(PDF_STYLES.color.teal[0], PDF_STYLES.color.teal[1], PDF_STYLES.color.teal[2]);
      doc.setLineWidth(1);
      doc.line(leftGap, bandHeight, pageWidth - 20, bandHeight);
      
      // Reset text color - using dynamic color
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
    };

    // Helper function to add watermark to page (with logo image - centered on page)
    const addWatermark = (logoData) => {
      if (logoData) {
        try {
          // Calculate center position for watermark - larger size for better visibility
          const watermarkWidth = 140; // Increased logo width for better visibility
          const watermarkHeight = 140; // Increased logo height (maintain aspect ratio)
          const watermarkX = (pageWidth - watermarkWidth) / 2; // Center horizontally
          const watermarkY = (pageHeight - watermarkHeight) / 2; // Center vertically
          
          // Add logo image as watermark (centered, with opacity already applied in canvas)
          // The logo shows "10000 HEARTS" with medical symbols (stethoscope, heart with cross)
          doc.addImage(logoData, 'PNG', watermarkX, watermarkY, watermarkWidth, watermarkHeight, undefined, 'FAST');
        } catch (error) {
          console.error("Error adding watermark logo:", error);
          // Fallback to text watermark if image fails - using dynamic color and font size
          doc.setTextColor(PDF_STYLES.color.watermarkGray[0], PDF_STYLES.color.watermarkGray[1], PDF_STYLES.color.watermarkGray[2]);
          doc.setFontSize(PDF_STYLES.fontSize.watermark);
          doc.setFont("helvetica", "normal");
          doc.text("10000 HEARTS", pageWidth / 2, pageHeight / 2, { align: "center" });
          doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
        }
      } else {
        // Fallback to text watermark if no image - using dynamic color and font size
        doc.setTextColor(PDF_STYLES.color.watermarkGray[0], PDF_STYLES.color.watermarkGray[1], PDF_STYLES.color.watermarkGray[2]);
        doc.setFontSize(PDF_STYLES.fontSize.watermark);
        doc.setFont("helvetica", "normal");
        doc.text("10000 HEARTS", pageWidth / 2, pageHeight / 2, { align: "center" });
        doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
      }
    };

    // Helper function to check page break - MUST be defined before other functions that use it
    const checkPageBreak = (requiredSpace, isLastContent = false) => {
      // Header Height is 25mm + separator and margin = 35mm safe zone at top
      const safeTop = 35;
      
      // Footer Height is approx 30mm + margin = 35mm safe zone at bottom
      const safeBottom = pageHeight - 35;
      
      // Ensure content never starts before safeTop
      if (yPosition < safeTop) {
        yPosition = safeTop;
      }
      
      // Break only when content would overlap the safe area
      if (yPosition + requiredSpace > safeBottom && !isLastContent) {
          doc.addPage();
        
        // White background for new page
        doc.setFillColor(PDF_STYLES.color.white[0], PDF_STYLES.color.white[1], PDF_STYLES.color.white[2]);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        
        // Add Header, Watermark, and Footer back to the new page
        addHeader(logoDataUrl);
        addWatermark(logoWatermarkUrl);
        addFooter();
        
        // Reset Y position to content start area
        yPosition = safeTop;
      }
    };

    // Helper function to add section divider
    const addSectionDivider = (y) => {
      yPosition = y;
      checkPageBreak(5); // Check before adding divider
      const currentY = yPosition;
      
      doc.setDrawColor(PDF_STYLES.color.separatorGray[0], PDF_STYLES.color.separatorGray[1], PDF_STYLES.color.separatorGray[2]);
      doc.setLineWidth(PDF_STYLES.lineWidth.separator);
      doc.line(PDF_STYLES.spacing.pageMargin, currentY, pageWidth - PDF_STYLES.spacing.pageMargin, currentY);
      return currentY + PDF_STYLES.spacing.afterHeader; // Consistent spacing after divider
    };

    // Helper function to add section header with background (matching image style)
    const addSectionHeader = (text, y, fontSize = PDF_STYLES.fontSize.sectionHeader) => {
      yPosition = y;
      checkPageBreak(15); // Check with adequate space for header + spacing
      const currentY = yPosition;
      
      const headerHeight = PDF_STYLES.spacing.headerHeight;
      
      // Background box - light teal banner - using dynamic color
      doc.setFillColor(PDF_STYLES.color.teal[0], PDF_STYLES.color.teal[1], PDF_STYLES.color.teal[2]);
      doc.rect(PDF_STYLES.spacing.pageMargin, currentY - PDF_STYLES.spacing.headerBoxOffset, pageWidth - (PDF_STYLES.spacing.pageMargin * 2), headerHeight, "F");
      
      // Text - centered, bold, dark font - using dynamic color
      doc.setTextColor(PDF_STYLES.color.darkGray[0], PDF_STYLES.color.darkGray[1], PDF_STYLES.color.darkGray[2]);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "bold");
      const textWidth = doc.getTextWidth(text);
      const textX = (pageWidth - textWidth) / 2; // Center the text
      doc.text(text, textX, currentY + PDF_STYLES.spacing.headerTextOffset);
      
      // Reset
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
      return currentY + headerHeight + PDF_STYLES.spacing.afterSectionHeader; // More space after section header
    };
    
    // Helper function to get text width for current font settings
    const getTextWidth = (text, fontSize = 10) => {
      doc.setFontSize(fontSize);
      return doc.getTextWidth(text);
    };

    // Helper function to draw curved shape background (curved bottom-right corner)
    const drawCurvedShape = (x, y, w, h) => {
      const lightGreenColor = [144, 238, 144];
      doc.setFillColor(lightGreenColor[0], lightGreenColor[1], lightGreenColor[2]);
      
      // Draw main rectangle
      doc.rect(x, y, w, h, "F");
      
      // Add curved shape at bottom-right using a circle to create curved edge
      const curveRadius = 8; // Radius of the curve
      // Draw a circle at the bottom-right corner to create curved effect
      doc.circle(x + w - curveRadius, y + h - curveRadius, curveRadius, "F");
      
      // Also add a smaller curve for smoother appearance
      doc.circle(x + w - 5, y + h - 3, 3, "F");
    };

    // Helper function to add footer to page (matching header color) - MUST be defined before checkPageBreak


    // Helper function to add header to page (matching reference image) - MUST be defined before checkPageBreak


    // Helper function to add watermark to page (with logo image - centered on page)


    // White background (default) - using dynamic color
    doc.setFillColor(PDF_STYLES.color.white[0], PDF_STYLES.color.white[1], PDF_STYLES.color.white[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // ===== HEADER =====
      addHeader(logoDataUrl);
    
    // ===== WATERMARK =====
      addWatermark(logoWatermarkUrl);
    
    // ===== FOOTER =====
      addFooter();
    
    // Title removed - start content directly
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
    
    // Start content directly below header area (consistent on all pages)
    const headerHeight = 25;
    const headerSeparatorHeight = 1;
    const marginFromHeader = 5;
    const safeTop = headerHeight + headerSeparatorHeight + marginFromHeader;
    let yPosition = safeTop;

    // Patient Summary Section - Following form sequence order
    checkPageBreak(80); // Check before Patient Summary
    yPosition = addSectionHeader("Patient Summary", yPosition, PDF_STYLES.fontSize.sectionHeader);
    
    // Start position for summary box
    const summaryBoxStart = yPosition;
    
    // Calculate content height first - following form order
    let itemCount = 0;
    itemCount += 2; // Name and Age/Sex always present
    if (assessment?.height) itemCount++;
    if (assessment?.weight) itemCount++;
    if (assessment?.bmi) itemCount++;
    // Initial Symptoms
    if (assessment?.chest_pain || assessment?.shortness_of_breath || assessment?.dizziness || assessment?.fatigue) itemCount++;
    // Define helper variables early for use throughout PDF generation
    const bpInfo = getBPCategory();
    const sugarInfo = getBloodSugarClassification();
    const weightRec = getWeightRecommendation();
    const bmiClass = getBMIClassification(); // Define bmiClass early for use in multiple sections
    
    // Blood Pressure
    if (assessment?.systolic && assessment?.diastolic) itemCount++;
    if (assessment?.pulse) itemCount++;
    // Blood Glucose
    if (sugarInfo) itemCount++;
    // Lipid Levels
    if (assessment?.ldl || assessment?.hdl) itemCount++;
    // Diet & Activity
    if (assessment?.diet) itemCount++;
    if (assessment?.exercise) itemCount++;
    if (assessment?.water_intake) itemCount++;
    if (assessment?.profession) itemCount++;
    // Sleep & Tobacco
    if (assessment?.sleep_hours) itemCount++;
    if (assessment?.smoking) itemCount++;
    // Additional Symptoms
    if (assessment?.swelling || assessment?.palpitations || assessment?.family_history) itemCount++;
    // Personal Notes
    if (assessment?.user_notes) itemCount++;
    
    const summaryBoxHeight = (itemCount * PDF_STYLES.spacing.betweenItems) + PDF_STYLES.spacing.afterSubsection;
    
      // No background box - plain content area
    
    setBodyText();
    let summaryY = summaryBoxStart;
    
    // Following form sequence: Patient Details -> Initial Symptoms -> Blood Pressure -> Blood Glucose -> Lipid Levels -> Diet & Activity -> Sleep & Tobacco -> Additional Symptoms -> Personal Notes
    // Following form sequence: Patient Details -> Initial Symptoms -> Blood Pressure -> Blood Glucose -> Lipid Levels -> Diet & Activity -> Sleep & Tobacco -> Additional Symptoms -> Personal Notes
    // Align content with background start (pageMargin)
    const leftCol = PDF_STYLES.spacing.pageMargin;
    
    // 1. Patient Details (Step 1) - all labels bold
    summaryY = addLabelValue("Name: ", assessment?.name || "N/A", leftCol, summaryY);
    summaryY += PDF_STYLES.spacing.betweenItems;
    
    summaryY = addLabelValue("Age/Sex: ", formatAgeSex(), leftCol, summaryY);
    summaryY += PDF_STYLES.spacing.betweenItems;
    
    if (assessment?.height) {
      summaryY = addLabelValue("Height: ", `${assessment?.height} cm`, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    if (assessment?.weight) {
      summaryY = addLabelValue("Weight: ", `${assessment?.weight} kg`, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
 
    if (assessment?.profession) {
      summaryY = addLabelValue("Profession: ", assessment?.profession, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    if (assessment?.bmi) {
      const isBMIAbnormal = (assessment?.bmi ?? 0) >= 25; // Overweight or obese
      const bmiValue = `${assessment?.bmi?.toFixed(1)} kg/m² (${getBMICategory()})`;
      summaryY = addValueWithHighlight("BMI: ", bmiValue, isBMIAbnormal, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    // 2. Initial Symptoms (Step 0) - label bold
    const initialSymptoms = [];
    if (assessment?.chest_pain) initialSymptoms.push("Chest pain");
    if (assessment?.shortness_of_breath) initialSymptoms.push("Shortness of breath");
    if (assessment?.dizziness) initialSymptoms.push("Dizziness");
    if (assessment?.fatigue) initialSymptoms.push("Fatigue");
    if (initialSymptoms.length > 0) {
      summaryY = addLabelValue("Initial Symptoms: ", initialSymptoms.join(", "), leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    // 3. Blood Pressure (Step 4) - highlight if abnormal
    if (assessment?.systolic && assessment?.diastolic) {
      const isBPAbnormal = (assessment?.systolic ?? 0) >= 130 || (assessment?.diastolic ?? 0) >= 90;
      const bpValue = `${assessment?.systolic}/${assessment?.diastolic} mmHg`;
      summaryY = addValueWithHighlight("Blood Pressure: ", bpValue, isBPAbnormal, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    if (assessment?.pulse) {
      const isPulseAbnormal = (assessment?.pulse ?? 0) < 60 || (assessment?.pulse ?? 0) > 100;
      const pulseValue = `${assessment?.pulse}/min`;
      summaryY = addValueWithHighlight("Pulse: ", pulseValue, isPulseAbnormal, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    // 4. Blood Glucose (Step 5) - highlight if abnormal
    if (sugarInfo) {
      const sugarType = sugarInfo?.type === "2-hour Post-prandial" ? "2-hour Post-meal" : "Fasting";
      const isSugarAbnormal = sugarInfo?.status?.includes("PRE-DIABETIC") || sugarInfo?.status === "DIABETIC";
      const sugarValue = `${sugarInfo?.value} mg/dL`;
      summaryY = addValueWithHighlight(`${sugarType} Blood Sugar: `, sugarValue, isSugarAbnormal, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    // 5. Lipid Levels (Step 6) - highlight if abnormal
    if (assessment?.ldl || assessment?.hdl) {
      const lipidParts = [];
      let isLipidAbnormal = false;
      if (assessment?.ldl) {
        const isLDLAbnormal = (assessment?.ldl ?? 0) >= 160;
        if (isLDLAbnormal) isLipidAbnormal = true;
        lipidParts.push(`LDL: ${assessment?.ldl} mg/dL`);
      }
      if (assessment?.hdl) {
        const isHDLAbnormal = (assessment?.hdl ?? 0) < 40;
        if (isHDLAbnormal) isLipidAbnormal = true;
        lipidParts.push(`HDL: ${assessment?.hdl} mg/dL`);
      }
      const lipidValue = lipidParts.join(", ");
      summaryY = addValueWithHighlight("Lipid Levels: ", lipidValue, isLipidAbnormal, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    // 6. Diet & Activity (Step 2) - labels bold
    if (assessment?.diet) {
      summaryY = addLabelValue("Diet: ", assessment?.diet, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    if (assessment?.exercise) {
      summaryY = addLabelValue("Exercise: ", assessment?.exercise, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
 
    if (assessment?.water_intake) {
      summaryY = addLabelValue("Water Intake: ", `${assessment?.water_intake} L/day`, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    // 7. Sleep & Tobacco (Step 3) - labels bold
    if (assessment?.sleep_hours) {
      summaryY = addLabelValue("Sleep: ", `${assessment?.sleep_hours} hours/day`, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    if (assessment?.smoking && !['never', 'no'].includes(assessment.smoking.toLowerCase())) {
      summaryY = addLabelValue("Smoking: ", assessment?.smoking, leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    // 8. Additional Symptoms (Step 7) - label bold
    const additionalSymptoms = [];
    if (assessment?.swelling) additionalSymptoms.push("Swelling");
    if (assessment?.palpitations) additionalSymptoms.push("Palpitations");
    if (assessment?.family_history) additionalSymptoms.push("Family history");
    if (additionalSymptoms.length > 0) {
      summaryY = addLabelValue("Additional Symptoms: ", additionalSymptoms.join(", "), leftCol, summaryY);
      summaryY += PDF_STYLES.spacing.betweenItems;
    }
    
    // 9. Personal Notes (Step 8) - label bold with text wrapping (split enabled)
    if (assessment?.user_notes) {
      summaryY = addLabelValue("Personal Notes: ", assessment.user_notes, leftCol, summaryY, 170, 6);
      summaryY += PDF_STYLES.spacing.afterSubsection;
    }
    
    yPosition = summaryY + PDF_STYLES.spacing.afterHeader; // Auto spacing after summary box
    setBodyText(); // Reset text style for following sections

    // Interpretation of Results Section - Only show if there's content to interpret
    const hasInterpretationContent = assessment?.bmi || (assessment?.systolic && assessment?.diastolic) || sugarInfo || assessment?.pulse || assessment?.ldl || assessment?.hdl;
    
    if (hasInterpretationContent) {
      checkPageBreak(25);
    yPosition = addSectionDivider(yPosition);
    yPosition = addSectionHeader("Interpretation of Results", yPosition, PDF_STYLES.fontSize.sectionHeader);
      
      const interpStart = yPosition;
      let interpY = interpStart;

      // Weight & BMI subsection - Only show if data exists
    if (assessment?.bmi) {
      checkPageBreak(30); // Check before Weight & BMI (optimized for equal spacing)
    yPosition = setSubsectionHeader("Weight & BMI", yPosition);
    setBodyText();
      // bmiClass is already defined at the top of the function
      if (bmiClass) {
      const isBMIAbnormal = (assessment?.bmi ?? 0) >= 25; // Overweight or obese
      const bmiValue = `${assessment?.bmi?.toFixed(1)} = ${bmiClass?.class ?? ''}`;
      addValueWithHighlight("BMI: ", bmiValue, isBMIAbnormal, PDF_STYLES.spacing.pageMargin, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      
      // Ideal weight recommendation
      if (weightRec && assessment?.height) {
        const idealMin = weightRec?.range?.[0] ?? 0;
        const idealMax = weightRec?.range?.[1] ?? 0;
        const idealText = `Ideal weight for height ~${assessment?.height} cm is around `;
        const boldRange = `${idealMin.toFixed(0)}-${idealMax.toFixed(0)} kg`;
        const textWidth = getTextWidth(idealText);
        doc.text(idealText, PDF_STYLES.spacing.pageMargin, yPosition);
      doc.setFont("helvetica", "bold");
        doc.text(boldRange, PDF_STYLES.spacing.pageMargin + textWidth, yPosition);
      doc.setFont("helvetica", "normal");
        yPosition += (PDF_STYLES.spacing.betweenItems + 5); // Increased gap as requested
        
        
        if (weightRec?.action === "lose") {
          checkPageBreak(10); // Check before weight loss text
          const weightLossText = `Needs to lose ~${weightRec?.kg?.toFixed(0) ?? 0} kg, but this should be gradual and phased`;
          yPosition = addWrappedText(weightLossText, PDF_STYLES.spacing.pageMargin, yPosition, pageWidth - (PDF_STYLES.spacing.pageMargin * 2), PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
        } else if (weightRec?.action === "gain") {
        checkPageBreak(15); // Check before weight gain text
          yPosition = addWrappedText(`Needs to gain ~${weightRec?.kg?.toFixed(0) ?? 0} kg through healthy weight gain strategies.`, PDF_STYLES.spacing.pageMargin, yPosition, pageWidth - (PDF_STYLES.spacing.pageMargin * 2), PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
          yPosition += PDF_STYLES.spacing.betweenItems;
        }
      }
    }
    yPosition += PDF_STYLES.spacing.betweenSections;
    }

    // Blood Pressure subsection - Only show if data exists
    if (assessment?.systolic && assessment?.diastolic) {
      checkPageBreak(30);
      yPosition = setSubsectionHeader("Blood Pressure", yPosition);
      setBodyText();

      const sysLabel = (assessment?.systolic ?? 0) >= 130 ? "mildly elevated" : (assessment?.systolic ?? 0) < 120 ? "normal" : "elevated";
      const diaLabel = (assessment?.diastolic ?? 0) >= 90 ? "clearly high" : (assessment?.diastolic ?? 0) >= 85 ? "elevated" : "normal";
      const isSystolicAbnormal = (assessment?.systolic ?? 0) >= 130;
      const isDiastolicAbnormal = (assessment?.diastolic ?? 0) >= 90;
      addValueWithHighlight("Systolic: ", sysLabel, isSystolicAbnormal, PDF_STYLES.spacing.pageMargin, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      addValueWithHighlight("Diastolic: ", diaLabel, isDiastolicAbnormal, PDF_STYLES.spacing.pageMargin, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      
      
      if (bpInfo?.category) {
        const categoryLength = bpInfo?.category?.length ?? 0;
        const estimatedSpace = categoryLength > 30 ? 30 : 20;
        checkPageBreak(estimatedSpace);
        
        doc.setFont("helvetica", "bold");
        doc.text(`${bpInfo?.category}`, PDF_STYLES.spacing.pageMargin, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
        doc.setFont("helvetica", "normal");
      }
      
      yPosition += PDF_STYLES.spacing.afterSubsection;
    }

    // Pulse subsection - Only show if data exists (moved to appear right after Blood Pressure)
    if (assessment?.pulse) {
      checkPageBreak(20);
      yPosition = setSubsectionHeader("Pulse", yPosition);
      setBodyText();
      const pulse = assessment?.pulse ?? 0;
      const isPulseAbnormal = pulse < 60 || pulse > 100;
      const pulseStatus = isPulseAbnormal ? "Abnormal" : "Normal";
      doc.text(`Status: ${pulseStatus} (Normal range: 60-100/min)`, PDF_STYLES.spacing.pageMargin, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      yPosition += PDF_STYLES.spacing.afterSubsection;
    }

    // Blood Sugar subsection - Only show if data exists
    if (sugarInfo) {
      checkPageBreak(50);
      const sugarType = sugarInfo?.type === "2-hour Post-prandial" ? "2-hour post-meal" : "fasting";
      yPosition = setSubsectionHeader(`Blood Sugar (${sugarType})`, yPosition);
      setBodyText();
      
      // Show reference ranges
      if (sugarInfo?.type === "2-hour Post-prandial") {
        doc.text("Normal: <140 mg/dL", PDF_STYLES.spacing.pageMargin, yPosition);
          yPosition += 6; // Increased spacing
        doc.text("Prediabetes: 140-199 mg/dL", PDF_STYLES.spacing.pageMargin, yPosition);
          yPosition += 6; // Increased spacing
        doc.text("Diabetes: >=200 mg/dL", PDF_STYLES.spacing.pageMargin, yPosition);
        yPosition += 6; // Increased spacing
      } else {
        doc.text("Normal: <100 mg/dL", PDF_STYLES.spacing.pageMargin, yPosition);
          yPosition += 6; // Increased spacing
        doc.text("Prediabetes: 100-125 mg/dL", PDF_STYLES.spacing.pageMargin, yPosition);
          yPosition += 6; // Increased spacing
        doc.text("Diabetes: >=126 mg/dL", PDF_STYLES.spacing.pageMargin, yPosition);
        yPosition += 6; // Increased spacing
      }
      checkPageBreak(10);
      const isSugarAbnormal = sugarInfo?.status?.includes("PRE-DIABETIC") || sugarInfo?.status === "DIABETIC";
      const statusText = sugarInfo?.status?.includes("PRE-DIABETIC") ? "PRE-DIABETIC (risk)" : sugarInfo?.status ?? '';
      addValueWithHighlight("Status: ", statusText, isSugarAbnormal, PDF_STYLES.spacing.pageMargin, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      
      if (sugarInfo?.risks?.length > 0) {
        checkPageBreak(20 + (sugarInfo?.risks?.length * PDF_STYLES.spacing.betweenItems));
        doc.text(`This level of blood sugar increases risk of:`, PDF_STYLES.spacing.pageMargin, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
        sugarInfo?.risks?.forEach(risk => {
           // Fix bullet indentation
           doc.text(`  • ${risk}`, PDF_STYLES.spacing.pageMargin + 8, yPosition);
           yPosition += 6; // Increased spacing for bullets
        });
      }
      
      yPosition += PDF_STYLES.spacing.betweenSections;
    }

    // Lipid Levels subsection - Only show if data exists
    if (assessment?.ldl || assessment?.hdl) {
      checkPageBreak(50);
      const lipidType = assessment?.ldl && assessment?.hdl ? "Complete" : "Partial";
      yPosition = setSubsectionHeader(`Lipid Levels (${lipidType})`, yPosition);
    setBodyText();
      
      if (assessment?.ldl) {
        const isLDLAbnormal = (assessment?.ldl ?? 0) >= 160;
        const ldlStatus = (assessment?.ldl ?? 0) < 100 ? "Optimal" : (assessment?.ldl ?? 0) < 130 ? "Near optimal" : (assessment?.ldl ?? 0) < 160 ? "Borderline high" : (assessment?.ldl ?? 0) < 190 ? "High" : "Very high";
        addValueWithHighlight("LDL Status: ", ldlStatus, isLDLAbnormal, PDF_STYLES.spacing.pageMargin, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
      }
      
      if (assessment?.hdl) {
        const isHDLAbnormal = (assessment?.hdl ?? 0) < 40;
        const hdlStatus = (assessment?.hdl ?? 0) >= 60 ? "Optimal" : (assessment?.hdl ?? 0) >= 40 ? "Normal" : "Low";
        addValueWithHighlight("HDL Status: ", hdlStatus, isHDLAbnormal, PDF_STYLES.spacing.pageMargin, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
      }
      yPosition += PDF_STYLES.spacing.betweenSections;
    }
    } // End of Interpretation of Results section

    // Overall Clinical Impression - Always show (generate default if needed)
    let hasClinicalImpression = false;
    let clinicalImpressionText = "";
    
    if (assessment.ai_insights?.summary) {
      // Clean up summary text - remove JSON artifacts, curly braces, and other formatting issues
      let summaryText = assessment?.ai_insights?.summary;
      if (typeof summaryText === 'string') {
        // Remove JSON artifacts
        summaryText = summaryText.replace(/\{|\}/g, '');
        summaryText = summaryText.replace(/\[|\]/g, '');
        summaryText = summaryText.replace(/"/g, '');
        summaryText = summaryText.replace(/summary\s*:\s*/gi, '');
        summaryText = summaryText.trim();
        
        // If after cleaning it's still empty or just whitespace/braces, use fallback
        if (!summaryText || summaryText.length < 10) {
          summaryText = null;
    } else {
          hasClinicalImpression = true;
          // Capitalize first letter
          clinicalImpressionText = summaryText.trim().charAt(0).toUpperCase() + summaryText.trim().slice(1);
        }
      } else if (typeof summaryText === 'object') {
        // If it's an object, try to extract text
        summaryText = JSON.stringify(summaryText).replace(/\{|\}|\[|\]|"/g, '').trim();
        if (summaryText && summaryText.length >= 10) {
          hasClinicalImpression = true;
          // Capitalize first letter
          clinicalImpressionText = summaryText.trim().charAt(0).toUpperCase() + summaryText.trim().slice(1);
        }
      }
      
      if (!hasClinicalImpression) {
        // Fall through to generate default impression
        clinicalImpressionText = "";
      }
    }
    
    if (!hasClinicalImpression) {
    let clinicalImpression = "You are currently ";
    const conditions = [];
    if (bmiClass && bmiClass?.class?.includes("Obese")) {
      conditions.push("obese");
    }
    if (bmiClass && bmiClass?.class === "Overweight") {
      conditions.push("overweight");
    }
    if (bpInfo?.category && bpInfo?.category?.includes("High Blood Pressure")) {
      conditions.push("have early high blood pressure");
    }
    if (sugarInfo && sugarInfo?.status?.includes("PRE-DIABETIC")) {
      conditions.push("your blood sugar is in the pre-diabetic range");
    }
    if (sugarInfo && sugarInfo?.status === "DIABETIC") {
      conditions.push("have diabetes");
    }
    
      if (conditions.length > 0) {
        hasClinicalImpression = true;
    const conditionText = conditions.join(", ");
        clinicalImpressionText = conditionText + ". These conditions are interconnected and largely reversible at this stage if action is taken now.";
      } else {
        // Default message if no specific conditions
        hasClinicalImpression = true;
        clinicalImpressionText = "Your health assessment has been completed. Continue monitoring your health metrics regularly.";
      }
    }
    
    // Always show Clinical Impression section
    if (!hasClinicalImpression) {
      hasClinicalImpression = true;
      clinicalImpressionText = "Your health assessment has been completed. Continue monitoring your health metrics regularly.";
    }
    
    if (hasClinicalImpression) {
      checkPageBreak(10); // Check before divider and header - allow new page for header if needed
      yPosition = addSectionDivider(yPosition);
      yPosition = addSectionHeader("Overall Clinical Impression", yPosition, PDF_STYLES.fontSize.sectionHeader);
      
      // Start position for impression box
      const impressionBoxStart = yPosition;
      
      // Calculate content height first by estimating text lines
      setBodyText();
      let estimatedHeight = 0;
      
      if (assessment.ai_insights?.summary && clinicalImpressionText) {
        const lines = doc.splitTextToSize(clinicalImpressionText, pageWidth - 50);
        estimatedHeight = lines.length * PDF_STYLES.spacing.betweenItems;
      } else {
        let clinicalImpression = "You are currently ";
        const lines1 = doc.splitTextToSize(clinicalImpression + clinicalImpressionText, pageWidth - 50);
        estimatedHeight = lines1.length * PDF_STYLES.spacing.betweenItems + PDF_STYLES.spacing.betweenItems;
        
        const para2Text = (!sugarInfo || !sugarInfo.status.includes("DIABETIC")) 
          ? "This is NOT yet diabetes, and likely does not need medication immediately, but lifestyle changes are urgent."
          : "Medical management along with lifestyle changes is essential.";
        const lines2 = doc.splitTextToSize(para2Text, pageWidth - 50);
        estimatedHeight += lines2.length * PDF_STYLES.spacing.betweenItems;
      }
    
      setBodyText();
      
      // No background box - plain content area
      
      // Draw text - bold only (no background)
      let impressionY = yPosition;
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setFont("helvetica", "bold"); // Make content bold
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
      
      if (assessment.ai_insights?.summary && clinicalImpressionText) {
        // Capitalize first letter of the text
        const capitalizedText = clinicalImpressionText.trim().charAt(0).toUpperCase() + clinicalImpressionText.trim().slice(1);
        // Draw bold text with increased line spacing for readability
        impressionY = addWrappedText(capitalizedText, PDF_STYLES.spacing.pageMargin, impressionY, pageWidth - (PDF_STYLES.spacing.pageMargin * 2), PDF_STYLES.fontSize.body, 8);
      } else {
        let clinicalImpression = "You are currently ";
        
        // First paragraph
        // First paragraph with increased line spacing
        impressionY = addWrappedText(clinicalImpression + clinicalImpressionText, PDF_STYLES.spacing.pageMargin, impressionY, pageWidth - (PDF_STYLES.spacing.pageMargin * 2), PDF_STYLES.fontSize.body, 8);
        impressionY += 8; // Space between paragraphs
        
        // Second paragraph
        const para2Text = (!sugarInfo || !sugarInfo.status.includes("DIABETIC")) 
          ? "This is NOT yet diabetes, and likely does not need medication immediately, but lifestyle changes are urgent."
          : "Medical management along with lifestyle changes is essential.";
        impressionY = addWrappedText(para2Text, PDF_STYLES.spacing.contentIndent, impressionY, pageWidth - (PDF_STYLES.spacing.contentIndent * 2), PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
      }
      
      // Reset font to normal after Clinical Impression
      doc.setFont("helvetica", "normal");
      
      // Add "Important Note" if risk is high (matching Insights tab)
      if (assessment?.risk_score && assessment?.risk_score > 20) {
        yPosition += 5;
        const noteText = "Important Note: Based on your risk score, we strongly recommend consulting with a healthcare provider or registered dietitian for a comprehensive dietary plan tailored to your specific needs.";
        yPosition = addWrappedText(noteText, PDF_STYLES.spacing.pageMargin, yPosition, pageWidth - (PDF_STYLES.spacing.pageMargin * 2), PDF_STYLES.fontSize.body, 8);
      }
    }

    // Key Counseling Points and all subsequent sections removed from PDF - only shown in screen view

    // Footer is already added to each page via addFooter() function
    // No need to add it again here as it's rendered on every page

    // Save the PDF
    const patientName = assessment?.name || "Patient";
    const fileName = `Heart_Health_Assessment_Report_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    if (action === 'share') {
      return doc.output('blob');
    }
    
    doc.save(fileName);
    toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        assessment: assessment ? "exists" : "missing",
        assessmentId: assessment?.id
      });
      toast.error("Failed to generate PDF. Please check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-accent animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Access Denied View
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto border border-destructive/20 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-bold text-destructive mb-2">Access Restricted</h2>
          <p className="text-destructive font-medium mb-4">You are not authorized to check this report</p>
          <Button variant="outline" onClick={() => navigate("/heart-health")}>
            Back to Heart Health Assessments
          </Button>
        </div>
      </div>
    );
  }



  // Not Found View
  if (assessmentId && !assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Report not found or access denied.</p>
          <Button variant="link" onClick={() => navigate("/heart-health-results")}>
            View All Reports
          </Button>
        </div>
      </div>
    );
  }

  // Handle WhatsApp Share
  const handleWhatsAppShare = async () => {
    try {
      const message = `Hi ${assessment?.name}, Your medical camp report is ready. Please go through it once - some small health signals are easier to improve when noticed early. If you need clarity or support, you can reach us at +91 8977757494`;
    
      // 2. Direct Redirect (Text Only) - For Desktop or if Share fails
      // Direct links (wa.me) CANNOT attach files, so this is text-only.
      const waLink = `https://wa.me/${assessment?.mobile}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(waLink, "_blank");
      
      // Mark as sent in database
      if (assessment?.id) {
        markAsSent(assessment.id);
      }
      
      // Notify user about the limitation if they are expecting a file
      if (navigator.canShare) {
        toast.info("Opening WhatsApp...");
      }
      
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share report.");
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/heart-health")} className="mb-4">
          <Home className="mr-2 h-4 w-4" />
          Back to Heart Health
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-12 h-12 text-accent fill-accent" />
            <div>
              {assessmentId && assessment?.name ? (
                <h2 className="text-2xl font-bold">Hi {assessment.name},</h2>
              ) : (
                <h2 className="text-2xl font-bold">Welcome,</h2>
              )}
              <h1 className="text-3xl font-bold">Heart Health Reports</h1>
            </div>
          </div>
        </div>

        {/* Report History Table Section - Now at the top */}
        {allAssessments.length > 0 && (
          <Card className="p-6 mb-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Your Reports</h3>
              <div className="flex items-center gap-2 w-full max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name or mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full bg-background"
                  />
                </div>
              </div>
              <Button onClick={() => navigate("/heart-health")} size="sm" className="bg-accent hover:bg-accent/90">
                + Create New Report
              </Button>
            </div>
            
            <div className="rounded-md border border-border overflow-x-auto min-h-[500px]">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold text-center">Name</TableHead>
                    <TableHead className="font-bold text-center">Date</TableHead>
                    <TableHead className="font-bold text-center">Heart Age</TableHead>
                    <TableHead className="font-bold text-center">Risk (%)</TableHead>
                    <TableHead className="font-bold text-center">BMI</TableHead>
                    <TableHead className="font-bold text-center w-[100px]">Sent</TableHead>
                    <TableHead className="font-bold text-center w-[60px]">WhatsApp</TableHead>
                    {isAdmin && <TableHead className="font-bold text-center w-[60px]">Action</TableHead>}
                    <TableHead className="font-bold text-center">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 9 : 8} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  ) : paginatedAssessments.map((item, index) => {
                    const isViewing = item.id === assessmentId;
                    // Calculate real index for report number based on pagination
                    const realIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                    
                    return (
                      <TableRow 
                        key={item.id} 
                        className={`cursor-pointer transition-colors ${
                          isViewing ? "bg-accent/10 hover:bg-accent/15" : "hover:bg-muted/30"
                        }`}
                        onClick={() => {
                          navigate(`/heart-health-results?id=${item.id}`);
                          setIsModalOpen(true);
                        }}
                      >
                        <TableCell className="text-center font-medium">
                          <div className="flex flex-col items-center">
                            <span>{item.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Report #{filteredAssessments.length - realIndex}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-accent">
                          {item.heart_age || "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.risk_score ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              item.risk_score > 20 ? "bg-red-100 text-red-700" : 
                              item.risk_score > 10 ? "bg-orange-100 text-orange-700" : 
                              "bg-green-100 text-green-700"
                            }`}>
                              {item.risk_score.toFixed(1)}%
                            </span>
                          ) : "N/A"}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {item.bmi ? item.bmi.toFixed(1) : "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                            <Checkbox 
                              checked={item.is_report_send || false} 
                              onCheckedChange={() => handleToggleSent(item.id, item.is_report_send)}
                              className="h-5 w-5"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                            {item.mobile ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-[#25D366] hover:text-[#128C7E] hover:bg-[#25D366]/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const message = `Hi ${item.name}, Your medical camp report is ready. Please go through it once - some small health signals are easier to improve when noticed early. If you need clarity or support, you can reach us at +91 8977757494`;
                                  const cleanNumber = item.mobile.replace(/\D/g, '');
                                  const waLink = `https://wa.me/${cleanNumber.startsWith('91') ? cleanNumber : '91' + cleanNumber}?text=${encodeURIComponent(message)}`;
                                  window.open(waLink, "_blank");
                                  markAsSent(item.id);
                                }}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            ) : "-"}
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-center">
                            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                onClick={(e) => handleDelete(e, item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="text-center">
                          <Button
                            variant="isViewing"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isViewing) {
                                navigate(`/heart-health-results?id=${item.id}`);
                              }
                              setIsModalOpen(true);
                            }}
                          >
                            {isViewing ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                Viewing
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4" />
                                View
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {filteredAssessments.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssessments.length)} of {filteredAssessments.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Assessment Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) navigate("/heart-health-results");
        }}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto p-0 border-none bg-transparent shadow-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-accent/10 hover:[&::-webkit-scrollbar-thumb]:bg-accent/80">
            {!assessment ? (
              <div className="bg-background rounded-lg p-6 md:p-10 shadow-2xl border border-border">
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-accent animate-pulse mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading assessment details...</p>
                </div>
              </div>
            ) : (
            <div className="bg-background rounded-lg p-6 md:p-10 shadow-2xl border border-border">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl font-bold text-foreground">Assessment Details</DialogTitle>
              </DialogHeader>

              <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-foreground">Assessment Details</h3>
                  <div className="flex gap-2">
                    {!isEditMode && (
                      <>
                        <Button
                          onClick={handleWhatsAppShare}
                          className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
                          size="sm"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Consult on WhatsApp
                        </Button>
                        <Button onClick={handleEdit} variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button onClick={downloadPDFReport} variant="default" size="sm" disabled={saving}>
                          <Download className="mr-2 h-4 w-4" />
                          {saving ? "Generating..." : "Download PDF"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

        {/* Current Report Details */}
          <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Report Details - {assessment?.created_at ? new Date(assessment?.created_at).toLocaleDateString() : 'N/A'}
          </h2>
        </div>

        <Tabs defaultValue="health" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="health">Heart Health</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="risk">Risk Contributors</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment?.bmi ? assessment?.bmi?.toFixed(1) : "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">BMI</h3>
                <p className="text-xs text-muted-foreground">{getBMICategory()}</p>
                <p className="text-xs text-muted-foreground mt-2">Body Mass Index</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">{calculateCardiovascularScore()}</div>
                <h3 className="text-lg font-semibold text-accent">CV Score</h3>
                <p className={`text-xs font-medium ${getCVRiskLevel().color}`}>{getCVRiskLevel().level}</p>
                <p className="text-xs text-muted-foreground mt-2">Cardiovascular Risk</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment?.heart_age || assessment?.age || "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Age</h3>
                <p className="text-xs text-muted-foreground">vs {assessment?.age} years</p>
                <p className="text-xs text-muted-foreground mt-2">Biological Age</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment?.risk_score ? `${assessment.risk_score.toFixed(1)}%` : "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Risk</h3>
                <p className={`text-xs font-medium ${getRiskCategory().color}`}>{getRiskCategory().level}</p>
                <p className="text-xs text-muted-foreground mt-2">10-Year Risk</p>
              </Card>
            </div>

            {/* Metric Explanations */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* BMI Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">📊 What is BMI?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  BMI (Body Mass Index) tells whether your weight is healthy for your height.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">18.5 - 24.9</span>
                    <span className="font-medium text-success">Normal</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">25 - 29.9</span>
                    <span className="font-medium text-warning">Overweight</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">≥ 30</span>
                    <span className="font-medium text-danger">Obese</span>
                  </div>
                </div>
              </Card>

              {/* Blood Pressure Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">🩺 Understanding Blood Pressure</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Blood pressure measures the force of blood against artery walls.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">&lt; 120/80</span>
                      <span className="font-medium text-success">Normal</span>
                    </div>
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">120-129/&lt;80</span>
                      <span className="font-medium text-health-orange">Elevated</span>
                    </div>
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">130-139/80-89</span>
                      <span className="font-medium text-health-orange">Stage 1 High</span>
                    </div>
                    <div className="flex justify-between text-sm pb-2">
                      <span className="text-muted-foreground">≥140/≥90</span>
                      <span className="font-medium text-warning">Stage 2 High</span>
                    </div>
                  </div>
                  {bpInfo?.category && bpInfo?.category?.includes("Normal") && assessment?.systolic && assessment?.systolic < 100 && (
                    <div className="mt-4 p-3 bg-health-lightBlue rounded-lg">
                      <p className="text-xs text-foreground">
                        💡 Low-normal BP is common in athletes and active individuals. If you experience dizziness or
                        fatigue, consult your doctor.
                      </p>
                    </div>
                  )}
                  {bpInfo?.category && bpInfo?.category?.includes("High Blood Pressure") && (
                    <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                      <p className="text-xs text-foreground">
                        This level of BP, if persistent, increases risk of: • Stroke • Heart disease • Kidney damage
                      </p>
                    </div>
                  )}
            </Card>
            </div>

            {/* Cholesterol Section */}
            {(assessment?.ldl || assessment?.hdl) && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">🧪 Cholesterol Levels</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      {assessment?.ldl && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">LDL (Bad Cholesterol)</span>
                            <span
                              className={`text-2xl font-bold ${
                                (() => {
                                  const level = LDL_LEVELS.find(lvl => assessment?.ldl < lvl.max);
                                  return level?.color || "text-success";
                                })()
                              }`}
                            >
                              {assessment?.ldl}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">mg/dL</p>
                          <div className="mt-2 text-sm font-medium">
                            {(() => {
                              const level = LDL_LEVELS.find(lvl => assessment?.ldl < lvl.max);
                              return level ? <span className={level.color}>{level.label}</span> : null;
                            })()}
                          </div>
                        </div>
                      )}

                      {assessment?.hdl && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">HDL (Good Cholesterol)</span>
                            <span
                              className={`text-2xl font-bold ${
                                (() => {
                                  const level = HDL_LEVELS.find(lvl => assessment?.hdl < lvl.max);
                                  return level?.color || "text-success";
                                })()
                              }`}
                            >
                              {assessment?.hdl}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">mg/dL</p>
                          <div className="mt-2 text-sm font-medium">
                            {(() => {
                              const level = HDL_LEVELS.find(lvl => assessment?.hdl < lvl.max);
                              return level ? <span className={level.color}>{level.label}</span> : null;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Understanding Cholesterol:</h4>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="p-3 bg-warning/10 rounded-lg">
                        <p className="font-medium text-foreground mb-1">LDL (Bad Cholesterol):</p>
                        <p>High levels can build up in arteries and increase heart disease risk. Keep it low!</p>
                      </div>
                      <div className="p-3 bg-success/10 rounded-lg">
                        <p className="font-medium text-foreground mb-1">HDL (Good Cholesterol):</p>
                        <p>Helps remove bad cholesterol from arteries. Higher is better!</p>
                      </div>
                    </div>

                    {assessment?.ai_insights?.cholesterol_advice && (
                      <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">💡 Recommendation:</p>
                        <p className="text-sm text-foreground/90">{assessment?.ai_insights?.cholesterol_advice}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Summary Section */}
            <Card className="p-6 bg-accent/5">
              <h3 className="text-2xl font-bold text-accent mb-4">📋 Your Health Summary</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">BMI</span>
                    <span className="text-sm font-bold text-accent">
                      {assessment.bmi?.toFixed(1)} - {getBMICategory()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">CV Score</span>
                    <span className="text-sm font-bold text-accent">
                      {calculateCardiovascularScore()} - {getCVRiskLevel().level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Heart Age</span>
                    <span className="text-sm font-bold text-accent">
                      {assessment?.heart_age || assessment?.age} years
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">10-Year Risk</span>
                    <span className="text-sm font-bold text-accent">
                      {assessment?.risk_score?.toFixed(1)}% - {getRiskCategory()?.level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Blood Pressure</span>
                    <span className="text-sm font-bold text-accent">
                          {assessment?.systolic}/{assessment?.diastolic} - {bpInfo?.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Age</span>
                    <span className="text-sm font-bold text-accent">{assessment?.age} years</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Comprehensive Detailed Report Section */}
            <Card className="p-8 bg-card border-accent/20">
              <div className="flex items-center justify-between mb-6">
                {!isEditMode ? (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Patient Summary */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Patient Summary</h3>
                <div className="bg-muted/20 p-6 rounded-lg space-y-4">
                  {isEditMode ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={editingData.name || ""}
                            onChange={(e) => handleFieldChange("name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-age">Age</Label>
                          <Input
                            id="edit-age"
                            type="number"
                            value={editingData.age || ""}
                            onChange={(e) => handleFieldChange("age", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-gender">Gender</Label>
                          <select
                            id="edit-gender"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={editingData.gender || ""}
                            onChange={(e) => handleFieldChange("gender", e.target.value)}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-mobile">Mobile</Label>
                          <Input
                            id="edit-mobile"
                            value={editingData.mobile || ""}
                            onChange={(e) => handleFieldChange("mobile", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-height">Height (cm)</Label>
                          <Input
                            id="edit-height"
                            type="number"
                            value={editingData.height || ""}
                            onChange={(e) => handleFieldChange("height", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-weight">Weight (kg)</Label>
                          <Input
                            id="edit-weight"
                            type="number"
                            value={editingData.weight || ""}
                            onChange={(e) => handleFieldChange("weight", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-systolic">Systolic BP</Label>
                          <Input
                            id="edit-systolic"
                            type="number"
                            value={editingData.systolic || ""}
                            onChange={(e) => handleFieldChange("systolic", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-diastolic">Diastolic BP</Label>
                          <Input
                            id="edit-diastolic"
                            type="number"
                            value={editingData.diastolic || ""}
                            onChange={(e) => handleFieldChange("diastolic", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-pulse">Pulse (bpm)</Label>
                          <Input
                            id="edit-pulse"
                            type="number"
                            value={editingData.pulse || ""}
                            onChange={(e) => handleFieldChange("pulse", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-fasting-sugar">Fasting Sugar (mg/dL)</Label>
                          <Input
                            id="edit-fasting-sugar"
                            type="number"
                            value={editingData.fasting_sugar || ""}
                            onChange={(e) => handleFieldChange("fasting_sugar", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-post-meal-sugar">Post-meal Sugar (mg/dL)</Label>
                          <Input
                            id="edit-post-meal-sugar"
                            type="number"
                            value={editingData.post_meal_sugar || ""}
                            onChange={(e) => handleFieldChange("post_meal_sugar", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-ldl">LDL (mg/dL)</Label>
                          <Input
                            id="edit-ldl"
                            type="number"
                            value={editingData.ldl || ""}
                            onChange={(e) => handleFieldChange("ldl", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-hdl">HDL (mg/dL)</Label>
                          <Input
                            id="edit-hdl"
                            type="number"
                            value={editingData.hdl || ""}
                            onChange={(e) => handleFieldChange("hdl", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-diet">Diet</Label>
                        <select
                          id="edit-diet"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={editingData.diet || ""}
                          onChange={(e) => handleFieldChange("diet", e.target.value)}
                        >
                          <option value="">Select Diet</option>
                          <option value="I mostly choose high-carb foods, occasional vegetables or fruits">High-carb, occasional vegetables/fruits</option>
                          <option value="I choose both high and low carb foods equally with moderate consumption of fruits and vegetables">Balanced high/low carb</option>
                          <option value="I limit or restrict high-carb foods most of the time and consume vegetables, sprouts and fruits regularly">Low-carb, regular vegetables</option>
                          <option value="I choose a balanced diet all the time">Balanced diet</option>
                          <option value="I have irregular dietary patterns">Irregular patterns</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-exercise">Exercise</Label>
                        <select
                          id="edit-exercise"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={editingData.exercise || ""}
                          onChange={(e) => handleFieldChange("exercise", e.target.value)}
                        >
                          <option value="">Select Exercise Level</option>
                          <option value="Sedentary - Little to no exercise">Sedentary</option>
                          <option value="Light activity - Exercise 1-2 times per week">Light activity</option>
                          <option value="Moderate activity - Exercise 3-4 times per week">Moderate activity</option>
                          <option value="Active - Exercise 5-6 times per week">Active</option>
                          <option value="Very active - Exercise daily or intense workouts">Very active</option>
                        </select>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-sleep">Sleep Hours</Label>
                          <Input
                            id="edit-sleep"
                            type="number"
                            value={editingData.sleep_hours || ""}
                            onChange={(e) => handleFieldChange("sleep_hours", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-smoking">Smoking</Label>
                          <select
                            id="edit-smoking"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={editingData.smoking || ""}
                            onChange={(e) => handleFieldChange("smoking", e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="never">Never</option>
                            <option value="occasionally">Occasionally</option>
                            <option value="regularly">Regularly</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label>Symptoms</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-chest-pain"
                              checked={editingData.chest_pain || false}
                              onCheckedChange={(checked) => handleFieldChange("chest_pain", checked)}
                            />
                            <Label htmlFor="edit-chest-pain" className="cursor-pointer">Chest pain</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-shortness"
                              checked={editingData.shortness_of_breath || false}
                              onCheckedChange={(checked) => handleFieldChange("shortness_of_breath", checked)}
                            />
                            <Label htmlFor="edit-shortness" className="cursor-pointer">Shortness of breath</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-dizziness"
                              checked={editingData.dizziness || false}
                              onCheckedChange={(checked) => handleFieldChange("dizziness", checked)}
                            />
                            <Label htmlFor="edit-dizziness" className="cursor-pointer">Dizziness</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-fatigue"
                              checked={editingData.fatigue || false}
                              onCheckedChange={(checked) => handleFieldChange("fatigue", checked)}
                            />
                            <Label htmlFor="edit-fatigue" className="cursor-pointer">Fatigue</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-swelling"
                              checked={editingData.swelling || false}
                              onCheckedChange={(checked) => handleFieldChange("swelling", checked)}
                            />
                            <Label htmlFor="edit-swelling" className="cursor-pointer">Swelling</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-palpitations"
                              checked={editingData.palpitations || false}
                              onCheckedChange={(checked) => handleFieldChange("palpitations", checked)}
                            />
                            <Label htmlFor="edit-palpitations" className="cursor-pointer">Palpitations</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-family-history"
                              checked={editingData.family_history || false}
                              onCheckedChange={(checked) => handleFieldChange("family_history", checked)}
                            />
                            <Label htmlFor="edit-family-history" className="cursor-pointer">Family history</Label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="edit-notes">User Notes</Label>
                          {editingData.user_notes && editingData.user_notes !== assessment?.user_notes && (
                            <span className="text-xs text-muted-foreground">
                              Insights will be regenerated when you save
                            </span>
                          )}
                        </div>
                        <Textarea
                          id="edit-notes"
                          value={editingData.user_notes || ""}
                          onChange={(e) => handleFieldChange("user_notes", e.target.value)}
                          rows={4}
                          placeholder="Enter your health notes, concerns, medications, or any relevant information..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Your notes will be analyzed to provide personalized insights and diet recommendations.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                  <p className="text-base"><strong>Name:</strong> {assessment?.name}</p>
                  <p className="text-base"><strong>Age/Sex:</strong> {formatAgeSex()}</p>
                  {assessment?.height && <p className="text-base"><strong>Height:</strong> {assessment?.height} cm</p>}
                  {assessment?.weight && <p className="text-base"><strong>Weight:</strong> {assessment?.weight} kg</p>}
                  {assessment?.bmi && <p className="text-base"><strong>BMI:</strong> {assessment?.bmi?.toFixed(1)} kg/m²</p>}
                  {assessment?.systolic && assessment?.diastolic && (
                    <p className="text-base"><strong>Blood Pressure:</strong> {assessment?.systolic} / {assessment?.diastolic} mmHg</p>
                  )}
                  <p className="text-base"><strong>Pulse:</strong> {assessment?.pulse || 70}/min {assessment?.pulse && assessment?.pulse >= 60 && assessment?.pulse <= 100 ? "(normal)" : ""}</p>
                   {assessment?.post_meal_sugar && <p className="text-base"><strong>Post-meal Sugar:</strong> {assessment?.post_meal_sugar} mg/dL</p>}
                   {assessment?.fasting_sugar && <p className="text-base"><strong>Fasting Sugar:</strong> {assessment?.fasting_sugar} mg/dL</p>}
                   {assessment?.diabetes && <p className="text-base"><strong>Diabetes Status:</strong> {assessment?.diabetes}</p>}
                   
                   <div className="mt-4 pt-4 border-t border-accent/10">
                     <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Lipid Profile</h4>
                     <p className="text-base"><strong>LDL (Bad):</strong> {assessment?.ldl || "-"} mg/dL</p>
                     <p className="text-base"><strong>HDL (Good):</strong> {assessment?.hdl || "-"} mg/dL</p>
                   </div>

                   <div className="mt-4 pt-4 border-t border-accent/10">
                     <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Symptoms Reported</h4>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                       <p className="text-sm"><strong>Chest Pain:</strong> {assessment?.chest_pain ? "Yes" : "No"}</p>
                       <p className="text-sm"><strong>SOB:</strong> {assessment?.shortness_of_breath ? "Yes" : "No"}</p>
                       <p className="text-sm"><strong>Dizziness:</strong> {assessment?.dizziness ? "Yes" : "No"}</p>
                       <p className="text-sm"><strong>Fatigue:</strong> {assessment?.fatigue ? "Yes" : "No"}</p>
                       <p className="text-sm"><strong>Swelling:</strong> {assessment?.swelling ? "Yes" : "No"}</p>
                       <p className="text-sm"><strong>Palpitations:</strong> {assessment?.palpitations ? "Yes" : "No"}</p>
                     </div>
                   </div>

                   <div className="mt-4 pt-4 border-t border-accent/10">
                     <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-2">Lifestyle & History</h4>
                     <p className="text-sm"><strong>Exercise:</strong> {assessment?.exercise || "-"}</p>
                     <p className="text-sm"><strong>Smoking:</strong> {assessment?.smoking || "-"}</p>
                     <p className="text-sm"><strong>Tobacco Use:</strong> {Array.isArray(assessment?.tobacco_use) ? assessment.tobacco_use.join(", ") : (assessment?.tobacco_use || "-")}</p>
                     <p className="text-sm"><strong>Family History:</strong> {assessment?.family_history ? "Yes" : "No"}</p>
                     <p className="text-sm"><strong>User Notes:</strong> {assessment?.user_notes || "-"}</p>
                   </div>
                    </>
                  )}
                </div>
              </div>

              {/* Interpretation of Results */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Interpretation of Results</h3>
                
                {/* Weight & BMI */}
                {assessment?.bmi && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-foreground mb-3">Weight & BMI</h4>
                    <div className="bg-warning/10 p-4 rounded-lg mb-3">
                      <p className="text-base font-semibold mb-2">
                        BMI {assessment?.bmi?.toFixed(1)} = {getBMIClassification()?.class || getBMICategory()}
                      </p>
                      {getBMIClassification()?.risks && getBMIClassification()?.risks?.length > 0 && (
                        <>
                          <p className="text-base mb-2">This significantly increases the risk of:</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {getBMIClassification()?.risks?.map((risk, idx) => (
                              <li key={idx} className="text-base">{risk}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    {weightRec && assessment?.height && (
                      <div className="space-y-2">
                        <p className="text-base">
                          Ideal weight for height ~{assessment?.height} cm is around {weightRec?.range?.[0]?.toFixed(0)}–{weightRec?.range?.[1]?.toFixed(0)} kg
                        </p>
                        {weightRec?.action !== "maintain" && (
                          <p className="text-base">
                            Needs to {weightRec?.action === "lose" ? "lose" : "gain"} ~{Math.round(weightRec?.kg ?? 0)} kg, but this should be gradual and phased
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Blood Pressure */}
                {assessment?.systolic && assessment?.diastolic && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-foreground mb-3">Blood Pressure</h4>
                    <div className="bg-warning/10 p-4 rounded-lg space-y-2">
                      <p className="text-base font-semibold">{assessment?.systolic}/{assessment?.diastolic} mmHg</p>
                      <p className="text-base">
                        Systolic: {(assessment?.systolic ?? 0) >= 130 ? "mildly elevated" : (assessment?.systolic ?? 0) < 120 ? "normal" : "elevated"}
                      </p>
                      <p className="text-base">
                        Diastolic: {(assessment?.diastolic ?? 0) >= 90 ? "clearly high" : (assessment?.diastolic ?? 0) >= 85 ? "elevated" : "normal"}
                      </p>
                      <p className="text-base font-semibold mt-2">{bpInfo?.category}</p>
                      {bpInfo?.category && bpInfo?.category?.includes("High Blood Pressure") && (
                        <div className="mt-3">
                          <p className="text-sm mb-2">This level of BP, if persistent, increases risk of:</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {BP_RISKS.map((risk, idx) => (
                              <li key={idx} className="text-sm">{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Blood Sugar */}
                {(() => {
                  const sugarInfo = getBloodSugarClassification();
                  if (!sugarInfo) return null;
                  const sugarType = sugarInfo?.type === "2-hour Post-prandial" ? "2-hour post-meal" : "fasting";
                  return (
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold text-foreground mb-3">
                        Blood Sugar ({sugarType} = {sugarInfo?.value} mg/dL)
                      </h4>
                      <div className="bg-warning/10 p-4 rounded-lg space-y-2">
                        <p className="text-base">Normal: &lt;140 mg/dL</p>
                        <p className="text-base">Prediabetes: 140–199 mg/dL</p>
                        <p className="text-base">Diabetes: ≥200 mg/dL</p>
                        <p className="text-base font-semibold mt-2">{sugarInfo?.status}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Pulse */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Pulse</h4>
                  <p className="text-base">
                    {assessment?.pulse || 70}/min – {assessment?.pulse && assessment?.pulse >= 60 && assessment?.pulse <= 100 ? "Normal" : "Check with doctor"}
                  </p>
                </div>
              </div>

              {/* Overall Clinical Impression */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Overall Clinical Impression (Simple Explanation)</h3>
                <div className="bg-accent/10 p-6 rounded-lg space-y-3">
                  {(() => {
                    const conditions = [];
                    const bmiClass = getBMIClassification();
                    if (bmiClass && bmiClass?.class?.includes("Obese")) conditions.push("obese");
                    if (bmiClass && bmiClass?.class === "Overweight") conditions.push("overweight");
                    if (bpInfo?.category && bpInfo?.category?.includes("High Blood Pressure")) conditions.push("have early high blood pressure");
                    const sugarInfo = getBloodSugarClassification();
                    if (sugarInfo && sugarInfo?.status?.includes("PRE-DIABETIC")) conditions.push("your blood sugar is in the pre-diabetic range");
                    if (sugarInfo && sugarInfo?.status === "DIABETIC") conditions.push("have diabetes");
                    
                    const conditionText = conditions.length > 0 ? conditions.join(", ") : "in good health";
                    return (
                      <>
                        <p className="text-base">
                          You are currently {conditionText}. {conditions.length > 0 ? "These conditions are interconnected and largely reversible at this stage if action is taken now." : ""}
                        </p>
                        {sugarInfo && !sugarInfo?.status?.includes("DIABETIC") && (
                          <p className="text-base">
                            This is NOT yet diabetes, and likely does not need medication immediately, but lifestyle changes are urgent.
                          </p>
                        )}
                        {sugarInfo && sugarInfo?.status === "DIABETIC" && (
                          <p className="text-base">
                            Medical management along with lifestyle changes is essential.
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Key Counseling Points */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Key Counseling Points</h3>
                
                {/* A. Weight Loss */}
                {weightRec && weightRec.action !== "maintain" && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-foreground mb-3">Weight Loss – Most Important Intervention</h4>
                    <div className="bg-success/10 p-4 rounded-lg space-y-3">
                      <p className="text-base">Even 5–10% weight loss ({Math.round((assessment?.weight ?? 0) * 0.05)}–{Math.round((assessment?.weight ?? 0) * 0.1)} kg) can:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li className="text-base">Reduce blood sugar</li>
                        <li className="text-base">Lower BP</li>
                        <li className="text-base">Improve insulin sensitivity</li>
                      </ul>
                      <div className="mt-3">
                        <p className="text-base font-semibold">Realistic Targets:</p>
                        <p className="text-base">First goal: Lose {Math.round((assessment?.weight ?? 0) * 0.08)}–{Math.round((assessment?.weight ?? 0) * 0.1)} kg in 6 months</p>
                        <p className="text-base">Long-term goal: Reach ~{weightRec?.range?.[1]?.toFixed(0) ?? 0} kg over 1.5–2 years</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* B. Diet Recommendations */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Diet Recommendations</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-warning/10 p-4 rounded-lg">
                      <p className="text-base font-semibold mb-2">Avoid / Reduce:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Sugary drinks, juices, sweets</li>
                        <li>White rice, white bread, bakery items</li>
                        <li>Fried foods, fast food</li>
                        <li>Late-night eating</li>
                        <li>Excess salt (important for BP)</li>
                      </ul>
                    </div>
                    <div className="bg-success/10 p-4 rounded-lg">
                      <p className="text-base font-semibold mb-2">Encourage:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Half plate vegetables</li>
                        <li>Whole grains (millets, brown rice, oats)</li>
                        <li>Lean protein (dal, beans, eggs, fish, chicken)</li>
                        <li>Fruits (1–2/day, whole fruit only)</li>
                        <li>Healthy fats (nuts, seeds, olive/mustard oil)</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-base font-semibold mt-3">Simple rule: No sugar drinks, no fried food, smaller portions</p>
                </div>

                {/* C. Physical Activity */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Physical Activity</h4>
                  <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                    <p className="text-base font-semibold">Minimum recommendation:</p>
                    <p className="text-base">Brisk walking 30–45 minutes/day, 5–6 days/week</p>
                    <p className="text-base">Add light strength training 2–3 days/week</p>
                    {(assessment?.exercise === "Sedentary" || !assessment?.exercise) && (
                      <div className="mt-2">
                        <p className="text-base">If sedentary:</p>
                        <p className="text-base font-semibold">Start with 15–20 minutes/day, then increase</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* D. Blood Pressure Control */}
                {bpInfo.category && bpInfo.category.includes("High Blood Pressure") && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-foreground mb-3">Blood Pressure Control</h4>
                    <div className="bg-warning/10 p-4 rounded-lg">
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li className="text-base">Weight loss</li>
                        <li className="text-base">Salt &lt;5 g/day</li>
                        <li className="text-base">Exercise</li>
                        <li className="text-base">Adequate sleep (7–8 hrs)</li>
                        <li className="text-base">Stress management</li>
                      </ul>
                      <p className="text-base mt-3">
                        If BP remains ≥130/90 after 3 months of lifestyle change → medication may be needed.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Precautions & Warnings */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Precautions & Warnings to Give the Patient</h3>
                
                <div className="mb-4">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Important Precautions</h4>
                  <div className="bg-warning/10 p-4 rounded-lg">
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li className="text-base">Do not ignore high BP or sugar</li>
                      <li className="text-base">Avoid crash diets or weight-loss pills</li>
                      <li className="text-base">Avoid smoking and alcohol</li>
                      <li className="text-base">Do not self-medicate</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-foreground mb-3">Warning Symptoms (Seek Care Immediately)</h4>
                  <div className="bg-destructive/10 p-4 rounded-lg">
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li className="text-base">Severe headache</li>
                      <li className="text-base">Chest pain</li>
                      <li className="text-base">Dizziness or fainting</li>
                      <li className="text-base">Excessive thirst or urination</li>
                      <li className="text-base">Sudden vision changes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommended Investigations */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Recommended Investigations</h3>
                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="text-base mb-2">You may advise:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="text-base">Fasting blood sugar</li>
                    <li className="text-base">HbA1c</li>
                    <li className="text-base">Lipid profile</li>
                    <li className="text-base">Liver function tests</li>
                    <li className="text-base">Kidney function tests</li>
                    <li className="text-base">ECG</li>
                  </ul>
                  <p className="text-base mt-3">These help assess cardio-metabolic risk.</p>
                </div>
              </div>

              {/* Follow-Up Plan */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Follow-Up Plan</h3>
                <div className="bg-success/10 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li className="text-base">Recheck BP and sugar in 3 months</li>
                    <li className="text-base">Monthly weight monitoring</li>
                    <li className="text-base">Reinforce lifestyle adherence</li>
                  </ul>
                </div>
              </div>

              {/* Key Message */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Key Message</h3>
                <div className="bg-accent/20 p-6 rounded-lg border-l-4 border-accent">
                  <p className="text-lg font-semibold">
                    You are at a reversible stage—with weight loss, diet control, and exercise, you can prevent diabetes and control blood pressure without medicines.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Key Metrics Cards - Also shown on Insights tab */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment?.bmi ? assessment?.bmi?.toFixed(1) : "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">BMI</h3>
                <p className="text-xs text-muted-foreground">{getBMICategory()}</p>
                <p className="text-xs text-muted-foreground mt-2">Body Mass Index</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">{calculateCardiovascularScore()}</div>
                <h3 className="text-lg font-semibold text-accent">CV Score</h3>
                <p className={`text-xs font-medium ${getCVRiskLevel().color}`}>{getCVRiskLevel().level}</p>
                <p className="text-xs text-muted-foreground mt-2">Cardiovascular Risk</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment.heart_age || assessment.age || "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Age</h3>
                <p className="text-xs text-muted-foreground">vs {assessment.age} years</p>
                <p className="text-xs text-muted-foreground mt-2">Biological Age</p>
              </Card>

              <Card className="p-6 text-center space-y-2 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-foreground">
                  {assessment.risk_score ? `${assessment.risk_score.toFixed(1)}%` : "N/A"}
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Risk</h3>
                <p className={`text-xs font-medium ${getRiskCategory().color}`}>{getRiskCategory().level}</p>
                <p className="text-xs text-muted-foreground mt-2">10-Year Risk</p>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground">AI-Powered Insights</h3>
              {assessment?.user_notes && (
                <Button 
                  onClick={handleRegenerateInsights} 
                  variant="outline" 
                  size="sm"
                  disabled={saving}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Regenerate Insights
                </Button>
              )}
            </div>

            {assessment.ai_insights ? (
              <div className="space-y-6">
                {/* Summary Section - Only show if summary exists and has content */}
                {(() => {
                  const summaryText = assessment?.ai_insights?.summary;
                  if (!summaryText) {
                    return null;
                  }
                  
                  // Handle different data types
                  let cleanedSummary = '';
                  if (typeof summaryText === 'string') {
                    cleanedSummary = summaryText.replace(/\{|\}|\[|\]|"/g, '').trim();
                  } else if (typeof summaryText === 'object') {
                    cleanedSummary = JSON.stringify(summaryText).replace(/\{|\}|\[|\]|"/g, '').trim();
                  }
                  
                  if (!cleanedSummary || cleanedSummary.length < 5) {
                    return null;
                  }
                  
                  return (
                    <Card className="p-8 bg-card border-accent/20">
                      <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-8 h-8 text-accent" />
                        <h2 className="text-2xl font-bold text-foreground">Summary of Patient</h2>
                      </div>
                      <div className="p-6 bg-muted/20 rounded-lg">
                        <p className="text-lg leading-relaxed text-foreground">{cleanedSummary}</p>
                      </div>
                    </Card>
                  );
                })()}

                {/* Recommendation Cards */}
                {assessment?.ai_insights?.recommendations && assessment?.ai_insights?.recommendations?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-foreground">Recommended Actions</h3>
                    {assessment?.ai_insights?.recommendations
                      .map((rec, idx) => {
                        let title = "";
                        let description = "";

                        if (typeof rec === "object" && rec !== null) {
                          title = rec.title || "";
                          description = rec.description || "";
                        } else if (typeof rec === "string") {
                          description = rec;
                          title = `Recommendation ${idx + 1}`;
                        }

                        // Clean up all metadata and JSON artifacts
                        title = title
                          .replace(/[{}\[\]"']/g, "")
                          .replace(/^(title|recommendations)\s*:\s*/i, "")
                          .trim();
                        description = description
                          .replace(/[{}\[\]"']/g, "")
                          .replace(/^description\s*:\s*/i, "")
                          .trim();

                        if (!title || !description || title.length < 2 || description.length < 5) return null;

                        return (
                          <Card key={idx} className="p-6 bg-background border border-accent/20">
                            <h4 className="text-xl font-semibold text-foreground mb-3">{title}</h4>
                            <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
                          </Card>
                        );
                      })
                      .filter(Boolean)}
                  </div>
                )}

                {/* Diet Plan Card - Show if diet_plan exists or if any diet plan data exists */}
                {(assessment?.ai_insights?.diet_plan || 
                  assessment?.ai_insights?.diet_plan?.summary || 
                  assessment?.ai_insights?.diet_plan?.foods_to_eat || 
                  assessment?.ai_insights?.diet_plan?.foods_to_avoid || 
                  assessment?.ai_insights?.diet_plan?.meal_suggestions) && (
                  <Card className="p-8 bg-gradient-to-br from-health-lightBlue/20 to-accent/5">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">🥗</span>
                      <h3 className="text-2xl font-semibold text-foreground">Your Personalized Diet Plan</h3>
                    </div>

                    {assessment?.ai_insights?.diet_plan?.summary && (
                      <div className="mb-6">
                        <p className="text-lg leading-relaxed text-foreground/90">
                          {assessment?.ai_insights?.diet_plan?.summary}
                        </p>
                      </div>
                    )}

                    {(assessment?.ai_insights?.diet_plan?.foods_to_eat ||
                      assessment?.ai_insights?.diet_plan?.foods_to_avoid) && (
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Foods to Eat */}
                        {assessment?.ai_insights?.diet_plan?.foods_to_eat &&
                          Array.isArray(assessment?.ai_insights?.diet_plan?.foods_to_eat) &&
                          assessment?.ai_insights?.diet_plan?.foods_to_eat?.length > 0 && (
                            <Card className="p-6 bg-success/5 border-l-4 border-success">
                              <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-success" />
                                <h4 className="text-lg font-semibold text-success">Foods to Include</h4>
                              </div>
                              <ul className="space-y-2">
                                {assessment?.ai_insights?.diet_plan?.foods_to_eat?.map((food, idx) => (
                                  <li key={idx} className="flex gap-2 text-sm text-foreground">
                                    <span className="text-success mt-0.5">✓</span>
                                    <span>{typeof food === 'string' ? food : JSON.stringify(food)}</span>
                                  </li>
                                ))}
                              </ul>
                            </Card>
                          )}

                        {/* Foods to Avoid */}
                        {assessment?.ai_insights?.diet_plan?.foods_to_avoid &&
                          Array.isArray(assessment?.ai_insights?.diet_plan?.foods_to_avoid) &&
                          assessment?.ai_insights?.diet_plan?.foods_to_avoid?.length > 0 && (
                            <Card className="p-6 bg-warning/5 border-l-4 border-warning">
                              <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="w-5 h-5 text-warning" />
                                <h4 className="text-lg font-semibold text-warning">Foods to Limit/Avoid</h4>
                              </div>
                              <ul className="space-y-2">
                                {assessment?.ai_insights?.diet_plan?.foods_to_avoid?.map((food, idx) => (
                                  <li key={idx} className="flex gap-2 text-sm text-foreground">
                                    <span className="text-warning mt-0.5">✗</span>
                                    <span>{typeof food === 'string' ? food : JSON.stringify(food)}</span>
                                  </li>
                                ))}
                              </ul>
                            </Card>
                          )}
                      </div>
                    )}

                    {assessment?.risk_score && assessment?.risk_score > 20 && (
                      <div className="mt-6 p-4 bg-warning/10 border-l-4 border-warning rounded">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                          <div>
                            <p className="font-semibold text-warning mb-1">Important Note:</p>
                            <p className="text-sm text-foreground/90">
                              Based on your risk score, we strongly recommend consulting with a healthcare provider or
                              registered dietitian for a comprehensive dietary plan tailored to your specific needs.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Meal Suggestions Card - Separate */}
                {assessment?.ai_insights?.diet_plan?.meal_suggestions &&
                  Array.isArray(assessment?.ai_insights?.diet_plan?.meal_suggestions) &&
                  assessment?.ai_insights?.diet_plan?.meal_suggestions?.length > 0 && (
                    <Card className="p-8 bg-gradient-to-br from-accent/10 to-background">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">🍽️</span>
                        <div>
                          <h3 className="text-2xl font-semibold text-foreground">South Indian Meal Suggestions</h3>
                          <p className="text-sm text-muted-foreground mt-1">Traditional healthy South Indian meals for heart health</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        {assessment?.ai_insights?.diet_plan?.meal_suggestions?.map((meal, idx) => (
                          <Card key={idx} className="p-4 bg-background border border-accent/20">
                            <p className="text-sm text-foreground">{meal}</p>
                          </Card>
                        ))}
                      </div>
                    </Card>
                  )}

                {/* DON'Ts Section - Two separate cards at bottom */}
                {assessment?.ai_insights?.donts &&
                  Array.isArray(assessment?.ai_insights?.donts) &&
                  assessment?.ai_insights?.donts?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-foreground">Important Precautions</h3>

                      {/* Mild Cautions - Green/Yellow Card */}
                      <Card className="p-6 bg-success/10 border-l-4 border-success">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="w-6 h-6 text-success" />
                          <h4 className="text-xl font-semibold text-success">Things to Be Careful About</h4>
                        </div>
                        <div className="space-y-3">
                          {assessment?.ai_insights?.donts
                            ?.slice(0, Math.ceil((assessment?.ai_insights?.donts?.length ?? 0) / 2))
                            ?.map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-start">
                                <span className="text-success mt-1">⚠</span>
                                <p className="text-base text-foreground">{item}</p>
                              </div>
                            ))}
                        </div>
                      </Card>

                      {/* Strict Warnings - Orange/Red Card */}
                      <Card className="p-6 bg-destructive/10 border-l-4 border-destructive">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="w-6 h-6 text-destructive" />
                          <h4 className="text-xl font-semibold text-destructive">Strictly Avoid</h4>
                        </div>
                        <div className="space-y-3">
                          {assessment?.ai_insights?.donts
                            ?.slice(Math.ceil((assessment?.ai_insights?.donts?.length ?? 0) / 2))
                            ?.map((item, idx) => (
                              <div key={idx} className="flex gap-3 items-start">
                                <span className="text-destructive mt-1">✗</span>
                                <p className="text-base text-foreground">{item}</p>
                              </div>
                            ))}
                        </div>
                      </Card>
                    </div>
                  )}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  No personalized insights available yet. Please check back later.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Risk Contributors</h2>
              <p className="text-muted-foreground mb-6">
                These factors are currently contributing to your heart health risk:
              </p>
              <div className="space-y-4">
                {/* Only show actual risk contributors (negative factors) */}
                {assessment.smoking && !NON_SMOKING_VALUES.includes(assessment.smoking) && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Smoking Status</h4>
                        <p className="text-sm text-muted-foreground">{assessment.smoking}</p>
                        <p className="text-sm text-warning mt-2">
                          ⚠️ Smoking significantly increases cardiovascular risk
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {weightRec && weightRec.action !== "maintain" && (
                  <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Weight Adjustment</h4>
                        <p className="text-sm text-muted-foreground">
                          You should aim to {weightRec.action} approximately {Math.round(weightRec.kg * 10) / 10} kg to reach a healthy BMI range.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Target weight range: {weightRec.range[0].toFixed(1)} kg - {weightRec.range[1].toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.systolic && assessment.systolic > 120 && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Elevated Blood Pressure</h4>
                        <p className="text-sm text-muted-foreground">
                          {assessment.systolic}/{assessment.diastolic} mmHg - {bpInfo.category}
                        </p>
                        <p className="text-sm text-warning mt-2">
                          ⚠️ High blood pressure strains your heart and arteries
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.bmi && assessment.bmi > 25 && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Body Weight</h4>
                        <p className="text-sm text-muted-foreground">
                          BMI: {assessment.bmi.toFixed(1)} - {getBMICategory()}
                        </p>
                        <p className="text-sm text-warning mt-2">⚠️ Excess weight increases risk of heart disease</p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.exercise && LOW_ACTIVITY_LEVELS.includes(assessment.exercise) && (
                    <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">Low Physical Activity</h4>
                          <p className="text-sm text-muted-foreground">{assessment.exercise}</p>
                          <p className="text-sm text-warning mt-2">⚠️ Lack of exercise weakens cardiovascular health</p>
                        </div>
                      </div>
                    </div>
                  )}

                {assessment.ldl && assessment.ldl > 130 && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">High LDL Cholesterol</h4>
                        <p className="text-sm text-muted-foreground">LDL: {assessment.ldl} mg/dL</p>
                        <p className="text-sm text-warning mt-2">⚠️ High bad cholesterol can clog arteries</p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.hdl && assessment.hdl < 40 && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Low HDL Cholesterol</h4>
                        <p className="text-sm text-muted-foreground">HDL: {assessment.hdl} mg/dL</p>
                        <p className="text-sm text-warning mt-2">⚠️ Low good cholesterol reduces heart protection</p>
                      </div>
                    </div>
                  </div>
                )}

                {assessment.family_history && (
                  <div className="p-4 bg-warning/5 border-l-4 border-warning rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Family History</h4>
                        <p className="text-sm text-muted-foreground">Family history of heart disease</p>
                        <p className="text-sm text-warning mt-2">⚠️ Genetic factors increase your risk</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show message if no significant risk factors */}
                {!(
                  (assessment.smoking && !NON_SMOKING_VALUES.includes(assessment.smoking)) ||
                  (assessment.systolic && assessment.systolic > 120) ||
                  (assessment.bmi && assessment.bmi > 25) ||
                  (assessment.exercise && LOW_ACTIVITY_LEVELS.includes(assessment.exercise)) ||
                  (assessment.ldl && assessment.ldl > 130) ||
                  (assessment.hdl && assessment.hdl < 40) ||
                  assessment.family_history
                ) && (
                  <div className="p-6 bg-success/5 border-l-4 border-success rounded-lg text-center">
                    <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                    <h4 className="font-semibold text-foreground mb-2">Great News!</h4>
                    <p className="text-sm text-muted-foreground">
                      No major risk contributors identified. Keep up the good work!
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <MessageCircle className="w-12 h-12 text-accent" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Chat with Our Health Expert</h3>
                <p className="text-sm text-muted-foreground mb-4">Get personalized guidance</p>
                <Button onClick={() => navigate("/chat")} className="w-full">
                  Start Chat
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Phone className="w-12 h-12 text-accent" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Talk to Our Team</h3>
                <p className="text-sm text-muted-foreground mb-4">Speak with a health advisor</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open("https://10000hearts.com/wellness-campaign", "_blank")}
                >
                  Schedule Call
                </Button>
              </div>
            </div>
          </Card>
        </div>
            </div>
          )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 10000hearts. All rights reserved.</p>
          <p className="mt-2">
            This assessment is for informational purposes only and does not constitute medical advice. Please consult
            with a healthcare professional for medical concerns.
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-lg text-foreground">
              Are you sure you want to delete this assessment? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



