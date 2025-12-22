import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Plus, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState , useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-health.jpg";
import logo from "@/assets/logo.png";
import LocationMapDialog from "@/components/LocationMapDialog";

// Reusable Doctor Fields Component
const DoctorFields = ({ formData, errors, onInputChange }) => {
  const handleQualificationChange = (e) => {
    onInputChange("qualification", e.target.value);
  };

  const handleYearsOfExperienceChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    onInputChange("years_of_experience", numericValue);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <div className="space-y-2">
        <Label htmlFor="qualification">
          Qualification <span className="text-destructive">*</span>
        </Label>
        <Input
          id="qualification"
          type="text"
          value={formData.qualification || ""}
          onChange={handleQualificationChange}
          placeholder="Enter qualification (e.g., MBBS, MD, MS)"
          maxLength={100}
          className={`placeholder:text-xs md:placeholder:text-sm ${errors.qualification ? "border-destructive" : "border-input"}`}
        />
        {errors.qualification && <p className="text-sm text-destructive">{errors.qualification}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="years_of_experience">
          Years of Experience <span className="text-destructive">*</span>
        </Label>
        <Input
          id="years_of_experience"
          type="text"
          value={formData.years_of_experience || ""}
          onChange={handleYearsOfExperienceChange}
          placeholder="Enter years of experience"
          maxLength={3}
          className={`placeholder:text-xs md:placeholder:text-sm ${errors.years_of_experience ? "border-destructive" : "border-input"}`}
        />
        {errors.years_of_experience && <p className="text-sm text-destructive">{errors.years_of_experience}</p>}
      </div>
    </div>
  );
};

