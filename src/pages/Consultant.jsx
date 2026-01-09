import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Phone, Mail, ArrowLeft, CheckCircle2, Stethoscope, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-health.jpg";

const Consultant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get("id");
  const selectedClinicFromState = location.state?.selectedClinic;
  const { user } = useAuth();
  
  const [selectedClinic, setSelectedClinic] = useState(selectedClinicFromState || null);
  const [loadingClinic, setLoadingClinic] = useState(clinicId && !selectedClinicFromState ? true : false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dateInputRef = useRef(null);

  // Reusable function to mask phone number (show only last 4 digits)
  const maskPhoneNumber = (phone) => {
    if (!phone) return null;
    const digits = phone.toString().replace(/\D/g, "");
    if (digits.length <= 4) return phone;
    const lastFour = digits.slice(-4);
    return "X".repeat(digits.length - 4) + lastFour;
  };

  // Extract clinic data using exact column names from database
  const clinicName = selectedClinic?.clinic_name || "";
  const clinicLocation = selectedClinic?.location || "";
  const specialization = selectedClinic?.specilization || "";
  const timingSlots = selectedClinic?.timing_sloats || "";
  const doctorName = selectedClinic?.name || "";
  const clinicEmail = selectedClinic?.email || null;
  const mobileNumber = selectedClinic?.mobile_number || null;
  const alternateMobileNumber = selectedClinic?.alternat_mobile_number || null;
  const city = selectedClinic?.city || null;
  const qualification = selectedClinic?.qualification || null;
  const yearsofexperience = selectedClinic?.yearsofexperience || null;
  const consultantFee = selectedClinic?.consultant_fee || null;
  const partnerType = selectedClinic?.partner_type || null;

  // Generate available time slots from timing slots text
  // Show the same text that's displayed in the "Available Slots" section on the left
  const availableTimeSlots = useMemo(() => {
    if (!timingSlots || !timingSlots.trim()) {
      return [];
    }

    // Split by comma or newline to get individual slot entries
    const slotsText = timingSlots.trim();
    const slotEntries = slotsText.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
    
    // If no commas/newlines, treat the whole text as one option
    if (slotEntries.length === 0) {
      return [{
        value: slotsText,
        label: slotsText
      }];
    }
    
    // Create dropdown options from the slot entries
    const slots = slotEntries.map((entry) => ({
      value: entry,
      label: entry
    }));

    return slots;
  }, [timingSlots]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = "Preferred date is required";
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = "Preferred time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, verify table exists
      const { error: tableCheckError } = await supabase
        .from("Consultant_Submissions")
        .select("id")
        .limit(1);

        if (tableCheckError && (tableCheckError.code === '42P01' || tableCheckError.message?.includes("Could not find the table"))) {
          toast.error(
            "Table 'Consultant_Submissions' does not exist! Open console (F12) to copy SQL code.",
            { duration: 20000 }
          );
          
          setIsSubmitting(false);
          return;
        }

      // Prepare data for Supabase with correct column names
      const consultationData = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone.replace(/\D/g, ""), // Remove non-digits
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        message: formData.message.trim() || null,
        clinic_name: clinicName || null,
        doctor_name: doctorName || null,
        clinic_address: clinicLocation || null,
      };

      // Insert into Supabase (matching pattern from working tables)
      const { error } = await supabase
        .from("Consultant_Submissions")
        .insert([consultationData]);

      if (error) {
        console.error("Supabase error:", error);
        
        // Check if table doesn't exist
        if (error.code === '42P01' || error.message?.includes("Could not find the table") || error.message?.includes("does not exist")) {
          toast.error(
            "Table 'Consultant_Submissions' does not exist. Please create it in Supabase Dashboard > SQL Editor. Check console for SQL.",
            { duration: 10000 }
          );
        } else if (error.code === '42501' || error.message?.includes('policy') || error.message?.includes('permission')) {
          toast.error("Permission denied. Please check RLS policies for the Consultant_Submissions table.");
        } else {
          toast.error(error.message || "Failed to submit consultation request. Please try again.");
        }
        throw error;
      }

      toast.success("Consultation request submitted successfully! We'll contact you soon.");
      
      // Navigate to confirmation page with form data and clinic info
      navigate("/consultation-confirmation", {
        state: {
          formData: { ...formData },
          selectedClinic: selectedClinic
        }
      });
    } catch (error) {
      console.error("Error submitting consultation request:", error);
      toast.error(error.message || "Failed to submit consultation request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };


  // Fetch clinic details based on ID from URL
  useEffect(() => {
    const fetchClinicById = async () => {
      // If clinic ID is provided in URL, fetch from database
      if (clinicId) {
        setLoadingClinic(true);
        try {
          // Use the same query pattern as Clinics.jsx which works
          const { data, error } = await supabase
            .from("partner-with-us")
            .select("*")
            .eq("id", clinicId)
            .eq("partner_type", "Clinic/Doctor")
            .single();

          if (error) {
            console.error("Error fetching clinic:", error);
            throw error;
          }

          if (data) {
            setSelectedClinic(data);
          } else {
            toast.error("Clinic not found");
            navigate("/clinics");
          }
        } catch (error) {
          console.error("Error fetching clinic:", error);
          toast.error("Failed to load clinic details");
          navigate("/clinics");
        } finally {
          setLoadingClinic(false);
        }
      } else if (!selectedClinicFromState) {
        // If no ID and no state, redirect to clinics page
        toast.error("Please select a clinic first");
        navigate("/clinics");
      }
    };

    fetchClinicById();
  }, [clinicId, selectedClinicFromState, navigate]);

  // Set email from logged-in user
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user?.email]);

  if (loadingClinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!selectedClinic) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-health-bg/95 via-background/90 to-health-lightBlue/95"></div>
        <div className="relative z-10 container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/clinics")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clinics
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Clinic Information Card */}
            <div className="md:col-span-1">
              <Card className="p-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-4 text-accent">Clinic Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{clinicName}</h3>
                  </div>

                  {/* Doctor Name - Prominently displayed */}
                  {doctorName && (
                    <div className="flex items-center gap-2 mb-2 pb-3 border-b border-border">
                      <Stethoscope className="h-5 w-5 text-accent" />
                      <div>
                        <p className="text-xl font-bold text-foreground">
                          Dr. {doctorName}
                        </p>
                        {specialization && (
                          <p className="text-sm text-accent font-semibold mt-1">
                            {specialization}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Specialization - Display separately if doctor name is not available */}
                  {!doctorName && specialization && (
                    <div className="flex items-center gap-2 mb-2 pb-3 border-b border-border">
                      <Stethoscope className="h-5 w-5 text-accent" />
                      <p className="text-lg font-semibold text-foreground">
                        Specialization: {specialization}
                      </p>
                    </div>
                  )}

                  {clinicLocation && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">{clinicLocation}</span>
                    </div>
                  )}

                  {city && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium">City:</span> {city}
                      </span>
                    </div>
                  )}

                  {mobileNumber && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">{maskPhoneNumber(mobileNumber)}</span>
                    </div>
                  )}

                  {alternateMobileNumber && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium">Alt Mobile:</span> {maskPhoneNumber(alternateMobileNumber)}
                      </span>
                    </div>
                  )}

                  {clinicEmail && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm break-all">{clinicEmail}</span>
                    </div>
                  )}

                  {qualification && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Qualification:</span> {qualification}
                      </p>
                    </div>
                  )}

                  {yearsofexperience && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Experience:</span> {yearsofexperience} {yearsofexperience === "1" ? "year" : "years"}
                    </div>
                  )}

                  {partnerType && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Partner Type:</span> {partnerType}
                    </div>
                  )}

                  {/* Consultant Availability Table */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-accent" />
                      <h3 className="font-semibold text-sm">Available Slots</h3>
                    </div>
                    {timingSlots ? (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="overflow-x-auto">
                          <p>{timingSlots}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 px-2 font-semibold text-foreground">Day/Time</th>
                                <th className="text-left py-2 px-2 font-semibold text-foreground">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-2 px-2 text-muted-foreground italic" colSpan={2}>
                                  Not available
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="md:col-span-2">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Book Consultation</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <Label htmlFor="name" className="mb-2">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="mb-2">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      className={errors.email ? "border-destructive" : ""}
                      disabled={!!user?.email}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="mb-2">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your 10-digit phone number"
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredDate" className="mb-2">
                        Preferred Date <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          ref={dateInputRef}
                          id="preferredDate"
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                          onClick={(e) => {
                            const input = e.target;
                            // Try showPicker() method (modern browsers)
                            if (typeof input.showPicker === 'function') {
                              input.showPicker();
                            }
                          }}
                          min={new Date().toISOString().split("T")[0]}
                          className={`pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none cursor-pointer ${errors.preferredDate ? "border-destructive" : ""}`}
                          style={{
                            WebkitAppearance: 'none',
                            MozAppearance: 'textfield'
                          }}
                        />
                        <Calendar 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors z-10" 
                          onClick={() => {
                            const input = dateInputRef.current;
                            if (input) {
                              // Try showPicker() method (modern browsers)
                              if (typeof input.showPicker === 'function') {
                                input.showPicker();
                              } else {
                                // Fallback: focus and click the input
                                input.focus();
                                input.click();
                              }
                            }
                          }}
                        />
                      </div>
                      {errors.preferredDate && (
                        <p className="text-sm text-destructive mt-1">{errors.preferredDate}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="preferredTime" className="mb-2">
                        Preferred Time <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.preferredTime || ""}
                        onValueChange={(value) => handleInputChange("preferredTime", value)}
                        disabled={availableTimeSlots.length === 0}
                      >
                        <SelectTrigger className={errors.preferredTime ? "border-destructive" : ""}>
                          <SelectValue placeholder={availableTimeSlots.length > 0 ? "Select available time slot" : "No available slots"} />
                        </SelectTrigger>
                        {availableTimeSlots.length > 0 && (
                            <SelectContent>
                              {availableTimeSlots.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                        )}
                      </Select>
                      {errors.preferredTime && (
                        <p className="text-sm text-destructive mt-1">{errors.preferredTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="mb-2">
                      Additional Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Any specific concerns or questions you'd like to mention..."
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Submit Consultation Request
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultant;

