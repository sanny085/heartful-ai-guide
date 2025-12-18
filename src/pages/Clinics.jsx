import { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Stethoscope, MapPin, Phone, Mail, Calendar, Loader2, User, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Constants
const FALLBACK_IMAGE_URL = "https://media.istockphoto.com/id/1090425074/vector/vector-illustration-of-hospital-room-interior-with-medical-tools-bed-and-table-room-in.jpg?s=612x612&w=0&k=20&c=NrokSg7oN6vXB_wd75yyR3uYNoCNvqp6XfrxHR2l48A=";
const FALL_BACK_DOCTOR_IMAGE_URL = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

/**
 * Get public image URL from Supabase Storage
 * Converts file path (stored in database) to a usable image URL
 */
const getImageUrl = (filePath, bucketName = "logo") => {
  if (!filePath) return null;
  
  // If it's already a full URL, return as is
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  
  // For public buckets, use Supabase's getPublicUrl() method
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data?.publicUrl || null;
};

/**
 * Get clinic name from various possible field names
 */
const getClinicName = (clinic) => {
  return clinic["Organization/Clinic Name"] || 
         clinic["Hospital/Clinic/Diagnostic Name"] || 
         "Clinic Name";
};

/**
 * Get clinic location from various possible field names
 */
const getClinicLocation = (clinic) => {
  return clinic["clinic/location"] || 
         clinic.location || 
         clinic["Hospital/Clinic/Diagnostic center"] || 
         null;
};

/**
 * Get background image URL from partnership_logo_images_url column in Supabase
 * This should be shown as the background image
 */
const getBackgroundImageUrl = (clinic) => {
  // Use partnership_logo_images_url column for background image
  const logoPath = clinic.partnership_logo_images_url;
  if (!logoPath) return null;
  // getImageUrl handles both full URLs and file paths automatically
  return getImageUrl(logoPath, "partnership_logo_images");
};

/**
 * Get profile picture URL from logo_url column in Supabase
 * This should be shown as the profile picture
 * Returns null if no profile pic is found in Supabase
 */
const getProfilePicUrl = (clinic) => {
  // Use logo_url column for profile picture
  const profilePicPath = clinic.logo_url;
  
  // If no path found, return null (will use fallback)
  if (!profilePicPath) {
    return null;
  }
  
  // Try to get the URL from Supabase storage (logo bucket)
  return getImageUrl(profilePicPath, "logo");
};

/**
 * Clinic Card Component
 */
const ClinicCard = ({ clinic, navigate }) => {
  const [logoError, setLogoError] = useState(false);
  const [profilePicError, setProfilePicError] = useState(false);

  const backgroundImageUrl = useMemo(() => getBackgroundImageUrl(clinic), [clinic]);
  const profilePicUrl = useMemo(() => getProfilePicUrl(clinic), [clinic]);
  const clinicName = useMemo(() => getClinicName(clinic), [clinic]);
  const location = useMemo(() => getClinicLocation(clinic), [clinic]);
  const specialization = clinic.specilization || clinic.specialization;

  return (
    <Card className="p-0 hover:shadow-xl transition-shadow overflow-hidden">
      {/* Background Image Section - Uses partnership_logo_images_url */}
      <div className="w-full h-64 overflow-hidden relative">
        <img 
          src={logoError ? FALLBACK_IMAGE_URL : (backgroundImageUrl || FALLBACK_IMAGE_URL)} 
          alt={`${clinicName} Background`}
          className="w-full h-full object-cover"
          onError={() => setLogoError(true)}
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        
        {/* Clinic Name and Specialization in Middle - Single Line */}
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 text-center p-4 z-10">
          <h2 className="text-white font-bold text-2xl md:text-3xl lg:text-4xl">
            {clinicName}
            {specialization && (
              <span className="block text-base md:text-lg lg:text-xl font-semibold mt-1">
                {specialization}
              </span>
            )}
          </h2>
        </div>
        
        {/* Profile Picture - Use Supabase profile pic if available, otherwise use default */}
        <div className="absolute bottom-8 left-6 transform translate-y-[30%] z-[100]">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-background flex-shrink-0 shadow-2xl bg-background">
            {profilePicUrl && !profilePicError ? (
              // If profile pic exists in Supabase and loads successfully, use it
              <img 
                src={profilePicUrl} 
                alt="Doctor Profile"
                className="w-full h-full object-cover"
                onError={() => setProfilePicError(true)}
              />
            ) : (
              // If no profile pic in Supabase or error loading it, use default fallback
              <img 
                src={FALL_BACK_DOCTOR_IMAGE_URL} 
                alt="Doctor Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 pt-14">
        <div className="space-y-3 mb-4">
          {/* Qualification */}
          {clinic.qualification && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Qualification:</span> {clinic.qualification}
            </div>
          )}

          {/* Years of Experience */}
          {clinic.yearsofexperience && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Experience:</span> {clinic.yearsofexperience} years
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span className="text-sm">{location}</span>
            </div>
          )}

          {/* City */}
          {clinic.city && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span className="text-sm">
                <span className="font-medium">City:</span> {clinic.city}
              </span>
            </div>
          )}

          {/* Mobile Number */}
          {clinic["Mobile Number"] && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
              <span className="text-sm">{clinic["Mobile Number"]}</span>
            </div>
          )}

          {/* Email */}
          {clinic.Email && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
              <span className="text-sm break-all">{clinic.Email}</span>
            </div>
          )}

          {/* Contact Person */}
          {clinic.Name && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <span className="text-sm">
                <span className="font-medium">Contact Person:</span> {clinic.Name}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {clinic.Message && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-2">Description:</p>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {clinic.Message}
            </p>
          </div>
        )}

        <Button 
          className="w-full mt-4 bg-accent hover:bg-accent/90"
          onClick={() => navigate("/videoconsult")}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Book Consultation
        </Button>
      </div>
    </Card>
  );
};

const Clinics = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("partner-with-us")
        .select("*")
        .eq("Partnership Type", "Clinic/Doctor")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setClinics(data || []);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      toast.error("Failed to load clinics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Partner <span className="text-accent">Clinics</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect with experienced doctors and healthcare professionals
          </p>
        </div>

        {clinics.length === 0 ? (
          <Card className="p-12 text-center">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No Clinics Available</h3>
            <p className="text-muted-foreground mb-6">
              There are no registered clinics at the moment. Check back soon!
            </p>
            <Button onClick={() => navigate("/videoconsult")}>
              Back to Video Consult
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} navigate={navigate} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Clinics;
