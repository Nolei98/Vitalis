
import React from 'react';

interface NutrientBadgeProps {
  label: string;
  value: string;
  sublabel: string;
}

const NutrientBadge: React.FC<NutrientBadgeProps> = ({ label, value, sublabel }) => {
  return (
    <div className="flex flex-col items-center sm:items-end">
      <span className="font-bold text-[#0F482F] text-sm">{value}</span>
      <div className="flex items-center gap-1 text-[10px] text-[#0F482F]/60 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-[#E5AB7E]"></span>
        {sublabel}
      </div>
    </div>
  );
};

export default NutrientBadge;