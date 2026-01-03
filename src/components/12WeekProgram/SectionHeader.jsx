import { memo } from "react";

const SectionHeader = memo(({ 
  badgeIcon: BadgeIcon, 
  badgeText, 
  title, 
  description, 
  titleIcon: TitleIcon,
  className = "" 
}) => {
  return (
    <div className={`text-center mb-12 ${className}`}>
      {badgeText && BadgeIcon && (
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-green-50 border-2 border-green-200">
          <BadgeIcon className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
          <span className="text-xs md:text-sm font-bold text-gray-800">{badgeText}</span>
        </div>
      )}
      <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold mb-4 text-gray-800">
        {title}
        {TitleIcon && <TitleIcon className="inline-block w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-red-500 animate-pulse ml-2" />}
      </h2>
      {description && (
        <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mt-4 md:mt-6">
          {description}
        </p>
      )}
    </div>
  );
});

SectionHeader.displayName = "SectionHeader";

export default SectionHeader;

