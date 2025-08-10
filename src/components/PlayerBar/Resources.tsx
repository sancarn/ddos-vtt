import React from 'react';
// Conditional import for game store - only used when characterId is provided
// import { useGameStore } from '../../store/gameStore';

// Base resource component that all specific resources extend
interface ResourceBaseProps {
  icon: string;
  amount: number;
  maxAmount?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  customOverlay?: React.ReactElement;
}

export const ResourceBase: React.FC<ResourceBaseProps> = ({
  icon,
  amount,
  maxAmount,
  label,
  size = 'md',
  onClick,
  className = '',
  customOverlay
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={`group relative flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 hover:scale-110 ${className}`}
      onClick={onClick}
    >
      <div className={`relative ${sizeClasses[size]} rounded-lg flex items-center justify-center shadow-lg`}>
        <img 
          src={icon} 
          alt={label || 'Resource'} 
          className="w-6 h-6 filter drop-shadow-sm"
        />
        {maxAmount && (
          <div className="absolute -bottom-2 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-gray-600">
            {amount}/{maxAmount}
          </div>
        )}
        {!maxAmount && amount > 1 && (
          <div className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-gray-600">
            {amount}
          </div>
        )}
        {/* Custom overlay for additional content like spell level */}
        {customOverlay}
      </div>
      {/* Tooltip */}
      {label && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {label}
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Action resource (Action, Bonus Action, Reaction) - updated to use current/max
interface ActionResourceProps {
  type: 'action' | 'bonusAction' | 'reaction';
  current: number;
  max: number;
  onClick?: () => void;
}

export const ActionResource: React.FC<ActionResourceProps> = ({ type, current, max, onClick }) => {
  const getActionIcon = () => {
    switch (type) {
      case 'action':
        return 'assets/resources/action.svg';
      case 'bonusAction':
        return 'assets/resources/bonus-action.svg';
      case 'reaction':
        return 'assets/resources/reaction.svg';
      default:
        return 'assets/resources/action.svg';
    }
  };

  const getActionLabel = () => {
    switch (type) {
      case 'action':
        return 'Action';
      case 'bonusAction':
        return 'Bonus';
      case 'reaction':
        return 'Reaction';
      default:
        return 'Action';
    }
  };

  const getActionColor = () => {
    if (current === 0) return 'bg-gray-600';
    if (current === max) return 'bg-green-500';
    return 'bg-green-400';
  };

  return (
    <ResourceBase
      icon={getActionIcon()}
      amount={current}
      maxAmount={max}
      label={getActionLabel()}
      onClick={onClick}
      className={current === 0 ? 'opacity-50' : ''}
    />
  );
};

// Spell slot resource
interface SpellSlotResourceProps {
  level: number;
  available: number;
  max: number;
  onClick?: () => void;
}

export const SpellSlotResource: React.FC<SpellSlotResourceProps> = ({ level, available, max, onClick }) => {
  const getSpellIcon = () => {
    return 'assets/resources/spell-slot.svg';
  };

  const getSpellLevelRoman = (level: number): string => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    return romanNumerals[level - 1] || level.toString();
  };

  return (
    <ResourceBase
      icon={getSpellIcon()}
      amount={available}
      maxAmount={max}
      label={`Level ${level} Spell Slot`}
      onClick={onClick}
      customOverlay={
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 py-0.5 rounded border border-gray-600 font-serif">
          {getSpellLevelRoman(level)}
        </div>
      }
    />
  );
};

// Ki points resource
interface KiResourceProps {
  available: number;
  max: number;
  onClick?: () => void;
}

export const KiResource: React.FC<KiResourceProps> = ({ available, max, onClick }) => {
  return (
    <ResourceBase
      icon="assets/resources/ki.svg"
      amount={available}
      maxAmount={max}
      label="Ki"
      onClick={onClick}
    />
  );
};

// Sorcery points resource
interface SorceryPointResourceProps {
  available: number;
  max: number;
  onClick?: () => void;
}

export const SorceryPointResource: React.FC<SorceryPointResourceProps> = ({ available, max, onClick }) => {
  return (
    <ResourceBase
      icon="assets/resources/sorcery-point.svg"
      amount={available}
      maxAmount={max}
      label="Sorcery Points"
      onClick={onClick}
    />
  );
};

// Channel Divinity resource
interface ChannelDivinityResourceProps {
  available: number;
  max: number;
  onClick?: () => void;
}

export const ChannelDivinityResource: React.FC<ChannelDivinityResourceProps> = ({ available, max, onClick }) => {
  return (
    <ResourceBase
      icon="assets/resources/channel-divinity.svg"
      amount={available}
      maxAmount={max}
      label="Channel Divinity"
      onClick={onClick}
    />
  );
};

// Wildshape resource
interface WildshapeResourceProps {
  available: number;
  max: number;
  onClick?: () => void;
}

export const WildshapeResource: React.FC<WildshapeResourceProps> = ({ available, max, onClick }) => {
  return (
    <ResourceBase
      icon="assets/resources/wildshape.svg"
      amount={available}
      maxAmount={max}
      label="Wildshape Charges"
      onClick={onClick}
    />
  );
};

// Bardic Inspiration resource
interface BardicInspirationResourceProps {
  available: number;
  max: number;
  onClick?: () => void;
}

export const BardicInspirationResource: React.FC<BardicInspirationResourceProps> = ({ available, max, onClick }) => {
  return (
    <ResourceBase
      icon="assets/resources/bardic-inspiration.svg"
      amount={available}
      maxAmount={max}
      label="Bardic Inspiration"
      onClick={onClick}
    />
  );
};

// Rage resource
interface RageResourceProps {
  available: number;
  max: number;
  onClick?: () => void;
}

export const RageResource: React.FC<RageResourceProps> = ({ available, max, onClick }) => {
  return (
    <ResourceBase
      icon="assets/resources/rage.svg"
      amount={available}
      maxAmount={max}
      label="Rage"
      onClick={onClick}
    />
  );
};

// Resource data interface for the new architecture
export interface ResourceItem {
  name: string;
  element: React.ReactElement;
}

// Main Resources component that displays all resources horizontally
interface ResourcesProps {
  data: () => ResourceItem[];
  className?: string;
}

export const Resources: React.FC<ResourcesProps> = ({ data, className = '' }) => {
  const resources = data();

  return (
    <div className={`flex items-center pb-3 bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {resources.map((resource, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          {resource.element}
        </div>
      ))}
    </div>
  );
};

// Test export to ensure component can be imported
export const TestResources = () => <div>Test Resources Component</div>;

export default Resources;
