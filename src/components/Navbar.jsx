import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Heart,
  User,
  Users,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { redirectToRoot } from "@/lib/utils";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const envType = import.meta.env.VITE_PUBLIC_env_type;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <img
            src={logo}
            alt="10000Hearts Logo"
            className={`w-auto transition-all duration-300 cursor-pointer ${
              isScrolled ? "h-10 md:h-12" : "h-16 md:h-20"
            }`}
            onClick={redirectToRoot}
          />
        <span>{envType === 'dev' ? envType : ''}</span>
          {/* Services Navigation Menu */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-primary">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[200px] p-2">
                    <button
                      onClick={() => {
                        const healthSection = document.getElementById(
                          "heart-health-section"
                        );
                        healthSection?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="w-full text-left px-4 py-3 rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span className="font-medium">
                          Heart Health Checkup
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate("/reviews")}
                      className="w-full text-left px-4 py-3 rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="font-medium">Reviews</span>
                      </div>
                    </button>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Services Menu */}
          <NavigationMenu className="md:hidden">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-primary px-2">
                  <span className="text-sm">Services</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[180px] p-2">
                    <button
                      onClick={() => {
                        const healthSection = document.getElementById(
                          "heart-health-section"
                        );
                        healthSection?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          Heart Health
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate("/reviews")}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Reviews</span>
                      </div>
                    </button>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {!loading &&
            (user ? (
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
                className="border-primary text-primary hover:bg-primary/5"
                size="sm"
              >
                <User className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Profile</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-primary text-primary hover:bg-primary/5"
                size="sm"
              >
                Sign In
              </Button>
            ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;


