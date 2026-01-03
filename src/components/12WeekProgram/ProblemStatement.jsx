import { memo } from "react";
import { XCircle } from "lucide-react";

const ProblemStatement = memo(({ text, icon: Icon = XCircle, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-red-500 flex-shrink-0" />
      <span className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 font-medium leading-relaxed">
        {text}
      </span>
    </div>
  );
});

ProblemStatement.displayName = "ProblemStatement";

export default ProblemStatement;

