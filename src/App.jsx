import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import HeartHealthAssessment from "./pages/HeartHealthAssessment";
import HeartHealthResults from "./pages/HeartHealthResults";
import HealthCheckup from "./pages/HealthCheckup";
import Chat from "./pages/Chat";
import WellnessCampaign from "./pages/WellnessCampaign";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/health-checkup" element={<HealthCheckup />} />
            <Route path="/heart-health" element={<HeartHealthAssessment />} />
            <Route path="/heart-health-results" element={<HeartHealthResults />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/wellness-campaign" element={<WellnessCampaign />} />
            <Route path="/reviews" element={<Reviews />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;