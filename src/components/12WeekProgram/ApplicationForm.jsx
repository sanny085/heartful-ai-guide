import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

const INITIAL_FORM_DATA = {
  name: "",
  age: "",
  gender: "",
  city: "",
  language: "",
  bpRange: "",
  sugarStatus: "",
  comments: "",
};

const INPUT_CLASSES = "mt-1 md:mt-2 text-sm md:text-base rounded-lg border-2 border-green-200 focus:outline-none bg-white py-2 md:py-2.5";
const SELECT_CLASSES = "mt-1 md:mt-2 w-full px-3 py-2 text-sm md:text-base border-2 border-green-200 rounded-lg focus:outline-none bg-white text-gray-800";
const LABEL_CLASSES = "text-xs md:text-sm lg:text-base font-semibold text-gray-700";

const GENDER_OPTIONS = [
  { value: "", label: "Choose gender..." },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const LANGUAGE_OPTIONS = [
  { value: "", label: "Choose language..." },
  { value: "telugu", label: "Telugu" },
  { value: "hindi", label: "Hindi" },
  { value: "english", label: "English" },
  { value: "other", label: "Other" },
];

const SUGAR_STATUS_OPTIONS = [
  { value: "", label: "Select status" },
  { value: "normal", label: "Normal" },
  { value: "pre-diabetic", label: "Pre-diabetic" },
  { value: "diabetic", label: "Diabetic" },
  { value: "not-checked", label: "Not checked" },
];

// Reusable FormField Component
const FormField = memo(({ field, value, onChange, label, type = "text", required = false, placeholder, options, min, max, rows }) => {
  const handleChange = useCallback((e) => {
    onChange(field, e.target?.value ?? "");
  }, [field, onChange]);

  return (
    <div>
      <Label htmlFor={field} className={LABEL_CLASSES}>
        {label} {required && "*"}
      </Label>
      {type === "select" ? (
        <select
          id={field}
          value={value}
          onChange={handleChange}
          required={required}
          className={SELECT_CLASSES}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <Textarea
          id={field}
          value={value}
          onChange={handleChange}
          className={INPUT_CLASSES}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <Input
          id={field}
          type={type}
          value={value}
          onChange={handleChange}
          required={required}
          className={INPUT_CLASSES}
          placeholder={placeholder}
          min={min}
          max={max}
        />
      )}
    </div>
  );
});

FormField.displayName = "FormField";

// Form Fields Configuration
const FORM_FIELDS = [
  [
    { field: "name", label: "Name", type: "text", required: true, placeholder: "Your name" },
    { field: "age", label: "Age", type: "number", required: true, placeholder: "Your age", min: 18, max: 100 },
    { field: "gender", label: "Gender", type: "select", required: true, options: GENDER_OPTIONS },
  ],
  [
    { field: "city", label: "City", type: "text", required: true, placeholder: "Your city" },
    { field: "language", label: "Language", type: "select", required: true, options: LANGUAGE_OPTIONS },
    { field: "bpRange", label: "BP Range", type: "text", required: false, placeholder: "e.g., 140/90" },
  ],
  [
    { field: "sugarStatus", label: "Sugar Status", type: "select", required: false, options: SUGAR_STATUS_OPTIONS },
    { field: "comments", label: "Comments / current medicine", type: "textarea", required: false, placeholder: "Add any comments or list current medications", rows: 3 },
  ],
];

const ApplicationForm = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Read selected program from URL params
  useEffect(() => {
    const program = searchParams.get("program");
    if (program) {
      setSelectedProgram(decodeURIComponent(program));
    }
  }, [searchParams]);

  // Redirect to home page after 1 second when form is submitted
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, navigate]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);


  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      const { name, age, gender, city, language, bpRange, sugarStatus, comments } = formData;
      
      const insertData = {
        name: name || null,
        age: age ? parseInt(age, 10) : null,
        gender: gender || null,
        city: city || null,
        language: language || null,
        bp_range: bpRange || null,
        sugar_status: sugarStatus || null,
        medicines: comments || null,
        selected_program: selectedProgram || null,
      };

      const { error } = await supabase.from("twelve_week_program").insert(insertData);

      if (error) {
        throw error;
      }

      toast.success("Thank you! Our team will connect with you shortly.", {
        duration: 5000,
      });

      // Scroll to top to show thank you message
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      setIsSubmitted(true);
      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      const errorMessage = error?.message ?? "Please try again.";
      toast.error(`Failed to submit: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedProgram]);

  const successMessage = useMemo(() => (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6 md:p-8 lg:p-12 text-center bg-green-50 border-2 border-green-300 rounded-2xl">
        <CheckCircle2 className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-green-600 mx-auto mb-3 md:mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">Thank You!</h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-600">
          Our team will connect with you shortly.
        </p>
      </Card>
    </div>
  ), []);

  if (isSubmitted) {
    return successMessage;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-2 md:mb-4 lg:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 md:mb-2 text-gray-800 whitespace-nowrap">
          Start Your Transformation
        </h2>
      </div>

      {/* Selected Program Badge - Left side at start of form */}
      {selectedProgram && (
        <Badge className="px-3 py-1 md:px-4 md:py-1.5 bg-green-500 text-white text-xs md:text-sm font-bold rounded-full text-center border-0">
          Join Our Wellness Camp {selectedProgram} ✨
        </Badge>
      )}

      {/* Form Card - Light green like reference */}
      <Card className="p-4 md:p-8 lg:p-10 bg-green-50 border-2 border-green-200 rounded-2xl shadow-lg mt-4">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
          {FORM_FIELDS.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 gap-3 md:gap-4">
              {row.map((fieldConfig) => {
                const { field, label, type, required, placeholder, options, min, max, rows } = fieldConfig ?? {};
                return (
                <FormField
                  key={field}
                  field={field}
                  value={formData[field]}
                  onChange={handleChange}
                  label={label}
                  type={type}
                  required={required}
                  placeholder={placeholder}
                  options={options}
                  min={min}
                  max={max}
                  rows={rows}
                />
                );
              })}
            </div>
          ))}

          {/* Submit Button */}
          <div className="pt-2 md:pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 md:py-4 lg:py-6 text-sm md:text-base lg:text-lg font-bold rounded-lg shadow-lg"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
            <p className="text-center text-xs md:text-sm text-gray-600 mt-2 md:mt-4">
              Takes only 1 minutes
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
});

ApplicationForm.displayName = "ApplicationForm";

export default ApplicationForm;
