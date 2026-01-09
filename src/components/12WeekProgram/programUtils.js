// Shared utilities for 12WeekProgram components

const COLOR_MAP = {
    green: {
      badge: "bg-green-500",
      border: "border-green-300",
      hoverBorder: "hover:border-green-400",
      bg: "from-green-50 to-green-50",
      iconBg: "from-green-50 to-green-50",
      iconBorder: "border-green-200",
      checkmark: "text-green-400",
      button: "from-green-400 to-emerald-400",
      buttonHover: "hover:from-green-500 hover:to-emerald-500",
      badgeText: "text-gray-800",
      chevron: "text-gray-800",
      badgeBg: "bg-green-100",
      badgeBorder: "border-green-300",
    },
    emerald: {
      badge: "bg-emerald-500",
      border: "border-emerald-400",
      hoverBorder: "hover:border-emerald-400",
      bg: "from-emerald-50 to-emerald-50",
      iconBg: "from-emerald-50 to-emerald-50",
      iconBorder: "border-emerald-200",
      checkmark: "text-emerald-400",
      button: "from-emerald-400 to-green-400",
      buttonHover: "hover:from-emerald-500 hover:to-green-500",
      badgeText: "text-gray-800",
      chevron: "text-gray-800",
      badgeBg: "bg-emerald-100",
      badgeBorder: "border-emerald-300",
    },
    teal: {
      badge: "bg-teal-500",
      border: "border-teal-300",
      hoverBorder: "hover:border-teal-500",
      bg: "from-teal-100 to-teal-50",
      iconBg: "from-teal-100 to-teal-50",
      iconBorder: "border-teal-300",
      checkmark: "text-teal-600",
      button: "from-teal-500 to-cyan-500",
      buttonHover: "hover:from-teal-600 hover:to-cyan-600",
      badgeText: "text-gray-800",
      chevron: "text-gray-800",
      badgeBg: "bg-teal-200",
      badgeBorder: "border-teal-400",
    },
    lime: {
      badge: "bg-lime-500",
      border: "border-lime-300",
      hoverBorder: "hover:border-lime-500",
      bg: "from-lime-100 to-lime-50",
      iconBg: "from-lime-100 to-lime-50",
      iconBorder: "border-lime-300",
      checkmark: "text-lime-600",
      button: "from-lime-500 to-green-500",
      buttonHover: "hover:from-lime-600 hover:to-green-600",
      badgeText: "text-gray-800",
      chevron: "text-gray-800",
      badgeBg: "bg-lime-200",
      badgeBorder: "border-lime-400",
    },
    cyan: {
      badge: "bg-cyan-500",
      border: "border-cyan-300",
      hoverBorder: "hover:border-cyan-500",
      bg: "from-cyan-100 to-cyan-50",
      iconBg: "from-cyan-100 to-cyan-50",
      iconBorder: "border-cyan-300",
      checkmark: "text-cyan-600",
      button: "from-cyan-500 to-teal-500",
      buttonHover: "hover:from-cyan-600 hover:to-teal-600",
      badgeText: "text-gray-800",
      chevron: "text-gray-800",
    },
    yellow: {
      badge: "bg-yellow-500",
      border: "border-yellow-300",
      hoverBorder: "hover:border-yellow-500",
      bg: "from-yellow-100 to-yellow-50",
      iconBg: "from-yellow-100 to-yellow-50",
      iconBorder: "border-yellow-300",
      checkmark: "text-yellow-600",
      button: "from-yellow-500 to-orange-500",
      buttonHover: "hover:from-yellow-600 hover:to-orange-600",
      badgeText: "text-gray-800",
      chevron: "text-gray-800",
    },
};

// Common color classes generator with nullish coalescing
export const getColorClasses = (color) => {
  return COLOR_MAP[color] ?? COLOR_MAP.green;
};

// Common CTA button handler with optional chaining
export const handleCTAClick = (navigate) => {
  window?.scrollTo?.({ top: 0, behavior: "smooth" });
  navigate?.("/12-weeks-program/apply");
};

// Common CTA button styles
export const CTA_BUTTON_CLASSES = "bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white px-3 py-2.5 md:px-6 md:py-4 lg:px-10 lg:py-7 text-xs sm:text-sm md:text-base lg:text-lg font-bold rounded-full shadow-xl border-2 border-green-300/30 relative overflow-hidden group w-full sm:w-auto";

// CTA Button content wrapper classes
export const CTA_BUTTON_CONTENT_CLASSES = "relative z-10 flex items-center justify-center flex-wrap gap-1 sm:gap-0 sm:flex-nowrap";
export const CTA_BUTTON_TEXT_CLASSES = "whitespace-normal sm:whitespace-nowrap text-center sm:text-left";
export const CTA_BUTTON_SHINE_CLASSES = "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700";

