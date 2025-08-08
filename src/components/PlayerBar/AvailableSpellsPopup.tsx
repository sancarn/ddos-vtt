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
        position: 'fixed',
        zIndex: 50,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      <div
        className="available-spells-popup"
        style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          border: '2px solid #d4af37',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          minWidth: '300px',
          maxWidth: '400px'
        }}
      >
        {/* Header */}
        <div
          className="popup-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #374151'
          }}
        >
          <h3
            className="popup-title"
            style={{
              color: '#d4af37',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: 0
            }}
          >
            Available Spells
          </h3>
          <button
            onClick={onClose}
            className="close-button"
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#d4af37';
              e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* Spells Grid */}
        <div
          className="spells-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {availableSpells.map((spell) => (
                         <div
               key={spell.id}
               className="spell-item"
               draggable
               onDragStart={(e) => {
                 e.dataTransfer.effectAllowed = 'move';
                 e.dataTransfer.setData('text/plain', spell.id);
                 e.dataTransfer.setData('application/json', JSON.stringify(spell));
               }}
               onClick={() => onSpellSelect(spell)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#4b5563';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Stone texture overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url(/assets/Overlay_SpellBar.png) center/cover',
                  opacity: 0.2,
                  pointerEvents: 'none'
                }}
              />
              
              <img
                src={spell.icon}
                alt={spell.name}
                className="spell-icon"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
                  position: 'relative',
                  zIndex: 1
                }}
              />
              <div
                className="spell-info"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flex: 1,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <span
                  className="spell-name"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#e5e7eb'
                  }}
                >
                  {spell.name}
                </span>
                <div
                  className="spell-details"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}
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
          className="popup-arrow"
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #d4af37'
          }}
        />
      </div>
    </div>
  );
};
