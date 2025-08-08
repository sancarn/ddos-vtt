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
    <div className="character-sheet">
      {/* Header */}
      <div className="character-header">
        <img 
          src={character.portrait} 
          alt={character.name}
          className="character-portrait"
        />
        <div className="character-info">
          <h3>{character.name}</h3>
          <div className="health-bar">
            <Heart size={16} />
            <span>{character.health.current}/{character.health.max}</span>
          </div>
        </div>
      </div>

      {/* Check and Save buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary">Check</button>
        <button className="btn btn-secondary">Save</button>
      </div>

      {/* Attributes */}
      <div className="attributes-section">
        <h4>Attributes</h4>
        <div className="attributes-grid">
          {attributes.map(({ key, name, icon }) => (
            <div key={key} className="attribute-item">
              <div className="attribute-header">
                <span className="attribute-icon">{icon}</span>
                <span className="attribute-name">{name}</span>
              </div>
              <div className="attribute-value">
                <span className="value">{character.attributes[key as keyof Character['attributes']]}</span>
                <span className="modifier">
                  ({getModifier(character.attributes[key as keyof Character['attributes']])})
                </span>
              </div>
              <div className="attribute-actions">
                <button 
                  className="btn btn-small"
                  onClick={() => handleAttributeRoll(key as keyof Character['attributes'])}
                >
                  Roll
                </button>
                <button className="btn btn-small">Check</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="skills-section">
        <h4>Skills</h4>
        <div className="skills-list">
          {character.skills.map((skill) => (
            <div key={skill.id} className="skill-item">
              <div className="skill-info">
                <span className="skill-icon">{skill.icon}</span>
                <span className="skill-name">{skill.name}</span>
              </div>
              <div className="skill-modifier">
                {skill.modifier >= 0 ? `+${skill.modifier}` : `${skill.modifier}`}
              </div>
              <button 
                className="btn btn-small"
                onClick={() => handleSkillRoll(skill.id)}
              >
                Roll
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status Effects */}
      <div className="status-section">
        <h4>Status</h4>
        <div className="status-grid">
          {character.statusEffects.map((effect) => (
            <div key={effect.id} className="status-effect">
              <img src={effect.icon} alt={effect.name} />
              <span className="effect-name">{effect.name}</span>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: 9 - character.statusEffects.length }).map((_, i) => (
            <div key={`empty-${i}`} className="status-slot empty" />
          ))}
        </div>
      </div>
    </div>
  );
};