// Country codes for mobile number
const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+971", country: "UAE" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+66", country: "Thailand" },
  { code: "+84", country: "Vietnam" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+977", country: "Nepal" },
  { code: "+27", country: "South Africa" },
  { code: "+234", country: "Nigeria" },
  { code: "+20", country: "Egypt" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+52", country: "Mexico" },
  { code: "+54", country: "Argentina" },
  { code: "+90", country: "Turkey" },
];

// Form fields configuration
const formFieldsConfig = [
  {
    id: "contact_name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
    required: true,
    gridCol: "md:col-span-1",
    validation: (value) => {
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Full name must be at least 2 characters";
      if (value.trim().length > 100) return "Full name must be less than 100 characters";
      // Validate name contains only letters, spaces, hyphens, and apostrophes
      if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
        return "Full name can only contain letters, spaces, hyphens, and apostrophes";
      }
      return null;
    },
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
    required: true,
    gridCol: "md:col-span-1",
    validation: (value) => {
      if (!value.trim()) return "Email is required";
      if (value.trim().length > 255) return "Email must be less than 255 characters";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return "Please enter a valid email address";
      }
      return null;
    },
  },
  {
    id: "mobile",
    label: "Mobile Number",
    type: "tel",
    placeholder: "Enter 10-digit mobile number",
    required: true,
    gridCol: "md:col-span-1",
    maxLength: 10,
    numericOnly: true,
    showCountryCode: true,
    validation: (value) => {
      if (!value.trim()) return "Mobile number is required";
      if (!/^[6-9]\d{9}$/.test(value.trim())) {
        return "Please enter a valid 10-digit mobile number";
      }
      return null;
    },
  },
  {
    id: "alternative_mobile",
    label: "Alternative Mobile Number",
    type: "tel",
    placeholder: "Enter alternative 10-digit mobile number",
    required: false,
    gridCol: "md:col-span-1",
    maxLength: 10,
    numericOnly: true,
    showCountryCode: true,
    validation: (value) => {
      // Optional field - only validate if value is provided
      if (!value || !value.trim()) {
        return null; // Not required, so no error if empty
      }
      if (!/^[6-9]\d{9}$/.test(value.trim())) {
        return "Please enter a valid 10-digit mobile number";
      }
      return null;
    },
  },
  {
    id: "timing_slots",
    label: "Availability Slots",
    type: "textarea",
    placeholder: "e.g., Monday-Friday: 9:00 AM - 6:00 PM, Saturday: 9:00 AM - 2:00 PM",
    required: false,
    gridCol: "md:col-span-2",
    rows: 4,
    validation: (value) => {
      // Optional field - only validate if value is provided
      if (!value || !value.trim()) {
        return null; // Not required, so no error if empty
      }
      if (value.trim().length < 5) {
        return "Availability slots must be at least 5 characters";
      }
      if (value.trim().length > 500) {
        return "Availability slots must be less than 500 characters";
      }
      return null;
    },
  },
  {
    id: "partnership_type",
    label: "Category",
    type: "select",
    required: true,
    gridCol: "md:col-span-1",
    options: [
      { value: "", label: "Select category" },
      { value: "Hospital", label: "Hospital" },
      { value: "Clinic/Doctor", label: "Clinic/Doctor" },
      { value: "Diagnostic Center", label: "Diagnostic Center" },
    ],
    validation: (value) => {
      if (!value) return "Category is required";
      return null;
    },
  },
  {
    id: "organization_type",
    label: "Hospital/Clinic/Diagnostic Name",
    type: "text",
    placeholder: "e.g., ABC Clinic, Dr. XYZ Practice, XYZ Diagnostic Labs",
    required: true,
    gridCol: "md:col-span-1",
    validation: (value) => {
      if (!value || !value.trim()) return "Hospital/Clinic/Diagnostic Name is required";
      if (value.trim().length < 2) return "Hospital/Clinic/Diagnostic Name must be at least 2 characters";
      if (value.trim().length > 200) return "Hospital/Clinic/Diagnostic Name must be less than 200 characters";
      return null;
    },
  },
  {
    id: "specialization",
    label: "Specialization",
    type: "select",
    required: false, // Only required when Hospital or Clinic/Doctor is selected (handled in validateForm)
    gridCol: "md:col-span-1",
    options: [
      { value: "", label: "Select specialization" },
      { value: "Cardiology", label: "Cardiology" },
      { value: "Dermatology", label: "Dermatology" },
      { value: "Endocrinology", label: "Endocrinology" },
      { value: "Gastroenterology", label: "Gastroenterology" },
      { value: "General Medicine", label: "General Medicine" },
      { value: "General Surgery", label: "General Surgery" },
      { value: "Gynecology", label: "Gynecology" },
      { value: "Hematology", label: "Hematology" },
      { value: "Internal Medicine", label: "Internal Medicine" },
      { value: "Nephrology", label: "Nephrology" },
      { value: "Neurology", label: "Neurology" },
      { value: "Oncology", label: "Oncology" },
      { value: "Orthopedics", label: "Orthopedics" },
      { value: "Pediatrics", label: "Pediatrics" },
      { value: "Psychiatry", label: "Psychiatry" },
      { value: "Pulmonology", label: "Pulmonology" },
      { value: "Radiology", label: "Radiology" },
      { value: "Urology", label: "Urology" },
      { value: "Anesthesiology", label: "Anesthesiology" },
      { value: "Pathology", label: "Pathology" },
      { value: "Ophthalmology", label: "Ophthalmology" },
      { value: "ENT (Ear, Nose, Throat)", label: "ENT (Ear, Nose, Throat)" },
      { value: "Rheumatology", label: "Rheumatology" },
      { value: "Emergency Medicine", label: "Emergency Medicine" },
      { value: "Family Medicine", label: "Family Medicine" },
      { value: "Physical Medicine and Rehabilitation", label: "Physical Medicine and Rehabilitation" },
      { value: "Other", label: "Other" },
    ],
    validation: (value) => {
      // Validation is handled in validateForm based on partnership_type
      return null;
    },
  },
  {
    id: "location",
    label: "Hospital/Clinic/Diagnostic center",
    type: "text",
    placeholder: "Enter hospital/clinic/diagnostic center location",
    required: true,
    gridCol: "md:col-span-1",
    showMapButton: true,
    validation: (value) => {
      if (!value || !value.trim()) return "hospital/clinic/diagnostic center location is required";
      if (value.trim().length < 3) return "Location must be at least 3 characters";
      if (value.trim().length > 200) return "Location must be less than 200 characters";
      return null;
    },
  },
  {
    id: "city",
    label: "City",
    type: "text",
    placeholder: "Enter city",
    required: true,
    gridCol: "md:col-span-1",
    validation: (value) => {
      if (!value || !value.trim()) return "City is required";
      if (value.trim().length < 2) return "City must be at least 2 characters";
      if (value.trim().length > 100) return "City must be less than 100 characters";
      // Validate city contains only letters, spaces, and hyphens
      if (!/^[a-zA-Z\s-]+$/.test(value.trim())) {
        return "City can only contain letters, spaces, and hyphens";
      }
      return null;
    },
  },
  {
    id: "consultant_fee",
    label: "Consultant Fee",
    type: "text",
    placeholder: "Enter consultant fee",
    required: false,
    gridCol: "md:col-span-1",
    numericOnly: true,
    allowDecimal: true,
    validation: (value) => {
      // Optional field - only validate if value is provided
      if (!value || !value.trim()) {
        return null; // Not required, so no error if empty
      }
      // Validate that it's a number
      if (!/^\d+(\.\d+)?$/.test(value.trim())) {
        return "Please enter a valid number";
      }
      // Validate that it's a positive number
      const num = parseFloat(value.trim());
      if (isNaN(num) || num < 0) {
        return "Please enter a valid positive number";
      }
      return null;
    },
  },
  {
    id: "logo",
    label: "Hospital/Clinic Logo",
    type: "file",
    placeholder: "Upload your hospital/clinic logo",
    required: false,
    gridCol: "md:col-span-1",
    accept: "image/*",
    validation: (value) => {
      // Optional field - only validate if value is provided
      if (!value || !(value instanceof File)) {
        return null; // Not required, so no error if empty
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(value.type)) {
        return "Please upload a valid image file (JPG, PNG, GIF, or WEBP)";
      }
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (value.size > maxSize) {
        return "File size must be less than 5MB";
      }
      return null;
    },
  },
  {
    id: "doctor_profile_pic",
    label: "Upload Profile Pic",
    type: "file",
    placeholder: "Upload doctor profile picture",
    required: false,
    gridCol: "md:col-span-1",
    accept: "image/*",
    validation: (value) => {
      // Optional field - only validate if value is provided
      if (!value || !(value instanceof File)) {
        return null; // Not required, so no error if empty
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(value.type)) {
        return "Please upload a valid image file (JPG, PNG, GIF, or WEBP)";
      }
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (value.size > maxSize) {
        return "File size must be less than 5MB";
      }
      return null;
    },
  },
  {
    id: "certificate",
    label: "Upload Document",
    type: "file",
    placeholder: "Upload document (PDF or Image)",
    required: false,
    gridCol: "md:col-span-1",
    accept: "application/pdf,image/*",
    validation: (value) => {
      // Optional field - only validate if value is provided
      if (!value || !(value instanceof File)) {
        return null; // Not required, so no error if empty
      }
      // Validate file type - PDF or images
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(value.type)) {
        return "Please upload a valid PDF or image file (JPG, PNG, GIF, or WEBP) for document";
      }
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (value.size > maxSize) {
        return "document file size must be less than 10MB";
      }
      return null;
    },
  },
  {
    id: "message",
    label: "Description",
    type: "textarea",
    placeholder:
      "Tell us about your clinic/ practice/ diagnostic center and how we can collaborate to improve patient care...",
    required: false,
    gridCol: "md:col-span-2",
    rows: 6,
    validation: (value) => {
      // Optional field - only validate if value is provided
      if (!value || !value.trim()) {
        return null; // Not required, so no error if empty
      }
      // Validate minimum length if provided
      if (value.trim().length < 10) {
        return "Description must be at least 10 characters";
      }
      // Validate maximum length
      if (value.trim().length > 1000) {
        return "Description must be less than 1000 characters";
      }
      return null;
    },
  },
];

