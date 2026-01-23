import { useMemo, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Heart,
  Globe,
} from "lucide-react";
import logo from "@/assets/logo.png";

// Atomic Component: Footer Link
const FooterLink = memo(({ to, children, onClick }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="text-sm text-white/70 hover:text-white transition-colors text-left"
      >
        {children}
      </button>
    );
  }
  return (
    <Link
      to={to}
      className="text-sm text-white/70 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
});
FooterLink.displayName = "FooterLink";

// Atomic Component: Footer Column
const FooterColumn = memo(({ title, links }) => (
  <div>
    <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => {
        const { to, label, onClick } = link;
        return (
          <li key={label}>
            <FooterLink to={to} onClick={onClick}>
              {label}
            </FooterLink>
          </li>
        );
      })}
    </ul>
  </div>
));
FooterColumn.displayName = "FooterColumn";

const Footer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Memoized navigation handlers
  const handleScrollToHealthSection = useMemo(
    () => () => {
      const healthSection = document.getElementById("heart-health-section");
      if (healthSection) {
        healthSection.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate("/");
        setTimeout(() => {
          const section = document.getElementById("heart-health-section");
          section?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    },
    [navigate]
  );

  // Handler for AI Health Companion (Chat) - checks auth and profile
  const handleChatClick = useMemo(
    () => async () => {
      if (!user) {
        toast.error("Please sign in to chat with AI Health Companion");
        navigate("/auth");
        return;
      }

      // Check if profile is complete
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error || !data) {
          toast.error("Please complete your profile first");
          navigate("/profile");
          return;
        }

        navigate("/chat");
      } catch (error) {
        console.error("Error checking profile:", error);
        navigate("/chat");
      }
    },
    [navigate, user]
  );

  // Memoized footer data - Services/Products (only working routes)
  const services = useMemo(
    () => [
      { label: "Heart Health Assessment", onClick: handleScrollToHealthSection },
      { label: "AI Health Companion", onClick: handleChatClick },
      { to: "/wellness-campaign", label: "Wellness Campaign" },
      { to: "/health-checkup", label: "Health Checkup" },
    ],
    [handleScrollToHealthSection, handleChatClick]
  );

  // Resources (only working routes)
  const resources = useMemo(
    () => [
      { to: "/blogs", label: "Health Blog" },
      { to: "/reviews", label: "User Reviews" },
      { to: "/about-us", label: "About Us" },
      { to: "/volunteer", label: "Volunteer" },
    ],
    []
  );

  // Quick Links (only working routes)
  const quickLinks = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/blogs", label: "Blogs" },
      { to: "/reviews", label: "Reviews" },
      { to: "/volunteer", label: "Contact Us" },
    ],
    []
  );

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Upper Section - Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 mb-12 pb-12 border-b border-white/10">
          <FooterColumn title="Services" links={services} />
          <FooterColumn title="Resources" links={resources} />
          <FooterColumn title="Quick Links" links={quickLinks} />
          <div>
            <h3 className="text-base font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <FooterLink to="/volunteer">Join Our Mission</FooterLink>
              </li>
              <li>
                <FooterLink to="/reviews">Share Your Story</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower Section - Company Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
          {/* Company Information */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <Link to="/">
                <img
                  src={logo}
                  alt="10000Hearts Logo"
                  className="h-16 md:h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
              10000hearts is a preventive wellness program that helps people reduce heart-attack risk naturally by building healthier daily habits and restoring balance in the body.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Globe className="w-4 h-4 text-white/60" />
              <span>Available in Telugu, Hindi & English</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent" />
              <span>© {currentYear} 10000hearts. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/about-us"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                to="/about-us"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link
                to="/volunteer"
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);

