import { useMemo, memo } from "react";
import { Sparkles, Moon, Dumbbell, Utensils } from "lucide-react";

// Atomic Component: Chat Bubble
const ChatBubble = memo(({ text, icon: Icon, iconColor, position, index }) => {
  const positions = useMemo(
    () => ({
      "top-left": "top-10 left-10 md:top-20 md:left-20",
      "mid-left": "top-1/3 left-5 md:left-10",
      "bottom-left": "bottom-20 left-10 md:left-20",
      "top-right": "top-10 right-10 md:top-20 md:right-20",
      "mid-right": "top-1/3 right-5 md:right-10",
      "bottom-right": "bottom-20 right-10 md:right-20",
    }),
    []
  );

  return (
    <div
      className={`absolute ${positions[position] || ""} hidden md:block opacity-0 animate-fade-in`}
      style={{
        animationDelay: `${index * 0.2}s`,
      }}
    >
      <div className="bg-white dark:bg-card rounded-xl md:rounded-2xl shadow-md p-3 md:p-4 max-w-[180px] md:max-w-[220px] border border-border/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
        <div className="flex items-start gap-2 md:gap-3">
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
          <p className="text-xs md:text-sm font-medium text-gray-800 dark:text-foreground leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
});
ChatBubble.displayName = "ChatBubble";

// Atomic Component: Background Bubble
const BackgroundBubble = memo(({ text, position }) => {
  const positions = useMemo(
    () => ({
      "top-left": "top-1/4 left-1/4",
      "bottom-right": "bottom-1/4 right-1/4",
    }),
    []
  );

  return (
    <div className={`absolute ${positions[position] || ""} opacity-20 blur-md hidden lg:block`}>
      <div className="bg-white/60 dark:bg-card/40 rounded-xl p-3 max-w-[140px]">
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
});
BackgroundBubble.displayName = "BackgroundBubble";

// Main Component
const AIHealthCoachWrapper = ({ children }) => {
  // Memoized chat bubbles data
  const chatBubbles = useMemo(
    () => [
      {
        text: "How was my day today?",
        icon: Sparkles,
        iconColor: "text-green-500",
        position: "top-left",
      },
      {
        text: "How to improve my sleep?",
        icon: Moon,
        iconColor: "text-blue-400",
        position: "mid-left",
      },
      {
        text: "How to do squats correctly?",
        icon: Dumbbell,
        iconColor: "text-purple-500",
        position: "bottom-left",
      },
      {
        text: "How to improve my sleep?",
        icon: Moon,
        iconColor: "text-blue-400",
        position: "top-right",
      },
      {
        text: "Workout Suggestions",
        icon: Dumbbell,
        iconColor: "text-purple-500",
        position: "mid-right",
      },
      {
        text: "Protein rich meal ideas for kids?",
        icon: Utensils,
        iconColor: "text-orange-500",
        position: "bottom-right",
      },
    ],
    []
  );

  // Memoized background bubbles data
  const backgroundBubbles = useMemo(
    () => [
      { text: "Health tips...", position: "top-left" },
      { text: "Wellness advice...", position: "bottom-right" },
    ],
    []
  );

  return (
    <section className="relative bg-gradient-to-br from-accent/5 via-primary/5 to-success/5 py-12 md:py-16 lg:py-20 overflow-hidden">
      {chatBubbles.map((bubble, index) => {
        const { text, icon, iconColor, position } = bubble;
        return (
          <ChatBubble
            key={`${position}-${index}`}
            text={text}
            icon={icon}
            iconColor={iconColor}
            position={position}
            index={index}
          />
        );
      })}

      {backgroundBubbles.map((bubble) => {
        const { text, position } = bubble;
        return <BackgroundBubble key={position} text={text} position={position} />;
      })}

      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default memo(AIHealthCoachWrapper);
