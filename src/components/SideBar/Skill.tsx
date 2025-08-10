import React from 'react';

interface SkillProps {
  name: string;
  icon: string;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const Skill: React.FC<SkillProps> = ({ name, icon, onClick, onContextMenu }) => {
  return (
    <div 
      className="flex items-center min-w-fit h-10 bg-[#262420] border-2 border-[#473D31] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#2d2926] hover:border-[#5a4f42] active:scale-95 px-4 gap-3"
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {/* Icon */}
      <div className="w-8 h-8 flex-shrink-0">
        <img src={icon} alt={`${name} icon`} className="w-full h-full object-contain" />
      </div>
      
      {/* Decorative left border line */}
      <div className="w-1 h-12 bg-[#1B1915] rounded-r-sm flex-shrink-0"></div>    

      {/* Skill name */}
      <span 
        className="text-[#A08A6E] font-small text-lg leading-none whitespace-nowrap"
        style={{ fontFamily: 'Amasis MT Pro Medium, serif' }}
      >
        {name.toUpperCase()}
      </span>
    </div>
  );
};

export default Skill;
