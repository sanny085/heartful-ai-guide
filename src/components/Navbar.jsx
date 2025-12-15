import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Heart,
  HandHeart,
  User,
  Users,
  BookOpen,
  Info,
  Menu,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Function to handle Heart Health Checkup navigation
  const handleHeartHealthCheckup = useCallback(() => {
    const currentPath = location.pathname;
    if (currentPath !== "/") {
      navigate("/");
      setTimeout(() => {
        const healthSection = document.getElementById("heart-health-section");
        healthSection?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      const healthSection = document.getElementById("heart-health-section");
      healthSection?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMobileMenuOpen(false);
  }, [navigate, location.pathname]);

  const envType = import.meta.env.VITE_PUBLIC_env_type;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border transition-all duration-300">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2 sm:py-2.5 md:py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
          <img
            src={logo}
            alt="10000Hearts Logo"
            className={`w-auto transition-all duration-300 cursor-pointer ${
              isScrolled 
                ? "h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 2xl:h-12" 
                : "h-12 sm:h-14 md:h-16 lg:h-[4.5rem] xl:h-20 2xl:h-20"
            }`}
            onClick={() => navigate("/")}
          />
        <span className="text-xs sm:text-sm md:text-base">{envType === 'dev' ? envType : ''}</span>
          {/* Services Navigation Menu */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-primary text-sm md:text-base lg:text-base">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px] 2xl:w-[280px] p-2">
                    <button
                      onClick={handleHeartHealthCheckup}
                      className="w-full text-left px-4 py-3 rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        <span className="font-medium text-sm md:text-base lg:text-base">
                          Heart Health Checkup
                        </span>
                      </div>
                    </button>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5 xl:gap-3">
          {/* Desktop/Tablet Navigation - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-4 2xl:gap-5">
            <Button
              variant="ghost"
              onClick={() => navigate("/blogs")}
              className="text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10 dark:hover:bg-purple-500/10 text-xs md:text-sm lg:text-base"
            >
              <BookOpen className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 mr-1.5 md:mr-2" />
              Blogs
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/reviews")}
              className="text-foreground hover:text-accent hover:bg-accent/10 text-xs md:text-sm lg:text-base"
            >
              <Users className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 mr-1.5 md:mr-2" />
              Reviews
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/volunteer")}
              className="text-foreground hover:text-success hover:bg-success/10 text-xs md:text-sm lg:text-base"
            >
              <HandHeart className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 mr-1.5 md:mr-2" />
              Volunteer
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/about-us")}
              className="text-foreground hover:text-warning hover:bg-warning/10 text-xs md:text-sm lg:text-base"
            >
              <Info className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 mr-1.5 md:mr-2" />
              About Us
            </Button>
          </div>

          {/* Desktop/Tablet Auth Button */}
          {!loading && (
            <div className="hidden md:block">
              {user ? (
                <Button
                  variant="outline"
                  onClick={() => navigate("/profile")}
                  className="border-primary text-primary hover:bg-primary/5 text-xs md:text-sm lg:text-base"
                  size="sm"
                >
                  <User className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 mr-1.5 md:mr-2" />
                  Profile
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="border-primary text-primary hover:bg-primary/5 text-xs md:text-sm lg:text-base"
                  size="sm"
                >
                  Sign In
                </Button>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Mobile Menu Sheet */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] md:w-[360px]">
              <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:gap-4">
                {/* Navigation Links */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/blogs");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-500/10 dark:hover:bg-purple-500/10 text-sm sm:text-base h-10 sm:h-11"
                  >
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    Blogs
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/reviews");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-foreground hover:text-accent hover:bg-accent/10 text-sm sm:text-base h-10 sm:h-11"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    Reviews
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/volunteer");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-foreground hover:text-success hover:bg-success/10 text-sm sm:text-base h-10 sm:h-11"
                  >
                    <HandHeart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    Volunteer
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/about-us");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-foreground hover:text-warning hover:bg-warning/10 text-sm sm:text-base h-10 sm:h-11"
                  >
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    About Us
                  </Button>
                </div>

                {/* Auth Section */}
                {!loading && (
                  <div className="pt-3 sm:pt-4 border-t border-border">
                    {user ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate("/profile");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full border-primary text-primary hover:bg-primary/5 text-sm sm:text-base h-10 sm:h-11"
                      >
                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                        Profile
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate("/auth");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full border-primary text-primary hover:bg-primary/5 text-sm sm:text-base h-10 sm:h-11"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


