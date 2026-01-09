import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import HeartHealthAssessment from "./pages/HeartHealthAssessment";
import HeartHealthResults from "./pages/HeartHealthResults";
import HealthCheckup from "./pages/HealthCheckup";
import Chat from "./pages/Chat";
import WellnessCampaign from "./pages/WellnessCampaign";
import Reviews from "./pages/Reviews";
import Volunteer from "./pages/Volunteer";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import AboutUs from "./pages/AboutUs";
import PartnerWithUs from "./pages/PartnerWithUs";
import VideoConsult from "./pages/VideoConsult";
import Clinics from "./pages/Clinics";
import Hospitals from "./pages/Hospitals";
import Consultant from "./pages/Consultant";
import ConsultationConfirmation from "./pages/ConsultationConfirmation";
import MyAppointments from "./pages/MyAppointments";
import Diagnostics from "./pages/Diagnostics";
import TwelveWeekProgram from "./pages/TwelveWeekProgram";
import TwelveWeekProgramApplication from "./pages/TwelveWeekProgramApplication";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/health-checkup" element={<HealthCheckup />} />
            <Route
              path="/heart-health"
              element={
                <PrivateRoute>
                  <HeartHealthAssessment />
                </PrivateRoute>
              }
            />
            <Route
              path="/heart-health-results"
              element={
                <PrivateRoute>
                  <HeartHealthResults />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              }
            />
            <Route path="/wellness-campaign" element={<WellnessCampaign />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route
              path="/partner-with-us"
              element={
                <PrivateRoute>
                  <PartnerWithUs />
                </PrivateRoute>
              }
            />
            <Route path="/videoconsult" element={<VideoConsult />} />
            <Route
              path="/clinics"
              element={
                <PrivateRoute>
                  <Clinics />
                </PrivateRoute>
              }
            />
            <Route
              path="/hospitals"
              element={
                <PrivateRoute>
                  <Hospitals />
                </PrivateRoute>
              }
            />
            <Route path="/consultant" element={<Consultant />} />
            <Route path="/consultation-confirmation" element={<ConsultationConfirmation />} />
            <Route
              path="/my-appointments"
              element={
                <PrivateRoute>
                  <MyAppointments />
                </PrivateRoute>
              }
            />
            <Route
              path="/diagnostics"
              element={
                <PrivateRoute>
                  <Diagnostics />
                </PrivateRoute>
              }
            />
            <Route
              path="/12-weeks-program"
              element={
                <PrivateRoute>
                  <TwelveWeekProgram />
                </PrivateRoute>
              }
            />
            <Route
              path="/12-weeks-program/apply"
              element={
                <PrivateRoute>
                  <TwelveWeekProgramApplication />
                </PrivateRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;