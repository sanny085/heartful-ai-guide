import { useEffect, useState } from "react"
import {supabase} from "../integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Stethoscope, MapPin, Phone, Mail, Calendar, User, Clock, Building2, GraduationCap, Briefcase, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react"
import heroImage from "@/assets/hero-health.jpg"

const Clinics = () => {
  // states added
  const [clinics , setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  // Navigation
  const navigate = useNavigate()
  // fetching the clinics data
  const fetchClinicData = async () => {
    try {
      setLoading(true)
      const {data , error} = await supabase.from("partner-with-us").select("*").eq("partner_type" , "Clinic/Doctor").order("created_at",{ascending:false})

      if (error) {
        console.error("Error Occured" , error)
        setClinics([])
      }else {
        setClinics(data || [])
      }
    } catch (err) {
      console.error("Error fetching clinics:", err)
      setClinics([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClinicData()
  } , [])

  // background Hospital Logo
  const DEFAULT_HOSPITAL_LOGO = "https://static.vecteezy.com/system/resources/thumbnails/023/740/386/small_2x/medicine-doctor-with-stethoscope-in-hand-on-hospital-background-medical-technology-healthcare-and-medical-concept-photo.jpg"
  // Doctors Logo
  const DEFAULT_DOCTORS_LOGO = "https://cdn-icons-png.flaticon.com/512/3774/3774293.png"

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue">
      {/* Hero Section with Image */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-health-bg/95 via-background/90 to-health-lightBlue/95"></div>
        
        {/* Back to Video Consult Button */}
        <div className="relative z-20 container mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/videoconsult")}
            className="text-foreground hover:text-accent hover:bg-background/50 backdrop-blur-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Video Consult
          </Button>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-accent border border-accent/30">
              <Stethoscope className="w-4 h-4" />
              Trusted Healthcare Partners
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Our Partner <span className="text-accent">Clinics</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Connect with experienced doctors and healthcare professionals near you. Find the best medical care with our trusted network of clinics and specialists.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Verified Doctors</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <Stethoscope className="w-4 h-4 text-accent" />
                <span>Expert Care</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Easy Booking</span>
              </div>
          </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 py-12">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="overflow-hidden border-border bg-card flex flex-col h-full">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <div className="pt-16 px-5 pb-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </Card>
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-2xl font-semibold mb-2 text-foreground">No Clinics Available</h3>
            <p className="text-muted-foreground">
              There are no registered clinics at the moment. Check back soon!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clinics.map((clinic) => {
              const {
                id,
                name,
                mobile_number,
                city,
                email,
                hospital_logo_url,
                doctor_profile_url,
                location,
                qualification,
                specilization,
                clinic_name,
                timing_sloats,
                yearsofexperience,
              } = clinic;
              return (
                <Card
                  key={id}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border bg-card flex flex-col h-full"
                >
                  {/* Image Header Section */}
                  <div className="relative h-48 overflow-visible bg-gradient-to-br from-accent/20 to-accent/5">
                    <div className="h-full overflow-hidden rounded-t-lg">
                      {hospital_logo_url ? <img src={hospital_logo_url} alt="hospital logo" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <img src={DEFAULT_HOSPITAL_LOGO} alt="hospital logo" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50"></div>

                      {/* Clinic Name & Specialization - Centered in Middle */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-4 w-full z-10">
                        <h3 className="font-bold text-lg md:text-xl mb-1 text-white drop-shadow-lg uppercase">
                          {clinic_name || "Clinic Name"}
                        </h3>
                        {specilization && (
                          <p className="text-sm md:text-base font-semibold text-white opacity-95 drop-shadow-md">
                            {specilization}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Doctor Profile Picture - Fully visible circle */}
                    <div className="absolute -bottom-12 left-4 z-20">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-background shadow-2xl bg-background overflow-hidden">
                          <img
                            src={doctor_profile_url && doctor_profile_url.trim() !== "" ? doctor_profile_url : DEFAULT_DOCTORS_LOGO}
                            alt="doctor profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="pt-16 px-5 pb-5 space-y-3 flex flex-col h-full min-h-[400px]">
                    <div className="flex-1 space-y-3">
                      {/* Doctor Name */}
                      {name && (
                        <div className="flex items-center gap-2 text-foreground">
                          <User className="w-4 h-4 text-accent flex-shrink-0" />
                          <p className="font-semibold text-base capitalize">
                            Dr. {name}
                          </p>
                        </div>
                      )}

                      {/* Key Info Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {/* Qualification */}
                        {qualification && (
                          <div className="flex items-start gap-2">
                            <GraduationCap className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Qualification
                              </p>
                              <p className="text-sm font-medium text-foreground truncate">
                                {qualification}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Experience */}
                        {yearsofexperience && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Experience
                              </p>
                              <p className="text-sm font-medium text-foreground">
                                {yearsofexperience}{" "}
                                {yearsofexperience === "1" ? "year" : "years"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      {location && (
                        <div className="flex items-start gap-2 text-muted-foreground pt-1">
                          <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <p className="text-sm flex-1">{location}</p>
                        </div>
                      )}

                      {/* City */}
                      {city && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                          <p className="text-sm capitalize">{city}</p>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="pt-2 space-y-2">
                        {mobile_number && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                            <p className="text-sm">
                              {(() => {
                                const digits = mobile_number
                                  .toString()
                                  .replace(/\D/g, "");
                                if (digits.length <= 4) return mobile_number;
                                const lastFour = digits.slice(-4);
                                const masked = "X".repeat(
                                  Math.max(0, digits.length - 4)
                                );
                                return `${masked}${lastFour}`;
                              })()}
                            </p>
                          </div>
                        )}

                        {email && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-sm break-all line-clamp-1">
                              {email}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Timing Slots */}
                      {timing_sloats && (
                        <div className="pt-2 space-y-2">
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-sm line-clamp-2">
                              {timing_sloats}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book Consultation Button - Always at bottom */}
                    <Button
                      className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={() => navigate(`/consultant?id=${id}`)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Consultation
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default Clinics