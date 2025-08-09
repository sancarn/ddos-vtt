import React, { useState } from 'react';

interface Spell {
  id: string;
  name: string;
  icon: string;
  type: 'spell' | 'ability' | 'item';
  level?: number;
  cooldown?: number;
  currentCooldown?: number;
}

interface AvailableSpellsPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSpellSelect: (spell: Spell) => void;
  position: { x: number; y: number };
}

export const AvailableSpellsPopup: React.FC<AvailableSpellsPopupProps> = ({
  isVisible,
  onClose,
  onSpellSelect,
  position
}) => {
  const [availableSpells] = useState<Spell[]>([
    {
      id: 'magic-missile',
      name: 'Magic Missile',
      icon: '/assets/spells/MagicMissile.png',
      type: 'spell',
      level: 1,
      cooldown: 0,
      currentCooldown: 0
    },
    {
      id: 'fireball',
      name: 'Fireball',
      icon: '/assets/spells/MagicMissile.png', // Using same icon for now
      type: 'spell',
      level: 3,
      cooldown: 3,
      currentCooldown: 0
    },
    {
      id: 'heal',
      name: 'Cure Wounds',
      icon: '/assets/spells/MagicMissile.png', // Using same icon for now
      type: 'spell',
      level: 1,
      cooldown: 1,
      currentCooldown: 0
    },
    {
      id: 'shield',
      name: 'Shield',
      icon: '/assets/spells/MagicMissile.png', // Using same icon for now
      type: 'spell',
      level: 1,
      cooldown: 2,
      currentCooldown: 0
    },
    {
      id: 'invisibility',
      name: 'Invisibility',
      icon: '/assets/spells/MagicMissile.png', // Using same icon for now
      type: 'spell',
      level: 2,
      cooldown: 5,
      currentCooldown: 0
    }
  ]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      <div
        className="available-spells-popup bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-game-gold rounded-xl p-4 shadow-2xl min-w-[300px] max-w-[400px]"
        style={{
          background: 'linear-gradient(to bottom right, #1f2937, #111827)'
        }}
      >
        {/* Header */}
        <div
          className="popup-header flex justify-between items-center mb-4 pb-3 border-b border-gray-700"
        >
          <h3
            className="popup-title text-game-gold text-lg font-bold m-0"
          >
            Available Spells
          </h3>
          <button
            onClick={onClose}
            className="close-button bg-none border-none text-gray-400 text-xl cursor-pointer p-1 rounded transition-all duration-200 hover:text-game-gold hover:bg-game-gold/10"
          >
            ×
          </button>
        </div>

        {/* Spells Grid */}
        <div
          className="spells-grid grid gap-4 max-h-[400px] overflow-y-auto"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))'
          }}
        >
          {availableSpells.map((spell) => (
            <div
              key={spell.id}
              className="spell-item flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-lg cursor-pointer transition-all duration-200 relative overflow-hidden hover:border-game-gold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-game-gold/20 min-h-[120px]"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', spell.id);
                e.dataTransfer.setData('application/json', JSON.stringify(spell));
              }}
              onClick={() => onSpellSelect(spell)}
            >
              {/* Stone texture overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'url(/assets/Overlay_SpellBar.png)'
                }}
              />

              <img
                src={spell.icon}
                alt={spell.name}
                className="spell-icon w-16 h-16 object-contain drop-shadow-lg relative z-10 mb-2"
                style={{
                  width: '64px',
                  height: '64px',
                  maxWidth: '64px',
                  maxHeight: '64px'
                }}
              />
              <div
                className="spell-info flex flex-col items-center gap-1 relative z-10 text-center"
              >
                <span
                  className="spell-name text-sm font-semibold text-gray-200"
                >
                  {spell.name}
                </span>
                <div
                  className="spell-details flex gap-2 text-xs text-gray-400"
                >
                  {spell.level && (
                    <span className="spell-level">
                      Level {spell.level}
                    </span>
                  )}
                  {spell.cooldown && spell.cooldown > 0 && (
                    <span className="spell-cooldown">
                      CD: {spell.cooldown}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow pointing to portrait */}
        <div
          className="popup-arrow absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-game-gold"
        />
      </div>
    </div>
  );
};
