import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeartHealthResults() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-12 h-12 text-accent fill-accent" />
            <div>
              <h2 className="text-2xl font-bold">Hi Sanny,</h2>
              <h1 className="text-3xl font-bold">Here's a snapshot of your heart health report</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button className="pb-4 px-4 border-b-2 border-accent text-accent font-medium">
            Heart Health
          </button>
          <button className="pb-4 px-4 text-muted-foreground hover:text-foreground">
            Insights
          </button>
          <button className="pb-4 px-4 text-muted-foreground hover:text-foreground">
            Risk Contributors
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center space-y-4 shadow-md">
            <div>
              <div className="text-5xl font-bold text-foreground mb-1">
                86<span className="text-2xl text-muted-foreground">points</span>
              </div>
              <h3 className="text-xl font-semibold text-accent mb-2">Cardiovascular Score</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              A score close to 100 means your heart is very healthy!
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 shadow-md">
            <div>
              <div className="text-5xl font-bold text-foreground mb-1">
                28<span className="text-2xl text-muted-foreground">years</span>
              </div>
              <h3 className="text-xl font-semibold text-accent mb-2">Heart Age</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Heart Age may differ from your actual age. The younger your heart, healthier you are, so aim to keep your heart young!
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 shadow-md">
            <div>
              <div className="text-5xl font-bold text-foreground mb-1">
                4<span className="text-2xl text-muted-foreground">%</span>
              </div>
              <h3 className="text-xl font-semibold text-accent mb-2">Heart Disease Risk</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Heart Disease Risk % shows your chance of getting heart disease in the next 10 years; a lower percentage means better health.
            </p>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Button
            onClick={() => navigate("/chat")}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
            size="lg"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Start Chat
          </Button>
          <Button
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10 px-8"
            size="lg"
          >
            <Phone className="mr-2 h-5 w-5" />
            Call Us
          </Button>
        </div>

        {/* Social Share */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Invite your friends & family to take the test</p>
          <div className="flex gap-3 justify-center">
            {[
              { icon: "🟢", label: "WhatsApp" },
              { icon: "📷", label: "Instagram" },
              { icon: "👍", label: "Facebook" },
              { icon: "✖️", label: "X" },
              { icon: "💼", label: "LinkedIn" }
            ].map((social) => (
              <button
                key={social.label}
                className="w-12 h-12 rounded-full bg-card border border-border hover:border-accent hover:shadow-md transition-all flex items-center justify-center"
                aria-label={social.label}
              >
                <span className="text-xl">{social.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          Copyright © 2024 Fitterfly Healthtech Pvt. Ltd. | All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
