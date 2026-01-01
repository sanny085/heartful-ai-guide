import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  Sparkles,
  Heart,
  Star,
  GraduationCap,
  Award,
  Stethoscope,
  BadgeCheck
} from "lucide-react";
import { useEffect, useState } from "react";

const ConsultationConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, selectedClinic } = location.state || {};
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  // Get clinic information
  const getClinicName = (clinic) => {
    return clinic?.["Hospital/Clinic/Diagnostic Name"] || 
           clinic?.["Clinic_Name"] ||
           clinic?.["clinic_name"] ||
           clinic?.["clinicName"] ||
           clinic?.["name"] ||
           "Clinic";
  };

  const getClinicLocation = (clinic) => {
    return clinic?.["clinic/location"] || 
           clinic?.location || 
           clinic?.["Hospital/Clinic/Diagnostic center"] || 
           null;
  };

  const clinicName = selectedClinic ? getClinicName(selectedClinic) : "";
  const clinicLocation = selectedClinic ? getClinicLocation(selectedClinic) : "";
  const specialization = selectedClinic?.specilization || selectedClinic?.specialization || "";
  const city = selectedClinic?.city || "";
  const mobile = selectedClinic?.["Mobile Number"] || selectedClinic?.mobile || "";
  const email = selectedClinic?.Email || selectedClinic?.email || "";
  const qualification = selectedClinic?.qualification || "";
  const yearsOfExperience = selectedClinic?.yearsofexperience || "";
  const doctorName = selectedClinic?.["Full Name"] || selectedClinic?.full_name || selectedClinic?.doctor_name || "";

  // Build full address
  const fullAddress = [clinicLocation, city].filter(Boolean).join(", ");

  const handleBackToConsultant = () => {
    if (selectedClinic?.id) {
      navigate(`/consultant?id=${selectedClinic.id}`);
    } else {
      navigate("/consultant", { state: { selectedClinic } });
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center shadow-xl">
          <p className="text-muted-foreground mb-4">No consultation data found.</p>
          <Button onClick={() => navigate("/clinics")}>Go to Clinics</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue py-12 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-health-cyan/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-health-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Success Header with Animation */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex justify-center mb-6 relative">
            {/* Animated Success Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <div className="relative rounded-full bg-gradient-to-br from-green-400 to-green-600 p-6 shadow-2xl transform transition-transform hover:scale-110">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
              {/* Sparkle Effects */}
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-bounce" />
              <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-yellow-400 animate-bounce delay-300" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-health-primary mb-4 bg-gradient-to-r from-health-primary to-health-cyan bg-clip-text text-transparent">
            Consultation Request Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Your consultation request has been successfully submitted. We'll contact you soon to confirm your appointment.
          </p>
          
          {/* Success Badge */}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 border border-green-200 rounded-full shadow-sm">
            <Star className="h-4 w-4 text-green-600 fill-green-600" />
            <span className="text-sm font-medium text-green-700">Request Confirmed</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Doctor Information Card - Left Side */}
          <div className="lg:col-span-1">
            <Card className={`h-full border-2 border-health-primary/20 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-health-primary/5 ${isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <CardHeader className="bg-gradient-to-r from-health-primary/10 to-health-cyan/10 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-health-primary/20 rounded-xl">
                    <Stethoscope className="h-8 w-8 text-health-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold text-health-primary">
                    Doctor Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {doctorName && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      <User className="h-4 w-4 text-health-primary" />
                      Doctor Name
                    </div>
                    <p className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-health-primary to-health-cyan bg-clip-text text-transparent">
                      {doctorName}
                    </p>
                  </div>
                )}

                {specialization && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      <BadgeCheck className="h-4 w-4 text-health-primary" />
                      Specialization
                    </div>
                    <p className="text-lg font-semibold text-gray-800">{specialization}</p>
                  </div>
                )}

                {qualification && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      <GraduationCap className="h-4 w-4 text-health-primary" />
                      Qualification
                    </div>
                    <p className="text-base font-medium text-gray-700 leading-relaxed">{qualification}</p>
                  </div>
                )}

                {yearsOfExperience && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      <Award className="h-4 w-4 text-health-primary" />
                      Experience
                    </div>
                    <p className="text-xl font-bold text-health-primary">{yearsOfExperience} Years</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Clinic Details Card - Center/Right */}
          <div className="lg:col-span-2">
            <Card className={`h-full border-2 border-health-green/20 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white ${isAnimating ? 'opacity-100 translate-x-0 delay-200' : 'opacity-0 translate-x-10'}`}>
              <CardHeader className="bg-gradient-to-r from-health-green/10 to-emerald-100/10 border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-health-green/20 rounded-xl">
                    <Building2 className="h-8 w-8 text-health-green" />
                  </div>
                  <CardTitle className="text-xl font-bold text-health-primary">
                    Clinic Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Clinic Name */}
                  <div className="md:col-span-2">
                    <div className="p-5 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-2 border-rose-100 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        <Building2 className="h-4 w-4 text-rose-600" />
                        Clinic Name
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{clinicName || "Not specified"}</p>
                    </div>
                  </div>

                  {/* Address */}
                  {fullAddress && (
                    <div className="md:col-span-2">
                      <div className="p-5 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border-2 border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          Clinic Address
                        </div>
                        <p className="text-lg font-semibold text-gray-900 leading-relaxed">{fullAddress}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {mobile && (
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-100 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        Mobile Number
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {(() => {
                          const phone = mobile.toString();
                          const digits = phone.replace(/\D/g, "");
                          if (digits.length <= 4) return phone;
                          const lastFour = digits.slice(-4);
                          const masked = "X".repeat(Math.max(0, digits.length - 4));
                          return `${masked}${lastFour}`;
                        })()}
                      </p>
                    </div>
                  )}

                  {email && (
                    <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-100 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        <Mail className="h-4 w-4 text-amber-600" />
                        Email Address
                      </div>
                      <a href={`mailto:${email}`} className="text-lg font-semibold text-gray-900 hover:text-health-primary transition-colors break-all">
                        {email}
                      </a>
                    </div>
                  )}


                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps Info Card */}
        <Card className={`mb-8 border-2 border-health-primary/20 shadow-lg bg-gradient-to-r from-health-primary/5 to-health-cyan/5 ${isAnimating ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-10'}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-health-primary/10 rounded-lg flex-shrink-0">
                <Heart className="h-6 w-6 text-health-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-health-primary mb-2">What Happens Next?</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our team will review your consultation request and contact you within <span className="font-semibold text-health-primary">24-48 hours</span> to confirm your appointment. 
                  Please keep your phone nearby for our call. We look forward to serving you!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isAnimating ? 'opacity-100 translate-y-0 delay-400' : 'opacity-0 translate-y-10'}`}>
          <Button
            onClick={() => navigate("/clinics")}
            variant="outline"
            size="lg"
            className="border-2 border-health-primary/30 hover:bg-health-primary/10 hover:border-health-primary shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Browse More Clinics
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationConfirmation;
