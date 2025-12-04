import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Edit2, Save, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { profileSchema } from "@/lib/validation";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    married_status: "",
    location: "",
    preferred_language: "",
    medical_category: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error("Failed to load profile data.");
      return;
    }

    if (data) {
      setProfile(data);
      setFormData({
        name: data.name || "",
        age: data.age?.toString() || "",
        gender: data.gender || "",
        married_status: data.married_status || "",
        location: data.location || "",
        preferred_language: data.preferred_language || "",
        medical_category: data.medical_category || "",
      });
    } else {
      // No profile exists, redirect to setup
      navigate('/profile-setup');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      // Validate age is a number
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum)) {
        toast.error("Please enter a valid age");
        return;
      }

      // Validate using zod schema
      const validationResult = profileSchema.safeParse({
        name: formData.name,
        age: ageNum,
        gender: formData.gender,
        married_status: formData.married_status,
        location: formData.location,
        preferred_language: formData.preferred_language,
        medical_category: formData.medical_category,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(validationResult.data)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue p-2 sm:p-4">
      <div className="container mx-auto max-w-4xl py-4 sm:py-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-4 sm:mb-6 border-primary text-primary hover:bg-primary/5 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-accent fill-accent" />
              <h1 className="text-xl sm:text-2xl font-bold text-primary">My Profile</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-primary text-primary hover:bg-primary/5 flex-1 sm:flex-none text-sm sm:text-base"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="border-warning text-warning hover:bg-warning/5 flex-1 sm:flex-none text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 sm:flex-none text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1 sm:flex-none text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Email</Label>
              <Input 
                value={user?.email || ""} 
                disabled 
                className="bg-muted text-sm sm:text-base" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className="text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm sm:text-base">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  disabled={!isEditing}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm sm:text-base">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="married_status" className="text-sm sm:text-base">Marital Status</Label>
                <Select
                  value={formData.married_status}
                  onValueChange={(value) => handleInputChange("married_status", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Unmarried">Unmarried</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm sm:text-base">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={!isEditing}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm sm:text-base">Preferred Language</Label>
              <Select
                value={formData.preferred_language}
                onValueChange={(value) => handleInputChange("preferred_language", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Telugu">Telugu</SelectItem>
                  <SelectItem value="Hinglish">Hinglish</SelectItem>
                  <SelectItem value="Teluglish">Teluglish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_category" className="text-sm sm:text-base">Medical Focus</Label>
              <Select
                value={formData.medical_category}
                onValueChange={(value) => handleInputChange("medical_category", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Physician">General Physician</SelectItem>
                  <SelectItem value="Mental Health">Mental Health</SelectItem>
                  <SelectItem value="Loneliness Support">Loneliness Support</SelectItem>
                  <SelectItem value="Diabetes / Thyroid">Diabetes / Thyroid</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;