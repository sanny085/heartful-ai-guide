import { Button } from "@/components/ui/button";
import {
  Heart,
  Activity,
  MessageCircle,
  Users,
  Brain,
  Shield,
  MessageSquare,
  Mic,
  Lightbulb,
  TrendingUp,
  Smile,
  UsersRound,
  Globe,
  Headphones,
  ChevronDown,
  HandHeart,
  Database,
  Calendar,
  Clock,
  ArrowRight,
  TriangleAlert,
  HeartCrack,
  Rocket,
  Bot,
  ClipboardList,
  LineChart,
  Droplets,
  Stethoscope,
  Bell,
  Star,
  StarHalf
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-health.jpg";
import aiDashboard from "@/assets/ai-dashboard.jpg";
import AIHealthCoachWrapper from "@/components/AIHealthCoachWrapper";
import { envConfig } from "@/lib/envApi";
import AIHealthFeaturesShowcase from "@/components/AIHealthFeaturesShowcase";
import landingPageBg from "@/assets/landing_page_bgImg.png";
import bpImg from "@/assets/landing_page_images/bp.png";
import heartImg from "@/assets/landing_page_images/heart_image.png";
import mobileImg from "@/assets/landing_page_images/mobile.png";
import piecefullImg from "@/assets/landing_page_images/piecefull_image.png";
import sugarImg from "@/assets/landing_page_images/sugar.webp";
import weightLossImg from "@/assets/landing_page_images/weight_loss.avif";
import before_afterImg from "@/assets/landing_page_images/before_after.avif";
import rameshImg from "@/assets/review-1.jpeg";
import sonalImg from "@/assets/review-2.jpeg";
import rakeshImg from "@/assets/review-3.jpeg";
import rajeshImg from "@/assets/review-4.jpeg";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasAssessment, setHasAssessment] = useState(false);
  
  const wellnessPrograms = [
    {
      title: "Heart Health",
      description: "Prevent cardiovascular diseases with AI monitoring",
      image: heartImg,
      icon: Heart,
      iconColor: "#FF4D4D",
      iconBg: "#FFF1F1"
    },
    {
      title: "Sugar Control",
      description: "Manage diabetes and prevent complications",
      image: sugarImg,
      icon: Droplets,
      iconColor: "#007AFF",
      iconBg: "#F0F7FF"
    },
    {
      title: "Weight Loss",
      description: "Sustainable weight management program",
      image: weightLossImg,
      icon: TrendingUp,
      iconColor: "#2ECC71",
      iconBg: "#EFFFF6"
    },
    {
      title: "BP Management",
      description: "Control hypertension before it's too late",
      image: bpImg,
      icon: Stethoscope,
      iconColor: "#AF52DE",
      iconBg: "#F8F2FF"
    }
  ];

  const testimonials = [
    {
      name: "Ramesh Kumar",
      age: 52,
      image: rameshImg,
      rating: 4,
      quote: "My BP was out of control for years. This AI helped me understand my risk and change my life. Now my numbers are perfect!"
    },
    {
      name: "Sonal Singh",
      age: 48,
      image: sonalImg,
      rating: 4.5,
      quote: "Diabetes was destroying my health silently. The daily guidance kept me on track. Lost 15kg and reversed pre-diabetes!"
    },
    {
      name: "Rakesh Sharma",
      age: 61,
      image: rakeshImg,
      rating: 5,
      quote: "AI predicted my heart risk before symptoms appeared. Started the program immediately. Avoided a major heart attack!"
    },
    {
      name: "Rajesh Kumar",
      age: 55,
      image: rajeshImg,
      rating: 5,
      quote: "The lifestyle tracking and personalized diet plans changed the way I look at my health. Feeling younger than ever!"
    }
  ];

  const howItWorksSteps = [
    {
      title: "Talk to Wellness Coach",
      description: "Share your health concerns in your language",
      icon: MessageCircle,
      color: "#108575",
      shadow: "shadow-[#108575]/20"
    },
    {
      title: "Get Risk Prediction",
      description: "Coach analyzes your health data instantly",
      icon: LineChart,
      color: "#F06225",
      shadow: "shadow-[#F06225]/20"
    },
    {
      title: "Personalized Plan",
      description: "Custom wellness program just for you",
      icon: ClipboardList,
      color: "#10B981",
      shadow: "shadow-[#10B981]/20"
    },
    {
      title: "Daily Guidance",
      description: "Track progress with 24/7 support",
      icon: Calendar,
      color: "#15803D",
      shadow: "shadow-[#15803D]/20"
    }
  ];

  const languages = [
    {
      nativeName: "తెలుగు",
      englishName: "Telugu",
      greeting: "నమస్కారం! నేను మీ ఆరోగ్య సహాయకుడిని."
    },
    {
      nativeName: "हिन्दी",
      englishName: "Hindi",
      greeting: "नमस्ते! मैं आपका स्वास्थ्य साथी हूं।"
    },
    {
      nativeName: "English",
      englishName: "English",
      greeting: "Hello! I'm your health Coach."
    }
  ];

  useEffect(() => {
    if (user) {
      checkExistingAssessment();
    }
  }, [user]);

  const checkExistingAssessment = async () => {
    try {
      const { data, error } = await supabase
        .from(envConfig.heart_health_assessments)
        .select("id")
        .eq("user_id", user?.id)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setHasAssessment(true);
      }
    } catch (error) {
      console.error("Error checking assessment:", error);
    }
  };

  const checkProfileComplete = async () => {
    if (!user) return false;

    const { data, error} = await supabase.from(envConfig.profiles).select("*").eq("user_id", user.id).maybeSingle();
    if (error || !data) return false;
    return true;
  };

  const handleChatClick = async () => {
    if (!user) {
      toast.error("Please sign in to chat with AI Doctor");
      navigate("/auth");
      return;
    }

    const hasProfile = await checkProfileComplete();
    if (!hasProfile) {
      toast.error("Please complete your profile first");
      navigate("/profile");
      return;
    }

    navigate("/chat");
  };

  const handleHealthReportClick = async () => {
    if (!user) {
      toast.error("Please sign in to access Health Report");
      navigate("/auth");
      return;
    }

    const hasProfile = await checkProfileComplete();
    if (!hasProfile) {
      toast.error("Please complete your profile first");
      navigate("/profile");
      return;
    }

    window.scrollTo(0, 0);
    navigate("/heart-health");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-bg via-background to-health-lightBlue overflow-x-hidden">

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url(${landingPageBg})` }}
      >
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 flex-grow flex flex-col items-center justify-center text-center mt-20">
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white drop-shadow-md">
            Prevent Heart Attacks
            <span className="block mt-2 text-[#00897B]  ">Before They Happen</span>
          </h1>

          {/* Subheading */}
          <div className="w-24 h-1 bg-white/50 rounded-full mx-auto mb-8"></div>
          
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto mb-12 font-medium drop-shadow-sm leading-relaxed">
             Wellness guidance to control BP, Sugar & Heart health - before it's too late.
          </p>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-4xl mx-auto mb-20">
            {/* Talk to AI Now */}
            <Button
              onClick={() => navigate("/wellness-program/apply")}
              className="bg-[#1E5631] hover:bg-[#143d22] text-white px-8 py-7 rounded-full text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 min-w-[200px]"
            >
              <MessageCircle className="w-6 h-6" />
              <div className="flex flex-col items-start text-left">
                  <span className="font-bold leading-none">Talk to Team</span>
                  <span className="text-xs opacity-80 leading-none mt-1">Now</span>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto" />
            </Button>

            {/* View Wellness Plans */}
             <Button
              onClick={() => {
                  const wellnessSection = document.getElementById("wellness-programs");
                  wellnessSection?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white px-8 py-7 rounded-full text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 min-w-[200px]"
            >
              <Calendar className="w-6 h-6" />
              <div className="flex flex-col items-start text-left">
                  <span className="font-bold leading-none">View Wellness</span>
                  <span className="text-xs opacity-80 leading-none mt-1">Plans</span>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto" />
            </Button>

            {/* Check Your Risk */}
             <Button
              onClick={() => navigate("/wellness-program/apply")}
              className="bg-[#FF6B35] hover:bg-[#e85a26] text-white px-8 py-7 rounded-full text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 min-w-[200px]"
            >
              <Activity className="w-6 h-6" />
              <div className="flex flex-col items-start text-left">
                  <span className="font-bold leading-none">Check Your</span>
                  <span className="text-xs opacity-80 leading-none mt-1">Risk</span>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto" />
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 bg-[#00897B] w-full py-4 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                    <div className="flex flex-col items-center group">
                        <Heart className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                        <div className="text-2xl font-bold mb-1">100+</div>
                        <div className="text-sm opacity-90">Lives Guided</div>
                    </div>
                    <div className="flex flex-col items-center group">
                        <Brain className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                        <div className="text-2xl font-bold mb-1">AI-Based</div>
                        <div className="text-sm opacity-90">Prevention and Prediction</div>
                    </div>
                    <div className="flex flex-col items-center group">
                        <Globe className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                        <div className="text-2xl font-bold mb-1">3 Languages</div>
                        <div className="text-sm opacity-90">Telugu | Hindi | English</div>
                    </div>
                    <div className="flex flex-col items-center group">
                         <Clock className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                        <div className="text-3xl font-bold mb-1">24/7</div>
                        <div className="text-sm opacity-90">Support Available</div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* The Silent Threat Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left Column: Full Width Image */}
                <div className="order-1">
                    <div className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#E0EBE4] bg-[#F2F9F5] relative group">
                        {/* Overlay Labels */}
                        <div className="absolute bottom-8 left-8 right-8 flex justify-between z-10 pointer-events-none">
                            <span className="text-3xl font-black text-red-600 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">Before</span>
                            <span className="text-3xl font-black text-red-600 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">After</span>
                        </div>
                        <img src={before_afterImg} alt="Before and After Health" className="w-full h-auto object-cover" />
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="space-y-8 order-2">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-extrabold text-[#004D40] leading-tight">
                            The Silent Threat
                        </h2>
                        <p className="text-lg text-gray-500 font-medium">
                            Silent health issues damage your body daily before any symptoms appear.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Threat 1 */}
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mt-1">
                                <TriangleAlert className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#004D40]">BP Going Unnoticed</h3>
                                <p className="text-gray-500">Silent hypertension damages your heart daily</p>
                            </div>
                        </div>

                        {/* Threat 2 */}
                        <div className="flex gap-4 items-start">
                             <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                                <TriangleAlert className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#004D40]">Sugar Silently Damaging</h3>
                                <p className="text-gray-500">Organs deteriorating without symptoms</p>
                            </div>
                        </div>

                        {/* Threat 3 */}
                        <div className="flex gap-4 items-start">
                             <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mt-1">
                                <HeartCrack className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#004D40]">Heart Attack Without Warning</h3>
                                <p className="text-gray-500">Sudden emergencies that could be prevented</p>
                            </div>
                        </div>
                    </div>

                    {/* Solution Card */}
                    <div className="bg-[#107C6B] rounded-3xl p-8 shadow-2xl text-white transform hover:scale-[1.02] transition-transform duration-300">
                        <h3 className="text-2xl font-bold mb-4">Our Wellness Solution</h3>
                        <p className="opacity-90 mb-8 leading-relaxed font-medium">
                            Our Wellness coach monitors your lifestyle, predicts risks, and guides you daily - before emergencies happen.
                        </p>
                        <div className="flex justify-center mt-4">
                            <Button 
                                onClick={() => navigate("/wellness-program/apply")}
                                className="bg-white text-[#107C6B] hover:bg-gray-100 font-bold px-8 py-7 rounded-full flex items-center gap-3 transition-all group w-full sm:w-auto"
                            >
                                <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                Start My Health Journey
                                <ArrowRight className="w-5 h-5 ml-auto" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Language Support */}
      <section className="py-10 relative overflow-hidden bg-[#F2F9F5]">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#CFEAD8]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#CFEAD8]/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-[#1A1A1A]">
               Speak Your Language. <span className="text-[#2E7D46]">Feel Understood.</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
               Our wellness coach speaks your language and understands your culture, making health conversations natural and comfortable.
            </p>
          </div>

          {/* Language Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {languages.map((lang, index) => (
              <div key={index} className="bg-[#EDF7F1]/50 p-6 rounded-2xl border border-[#E0EBE4] hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-[#1A1A1A]">{lang.nativeName}</h3>
                  <span className="text-sm text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">{lang.englishName}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#CFEAD8] flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-[#449F5A] rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium mb-1">{lang.greeting}</p>
                      {/* <p className="text-xs text-gray-400">AI Health Companion</p> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Health Journey Section */}
      {/* <section id="heart-health-section" className="container mx-auto px-4 py-16 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#E2F5EA] px-4 py-1.5 rounded-full text-sm font-medium text-[#2E7D46] mb-6">
               <Activity className="w-3 h-3" />
               AI-Powered Health Insights
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
               Discover Your <span className="text-[#2E7D46]">Heart Health</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
               Our AI companion provides personalized health insights with the care and understanding of a trusted physician.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                   <div className="w-12 h-12 bg-[#EDF7F1] rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-[#2E7D46]" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Heart Health Assessment</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                         Comprehensive heart health evaluation based on your lifestyle and medical history
                      </p>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                   <div className="w-12 h-12 bg-[#EDF7F1] rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-[#2E7D46]" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">AI Physician Chat</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                         Get instant answers to your health questions from our compassionate AI
                      </p>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
                   <div className="w-12 h-12 bg-[#EDF7F1] rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-[#2E7D46]" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Progress Tracking</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                         Monitor your health journey with easy-to-understand insights and trends
                      </p>
                   </div>
                </div>
             </div>

             
             <div className="bg-[#F9FAFB] rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
                <div className="bg-[#2E7D46] p-4 flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                      <Brain className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-white font-medium text-sm">AI Health Companion</h3>
                      <div className="flex items-center gap-1.5 opacity-90">
                         <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
                         <span className="text-xs text-white">Online • Ready to help</span>
                      </div>
                   </div>
                </div>
                
                <div className="p-6 h-[320px] overflow-hidden relative flex flex-col justify-end">
                  
                   <div className="absolute top-6 left-6 right-6 bottom-16 space-y-4">
                     
                      <div className="bg-[#E2F5EA] p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                         <p className="text-gray-700 text-sm mb-1">
                            Good morning! I noticed your glucose levels have been stable this week. Great job maintaining your diet!
                         </p>
                         <span className="text-[10px] text-gray-400">9:00 AM</span>
                      </div>

                    
                      <div className="bg-[#2E7D46] p-4 rounded-2xl rounded-tr-none max-w-[85%] ml-auto">
                         <p className="text-white text-sm mb-1">
                            Thanks! I've been following the meal plan you suggested.
                         </p>
                         <span className="text-[10px] text-white/70">9:01 AM</span>
                      </div>

                      
                      <div className="bg-[#E2F5EA] p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                         <p className="text-gray-700 text-sm mb-1">
                            That's wonderful! Would you like me to suggest some heart-healthy snack options for the evening?
                         </p>
                         <span className="text-[10px] text-gray-400">9:01 AM</span>
                      </div>
                   </div>

                  
                   <div className="bg-white rounded-full p-2 pl-4 flex items-center gap-2 border border-gray-200 absolute bottom-6 left-6 right-6">
                      <span className="text-gray-400 text-sm flex-1">Ask about your health...</span>
                      <div className="w-8 h-8 bg-[#2E7D46] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#256639] transition-colors">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section> */}

      {/* How It Works Section - New Design */}
      <section id="how-it-works" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#004D40]">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Your journey to better health in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto mb-16">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div 
                  className="w-28 h-28 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300"
                  style={{ backgroundColor: step.color }}
                >
                  <step.icon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-[#004D40] mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/wellness-program/apply")}
              className="bg-[#107C6B] hover:bg-[#0d6b5c] text-white px-10 py-7 rounded-full text-lg font-bold shadow-xl shadow-[#107C6B]/30 transition-all flex items-center gap-3"
            >
              <Bot className="w-6 h-6" />
              Talk With Wellness Coach
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Wellness Programs Section */}
      <section id="wellness-programs" className="py-16 relative overflow-hidden bg-[#E2F1E7]">
        {/* Dense Leafy Background Pattern */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dense-leaves" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M40 10 C50 30 70 40 90 40 C70 40 60 60 60 80 C60 60 40 50 20 50 C40 50 30 30 40 10 Z" fill="#107C6B" />
                <path d="M100 60 C110 80 130 90 150 90 C130 90 120 110 120 130 C120 110 100 100 80 100 C100 100 90 80 100 60 Z" fill="#2E7D46" transform="scale(0.6) translate(20, 20)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dense-leaves)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-[#004D40] tracking-tight">
              Wellness Programs
            </h2>
            <p className="text-lg text-[#004D40]/70 max-w-2xl mx-auto font-medium">
              Choose the program that fits your health goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {wellnessPrograms.map((program, index) => (
              <div key={index} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-all duration-500 group flex flex-col items-start border border-[#E0EBE4]">
                <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-50/50">
                  <img 
                    src={program.image} 
                    alt={program.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 pt-6 w-full relative">
                  {/* Icon Badge */}
                  <div className="absolute -top-6 left-8 w-14 h-14 bg-white rounded-2xl p-2 shadow-lg flex items-center justify-center">
                      <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: program.iconBg }}>
                          <program.icon className="w-7 h-7" style={{ color: program.iconColor }} />
                      </div>
                  </div>
                  
                  <div className="mt-10">
                      <h3 className="text-2xl font-extrabold text-[#004D40] mb-3">{program.title}</h3>
                      <p className="text-[#004D40]/60 text-sm mb-8 leading-relaxed font-medium">
                        {program.description}
                      </p>
                      <div className="flex justify-center w-full">
                        <div className="flex items-center text-[#107C6B] font-bold gap-2 cursor-pointer group/link" onClick={() => navigate("/wellness-program/apply")}>
                          <span className="border-b-2 border-transparent transition-all">View Program</span>
                          <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-[#064E3B] relative overflow-hidden">
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-white rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-white rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-6xl font-extrabold mb-4 text-white">
              Real Transformation. Real Lives Saved.
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Join Hundred's who transformed their health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full border-2 border-[#107C6B] object-cover"
                  />
                  <div>
                    <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-white/60 text-sm">Age {testimonial.age}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => {
                    const starValue = i + 1;
                    if (testimonial.rating >= starValue) {
                      return <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
                    } else if (testimonial.rating >= starValue - 0.5) {
                      return (
                        <div key={i} className="relative">
                          <Star className="w-4 h-4 text-white/20" />
                          <StarHalf className="absolute top-0 left-0 w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      );
                    } else {
                      return <Star key={i} className="w-4 h-4 text-white/20" />;
                    }
                  })}
                </div>
                <p className="text-white/80 italic leading-relaxed text-sm">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => navigate("/wellness-program/apply")}
              className="bg-white text-[#064E3B] hover:bg-gray-100 px-10 py-7 rounded-full text-lg font-bold shadow-xl transition-all flex items-center gap-3 group"
            >
              <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Join 100+ Like Them
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <section className="py-12 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            {/* Left Column: Phone Mockup */}
            <div className="relative flex justify-center lg:justify-start">
              <div className="rounded-[3rem] w-full max-w-md flex items-center justify-center relative overflow-hidden">
                 <img src={mobileImg} alt="Mobile App" className="w-full h-auto drop-shadow-2xl" />
                 {/* Decorative Blobs */}
                 <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-[#2E7D46]/5 rounded-full blur-3xl -z-10"></div>
                 <div className="absolute bottom-[-10%] left-[-10%] w-[200px] h-[200px] bg-[#2E7D46]/5 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>

            {/* Right Column: Features */}
            <div className="space-y-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#004D40] leading-tight">
                Your Personal Program Health Companion
              </h2>

              <div className="space-y-8">
                {/* Feature 1 */}
                <div className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#F2F9F5] rounded-2xl flex items-center justify-center group-hover:bg-[#E2F5EA] transition-colors">
                    <Globe className="w-7 h-7 text-[#2E7D46]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#004D40] mb-2">Talks in Your Language</h3>
                    <p className="text-gray-500 leading-relaxed">
                      Communicate comfortably in Telugu, Hindi, or English
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#F2F9F5] rounded-2xl flex items-center justify-center group-hover:bg-[#E2F5EA] transition-colors">
                    <Brain className="w-7 h-7 text-[#2E7D46]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#004D40] mb-2">Learns Your Habits</h3>
                    <p className="text-gray-500 leading-relaxed">
                      Understands your lifestyle and adapts recommendations
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#F2F9F5] rounded-2xl flex items-center justify-center group-hover:bg-[#E2F5EA] transition-colors">
                    <Bell className="w-7 h-7 text-[#2E7D46]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#004D40] mb-2">Alerts Before Danger</h3>
                    <p className="text-gray-500 leading-relaxed">
                      Proactive warnings when health risks are detected
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex gap-6 items-start group">
                  <div className="flex-shrink-0 w-14 h-14 bg-[#F2F9F5] rounded-2xl flex items-center justify-center group-hover:bg-[#E2F5EA] transition-colors">
                    <Calendar className="w-7 h-7 text-[#2E7D46]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#004D40] mb-2">Guides Daily Lifestyle</h3>
                    <p className="text-gray-500 leading-relaxed">
                      Personalized tips for diet, exercise, and wellness
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-center">
                <Button
                  onClick={() => navigate("/wellness-program/apply")}
                  className="bg-[#107C6B] hover:bg-[#0d6b5c] text-white px-10 py-7 rounded-full text-lg font-bold shadow-xl shadow-[#107C6B]/30 transition-all flex items-center gap-3"
                >
                  <Rocket className="w-6 h-6" />
                  Join wellness Program
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Health Features Showcase - Commented out as per request
      <AIHealthFeaturesShowcase />
      */}

      {/* About Section */}
      <section className="bg-background/50 py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className="text-[#107C6B]">10000Hearts</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to save Indian citizens from heart disease, diabetes, obesity, and mental health
              challenges through AI-driven awareness and preventive care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-[#107C6B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Care & Compassion</h3>
              <p className="text-muted-foreground">
                Every interaction is designed with empathy and understanding at its core
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-[#107C6B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Accessibility for All</h3>
              <p className="text-muted-foreground">
                Healthcare guidance in your language, available to every Indian citizen
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-[#107C6B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">AI-Powered Intelligence</h3>
              <p className="text-muted-foreground">Advanced AI that learns and adapts to your unique health patterns</p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-[#107C6B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Prevention First</h3>
              <p className="text-muted-foreground">
                Focus on awareness and prevention to save lives before emergencies
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-[#EDF7F1]/50 rounded-3xl p-12 text-center border border-[#E0EBE4]">
            <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed text-justify break-all">
              To create an intelligent AI ecosystem that guides every Indian toward better health, combining
              cutting-edge technology with doctor insights and personalized wellness programs. Together, we're building
              a healthier India, one heart at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#EDF7F1] px-4 py-2 rounded-full text-sm font-medium text-[#107C6B] mb-6">
              <TrendingUp className="w-4 h-4" />
              Innovation Pipeline
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What's Coming <span className="text-[#107C6B]">Next</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're constantly evolving to bring you the most advanced AI healthcare solutions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border relative">
              <div className="absolute top-4 right-4">
                <span className="bg-[#107C6B] text-white text-xs px-3 py-1 rounded-full font-medium">
                  In Development
                </span>
              </div>
              <div className="w-16 h-16 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-4">
                <Activity className="w-8 h-8 text-[#107C6B]" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">Predictive Health Analytics</h3>
              <p className="text-muted-foreground">
                AI-powered predictions to identify health risks before they become problems
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border relative">
              <div className="absolute top-4 right-4">
                <span className="bg-[#107C6B] text-white text-xs px-3 py-1 rounded-full font-medium">
                  Coming Soon
                </span>
              </div>
              <div className="w-16 h-16 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-[#107C6B]" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">Mental Health Support</h3>
              <p className="text-muted-foreground">
                Specialized AI modules for stress, anxiety, and emotional wellness
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border relative">
              <div className="absolute top-4 right-4">
                <span className="bg-[#2E7D46] text-white text-xs px-3 py-1 rounded-full font-medium">
                  Planned
                </span>
              </div>
              <div className="w-16 h-16 bg-[#EDF7F1] rounded-2xl flex items-center justify-center mb-4">
                <UsersRound className="w-8 h-8 text-[#107C6B]" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-card-foreground">Family Health Tracking</h3>
              <p className="text-muted-foreground">Monitor and manage health for your entire family in one place</p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-[#107C6B] rounded-3xl p-12 text-center border border-[#0d6b5c] shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-white">Join Our Wellness Program</h3>
            <p className="text-lg text-white/90 max-w-3xl mx-auto mb-10">
              Be part of the future of healthcare in India. Your feedback shapes what we build next.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate("/wellness-program/apply")}
                className="bg-white text-[#107C6B] hover:bg-gray-100 px-10 py-8 rounded-full text-xl font-bold shadow-2xl transition-all flex items-center gap-3 active:scale-95"
              >
                <Rocket className="w-6 h-6" />
                Join Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - New Design */}
      <section className="relative py-16 overflow-hidden bg-[#002B24]">
        {/* Background Image/Gradient Placeholder */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: `url(${piecefullImg})` }}
            ></div>
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
              Don't Wait for a Heart Attack. <br />
              <span className="text-green-700">Start Preventing Today.</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-white mb-12 max-w-2xl mx-auto drop-shadow-md font-medium">
              Take control of your health before it's too late. <br />
              Your future self will thank you.
            </p>

            <div className="flex flex-wrap gap-6 justify-center">
              <Button
                onClick={() => navigate("/wellness-program/apply")}
                className="bg-[#107C6B] hover:bg-[#0d6b5c] text-white px-10 py-8 rounded-full text-xl font-bold shadow-2xl transition-all flex items-center gap-3 active:scale-95"
              >
                <Rocket className="w-6 h-6" />
                Start My Wellness Program
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
