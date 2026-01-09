import { useEffect, useState, memo, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Stethoscope, 
  Building2, 
  MapPin,
  Search,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock3
} from "lucide-react";
import { format, isPast, isToday, isFuture, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-health.jpg";

// React-based date formatting component
const DateFormatter = memo(({ dateString }) => {
  const formatted = useMemo(() => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  }, [dateString]);
  return formatted;
});
DateFormatter.displayName = "DateFormatter";

// Get appointment status
const getAppointmentStatus = (dateString, timeString) => {
  if (!dateString) return { label: "Scheduled", variant: "default", icon: Clock3 };
  
  try {
    const appointmentDate = parseISO(dateString);
    if (isPast(appointmentDate)) {
      return { label: "Completed", variant: "secondary", icon: CheckCircle2 };
    } else if (isToday(appointmentDate)) {
      return { label: "Today", variant: "default", icon: AlertCircle };
    } else if (isFuture(appointmentDate)) {
      return { label: "Upcoming", variant: "outline", icon: CalendarDays };
    }
  } catch {
    return { label: "Scheduled", variant: "default", icon: Clock3 };
  }
  return { label: "Scheduled", variant: "default", icon: Clock3 };
};

// Status Badge Component
const StatusBadge = memo(({ date, time }) => {
  const status = useMemo(() => getAppointmentStatus(date, time), [date, time]);
  const Icon = status.icon;
  
  return (
    <Badge variant={status.variant} className="flex items-center gap-1.5 px-3 py-1">
      <Icon className="h-3 w-3" />
      <span className="text-xs font-medium">{status.label}</span>
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";

// Line by line field display component
const LineField = memo(({ icon: Icon, label, value }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-center gap-2 py-1 group">
      <div className="flex-shrink-0 h-6 w-6 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center group-hover:from-accent/20 group-hover:to-primary/20 transition-colors">
        {Icon && <Icon className="h-3 w-3 text-accent flex-shrink-0" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{label}:</span>
          <span className="text-xs font-semibold text-foreground truncate">{value}</span>
        </div>
      </div>
    </div>
  );
});
LineField.displayName = "LineField";

// Atomic Components - Memoized for performance
const AppointmentHeader = memo(({ id, date, time }) => {
  const last4Digits = useMemo(() => {
    const idStr = String(id);
    return idStr.length >= 4 ? idStr.slice(-4) : idStr;
  }, [id]);
  
  return (
    <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
      <Badge variant="outline" className="text-sm font-bold px-3 py-1.5 bg-accent/10 border-accent/30 text-accent">
        {last4Digits}
      </Badge>
      <StatusBadge date={date} time={time} />
    </div>
  );
});
AppointmentHeader.displayName = "AppointmentHeader";

const AppointmentCard = memo(({ appointment }) => {
  const {
    id,
    full_name,
    email,
    phone_number,
    preferred_date,
    preferred_time,
    created_at,
    updated_at,
    doctor_name: doctorName,
    clinic_name: clinicName,
    clinic_address: clinicAddress,
    ...otherFields
  } = appointment;

  const excludedFields = useMemo(
    () => ['id', 'created_at', 'updated_at', 'preferred_date', 'preferred_time', 'full_name', 'email', 'phone_number', 'doctor_name', 'clinic_name', 'clinic_address'],
    []
  );

  const formattedPhone = useMemo(() => {
    if (!phone_number) return null;
    const digits = String(phone_number).replace(/\D/g, "");
    return digits.length <= 4 ? phone_number : "X".repeat(digits.length - 4) + digits.slice(-4);
  }, [phone_number]);

  const formattedDate = useMemo(() => {
    if (!preferred_date) return null;
    try {
      return format(new Date(preferred_date), "MMM dd, yyyy");
    } catch {
      return preferred_date;
    }
  }, [preferred_date]);

  // Get all additional fields
  const additionalFields = useMemo(() => {
    return Object.entries(otherFields)
      .filter(([key, value]) => {
        return !excludedFields.includes(key) && 
               !key.toLowerCase().includes('message') &&
               value !== null && 
               value !== undefined && 
               value !== '';
      })
      .map(([key, value]) => {
        const formattedName = key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .replace(/^\w/, c => c.toUpperCase())
          .trim();
        return { label: formattedName, value: String(value) };
      });
  }, [otherFields, excludedFields]);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/50 bg-gradient-to-br from-card via-card to-card/95 overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-2 pt-3 px-4 relative z-10 bg-gradient-to-r from-accent/5 to-transparent">
        <AppointmentHeader id={id} date={preferred_date} time={preferred_time} />
      </CardHeader>

      <CardContent className="px-4 pb-3 pt-1 relative z-10">
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <LineField icon={Calendar} label="Date" value={formattedDate} />
          <LineField icon={Clock} label="Time" value={preferred_time || "Not specified"} />
          <LineField icon={User} label="Name" value={full_name} />
          <LineField icon={Mail} label="Email" value={email} />
          {formattedPhone && <LineField icon={Phone} label="Phone" value={formattedPhone} />}
          {doctorName && <LineField icon={Stethoscope} label="Doctor" value={`Dr. ${doctorName}`} />}
          {clinicName && <LineField icon={Building2} label="Clinic" value={clinicName} />}
          {clinicAddress && <LineField icon={MapPin} label="Address" value={clinicAddress} />}
          {additionalFields.map((field, idx) => (
            <LineField 
              key={idx} 
              icon={User} 
              label={field.label} 
              value={field.value} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
AppointmentCard.displayName = "AppointmentCard";

const LoadingState = memo(() => (
  <div className="min-h-screen flex items-center justify-center py-20">
    <div className="space-y-6 w-full max-w-7xl">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 border-2">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-20 w-full mb-4 rounded-xl" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
        </Card>
      ))}
      </div>
    </div>
  </div>
));
LoadingState.displayName = "LoadingState";

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="relative mb-8">
      <div className="h-32 w-32 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
        <CalendarDays className="h-16 w-16 text-accent/50" />
      </div>
      <div className="absolute -top-2 -right-2">
        <Sparkles className="h-8 w-8 text-accent animate-pulse" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-foreground mb-2">No Appointments Yet</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      You don't have any appointments scheduled. Book a consultation to get started!
    </p>
  </div>
));
EmptyState.displayName = "EmptyState";

// Main Component
const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDetails = useCallback(async () => {
    if (!user?.email) {
      setAppointments([]);
      return;
    }

    try {
      setLoading(true);
      const { data: consultantData, error: consultantError } = await supabase
        .from("Consultant_Submissions")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false });
      
      if (consultantError) {
        console.error("Error fetching appointments:", consultantError);
        setAppointments([]);
      } else {
        setAppointments(consultantData || []);
      }
    } catch (err) {
      console.error("Error:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    
    const query = searchQuery.toLowerCase();
    return appointments.filter(appointment => {
      return (
        appointment.full_name?.toLowerCase().includes(query) ||
        appointment.email?.toLowerCase().includes(query) ||
        appointment.doctor_name?.toLowerCase().includes(query) ||
        appointment.clinic_name?.toLowerCase().includes(query) ||
        appointment.preferred_date?.toLowerCase().includes(query) ||
        appointment.preferred_time?.toLowerCase().includes(query)
      );
    });
  }, [appointments, searchQuery]);

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-health-lightBlue/5 to-background">
      {/* Hero Section with Image */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-health-bg/95 via-background/90 to-health-lightBlue/95"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-accent border border-accent/30">
              <CalendarDays className="w-4 h-4" />
              Your Health Journey
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              My <span className="text-accent">Appointments</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Stay organized and never miss a consultation. Manage all your medical appointments in one place with ease and peace of mind.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Easy Management</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-accent" />
                <span>Quick Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Organized & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto max-w-7xl py-12 px-4">
        {/* Search Bar */}
        <div className="mb-10">
          {appointments.length > 0 && (
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search appointments by name, email, doctor, or clinic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-border focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {appointments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold text-foreground">{appointments.length}</p>
                  </div>
                  <CalendarDays className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Upcoming</p>
                    <p className="text-3xl font-bold text-foreground">
                      {appointments.filter(apt => {
                        if (!apt.preferred_date) return false;
                        try {
                          return isFuture(parseISO(apt.preferred_date)) || isToday(parseISO(apt.preferred_date));
                        } catch {
                          return false;
                        }
                      }).length}
                    </p>
                  </div>
                  <Clock3 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                    <p className="text-3xl font-bold text-foreground">
                      {appointments.filter(apt => {
                        if (!apt.preferred_date) return false;
                        try {
                          return isPast(parseISO(apt.preferred_date));
                        } catch {
                          return false;
                        }
                      }).length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Appointments Grid */}
        {filteredAppointments.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground mb-2">No appointments found</p>
              <p className="text-muted-foreground">Try adjusting your search query</p>
            </div>
          ) : (
          <EmptyState />
          )
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment?.id} appointment={appointment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
