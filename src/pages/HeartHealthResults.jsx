import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Phone, Home, Activity, CheckCircle, AlertCircle, Download } from "lucide-react";
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

export default function HeartHealthResults() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get("id");
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allAssessments, setAllAssessments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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

  useEffect(() => {
    if (!assessmentId) {
      toast.error("No assessment found");
      navigate("/heart-health");
      return;
    }

    if (user) {
      loadAssessment();
      loadUserAndAssessments();
    }
  }, [assessmentId, user]);

  const loadUserAndAssessments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUser(user);
      const { data, error } = await supabase
        .from(envConfig.heart_health_assessments)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

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
      setAssessment(data);
    } catch (error) {
      console.error("Error loading assessment:", error);
      toast.error(error.message || "Failed to load assessment results");
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  const calculateCardiovascularScore = () => {
    if (!assessment) return 0;
    const scoreReductions = [
      { condition: assessment.bmi > 25, reduction: 10 },
      { condition: assessment.systolic > 140, reduction: 15 },
      { condition: assessment.risk_score, reduction: assessment.risk_score * 2 }
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

    const picked = !sysLevel ? diaLevel : !diaLevel ? sysLevel : (sysLevel.index <= diaLevel.index ? sysLevel : diaLevel);

    const detailMap = {
      bothEqual: () => `Systolic and diastolic are both in ${picked.label.toLowerCase()} range.`,
      sysHigher: () => `Systolic is higher (${sysLevel.label.toLowerCase()}) while diastolic is ${diaLevel.label.toLowerCase()}.`,
      diaHigher: () => `Diastolic is higher (${diaLevel.label.toLowerCase()}) while systolic is ${sysLevel.label.toLowerCase()}.`,
      sysOnly: () => `Only systolic available: ${sysLevel.label}`,
      diaOnly: () => `Only diastolic available: ${diaLevel.label}`
    };

    const getDetail = () => {
      if (sysLevel && diaLevel) {
        if (sysLevel.index === diaLevel.index) return detailMap.bothEqual();
        if (sysLevel.index < diaLevel.index) return detailMap.sysHigher();
        return detailMap.diaHigher();
      }
      return sysLevel ? detailMap.sysOnly() : detailMap.diaOnly();
    };

    return {
      category: picked.category,
      label: picked.label,
      detail: getDetail(),
      severityIndex: picked.index,
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

  const bpInfo = useMemo(() => getBPCategory(), [assessment?.systolic, assessment?.diastolic]);
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

  const formatAgeSex = () => {
    const age = assessment?.age;
    const gender = assessment?.gender;
    if (!age) return "N/A";
    
    const genderMap = {
      male: "male",
      female: "female"
    };
    
    const normalizedGender = gender?.toLowerCase();
    const genderText = genderMap[normalizedGender] || normalizedGender || "N/A";
    return `${age}-year-old ${genderText}`;
  };

  const downloadPDFReport = async () => {
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

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Standardized PDF Styles
    const PDF_STYLES = {
      fontSize: {
        title: 20,
        sectionHeader: 14,
        subsectionHeader: 12,
        body: 10,
        small: 8
      },
      color: {
        black: [0, 0, 0],
        darkGray: [60, 60, 60],
        lightGray: [80, 80, 80],
        red: [200, 0, 0]
      },
      spacing: {
        afterHeader: 6,
        betweenItems: 5,
        betweenSections: 6,
        afterSubsection: 4
      }
    };

    // Helper function to set standard subsection header style
    const setSubsectionHeader = (text, y) => {
      doc.setFontSize(PDF_STYLES.fontSize.subsectionHeader);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(PDF_STYLES.color.darkGray[0], PDF_STYLES.color.darkGray[1], PDF_STYLES.color.darkGray[2]);
      doc.text(text, 20, y);
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
      return y + PDF_STYLES.spacing.afterHeader;
    };

    // Helper function to set standard body text style
    const setBodyText = () => {
      doc.setFontSize(PDF_STYLES.fontSize.body);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
    };

    // Helper function to add text with word wrapping (5px gap between lines)
    const addWrappedText = (text, x, y, maxWidth, fontSize = 10, lineHeight = 5) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      // Add lines with 5px gap between each line
      lines.forEach((line, index) => {
        doc.text(line, x, y + (index * 5));
      });
      return y + (lines.length * 5); // 5px gap between lines
    };

    // Helper function to add section divider
    const addSectionDivider = (y) => {
      checkPageBreak(10); // Check before adding divider
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, y, pageWidth - 20, y);
      return y + 6; // Return position after divider for readability
    };

    // Helper function to add section header with background
    const addSectionHeader = (text, y, fontSize = PDF_STYLES.fontSize.sectionHeader) => {
      checkPageBreak(15); // Check before adding header
      const tealColor = [144, 238, 224];
      const headerHeight = 8;
      
      // Background box
      doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
      doc.rect(20, y - 5, pageWidth - 40, headerHeight, "F");
      
      // Text
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "bold");
      doc.text(text, 25, y + 1);
      
      // Reset
      doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
      return y + headerHeight + 5; // Spacing after header for readability
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

    // Helper function to add header to page (matching reference image)
    const addHeader = (logoData) => {
      const tealColor = [144, 238, 224]; // Light teal/mint green color
      const bandHeight = 25; // Height of the teal band
      const leftGap = 20; // Gap from left for text
      
      // Draw curved teal band on the right side (using rectangle with curved effect)
      const bandStartX = pageWidth * 0.4; // Band starts around 40% from left
      const bandWidth = pageWidth - bandStartX;
      
      // Draw the teal band (rounded on left side using circles for curved effect)
      doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
      // Main rectangle
      doc.rect(bandStartX + 3, 0, bandWidth - 3, bandHeight, "F");
      // Rounded left edge using circles
      doc.circle(bandStartX + 3, 3, 3, "F");
      doc.circle(bandStartX + 3, bandHeight - 3, 3, "F");
      doc.rect(bandStartX, 3, 3, bandHeight - 6, "F");
      
      // Left side text (in white space) - exact colors from image
      doc.setTextColor(60, 60, 60); // Dark gray text (RGB: 60, 60, 60)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold"); // Helvetica bold
      doc.text("10000 HEARTS", leftGap, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal"); // Helvetica normal
      doc.setTextColor(80, 80, 80); // Lighter gray for tagline (RGB: 80, 80, 80)
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
      doc.setDrawColor(tealColor[0], tealColor[1], tealColor[2]);
      doc.setLineWidth(1);
      doc.line(leftGap, bandHeight, pageWidth - 20, bandHeight);
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
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
          // Fallback to text watermark if image fails
          doc.setTextColor(220, 220, 220);
          doc.setFontSize(50);
          doc.setFont("helvetica", "normal");
          doc.text("10000 HEARTS", pageWidth / 2, pageHeight / 2, { align: "center" });
          doc.setTextColor(0, 0, 0);
        }
      } else {
        // Fallback to text watermark if no image
        doc.setTextColor(220, 220, 220);
        doc.setFontSize(50);
        doc.setFont("helvetica", "normal");
        doc.text("10000 HEARTS", pageWidth / 2, pageHeight / 2, { align: "center" });
        doc.setTextColor(0, 0, 0);
      }
    };

    // Helper function to add footer to page (matching header color)
    const addFooter = () => {
      // Teal color matching header background
      const tealColor = [144, 238, 224]; // Teal color matching header (RGB: 144, 238, 224)
      
      const contactInfoHeight = 12; // Height of contact info band
      const disclaimerHeight = 17; // Height for disclaimer band
      const lineHeight = 1; // Height for separator line
      const totalFooterHeight = contactInfoHeight + disclaimerHeight + lineHeight;
      const footerStartY = pageHeight - totalFooterHeight;
      
      // Contact info (no background color - plain white background)
      // Contact info text (dark gray/black text) with icons
      doc.setTextColor(50, 50, 50); // Dark gray text (RGB: 50, 50, 50)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal"); // Helvetica font
      
      // Contact info from left to right with icon symbols
      const contactY = footerStartY + (contactInfoHeight / 2) + 2; // Center vertically
      // Using simple symbols: @ for website/globe, ☎ for phone, @ for Instagram
      const contactText = "WWW.10000hearts.com  |  +91 8977757494  |  @10000hearts.ai";
      doc.text(contactText, pageWidth / 2, contactY, { align: "center" });
      
      // Thin horizontal line separator
      doc.setDrawColor(200, 200, 200); // Light gray separator
      doc.setLineWidth(0.5);
      const lineY = footerStartY + contactInfoHeight;
      doc.line(20, lineY, pageWidth - 20, lineY);
      
      // Disclaimer band (teal background matching header)
      const disclaimerY = lineY;
      doc.setFillColor(tealColor[0], tealColor[1], tealColor[2]);
      doc.rect(0, disclaimerY, pageWidth, disclaimerHeight, "F");
      
      // Disclaimer text (dark gray text for better readability) - exact colors from image
      doc.setTextColor(50, 50, 50); // Dark gray text (RGB: 50, 50, 50)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal"); // Helvetica normal
      const disclaimerText = "Disclaimer: The health insights provided are for general wellness and educational purposes only, based on the basic information you share. This is not medical advice or a diagnosis please consult a certified doctor for any medical concerns.";
      const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 40);
      const disclaimerTextY = disclaimerY + (disclaimerHeight / 2) - ((disclaimerLines.length - 1) * 2.5) + 2;
      doc.text(disclaimerLines, pageWidth / 2, disclaimerTextY, { align: "center" });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
    };

    // Helper function to check if we need a new page (with proper margin from footer)
    const checkPageBreak = (requiredSpace) => {
      // Header height: 25px (teal band)
      // Footer height: contact info (12px) + disclaimer (17px) + line (1px) = 30px
      // Add extra margin (10px) to prevent content from going into footer
      const headerHeight = 25;
      const footerHeight = 30;
      const marginFromFooter = 10; // Margin to prevent overlap
      const safeBottom = pageHeight - footerHeight - marginFromFooter;
      
      // Break if content would overlap the safe area
      if (yPosition + requiredSpace > safeBottom) {
        doc.addPage();
        
        // White background for new page
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        
        // Add header, watermark, and footer to new page
        addHeader(logoDataUrl);
        addWatermark(logoWatermarkUrl);
        addFooter();
        
        // Main title on new page (below header)
        doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
        doc.setFontSize(PDF_STYLES.fontSize.title);
        doc.setFont("helvetica", "bold");
        doc.text("Heart Health Assessment Report", pageWidth / 2, 40, { align: "center" });
        
        yPosition = 50; // Reset position for new page
      }
    };

    // White background (default)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // ===== HEADER =====
    addHeader(logoDataUrl);
    
    // ===== WATERMARK =====
    addWatermark(logoWatermarkUrl);
    
    // ===== FOOTER =====
    addFooter();
    
    // Main title - centered below header
    doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
    doc.setFontSize(PDF_STYLES.fontSize.title);
    doc.setFont("helvetica", "bold");
    doc.text("Heart Health Assessment Report", pageWidth / 2, 40, { align: "center" });
    
    // Start content below title (minimize top spacing)
    let yPosition = 48;

    // Patient Summary Section
    checkPageBreak(80); // Check before Patient Summary
    yPosition = addSectionHeader("Patient Summary", yPosition, PDF_STYLES.fontSize.sectionHeader);
    
    // Add light background box for patient info
    const summaryBoxHeight = 60;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPosition - 2, pageWidth - 40, summaryBoxHeight, "F");
    
    setBodyText();
    let summaryY = yPosition + 4;
    
    // Two-column layout for better organization
    const leftCol = 25;
    const rightCol = 110;
    
    doc.text(`Name: ${assessment.name}`, leftCol, summaryY);
    summaryY += 5;
    
    doc.text(`Age/Sex: ${formatAgeSex()}`, leftCol, summaryY);
    summaryY += 5;
    
    if (assessment.height) {
      doc.text(`Height: ${assessment.height} cm`, leftCol, summaryY);
      summaryY += 5;
    }
    
    if (assessment.weight) {
      doc.text(`Weight: ${assessment.weight} kg`, leftCol, summaryY);
      summaryY += 5;
    }
    
    if (assessment.bmi) {
      doc.setFont("helvetica", "bold");
      doc.text(`BMI: ${assessment.bmi.toFixed(1)} kg/m² (${getBMICategory()})`, leftCol, summaryY);
      doc.setFont("helvetica", "normal");
      summaryY += 5;
    }
    
    if (assessment.systolic && assessment.diastolic) {
      doc.text(`Blood Pressure: ${assessment.systolic}/${assessment.diastolic} mmHg`, leftCol, summaryY);
      summaryY += 5;
    }
    
    // Pulse
    doc.text(`Pulse: ${assessment.pulse || 70}/min`, leftCol, summaryY);
    summaryY += 5;
    
    // Blood Sugar
    const sugarInfo = getBloodSugarClassification();
    if (sugarInfo) {
      const sugarType = sugarInfo.type === "2-hour Post-prandial" ? "2-hour Post-meal" : "Fasting";
      doc.text(`${sugarType} Blood Sugar: ${sugarInfo.value} mg/dL`, leftCol, summaryY);
      summaryY += 5;
    }
    
    yPosition += summaryBoxHeight + 6; // Space after summary box for readability

    // Interpretation of Results Section
    checkPageBreak(15); // Check before divider and header
    yPosition = addSectionDivider(yPosition);
    yPosition = addSectionHeader("Interpretation of Results", yPosition, PDF_STYLES.fontSize.sectionHeader);

    // Weight & BMI subsection
    checkPageBreak(40); // Check before Weight & BMI if needed
    yPosition = setSubsectionHeader("Weight & BMI", yPosition);
    setBodyText();
    const bmiClass = getBMIClassification();
    if (bmiClass && assessment.bmi) {
      doc.text(`BMI ${assessment.bmi.toFixed(1)} = ${bmiClass.class}`, 20, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      
      if (bmiClass.risks.length > 0) {
        checkPageBreak(20 + (bmiClass.risks.length * PDF_STYLES.spacing.betweenItems)); // Check before risks list
        doc.text(`This significantly increases the risk of:`, 20, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
        bmiClass.risks.forEach(risk => {
          doc.text(`  • ${risk}`, 25, yPosition);
          yPosition += PDF_STYLES.spacing.betweenItems;
        });
        yPosition += 1;
      }
      
      // Ideal weight recommendation
      if (weightRec && assessment.height) {
        const idealMin = weightRec.range[0];
        const idealMax = weightRec.range[1];
        const idealText = `Ideal weight for height ~${assessment.height} cm is around `;
        const boldRange = `${idealMin.toFixed(0)}-${idealMax.toFixed(0)} kg`;
        const textWidth = getTextWidth(idealText);
        doc.text(idealText, 20, yPosition);
      doc.setFont("helvetica", "bold");
        doc.text(boldRange, 20 + textWidth, yPosition);
      doc.setFont("helvetica", "normal");
        yPosition += PDF_STYLES.spacing.betweenItems;
        
        if (weightRec.action === "lose") {
          checkPageBreak(15); // Check before weight loss text
          const loseText = `Needs to lose `;
          const boldKg = `~${weightRec.kg.toFixed(0)} kg`;
          const butText = `, but this should be `;
          const boldPhased = `gradual and phased`;
          const loseWidth1 = getTextWidth(loseText);
          const loseWidth2 = getTextWidth(loseText + boldKg + butText);
          doc.text(loseText, 20, yPosition);
    doc.setFont("helvetica", "bold");
          doc.text(boldKg, 20 + loseWidth1, yPosition);
    doc.setFont("helvetica", "normal");
          doc.text(butText, 20 + loseWidth1 + getTextWidth(boldKg), yPosition);
      doc.setFont("helvetica", "bold");
          doc.text(boldPhased, 20 + loseWidth2, yPosition);
      doc.setFont("helvetica", "normal");
          yPosition += PDF_STYLES.spacing.betweenItems;
        } else if (weightRec.action === "gain") {
        checkPageBreak(15); // Check before weight gain text
        yPosition = addWrappedText(`Needs to gain ~${weightRec.kg.toFixed(0)} kg through healthy weight gain strategies.`, 20, yPosition, pageWidth - 40, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
        yPosition += PDF_STYLES.spacing.betweenItems;
        }
      }
    }
    yPosition += PDF_STYLES.spacing.betweenSections;

    // Blood Pressure subsection
    if (assessment.systolic && assessment.diastolic) {
      yPosition = setSubsectionHeader("Blood Pressure", yPosition);
      setBodyText();
      doc.setFont("helvetica", "bold");
      doc.text(`${assessment.systolic}/${assessment.diastolic} mmHg`, 20, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += PDF_STYLES.spacing.betweenItems;

      const sysLabel = assessment.systolic >= 130 ? "mildly elevated" : assessment.systolic < 120 ? "normal" : "elevated";
      const diaLabel = assessment.diastolic >= 90 ? "clearly high" : assessment.diastolic >= 85 ? "elevated" : "normal";
      doc.text(`Systolic: ${sysLabel}`, 20, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      doc.text(`Diastolic: ${diaLabel}`, 20, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      
      if (bpInfo.category) {
        // Check page break only before long category names that might overflow footer
        const categoryLength = bpInfo.category.length;
        const estimatedSpace = categoryLength > 30 ? 30 : 20; // More space for long category names
        checkPageBreak(estimatedSpace);
        
          doc.setFont("helvetica", "bold");
        doc.text(`${bpInfo.category}`, 20, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
          doc.setFont("helvetica", "normal");
      }
      
      if (bpInfo.category && bpInfo.category.includes("High Blood Pressure")) {
        checkPageBreak(30); // Check before risks list
        doc.setFontSize(PDF_STYLES.fontSize.small);
        doc.text(`This level of BP, if persistent, increases risk of:`, 20, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
        BP_RISKS.forEach(risk => {
          doc.text(`  • ${risk}`, 25, yPosition);
          yPosition += PDF_STYLES.spacing.betweenItems;
        });
        setBodyText();
        yPosition += 2;
      }
    }
    yPosition += PDF_STYLES.spacing.betweenSections;

    // Blood Sugar subsection
    checkPageBreak(50); // Check before Blood Sugar section
    if (sugarInfo) {
      const sugarType = sugarInfo.type === "2-hour Post-prandial" ? "2-hour post-meal" : "fasting";
      yPosition = setSubsectionHeader(`Blood Sugar (${sugarType} = ${sugarInfo.value} mg/dL)`, yPosition);
      setBodyText();
      if (sugarInfo.type === "2-hour Post-prandial") {
      doc.text("Normal: <140 mg/dL", 20, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      doc.text("Prediabetes: 140-199 mg/dL", 20, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      doc.text("Diabetes: >=200 mg/dL", 20, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      } else {
        doc.text("Normal: <100 mg/dL", 20, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
        doc.text("Prediabetes: 100-125 mg/dL", 20, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
        doc.text("Diabetes: >=126 mg/dL", 20, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
      }
      checkPageBreak(10); // Check before status
        doc.setFont("helvetica", "bold");
      const statusText = sugarInfo.status.includes("PRE-DIABETIC") ? "PRE-DIABETIC (risk)" : sugarInfo.status;
      doc.text(`Status: ${statusText}`, 20, yPosition);
        doc.setFont("helvetica", "normal");
      yPosition += PDF_STYLES.spacing.betweenItems;
      }

    // Pulse subsection
    checkPageBreak(20); // Check before Pulse section
    yPosition = setSubsectionHeader("Pulse", yPosition);
    setBodyText();
    doc.text(`${assessment.pulse || 70}/min - Normal`, 20, yPosition);
    yPosition += PDF_STYLES.spacing.betweenItems; // Space before next major section

    // Overall Clinical Impression
    yPosition = addSectionDivider(yPosition);
    yPosition = addSectionHeader("Overall Clinical Impression", yPosition, PDF_STYLES.fontSize.sectionHeader);
    
    // Check page break only if the content box would overflow footer
    const impressionBoxHeight = 45;
    checkPageBreak(impressionBoxHeight + 10); // Check before adding box if it would overflow
    
    // Add background box for clinical impression
    doc.setFillColor(250, 250, 250);
    doc.rect(20, yPosition - 2, pageWidth - 40, impressionBoxHeight, "F");
    
    setBodyText();
    let impressionY = yPosition + 4;
    
    // Use dynamic AI summary if available, otherwise use calculated impression
    if (assessment.ai_insights?.summary) {
      impressionY = addWrappedText(assessment.ai_insights.summary, 25, impressionY, pageWidth - 50, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
    } else {
    let clinicalImpression = "You are currently ";
    const conditions = [];
    if (bmiClass && bmiClass.class.includes("Obese")) {
      conditions.push("obese");
    }
    if (bmiClass && bmiClass.class === "Overweight") {
      conditions.push("overweight");
    }
    if (bpInfo.category && bpInfo.category.includes("High Blood Pressure")) {
      conditions.push("have early high blood pressure");
    }
    if (sugarInfo && sugarInfo.status.includes("PRE-DIABETIC")) {
      conditions.push("your blood sugar is in the pre-diabetic range");
    }
    if (sugarInfo && sugarInfo.status === "DIABETIC") {
      conditions.push("have diabetes");
    }
    
    const conditionText = conditions.join(", ");
    const fullText = conditionText + ". These conditions are interconnected and largely reversible at this stage if action is taken now.";
      impressionY = addWrappedText(clinicalImpression + fullText, 25, impressionY, pageWidth - 50, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
      impressionY += PDF_STYLES.spacing.betweenItems;
    
    if (!sugarInfo || !sugarInfo.status.includes("DIABETIC")) {
        const para2Text = "This is NOT yet diabetes, and likely does not need medication immediately, but lifestyle changes are urgent.";
        impressionY = addWrappedText(para2Text, 25, impressionY, pageWidth - 50, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
    } else {
        const para2Text = "Medical management along with lifestyle changes is essential.";
        impressionY = addWrappedText(para2Text, 25, impressionY, pageWidth - 50, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
      }
    }
    
    yPosition += impressionBoxHeight + 6; // Space after clinical impression box for readability

    // Key Counseling Points
    checkPageBreak(15); // Check before divider and header
    yPosition = addSectionDivider(yPosition);
    yPosition = addSectionHeader("Key Counseling Points", yPosition, PDF_STYLES.fontSize.sectionHeader);

    // A. Weight Loss
    yPosition = setSubsectionHeader("A. Weight Loss - Most Important Intervention", yPosition);
    setBodyText();
    doc.text("Even ", 20, yPosition);
    doc.setFont("helvetica", "bold");
      doc.text("5-10% weight loss", 20 + getTextWidth("Even "), yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(" (5-10 kg) can:", 20 + getTextWidth("Even 5-10% weight loss"), yPosition);
    yPosition += PDF_STYLES.spacing.betweenItems;

    const benefits = ["Reduce blood sugar", "Lower BP", "Improve insulin sensitivity"];
      benefits.forEach(benefit => {
      doc.text(`  • ${benefit}`, 25, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      });
    yPosition += PDF_STYLES.spacing.afterSubsection;
    
    checkPageBreak(30); // Check before Realistic Targets (only if needed)
      doc.setFont("helvetica", "normal");
      doc.text("Realistic Targets:", 20, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
    if (weightRec && weightRec.action === "lose" && weightRec.range && weightRec.range[1]) {
        yPosition = addWrappedText(`First goal: Lose 8-10 kg in 6 months`, 20, yPosition, pageWidth - 40, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
        yPosition += PDF_STYLES.spacing.betweenItems;
        yPosition = addWrappedText(`Long-term goal: Reach ~${weightRec.range[1].toFixed(0)} kg over 1.5-2 years`, 20, yPosition, pageWidth - 40, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
        yPosition += PDF_STYLES.spacing.betweenItems;
    } else {
        yPosition = addWrappedText("First goal: Lose 8-10 kg in 6 months", 20, yPosition, pageWidth - 40, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
        yPosition += PDF_STYLES.spacing.betweenItems;
        yPosition = addWrappedText("Long-term goal: Reach ideal weight over 1.5-2 years", 20, yPosition, pageWidth - 40, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
        yPosition += PDF_STYLES.spacing.betweenItems;
    }

      // B. Diet Recommendations
    checkPageBreak(70); // Check before Diet Recommendations (long section)
      yPosition = setSubsectionHeader("B. Diet Recommendations", yPosition);
      setBodyText();
    
    // Use dynamic data from ai_insights if available, otherwise use static fallback
    // Format stays exactly the same - just data source changes
    const avoidFoods = assessment.ai_insights?.diet_plan?.foods_to_avoid && 
                       Array.isArray(assessment.ai_insights.diet_plan.foods_to_avoid) &&
                       assessment.ai_insights.diet_plan.foods_to_avoid.length > 0
      ? assessment.ai_insights.diet_plan.foods_to_avoid
      : [
      "Sugary drinks, juices, sweets",
      "White rice, white bread, bakery items",
      "Fried foods, fast food",
      "Late-night eating",
      "Excess salt (important for BP)"
    ];
    
    const encourageFoods = assessment.ai_insights?.diet_plan?.foods_to_eat && 
                           Array.isArray(assessment.ai_insights.diet_plan.foods_to_eat) &&
                           assessment.ai_insights.diet_plan.foods_to_eat.length > 0
      ? assessment.ai_insights.diet_plan.foods_to_eat
      : [
          "Half plate vegetables",
          "Whole grains (millets, brown rice, oats)",
          "Lean protein (dal, beans, eggs, fish, chicken)",
          "Fruits (1-2/day, whole fruit only)",
          "Healthy fats (nuts, seeds, olive/mustard oil)"
        ];

    // Always show Avoid/Reduce section (same format as before)
    doc.setFont("helvetica", "bold");
    doc.text("Avoid / Reduce:", 20, yPosition);
    doc.setFont("helvetica", "normal");
    yPosition += PDF_STYLES.spacing.betweenItems;
      avoidFoods.forEach(food => {
      doc.text(`  • ${food}`, 25, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
    });
    yPosition += PDF_STYLES.spacing.afterSubsection;

    // Always show Encourage section (same format as before)
    checkPageBreak(45); // Check before Encourage section
    doc.setFont("helvetica", "bold");
      doc.text("Encourage:", 20, yPosition);
    doc.setFont("helvetica", "normal");
    yPosition += PDF_STYLES.spacing.betweenItems;
      encourageFoods.forEach(food => {
      doc.text(`  • ${food}`, 25, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
    });
    yPosition += PDF_STYLES.spacing.afterSubsection;

    // Use diet plan summary if available (dynamic), otherwise use static rule
    if (assessment.ai_insights?.diet_plan?.summary) {
      checkPageBreak(15);
      doc.setFont("helvetica", "italic");
      yPosition = addWrappedText(assessment.ai_insights.diet_plan.summary, 20, yPosition, pageWidth - 40, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
      doc.setFont("helvetica", "normal");
      yPosition += PDF_STYLES.spacing.betweenItems;
    } else {
      checkPageBreak(10); // Check before simple rule
      doc.setFont("helvetica", "italic");
      doc.text("Simple rule: No sugar drinks, no fried food, smaller portions", 20, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += PDF_STYLES.spacing.betweenItems;
    }

    // Add meal suggestions if available from AI insights (dynamic)
    if (assessment.ai_insights?.diet_plan?.meal_suggestions && 
        Array.isArray(assessment.ai_insights.diet_plan.meal_suggestions) &&
        assessment.ai_insights.diet_plan.meal_suggestions.length > 0) {
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.text("Sample Meal Suggestions:", 20, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += PDF_STYLES.spacing.afterHeader;
      assessment.ai_insights.diet_plan.meal_suggestions.forEach((meal, idx) => {
        checkPageBreak(10);
        yPosition = addWrappedText(`  • ${meal}`, 25, yPosition, pageWidth - 45, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
        yPosition += PDF_STYLES.spacing.betweenItems;
      });
      yPosition += PDF_STYLES.spacing.afterSubsection;
    }

    // C. Physical Activity
    checkPageBreak(40); // Check before Physical Activity
    yPosition = setSubsectionHeader("C. Physical Activity", yPosition);
    setBodyText();
    doc.text("Minimum recommendation:", 20, yPosition);
    yPosition += PDF_STYLES.spacing.betweenItems;
    doc.setFont("helvetica", "bold");
    doc.text("Brisk walking 30-45 minutes/day, 5-6 days/week", 20, yPosition);
    yPosition += PDF_STYLES.spacing.betweenItems;
    doc.setFont("helvetica", "normal");
    doc.text("Add light strength training 2-3 days/week", 20, yPosition);
    yPosition += PDF_STYLES.spacing.betweenItems;
    if (assessment.exercise === "Sedentary" || !assessment.exercise) {
      checkPageBreak(10); // Check before sedentary note
      doc.text("If sedentary:", 20, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(" Start with 15-20 minutes/day", 20 + getTextWidth("If sedentary:"), yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(", then increase", 20 + getTextWidth("If sedentary: Start with 15-20 minutes/day"), yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
    }
    yPosition += PDF_STYLES.spacing.betweenItems;

    // D. Blood Pressure Control
    if (assessment.systolic && assessment.diastolic && bpInfo.category && bpInfo.category.includes("High Blood Pressure")) {
      checkPageBreak(40); // Check before BP Control section
      yPosition = setSubsectionHeader("D. Blood Pressure Control", yPosition);
      setBodyText();
        const bpControlPoints = [
        "Weight loss",
        "Salt <5 g/day",
          "Exercise",
        "Adequate sleep (7-8 hrs)",
        "Stress management"
        ];
        bpControlPoints.forEach(point => {
        doc.text(`  • ${point}`, 25, yPosition);
        yPosition += PDF_STYLES.spacing.betweenItems;
      });
      yPosition += PDF_STYLES.spacing.afterSubsection;
      checkPageBreak(10); // Check before medication note
      doc.text("If BP remains >=130/90 after 3 months of lifestyle change -> medication may be needed.", 20, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
    }

      // AI Recommendations (if available)
    if (assessment.ai_insights?.recommendations && 
        Array.isArray(assessment.ai_insights.recommendations) && 
        assessment.ai_insights.recommendations.length > 0) {
      checkPageBreak(30); // Check before AI Recommendations
      yPosition = setSubsectionHeader("E. Personalized Recommendations", yPosition);
      setBodyText();
      
      assessment.ai_insights.recommendations.forEach((rec, idx) => {
        let title = "";
        let description = "";

        if (typeof rec === "object" && rec !== null) {
          title = rec.title || "";
          description = rec.description || "";
        } else if (typeof rec === "string") {
          description = rec;
          title = `Recommendation ${idx + 1}`;
        }

        // Clean up metadata and JSON artifacts
        title = title.replace(/[{}\[\]"']/g, "").replace(/^(title|recommendations)\s*:\s*/i, "").trim();
        description = description.replace(/[{}\[\]"']/g, "").replace(/^description\s*:\s*/i, "").trim();

        if (title && description && title.length >= 2 && description.length >= 5) {
          checkPageBreak(20);
          doc.setFont("helvetica", "bold");
          doc.text(`${title}:`, 20, yPosition);
          doc.setFont("helvetica", "normal");
        yPosition += PDF_STYLES.spacing.afterSubsection;
          yPosition = addWrappedText(description, 25, yPosition, pageWidth - 45, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
          yPosition += PDF_STYLES.spacing.betweenItems;
        }
      });
      yPosition += PDF_STYLES.spacing.afterSubsection;
    }

    // Precautions & Warnings
    checkPageBreak(15); // Check before divider and header
    yPosition = addSectionDivider(yPosition);
    yPosition = addSectionHeader("Precautions & Warnings", yPosition, PDF_STYLES.fontSize.sectionHeader);

    yPosition = setSubsectionHeader("Important Precautions", yPosition);
    setBodyText();
    
    // Use dynamic data from ai_insights if available, otherwise use static fallback
    const precautions = assessment.ai_insights?.donts && 
                        Array.isArray(assessment.ai_insights.donts) &&
                        assessment.ai_insights.donts.length > 0
      ? assessment.ai_insights.donts
      : [
          "Do not ignore high BP or sugar",
          "Avoid crash diets or weight-loss pills",
          "Avoid smoking and alcohol",
          "Do not self-medicate"
        ];
    
    precautions.forEach(prec => {
      doc.text(`  • ${prec}`, 25, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
    });
    yPosition += PDF_STYLES.spacing.afterSubsection;

    checkPageBreak(30); // Check before warning symptoms
    doc.setFontSize(PDF_STYLES.fontSize.subsectionHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PDF_STYLES.color.red[0], PDF_STYLES.color.red[1], PDF_STYLES.color.red[2]);
    doc.text("Warning Symptoms", 20, yPosition);
    setBodyText();
    yPosition += PDF_STYLES.spacing.afterSubsection;
    const warningSymptoms = [
      "Severe headache",
      "Chest pain",
      "Dizziness or fainting",
      "Excessive thirst or urination",
      "Sudden vision changes"
    ];
    warningSymptoms.forEach(symptom => {
      doc.text(`  • ${symptom}`, 25, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
    });
    yPosition += PDF_STYLES.spacing.betweenSections;

    // Recommended Investigations
    checkPageBreak(15); // Check before divider and header
    yPosition = addSectionDivider(yPosition);
    yPosition = addSectionHeader("Recommended Investigations", yPosition, PDF_STYLES.fontSize.sectionHeader);
    setBodyText();
      doc.text("You may advise:", 20, yPosition);
    yPosition += PDF_STYLES.spacing.afterSubsection;
    
    const investigations = [
      "Fasting blood sugar",
      "HbA1c",
      "Lipid profile",
      "Liver function tests",
      "Kidney function tests",
      "ECG"
    ];
    investigations.forEach(inv => {
      doc.text(`  • ${inv}`, 25, yPosition);
      yPosition += PDF_STYLES.spacing.betweenItems;
      });
    yPosition += PDF_STYLES.spacing.afterSubsection;
    checkPageBreak(10); // Check before assessment text
    doc.text("These help assess ", 20, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text("cardio-metabolic risk", 20 + getTextWidth("These help assess "), yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(".", 20 + getTextWidth("These help assess cardio-metabolic risk"), yPosition);
    yPosition += PDF_STYLES.spacing.betweenItems;

    // Follow-Up Plan
    checkPageBreak(15); // Check before divider and header
    yPosition = addSectionDivider(yPosition);
    yPosition = addSectionHeader("Follow-Up Plan", yPosition, PDF_STYLES.fontSize.sectionHeader);
    setBodyText();
      doc.text("• Recheck ", 20, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text("BP and sugar in 3 months", 20 + getTextWidth("• Recheck "), yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += PDF_STYLES.spacing.betweenItems;
    doc.text("• Monthly weight monitoring", 20, yPosition);
    yPosition += PDF_STYLES.spacing.betweenItems;
      doc.text("• Reinforce lifestyle adherence", 20, yPosition);
    yPosition += PDF_STYLES.spacing.betweenSections;

    // Key Message
    checkPageBreak(50); // Check before Key Message (needs space for box)
    yPosition = addSectionDivider(yPosition);
    yPosition += 5; // Gap before Key Message section for readability
    
    // Highlight box for key message
    doc.setFillColor(240, 248, 255);
    const keyMessageHeight = 25; // Increased box height for more spacing
    doc.rect(20, yPosition - 2, pageWidth - 40, keyMessageHeight, "F");
    
    doc.setFontSize(PDF_STYLES.fontSize.sectionHeader);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PDF_STYLES.color.black[0], PDF_STYLES.color.black[1], PDF_STYLES.color.black[2]);
    doc.text("Key Message", 25, yPosition + 5);
    yPosition += 8; // More space after title

    checkPageBreak(15); // Check before key message text
    setBodyText();
    yPosition = addWrappedText("You are at a reversible stage - with weight loss, diet control, and exercise, you can prevent diabetes and control blood pressure without medicines.", 25, yPosition, pageWidth - 50, PDF_STYLES.fontSize.body, PDF_STYLES.spacing.betweenItems);
    yPosition += PDF_STYLES.spacing.betweenItems;

    // Footer is already added to each page via addFooter() function
    // No need to add it again here as it's rendered on every page

    // Save the PDF
    const fileName = `Heart_Health_Assessment_Report_${assessment.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
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

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No assessment found</p>
          <Button onClick={() => navigate("/heart-health")} className="mt-4">
            Take Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" onClick={() => (window.location.href = "https://10000hearts.com/")} className="mb-4">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-12 h-12 text-accent fill-accent" />
            <div>
              <h2 className="text-2xl font-bold">Hi {assessment.name},</h2>
              <h1 className="text-3xl font-bold">Heart Health Reports</h1>
            </div>
          </div>
        </div>

        {/* Report History Section - Now at the top */}
        {allAssessments.length > 0 && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Your Reports</h3>
              <Button onClick={() => navigate("/heart-health")} size="sm" className="bg-accent hover:bg-accent/90">
                + Create New Report
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allAssessments.map((item, index) => (
                <Card
                  key={item.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    item.id === assessmentId
                      ? "border-accent border-2 bg-accent/10"
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => navigate(`/heart-health-results?id=${item.id}`)}
                >
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h3 className="font-bold text-foreground text-lg">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm text-muted-foreground">Report #{allAssessments.length - index}</h4>
                        {item.id === assessmentId && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                            Viewing
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Date</span>
                        <span className="text-xs font-medium text-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Heart Age</span>
                        <span className="text-xs font-medium text-foreground">{item.heart_age || "N/A"}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Risk</span>
                        <span className="text-xs font-medium text-foreground">
                          {item.risk_score ? `${item.risk_score.toFixed(1)}%` : "N/A"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">BMI</span>
                        <span className="text-xs font-medium text-foreground">
                          {item.bmi ? item.bmi.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>

                    {item.id !== assessmentId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/heart-health-results?id=${item.id}`);
                        }}
                      >
                        View Report
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Current Report Details */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Report Details - {new Date(assessment.created_at).toLocaleDateString()}
          </h2>
          <Button onClick={downloadPDFReport} className="bg-accent hover:bg-accent/90">
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
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
                  {assessment.bmi ? assessment.bmi.toFixed(1) : "N/A"}
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
                  {assessment.risk_score ? assessment.risk_score.toFixed(1) : "N/A"}%
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
                    <span className="font-medium text-health-orange">Overweight</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-muted-foreground">30+</span>
                    <span className="font-medium text-warning">Obese</span>
                  </div>
                </div>
                {assessment.bmi && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Your BMI: {assessment.bmi.toFixed(1)} → {getBMICategory()}
                    </p>
                  </div>
                )}
              </Card>

              {/* CV Score Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">❤️ What is CV Score?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Cardiovascular Risk Score combines factors like blood pressure, BMI, lifestyle, and more.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">0 - 50</span>
                    <span className="font-medium text-success">Low Risk</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">50 - 70</span>
                    <span className="font-medium text-health-orange">Moderate Risk</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-muted-foreground">70+</span>
                    <span className="font-medium text-warning">High Risk</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground">
                    Your Score: {calculateCardiovascularScore()} → {getCVRiskLevel().level}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Reversible with lifestyle improvements</p>
                </div>
              </Card>

              {/* Heart Age Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">💓 What is Heart Age?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Heart Age tells you how old your heart behaves biologically, not your actual age.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  If your heart age is higher than your real age, it means higher risk due to factors like weight,
                  activity, sleep, or nutrition.
                </p>
                {assessment.heart_age && assessment.age && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Your Heart Age: {assessment.heart_age} years
                    </p>
                    <p className="text-sm font-medium text-foreground">Your Actual Age: {assessment.age} years</p>
                    <p className="text-xs text-muted-foreground mt-2">{getHeartAgeMessage()}</p>
                  </div>
                )}
              </Card>

              {/* Risk Percentage Explanation */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">⚠️ What is Heart Risk %?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This is your chance of developing a heart problem in the next 10 years.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">&lt; 5%</span>
                    <span className="font-medium text-success">Excellent</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">5 - 10%</span>
                    <span className="font-medium text-health-green">Good</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2 border-b border-border">
                    <span className="text-muted-foreground">10 - 20%</span>
                    <span className="font-medium text-health-orange">Moderate</span>
                  </div>
                  <div className="flex justify-between text-sm pb-2">
                    <span className="text-muted-foreground">&gt; 20%</span>
                    <span className="font-medium text-warning">High</span>
                  </div>
                </div>
                {assessment.risk_score && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Your Risk: {assessment.risk_score.toFixed(1)}% → {getRiskCategory().level}
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Blood Pressure Details */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-accent mb-4">🩺 Blood Pressure Reading</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Blood pressure shows the force of blood against your artery walls.
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">Systolic</span>
                        <span className="text-2xl font-bold text-accent">{assessment.systolic || "N/A"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pressure when heart beats</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">Diastolic</span>
                        <span className="text-2xl font-bold text-accent">{assessment.diastolic || "N/A"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Pressure when heart relaxes</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Your BP: {assessment.systolic}/{assessment.diastolic} mmHg
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      Category: {bpInfo.category} ({bpInfo.label})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{bpInfo.detail}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">BP Categories:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm pb-2 border-b border-border">
                      <span className="text-muted-foreground">&lt;120/80</span>
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
                  {bpInfo.category.includes("Normal") && assessment.systolic && assessment.systolic < 100 && (
                    <div className="mt-4 p-3 bg-health-lightBlue rounded-lg">
                      <p className="text-xs text-foreground">
                        💡 Low-normal BP is common in athletes and active individuals. If you experience dizziness or
                        fatigue, consult your doctor.
                      </p>
                    </div>
                  )}
                  {bpInfo.category && bpInfo.category.includes("High Blood Pressure") && (
                    <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                      <p className="text-xs text-foreground">
                        This level of BP, if persistent, increases risk of: • Stroke • Heart disease • Kidney damage
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Cholesterol Section */}
            {(assessment.ldl || assessment.hdl) && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-accent mb-4">🧪 Cholesterol Levels</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      {assessment.ldl && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">LDL (Bad Cholesterol)</span>
                            <span
                              className={`text-2xl font-bold ${
                                (() => {
                                  const level = LDL_LEVELS.find(lvl => assessment.ldl < lvl.max);
                                  return level?.color || "text-success";
                                })()
                              }`}
                            >
                              {assessment.ldl}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">mg/dL</p>
                          <div className="mt-2 text-sm font-medium">
                            {(() => {
                              const level = LDL_LEVELS.find(lvl => assessment.ldl < lvl.max);
                              return level ? <span className={level.color}>{level.label}</span> : null;
                            })()}
                          </div>
                        </div>
                      )}

                      {assessment.hdl && (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">HDL (Good Cholesterol)</span>
                            <span
                              className={`text-2xl font-bold ${
                                (() => {
                                  const level = HDL_LEVELS.find(lvl => assessment.hdl < lvl.max);
                                  return level?.color || "text-success";
                                })()
                              }`}
                            >
                              {assessment.hdl}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">mg/dL</p>
                          <div className="mt-2 text-sm font-medium">
                            {(() => {
                              const level = HDL_LEVELS.find(lvl => assessment.hdl < lvl.max);
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

                    {assessment.ai_insights?.cholesterol_advice && (
                      <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">💡 Recommendation:</p>
                        <p className="text-sm text-foreground/90">{assessment.ai_insights.cholesterol_advice}</p>
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
                      {assessment.heart_age || assessment.age} years
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">10-Year Risk</span>
                    <span className="text-sm font-bold text-accent">
                      {assessment.risk_score?.toFixed(1)}% - {getRiskCategory().level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Blood Pressure</span>
                    <span className="text-sm font-bold text-accent">
                          {assessment.systolic}/{assessment.diastolic} - {bpInfo.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm font-medium text-foreground">Age</span>
                    <span className="text-sm font-bold text-accent">{assessment.age} years</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Comprehensive Detailed Report Section */}
            <Card className="p-8 bg-card border-accent/20">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Heart Health Assessment Report</h2>
              
              {/* Patient Summary */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Patient Summary</h3>
                <div className="bg-muted/20 p-6 rounded-lg space-y-2">
                  <p className="text-base"><strong>Name:</strong> {assessment.name}</p>
                  <p className="text-base"><strong>Age/Sex:</strong> {formatAgeSex()}</p>
                  {assessment.height && <p className="text-base"><strong>Height:</strong> {assessment.height} cm</p>}
                  {assessment.weight && <p className="text-base"><strong>Weight:</strong> {assessment.weight} kg</p>}
                  {assessment.bmi && <p className="text-base"><strong>BMI:</strong> {assessment.bmi.toFixed(1)} kg/m²</p>}
                  {assessment.systolic && assessment.diastolic && (
                    <p className="text-base"><strong>Blood Pressure:</strong> {assessment.systolic} / {assessment.diastolic} mmHg</p>
                  )}
                  <p className="text-base"><strong>Pulse:</strong> {assessment.pulse || 70}/min {assessment.pulse && assessment.pulse >= 60 && assessment.pulse <= 100 ? "(normal)" : ""}</p>
                  {(() => {
                    const sugarInfo = getBloodSugarClassification();
                    if (sugarInfo) {
                      const sugarType = sugarInfo.type === "2-hour Post-prandial" ? "2-hour Post-prandial" : "Fasting";
                      return <p className="text-base"><strong>{sugarType} Blood Sugar:</strong> {sugarInfo.value} mg/dL</p>;
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Interpretation of Results */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Interpretation of Results</h3>
                
                {/* Weight & BMI */}
                {assessment.bmi && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-foreground mb-3">Weight & BMI</h4>
                    <div className="bg-warning/10 p-4 rounded-lg mb-3">
                      <p className="text-base font-semibold mb-2">
                        BMI {assessment.bmi.toFixed(1)} = {getBMIClassification()?.class || getBMICategory()}
                      </p>
                      {getBMIClassification()?.risks && getBMIClassification().risks.length > 0 && (
                        <>
                          <p className="text-base mb-2">This significantly increases the risk of:</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {getBMIClassification().risks.map((risk, idx) => (
                              <li key={idx} className="text-base">{risk}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    {weightRec && assessment.height && (
                      <div className="space-y-2">
                        <p className="text-base">
                          Ideal weight for height ~{assessment.height} cm is around {weightRec.range[0].toFixed(0)}–{weightRec.range[1].toFixed(0)} kg
                        </p>
                        {weightRec.action !== "maintain" && (
                          <p className="text-base">
                            Needs to {weightRec.action === "lose" ? "lose" : "gain"} ~{Math.round(weightRec.kg)} kg, but this should be gradual and phased
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Blood Pressure */}
                {assessment.systolic && assessment.diastolic && (
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-foreground mb-3">Blood Pressure</h4>
                    <div className="bg-warning/10 p-4 rounded-lg space-y-2">
                      <p className="text-base font-semibold">{assessment.systolic}/{assessment.diastolic} mmHg</p>
                      <p className="text-base">
                        Systolic: {assessment.systolic >= 130 ? "mildly elevated" : assessment.systolic < 120 ? "normal" : "elevated"}
                      </p>
                      <p className="text-base">
                        Diastolic: {assessment.diastolic >= 90 ? "clearly high" : assessment.diastolic >= 85 ? "elevated" : "normal"}
                      </p>
                      <p className="text-base font-semibold mt-2">{bpInfo.category}</p>
                      {bpInfo.category && bpInfo.category.includes("High Blood Pressure") && (
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
                  const sugarType = sugarInfo.type === "2-hour Post-prandial" ? "2-hour post-meal" : "fasting";
                  return (
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold text-foreground mb-3">
                        Blood Sugar ({sugarType} = {sugarInfo.value} mg/dL)
                      </h4>
                      <div className="bg-warning/10 p-4 rounded-lg space-y-2">
                        <p className="text-base">Normal: &lt;140 mg/dL</p>
                        <p className="text-base">Prediabetes: 140–199 mg/dL</p>
                        <p className="text-base">Diabetes: ≥200 mg/dL</p>
                        <p className="text-base font-semibold mt-2">{sugarInfo.status}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Pulse */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-foreground mb-3">Pulse</h4>
                  <p className="text-base">
                    {assessment.pulse || 70}/min – {assessment.pulse && assessment.pulse >= 60 && assessment.pulse <= 100 ? "Normal" : "Check with doctor"}
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
                    if (bmiClass && bmiClass.class.includes("Obese")) conditions.push("obese");
                    if (bmiClass && bmiClass.class === "Overweight") conditions.push("overweight");
                    if (bpInfo.category && bpInfo.category.includes("High Blood Pressure")) conditions.push("have early high blood pressure");
                    const sugarInfo = getBloodSugarClassification();
                    if (sugarInfo && sugarInfo.status.includes("PRE-DIABETIC")) conditions.push("your blood sugar is in the pre-diabetic range");
                    if (sugarInfo && sugarInfo.status === "DIABETIC") conditions.push("have diabetes");
                    
                    const conditionText = conditions.length > 0 ? conditions.join(", ") : "in good health";
                    return (
                      <>
                        <p className="text-base">
                          You are currently {conditionText}. {conditions.length > 0 ? "These conditions are interconnected and largely reversible at this stage if action is taken now." : ""}
                        </p>
                        {sugarInfo && !sugarInfo.status.includes("DIABETIC") && (
                          <p className="text-base">
                            This is NOT yet diabetes, and likely does not need medication immediately, but lifestyle changes are urgent.
                          </p>
                        )}
                        {sugarInfo && sugarInfo.status === "DIABETIC" && (
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
                    <h4 className="text-xl font-semibold text-foreground mb-3">A. Weight Loss – Most Important Intervention</h4>
                    <div className="bg-success/10 p-4 rounded-lg space-y-3">
                      <p className="text-base">Even 5–10% weight loss ({Math.round(assessment.weight * 0.05)}–{Math.round(assessment.weight * 0.1)} kg) can:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li className="text-base">Reduce blood sugar</li>
                        <li className="text-base">Lower BP</li>
                        <li className="text-base">Improve insulin sensitivity</li>
                      </ul>
                      <div className="mt-3">
                        <p className="text-base font-semibold">Realistic Targets:</p>
                        <p className="text-base">First goal: Lose {Math.round(assessment.weight * 0.08)}–{Math.round(assessment.weight * 0.1)} kg in 6 months</p>
                        <p className="text-base">Long-term goal: Reach ~{weightRec.range[1].toFixed(0)} kg over 1.5–2 years</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* B. Diet Recommendations */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-foreground mb-3">B. Diet Recommendations</h4>
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
                  <h4 className="text-xl font-semibold text-foreground mb-3">C. Physical Activity</h4>
                  <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                    <p className="text-base font-semibold">Minimum recommendation:</p>
                    <p className="text-base">Brisk walking 30–45 minutes/day, 5–6 days/week</p>
                    <p className="text-base">Add light strength training 2–3 days/week</p>
                    {(assessment.exercise === "Sedentary" || !assessment.exercise) && (
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
                    <h4 className="text-xl font-semibold text-foreground mb-3">D. Blood Pressure Control</h4>
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
                  {assessment.bmi ? assessment.bmi.toFixed(1) : "N/A"}
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
                  {assessment.risk_score ? assessment.risk_score.toFixed(1) : "N/A"}%
                </div>
                <h3 className="text-lg font-semibold text-accent">Heart Risk</h3>
                <p className={`text-xs font-medium ${getRiskCategory().color}`}>{getRiskCategory().level}</p>
                <p className="text-xs text-muted-foreground mt-2">10-Year Risk</p>
              </Card>
            </div>

            {assessment.ai_insights ? (
              <div className="space-y-6">
                {/* Summary Section */}
                {assessment.ai_insights.summary && (
                  <Card className="p-8 bg-card border-accent/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-8 h-8 text-accent" />
                      <h2 className="text-2xl font-bold text-foreground">Summary of Patient</h2>
                    </div>
                    <div className="p-6 bg-muted/20 rounded-lg">
                      <p className="text-lg leading-relaxed text-foreground">{assessment.ai_insights.summary}</p>
                    </div>
                  </Card>
                )}

                {/* Recommendation Cards */}
                {assessment.ai_insights.recommendations && assessment.ai_insights.recommendations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-foreground">Recommended Actions</h3>
                    {assessment.ai_insights.recommendations
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

                {/* Diet Plan Card - Separate */}
                {assessment.ai_insights.diet_plan && (
                  <Card className="p-8 bg-gradient-to-br from-health-lightBlue/20 to-accent/5">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-4xl">🥗</span>
                      <h3 className="text-2xl font-semibold text-foreground">Your Personalized Diet Plan</h3>
                    </div>

                    {assessment.ai_insights.diet_plan.summary && (
                      <div className="mb-6">
                        <p className="text-lg leading-relaxed text-foreground/90">
                          {assessment.ai_insights.diet_plan.summary}
                        </p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Foods to Eat */}
                      {assessment.ai_insights.diet_plan.foods_to_eat &&
                        Array.isArray(assessment.ai_insights.diet_plan.foods_to_eat) &&
                        assessment.ai_insights.diet_plan.foods_to_eat.length > 0 && (
                          <Card className="p-6 bg-success/5 border-l-4 border-success">
                            <div className="flex items-center gap-2 mb-4">
                              <CheckCircle className="w-5 h-5 text-success" />
                              <h4 className="text-lg font-semibold text-success">Foods to Include</h4>
                            </div>
                            <ul className="space-y-2">
                              {assessment.ai_insights.diet_plan.foods_to_eat.map((food, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-foreground">
                                  <span className="text-success mt-0.5">✓</span>
                                  <span>{food}</span>
                                </li>
                              ))}
                            </ul>
                          </Card>
                        )}

                      {/* Foods to Avoid */}
                      {assessment.ai_insights.diet_plan.foods_to_avoid &&
                        Array.isArray(assessment.ai_insights.diet_plan.foods_to_avoid) &&
                        assessment.ai_insights.diet_plan.foods_to_avoid.length > 0 && (
                          <Card className="p-6 bg-warning/5 border-l-4 border-warning">
                            <div className="flex items-center gap-2 mb-4">
                              <AlertCircle className="w-5 h-5 text-warning" />
                              <h4 className="text-lg font-semibold text-warning">Foods to Limit/Avoid</h4>
                            </div>
                            <ul className="space-y-2">
                              {assessment.ai_insights.diet_plan.foods_to_avoid.map((food, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-foreground">
                                  <span className="text-warning mt-0.5">✗</span>
                                  <span>{food}</span>
                                </li>
                              ))}
                            </ul>
                          </Card>
                        )}
                    </div>

                    {assessment.risk_score && assessment.risk_score > 20 && (
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
                {assessment.ai_insights.diet_plan?.meal_suggestions &&
                  Array.isArray(assessment.ai_insights.diet_plan.meal_suggestions) &&
                  assessment.ai_insights.diet_plan.meal_suggestions.length > 0 && (
                    <Card className="p-8 bg-gradient-to-br from-accent/10 to-background">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">🍽️</span>
                        <h3 className="text-2xl font-semibold text-foreground">Sample Meal Suggestions</h3>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        {assessment.ai_insights.diet_plan.meal_suggestions.map((meal, idx) => (
                          <Card key={idx} className="p-4 bg-background border border-accent/20">
                            <p className="text-sm text-foreground">{meal}</p>
                          </Card>
                        ))}
                      </div>
                    </Card>
                  )}

                {/* DON'Ts Section - Two separate cards at bottom */}
                {assessment.ai_insights.donts &&
                  Array.isArray(assessment.ai_insights.donts) &&
                  assessment.ai_insights.donts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-foreground">Important Precautions</h3>

                      {/* Mild Cautions - Green/Yellow Card */}
                      <Card className="p-6 bg-success/10 border-l-4 border-success">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="w-6 h-6 text-success" />
                          <h4 className="text-xl font-semibold text-success">Things to Be Careful About</h4>
                        </div>
                        <div className="space-y-3">
                          {assessment.ai_insights.donts
                            .slice(0, Math.ceil(assessment.ai_insights.donts.length / 2))
                            .map((item, idx) => (
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
                          {assessment.ai_insights.donts
                            .slice(Math.ceil(assessment.ai_insights.donts.length / 2))
                            .map((item, idx) => (
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

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 10000hearts. All rights reserved.</p>
          <p className="mt-2">
            This assessment is for informational purposes only and does not constitute medical advice. Please consult
            with a healthcare professional for medical concerns.
          </p>
        </div>
      </div>
    </div>
  );
}