const PartnerWithUs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Initialize formData from config
  const initialFormData = formFieldsConfig.reduce((acc, field) => {
    acc[field.id] = field.type === "file" ? null : "";
    return acc;
  }, {});

  const [formData, setFormData] = useState({
    ...initialFormData,
    qualification: "",
    years_of_experience: "",
    country_code: "+91", // Default to India
  });
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [doctorProfilePicPreview, setDoctorProfilePicPreview] = useState(null);
  const [certificateFileName, setCertificateFileName] = useState(null);
  const [errors, setErrors] = useState({});
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Reusable file upload function
  const uploadFileToSupabase = useCallback(async (file, bucketName, filePrefix) => {
    if (!file || !(file instanceof File)) {
      return { url: null, error: null };
    }

        try {
          // Sanitize filename and create unique path
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${filePrefix}-${Date.now()}-${sanitizedName}`;
          
          const { data: uploadData = null, error: uploadError = null } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
        console.error(`${filePrefix} upload error:`, uploadError);
        // If bucket doesn't exist, skip upload silently
        if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("not found")) {
          console.warn(`${filePrefix} bucket not found - skipping upload. Please create the bucket in Supabase storage.`);
          return { url: null, error: null };
        }
            const errorMessage = uploadError?.message?.includes("row-level security policy")
          ? `Storage policy issue. ${filePrefix} upload skipped but form will be submitted.`
          : `${filePrefix} upload failed: ${uploadError.message ?? "Unknown error"}. Form will be submitted without ${filePrefix}.`;
            toast.warning(errorMessage, { duration: 5000 });
        return { url: null, error: uploadError };
          } else if (!uploadData) {
        console.error(`${filePrefix} upload: No data returned`);
        toast.warning(`${filePrefix} upload incomplete. Form will be submitted without ${filePrefix}.`, { duration: 5000 });
        return { url: null, error: null };
          } else {
            // Get public URL for the uploaded file
            const { data: urlData = null } = supabase.storage
          .from(bucketName)
              .getPublicUrl(fileName);
        let fileUrl = urlData?.publicUrl ?? null;
        
        // If getPublicUrl fails, construct URL manually as fallback (for certificate)
        if (!fileUrl && filePrefix === "certificate") {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const filePath = uploadData?.path || fileName;
          fileUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
          console.log("Certificate URL constructed manually:", fileUrl);
        }
        
        if (!fileUrl) {
          console.error(`${filePrefix} upload: Failed to generate public URL`);
          toast.warning(`${filePrefix} uploaded but URL generation failed. Form will be submitted without ${filePrefix}.`, { duration: 5000 });
          return { url: null, error: null };
            } else {
          toast.success(`${filePrefix === "logo" ? "Logo" : filePrefix === "profile" ? "Profile picture" : "Certificate"} uploaded successfully`, { duration: 3000 });
          return { url: fileUrl, error: null };
        }
      }
    } catch (error) {
      console.error(`${filePrefix} upload exception:`, error);
      // Skip toast for bucket not found errors
      if (!error.message?.includes("Bucket not found") && !error.message?.includes("not found")) {
        toast.warning(`${filePrefix} upload error: ${error.message}. Form will be submitted without ${filePrefix}.`, { duration: 5000 });
      }
      return { url: null, error };
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    formFieldsConfig.forEach((field) => {
      const value = formData[field.id];
      const error = field.validation(value);
      if (error) {
        newErrors[field.id] = error;
      }
    });
    
    // Validate country code
    if (!formData.country_code || !formData.country_code.trim()) {
      newErrors.country_code = "Country code is required";
    }
    
    // Validate specialization (required for Hospital and Clinic/Doctor)
    if (formData.partnership_type === "Hospital" || formData.partnership_type === "Clinic/Doctor") {
      if (!formData.specialization || formData.specialization === "" || !formData.specialization.trim()) {
        newErrors.specialization = "specialization is required";
      }
      
      // Validate custom specialization if "Other" is selected (only for Hospital and Clinic/Doctor)
      if (formData.specialization === "Other" && !customSpecialization.trim()) {
        newErrors.customSpecialization = "Please enter your specialization";
      } else if (formData.specialization === "Other" && customSpecialization.trim().length < 2) {
        newErrors.customSpecialization = "specialization must be at least 2 characters";
      } else if (formData.specialization === "Other" && customSpecialization.trim().length > 100) {
        newErrors.customSpecialization = "specialization must be less than 100 characters";
      }
    }
    
    // Validate qualification and years of experience (always required, visible by default)
    if (!formData.qualification?.trim()) {
      newErrors.qualification = "Qualification is required";
    } else if (formData.qualification.trim().length < 2) {
      newErrors.qualification = "Qualification must be at least 2 characters";
    } else if (formData.qualification.trim().length > 100) {
      newErrors.qualification = "Qualification must be less than 100 characters";
    }
    if (!formData.years_of_experience?.trim()) {
      newErrors.years_of_experience = "Years of experience is required";
    } else if (!/^\d+$/.test(formData.years_of_experience.trim())) {
      newErrors.years_of_experience = "Please enter a valid number";
    } else {
      const years = parseInt(formData.years_of_experience.trim(), 10);
      if (years < 0) {
        newErrors.years_of_experience = "Years of experience cannot be negative";
      } else if (years > 100) {
        newErrors.years_of_experience = "Please enter a valid years of experience";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let logoUrl = null;
      let doctorProfilePicUrl = null;
      let certificateUrl = null;
      const logoBucketName = "partnership_logo_images"; // Bucket for hospital/clinic logo
      const profilePicBucketName = "logo"; // Bucket for doctor profile pic
      const certificateBucketName = "certificate"; // Bucket for certificate (as per Supabase storage)

      // Upload files to Supabase storage using reusable function
      const logoResult = await uploadFileToSupabase(formData.logo, logoBucketName, "logo");
      logoUrl = logoResult.url;

      const profilePicResult = await uploadFileToSupabase(formData.doctor_profile_pic, profilePicBucketName, "profile");
      doctorProfilePicUrl = profilePicResult.url;

      const certificateResult = await uploadFileToSupabase(formData.certificate, certificateBucketName, "certificate");
      certificateUrl = certificateResult.url;

      // Prepare data for insertion - using exact column names from Supabase table
      const submissionData = {};
      
      // Map form fields to Supabase column names (exact match)
      if (formData.contact_name?.trim()) {
        submissionData["Name"] = formData.contact_name.trim();
      }
      if (formData.email?.trim()) {
        submissionData["Email"] = formData.email.trim();
      }
      if (formData.mobile?.trim()) {
        // Submit only the mobile number (numeric) without country code
        submissionData["Mobile Number"] = formData.mobile.trim();
      }
      if (formData.alternative_mobile?.trim()) {
        // Submit only the alternative mobile number (numeric) without country code
        submissionData["alternat_mobile_number"] = formData.alternative_mobile.trim();
      }
      if (formData.timing_slots?.trim()) {
        submissionData["timing_sloats"] = formData.timing_slots.trim();
      }
      if (formData.partnership_type) {
        submissionData["Partnership Type"] = formData.partnership_type;
      }
      if (formData.organization_type?.trim()) {
        submissionData["Organization/Clinic Name"] = formData.organization_type.trim();
      }
      if (formData.location?.trim()) {
        submissionData["clinic/location"] = formData.location.trim();
      }
      if (formData.city?.trim()) {
        submissionData["city"] = formData.city.trim();
      }
      // Save specialization if Hospital or Clinic/Doctor is selected
      if ((formData.partnership_type === "Hospital" || formData.partnership_type === "Clinic/Doctor") && formData.specialization?.trim()) {
        submissionData["specilization"] = formData.specialization.trim();
      }
      
      // Save qualification and years of experience (always saved, visible by default)
      if (formData.qualification?.trim()) {
        submissionData["qualification"] = formData.qualification.trim();
      }
      if (formData.years_of_experience?.trim()) {
        submissionData["yearsofexperience"] = formData.years_of_experience.trim();
      }
      if (formData.consultant_fee?.trim()) {
        submissionData["consultant_fee"] = formData.consultant_fee.trim();
      }
      if (formData.message?.trim()) {
        submissionData["Message"] = formData.message.trim();
      }
      
      // Add file URLs to correct columns
      // Hospital/Clinic Logo -> partnership_logo_images_url
      if (logoUrl) {
        submissionData["partnership_logo_images_url"] = logoUrl;
      }
      
      // Upload Profile Pic -> logo_url
      if (doctorProfilePicUrl) {
        submissionData["logo_url"] = doctorProfilePicUrl;
      }
      const tableName = "partner-with-us";
      
      // Try to insert with all fields first
      let { data, error } = await supabase.from(tableName).insert([submissionData]);

      // Retry logic: If column not found errors or type mismatch errors occur, remove those fields and retry
      if (error && error.message) {
        const submissionDataRetry = { ...submissionData };
       
        let retryNeeded = false;
        
        // Check for timing_sloats column type error (numeric type but receiving text)
        // This error occurs when trying to insert text into a numeric column
        // Error format: "invalid input syntax for type numeric: "10:00Am , 11:00Am...""
        // Only remove timing_sloats if the error message specifically mentions it or contains the timing value
        if (error.message.includes("invalid input syntax for type numeric")) {
          // Check if the error is specifically related to timing_sloats
          // The error message usually contains the problematic value
          const hasTimingSloatsValue = submissionDataRetry["timing_sloats"] && 
            error.message.includes(submissionDataRetry["timing_sloats"].substring(0, 10));
          
          if (submissionDataRetry["timing_sloats"] && (error.message.includes("timing_sloats") || hasTimingSloatsValue)) {
            console.warn("timing_sloats column type mismatch (numeric but receiving text), retrying without timing_sloats field");
            delete submissionDataRetry["timing_sloats"];
            retryNeeded = true;
          }
        }
        
        // Handle "Could not find" errors
        if (error.message.includes("Could not find")) {
            // Check for specilization column error
          if (error.message.includes("specilization") || error.message.includes("specialization")) {
            delete submissionDataRetry["specilization"];
            retryNeeded = true;
          }

          // Check for logo_url column error
          if (error.message.includes("logo_url")) {
            delete submissionDataRetry["logo_url"];
            retryNeeded = true;
          }

          // Check for partnership_logo_images_url column error
          if (error.message.includes("partnership_logo_images_url")) {
            console.warn("partnership_logo_images_url column not found, retrying without partnership_logo_images_url field");
            delete submissionDataRetry["partnership_logo_images_url"];
            retryNeeded = true;
          }

          // Check for alternat_mobile_number column error
          if (error.message.includes("alternat_mobile_number") || error.message.includes("Alternative Mobile Number")) {
            console.warn("alternat_mobile_number column not found, retrying without alternat_mobile_number field");
            delete submissionDataRetry["alternat_mobile_number"];
            retryNeeded = true;
          }

          // Check for timing_sloats column error (if not already handled above)
          if (!retryNeeded && (error.message.includes("timing_sloats") || error.message.includes("Availability Slots") || error.message.includes("Timing Slots"))) {
            delete submissionDataRetry["timing_sloats"];
            retryNeeded = true;
          }
        }

        // Retry insert if we removed any fields
        if (retryNeeded) {
          const retryResult = await supabase.from(tableName).insert([submissionDataRetry]);
          data = retryResult.data;
          error = retryResult.error;
        }
      }

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      toast.success("Thank you for your partnership interest! Our team will contact you soon.", {
        duration: 5000,
      });

      setFormData({
        ...initialFormData,
        qualification: "",
        years_of_experience: "",
        country_code: "+91", // Reset to India
      });
      setCustomSpecialization("");
      setLogoPreview(null);
      setDoctorProfilePicPreview(null);
      setCertificateFileName(null);

      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error submitting partnership form:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      if (error.message) {
        toast.error(`Failed to submit: ${error.message}`);
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (prev[fieldId]) {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Handle location selection from map dialog
  const handleLocationSelect = (location) => {
    handleInputChange("location", location);
  };

  // Reusable function to create file preview
  const createFilePreview = useCallback((file, fieldId) => {
    if (fieldId === "certificate") {
      // For certificate, check if it's an image or PDF
      if (file.type.startsWith("image/")) {
        // Create preview for images
        const reader = new FileReader();
        reader.onloadend = () => {
          setCertificateFileName(reader.result); // Store image preview
        };
        reader.readAsDataURL(file);
      } else {
        // For PDF, just store the filename
        setCertificateFileName(file.name);
      }
    } else {
      // Create preview for logo and doctor profile pic
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fieldId === "logo") {
          setLogoPreview(reader.result);
        } else if (fieldId === "doctor_profile_pic") {
          setDoctorProfilePicPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Reusable function to clear file preview
  const clearFilePreview = useCallback((fieldId) => {
      if (fieldId === "logo") {
        setLogoPreview(null);
      } else if (fieldId === "doctor_profile_pic") {
        setDoctorProfilePicPreview(null);
    } else if (fieldId === "certificate") {
      setCertificateFileName(null);
    }
  }, []);

  const handleFileChange = useCallback((fieldId, file) => {
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldId]: file }));
      createFilePreview(file, fieldId);
    } else {
      setFormData((prev) => ({ ...prev, [fieldId]: null }));
      clearFilePreview(fieldId);
    }
    setErrors((prev) => {
      if (prev[fieldId]) {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      }
      return prev;
    });
  }, [createFilePreview, clearFilePreview]);

  const renderField = (field) => {
    const { id, label, type, placeholder, required, options, maxLength, rows, gridCol, accept } = field;
    const value = formData[id];
    const error = errors[id];

    return (
      <div key={id} className={`space-y-2 ${gridCol || ""}`}>
        <Label htmlFor={id}>
          {label} {(required || (id === "specialization" && (formData.partnership_type === "Hospital" || formData.partnership_type === "Clinic/Doctor"))) && <span className="text-destructive">*</span>}
        </Label>

        {type === "file" ? (
          <div>
            <div className="relative">
              <label
                htmlFor={id}
                className="flex items-center justify-center w-full h-[144px] rounded-lg border-2 border-dashed border-border hover:border-accent cursor-pointer transition-colors bg-muted/30 hover:bg-muted/50"
              >
                {id === "certificate" && (certificateFileName || value) ? (
                  // Show image preview if it's an image, otherwise show PDF icon
                  typeof certificateFileName === "string" && certificateFileName.startsWith("data:image") ? (
                    <img
                      src={certificateFileName}
                      alt="Document preview"
                      className="w-full h-full object-contain p-2 rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-4 w-full">
                      <div className="w-16 h-16 rounded-lg bg-white/90 flex items-center justify-center mx-auto mb-2 border border-border/50 shadow-sm">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium break-all px-2">
                        {typeof certificateFileName === "string" ? certificateFileName : (value instanceof File ? value.name : "Document uploaded")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PDF file</p>
                    </div>
                  )
                ) : (id === "logo" && (logoPreview || value)) || (id === "doctor_profile_pic" && (doctorProfilePicPreview || value)) ? (
                  <img
                    src={
                      id === "logo" 
                        ? (logoPreview || (typeof value === "string" ? value : URL.createObjectURL(value)))
                        : (doctorProfilePicPreview || (typeof value === "string" ? value : URL.createObjectURL(value)))
                    }
                    alt={id === "logo" ? "Logo preview" : "Profile pic preview"}
                    className="w-full h-full object-contain p-2 rounded-lg"
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="w-16 h-16 rounded-lg bg-white/90 flex items-center justify-center mx-auto mb-2 border border-border/50 shadow-sm">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Click to upload</p>
                  </div>
                )}
              </label>
              <input
                id={id}
                type="file"
                accept={accept || "image/*"}
                onChange={(e) => handleFileChange(id, e.target.files?.[0] || null)}
                className="hidden"
              />
              {value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileChange(id, null);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/90 hover:bg-background border border-border/50 text-foreground/70 hover:text-foreground flex items-center justify-center transition-colors shadow-md z-10 backdrop-blur-sm"
                  aria-label={id === "certificate" ? "Remove document" : "Remove image"}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {placeholder || (id === "logo" ? "Upload your hospital/clinic logo (JPG, PNG, max 5MB)" : id === "doctor_profile_pic" ? "Upload doctor profile picture (JPG, PNG, max 5MB)" : "Upload document (PDF or Image, max 10MB)")}
            </p>
          </div>
        ) : type === "select" ? (
          <div className="space-y-2">
            <Select
              value={value || undefined}
              onValueChange={(selectedValue) => {
                handleInputChange(id, selectedValue);
                // Clear custom specialization if not "Other"
                if (id === "specialization" && selectedValue !== "Other") {
                  setCustomSpecialization("");
                }
                // Clear specialization if category changes away from Hospital/Clinic/Doctor
                // Qualification and years of experience are shown for all partnership types, so don't clear them
                if (id === "partnership_type" && selectedValue !== "Hospital" && selectedValue !== "Clinic/Doctor") {
                  // Only clear specialization-related fields when switching to Diagnostic Center
                  if (formData.specialization === "Other") {
                    setCustomSpecialization("");
                  }
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.specialization;
                    delete newErrors.customSpecialization;
                    return newErrors;
                  });
                }
              }}
            >
              <SelectTrigger className={`text-xs md:text-sm ${error ? "border-destructive" : "border-input"}`}>
                <SelectValue placeholder={options.find(opt => opt.value === "")?.label || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {options
                  .filter((option) => option.value !== "")
                  .map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                    >
                {option.label}
                    </SelectItem>
                  ))}
                {/* Show custom value as option if it's set and not "Other" */}
                {id === "specialization" && value && value !== "Other" && !options.find(opt => opt.value === value) && (
                  <SelectItem value={value}>{value}</SelectItem>
                )}
              </SelectContent>
            </Select>
            {id === "specialization" && value === "Other" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={customSpecialization}
                    onChange={(e) => setCustomSpecialization(e.target.value)}
                    placeholder="Enter your specialization"
                    maxLength={100}
                    className={`flex-1 placeholder:text-xs md:placeholder:text-sm ${
                      errors.customSpecialization || error ? "border-destructive" : "border-input"
                    }`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customSpecialization.trim()) {
                      e.preventDefault();
                      const customValue = customSpecialization.trim();
                      // Update the main field with custom value
                      handleInputChange(id, customValue);
                      // Clear the custom input field immediately
                      setCustomSpecialization("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (customSpecialization.trim()) {
                      const customValue = customSpecialization.trim();
                      // Update the main specialization field with the custom value
                      handleInputChange(id, customValue);
                      // Clear the custom input field immediately
                      setCustomSpecialization("");
                    }
                  }}
                  className="whitespace-nowrap text-xs"
                  disabled={!customSpecialization.trim()}
                >
                  Update
                </Button>
                </div>
                {errors.customSpecialization && (
                  <p className="text-sm text-destructive">{errors.customSpecialization}</p>
                )}
              </div>
            )}
          </div>
        ) : type === "textarea" ? (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => handleInputChange(id, e.target.value)}
            placeholder={placeholder}
            rows={rows || 6}
            className={`resize-none placeholder:text-xs md:placeholder:text-sm h-[144px] ${error ? "border-destructive" : "border-input"}`}
          />
        ) : (
          (() => {
            const { numericOnly, allowDecimal, showCountryCode, showMapButton } = field;
            
            const handleInputValueChange = (e) => {
              let inputValue = e.target.value;
              
              // Handle numeric-only input if configured
              if (numericOnly) {
                if (allowDecimal) {
                  // Allow numbers and one decimal point
                  inputValue = inputValue.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
                } else {
                  // Allow only integers
                  inputValue = inputValue.replace(/\D/g, '');
                }
              }
              
              handleInputChange(id, inputValue);
            };

            const inputClassName = `placeholder:text-xs md:placeholder:text-sm ${error ? "border-destructive" : "border-input"}`;
            
            // Input with country code selector
            if (showCountryCode) {
              return (
                <div className="flex gap-2">
                  <Select
                    value={formData.country_code || "+91"}
                    onValueChange={(value) => handleInputChange("country_code", value)}
                  >
                    <SelectTrigger className={`w-[70px] flex-shrink-0 text-xs md:text-sm ${error ? "border-destructive" : "border-input"}`}>
                      <SelectValue placeholder="+91" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map(({ code }) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={handleInputValueChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`flex-1 ${inputClassName}`}
                  />
                </div>
              );
            }

            // Input with map button
            if (showMapButton) {
              return (
                <div className="flex gap-2">
                  <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={handleInputValueChange}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`flex-1 ${inputClassName}`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsMapOpen(true)}
              className="flex-shrink-0"
              title="Select location on map"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
              );
            }

            // Standard input - using Input component dynamically
            return (
          <Input
            id={id}
            type={type}
            value={value}
                onChange={handleInputValueChange}
            placeholder={placeholder}
            maxLength={maxLength}
                className={inputClassName}
          />
            );
          })()
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  };

  // Group fields by rows (2 columns per row, except textarea which spans full width)
  const groupFieldsIntoRows = () => {
    const rows = [];
    let currentRow = [];
    let skipCount = 0;

    formFieldsConfig.forEach((field, index) => {
      if (skipCount > 0) {
        skipCount--;
        return;
      }

      const nextField = formFieldsConfig[index + 1];
      const nextNextField = formFieldsConfig[index + 2];

      // Special case: Logo, doctor_profile_pic, and certificate fields - show all three in one row
      if (field.id === "logo" && nextField?.id === "doctor_profile_pic" && nextNextField?.id === "certificate") {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        rows.push([field, nextField, nextNextField, { specialLayout: "three-files" }]);
        skipCount = 2; // Skip the next two fields (doctor_profile_pic and certificate)
        return;
      }

      if (field.gridCol === "md:col-span-2") {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        rows.push([field]);
      } else {
        currentRow.push(field);
        if (currentRow.length === 2) {
          rows.push(currentRow);
          currentRow = [];
        }
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  return (
    <div className="min-h-screen">
      {/* Background Image Section - From top to above form */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Overlay for better readability and beautiful effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-health-bg/90 via-background/85 to-health-lightBlue/90"></div>
        
        <div className="relative z-10">
          {/* Header Section */}
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
                Partner With <span className="text-accent">10000hearts</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                We partner exclusively with clinics, doctors, and diagnostic centers to deliver AI-powered
                healthcare solutions and improve patient outcomes across India.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Form Section - Regular background */}
      <div className="bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Partnership Form */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {groupFieldsIntoRows().map((row, rowIndex) => {
              // Check if this is the special three-files layout
              const hasThreeFilesLayout = row.some(item => item.specialLayout === "three-files");
              const actualFields = row.filter(field => !field.specialLayout);

              // Check if this row contains partnership_type field to add doctor fields conditionally
              const hasPartnershipType = actualFields.some(field => field.id === "partnership_type");

              if (hasThreeFilesLayout) {
                // Special layout: logo, profile pic, and certificate in one row
                return (
                  <div key={rowIndex}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {actualFields.map((field) => renderField(field))}
                    </div>
                    {/* Show qualification and years of experience fields by default (always visible) */}
                    {hasPartnershipType && (
                      <DoctorFields 
                        formData={formData} 
                        errors={errors} 
                        onInputChange={handleInputChange} 
                      />
                    )}
                  </div>
                );
              }

              // Regular grid layout
              return (
                <div key={rowIndex}>
                  <div className="grid md:grid-cols-2 gap-6">
                  {actualFields.map((field) => renderField(field))}
                  </div>
                  {/* Show qualification and years of experience fields by default (always visible) */}
                  {hasPartnershipType && (
                    <DoctorFields 
                      formData={formData} 
                      errors={errors} 
                      onInputChange={handleInputChange} 
                    />
                  )}
                </div>
              );
            })}

            <div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-accent/5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                By submitting this form, you agree to be contacted by 10000hearts team regarding
                partnership opportunities with clinics, doctors, and diagnostic centers. We respect your privacy and will use your information
                only for partnership-related communications.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {loading ? "Submitting..." : "Submit Partnership Inquiry"}
            </Button>
          </form>
        </Card>
        </div>
      </div>

      {/* Location Map Dialog Component */}
      <LocationMapDialog
        isOpen={isMapOpen}
        onOpenChange={setIsMapOpen}
        onLocationSelect={handleLocationSelect}
        initialLocation={formData.location}
      />
    </div>
  );
};

export default PartnerWithUs;