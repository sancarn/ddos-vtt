import React, { useState, useRef, useEffect } from 'react';

interface Spell {
  id: string;
  name: string;
  icon: string;
  type: 'spell' | 'ability' | 'item';
  level?: number;
  cooldown?: number;
  currentCooldown?: number;
}

interface SpellSlot {
  id: string;
  spell: Spell | null;
  position: { x: number; y: number };
}

interface SpellBarProps {
  className?: string;
}

export const SpellBar: React.FC<SpellBarProps> = ({ className = '' }) => {
  const [slots, setSlots] = useState<SpellSlot[]>([]);
  const [draggedSpell, setDraggedSpell] = useState<Spell | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize grid slots
  useEffect(() => {
    const gridWidth = 8;
    const gridHeight = 2;
    const newSlots: SpellSlot[] = [];

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        newSlots.push({
          id: `slot-${x}-${y}`,
          spell: null,
          position: { x, y }
        });
      }
    }

    setSlots(newSlots);
  }, []);

  const handleDragStart = (e: React.DragEvent, spell: Spell) => {
    setDraggedSpell(spell);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', spell.id);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotId);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    
    // Try to get spell data from drag event
    const spellId = e.dataTransfer.getData('text/plain');
    const spellJson = e.dataTransfer.getData('application/json');
    let spellToDrop: Spell | null = null;
    
    // If we have a dragged spell from internal drag, use it
    if (draggedSpell) {
      spellToDrop = draggedSpell;
    } else if (spellJson) {
      // Try to get full spell object from JSON data
      try {
        spellToDrop = JSON.parse(spellJson);
      } catch (error) {
        console.error('Failed to parse spell data:', error);
      }
    } else if (spellId) {
      // Fallback: create a basic spell object from the ID
      spellToDrop = {
        id: spellId,
        name: spellId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: '/assets/spells/MagicMissile.png',
        type: 'spell',
        level: 1,
        cooldown: 0,
        currentCooldown: 0
      };
    }
    
    if (!spellToDrop) return;

    setSlots(prev => prev.map(slot => {
      if (slot.id === slotId) {
        return { ...slot, spell: spellToDrop };
      }
      // Remove spell from other slots
      if (slot.spell?.id === spellToDrop.id) {
        return { ...slot, spell: null };
      }
      return slot;
    }));

    setDraggedSpell(null);
    setDragOverSlot(null);
  };

  const handleSpellClick = (spell: Spell) => {
    console.log(`Casting ${spell.name}`);
    // TODO: Implement spell casting logic
  };

  const handleSlotClick = (slot: SpellSlot) => {
    if (slot.spell) {
      handleSpellClick(slot.spell);
    }
  };

  const removeSpellFromSlot = (slotId: string) => {
    setSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, spell: null } : slot
    ));
  };

  return (
    <div 
      className={`spell-bar ${className}`}
      style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        border: '2px solid #d4af37',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Spell Bar Grid */}
      <div 
        className="spell-bar-container" 
        ref={containerRef}
        style={{
          overflowX: 'auto',
          padding: '8px 0'
        }}
      >
        <div 
          className="spell-bar-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '8px',
            minWidth: '800px'
          }}
        >
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`spell-slot ${slot.spell ? 'has-spell' : ''} ${
                dragOverSlot === slot.id ? 'drag-over' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, slot.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, slot.id)}
              onClick={() => handleSlotClick(slot)}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                border: slot.spell ? '2px solid #10b981' : '2px solid #4b5563',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                boxShadow: slot.spell ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = slot.spell ? '#10b981' : '#4b5563';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = slot.spell ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none';
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
                  opacity: 0.3,
                  pointerEvents: 'none'
                }}
              />
              
              {slot.spell ? (
                <div 
                  className="spell-in-slot"
                  draggable
                  onDragStart={(e) => handleDragStart(e, slot.spell!)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '8px',
                    cursor: 'grab'
                  }}
                >
                  <img 
                    src={slot.spell.icon} 
                    alt={slot.spell.name}
                    className="spell-icon"
                    style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                    }}
                  />
                  {slot.spell.currentCooldown && slot.spell.currentCooldown > 0 && (
                    <div 
                      className="cooldown-overlay"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px'
                      }}
                    >
                      <span 
                        className="cooldown-text"
                        style={{
                          color: '#ef4444',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
                        }}
                      >
                        {slot.spell.currentCooldown}
                      </span>
                    </div>
                  )}
                  <button
                    className="remove-spell-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSpellFromSlot(slot.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '16px',
                      height: '16px',
                      background: 'rgba(239, 68, 68, 0.8)',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div 
                  className="empty-slot"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#6b7280',
                    fontSize: '10px',
                    textAlign: 'center',
                    opacity: 0.5
                  }}
                >
                  <span className="slot-hint">Drop spell here</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
