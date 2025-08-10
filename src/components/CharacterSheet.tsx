import React from 'react';
import { Character } from '../types';
import { useGameStore } from '../store/gameStore';
import { Shield, Heart, Zap } from 'lucide-react';

interface CharacterSheetProps {
  character: Character;
}

export const CharacterSheet: React.FC<CharacterSheetProps> = ({ character }) => {
  const { rollAttributeCheck, rollSkillCheck } = useGameStore();

  const attributes = [
    { key: 'str', name: 'STR', icon: '💪' },
    { key: 'dex', name: 'DEX', icon: '🏃' },
    { key: 'con', name: 'CON', icon: '❤️' },
    { key: 'int', name: 'INT', icon: '🧠' },
    { key: 'wis', name: 'WIS', icon: '👁️' },
    { key: 'cha', name: 'CHA', icon: '💬' },
  ];

  const handleAttributeRoll = (attribute: keyof Character['attributes']) => {
    try {
      const result = rollAttributeCheck(character.id, attribute);
      console.log(`${attribute.toUpperCase()} check:`, result);
    } catch (error) {
      console.error('Roll failed:', error);
    }
  };

  const handleSkillRoll = (skillId: string) => {
    try {
      const result = rollSkillCheck(character.id, skillId);
      console.log('Skill check:', result);
    } catch (error) {
      console.error('Roll failed:', error);
    }
  };

  const getModifier = (value: number) => {
    const modifier = Math.floor((value - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg border border-gray-600">
        <img 
          src={character.portrait} 
          alt={character.name}
          className="w-16 h-16 rounded-full border-2 border-game-yellow"
        />
        <div>
          <h3 className="text-lg mb-1 text-game-yellow">{character.name}</h3>
          <div className="flex items-center gap-1.5 text-game-red font-bold">
            <Heart size={16} />
            <span>{character.health.current}/{character.health.max}</span>
          </div>
        </div>
      </div>

      {/* Check and Save buttons */}
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-gradient-to-r from-game-yellow to-game-orange text-black rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-game-orange hover:to-game-yellow hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-300/30">
          Check
        </button>
        <button className="px-4 py-2 bg-gradient-to-r from-game-blue to-blue-600 text-white rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-blue-600 hover:to-game-blue hover:-translate-y-0.5">
          Save
        </button>
      </div>

      {/* Attributes */}
      <div>
        <h4 className="text-game-yellow text-base mb-3 border-b border-gray-600 pb-1">Attributes</h4>
        <div className="grid grid-cols-2 gap-3">
          {attributes.map(({ key, name, icon }) => (
            <div key={key} className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{icon}</span>
                <span className="font-bold text-gray-300">{name}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-game-yellow">{character.attributes[key as keyof Character['attributes']]}</span>
                <span className="text-sm text-gray-400">
                  ({getModifier(character.attributes[key as keyof Character['attributes']])})
                </span>
              </div>
              <div className="flex gap-1">
                <button 
                  className="px-2 py-1 bg-gradient-to-r from-game-yellow to-game-orange text-black rounded text-xs font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-game-orange hover:to-game-yellow hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-300/30"
                  onClick={() => handleAttributeRoll(key as keyof Character['attributes'])}
                >
                  Roll
                </button>
                <button className="px-2 py-1 bg-gradient-to-r from-game-yellow to-game-orange text-black rounded text-xs font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-game-orange hover:to-game-yellow hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-300/30">
                  Check
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-game-yellow text-base mb-3 border-b border-gray-600 pb-1">Skills</h4>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {character.skills.map((skill) => (
            <div key={skill.id} className="flex justify-between items-center p-3 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm">{skill.icon}</span>
                <span className="text-xs text-gray-300">{skill.name}</span>
              </div>
              <div className="text-xs text-gray-400 font-bold">
                {skill.modifier >= 0 ? `+${skill.modifier}` : `${skill.modifier}`}
              </div>
              <button 
                className="px-2 py-1 bg-gradient-to-r from-game-yellow to-game-orange text-black rounded text-xs font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-game-orange hover:to-game-yellow hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-300/30"
                onClick={() => handleSkillRoll(skill.id)}
              >
                Roll
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status Effects */}
      <div>
        <h4 className="text-game-yellow text-base mb-3 border-b border-gray-600 pb-1">Status</h4>
        <div className="grid grid-cols-3 gap-2">
          {character.statusEffects.map((effect) => (
            <div key={effect.id} className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded">
              <img src={effect.icon} alt={effect.name} className="w-6 h-6" />
              <span className="text-xs text-gray-300 text-center">{effect.name}</span>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: 9 - character.statusEffects.length }).map((_, i) => (
            <div key={`empty-${i}`} className="border border-dashed border-gray-600 bg-transparent min-h-10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

