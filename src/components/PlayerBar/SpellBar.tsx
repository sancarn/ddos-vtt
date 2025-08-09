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

  // Initialize grid slots - 9 rows, 16 columns
  useEffect(() => {
    const gridWidth = 16;
    const gridHeight = 9;
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
      className={`spell-bar bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-game-gold rounded-xl p-4 shadow-2xl relative ${className}`}
    >
      {/* Stone texture overlay for the entire bar */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 pointer-events-none rounded-xl"
        style={{
          backgroundImage: 'url(/assets/Overlay_SpellBar.png)'
        }}
      />
      
      {/* Spell Bar Grid */}
      <div 
        className={`spell-bar-container overflow-x-auto overflow-y-auto py-2 relative z-10 max-h-[90px]`}
        ref={containerRef}
      >
        <div 
          className="spell-bar-grid grid grid-cols-16 grid-rows-9 gap-1 w-max"
        >
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`spell-slot relative w-16 h-16 bg-transparent rounded border border-gray-600 cursor-pointer transition-all duration-200 overflow-hidden flex-shrink-0 ${
                slot.spell ? 'border-green-500 shadow-lg shadow-green-500/30' : ''
              } ${
                dragOverSlot === slot.id ? 'border-game-gold scale-105 shadow-lg shadow-game-gold/30' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, slot.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, slot.id)}
              onClick={() => handleSlotClick(slot)}
            >
              {slot.spell ? (
                <div 
                  className="spell-in-slot relative flex items-center justify-center h-full w-full cursor-grab"
                  draggable
                  onDragStart={(e) => handleDragStart(e, slot.spell!)}
                >
                  <img 
                    src={slot.spell.icon} 
                    alt={slot.spell.name}
                    className="spell-icon w-full h-full object-contain drop-shadow-lg"
                  />
                  {slot.spell.currentCooldown && slot.spell.currentCooldown > 0 && (
                    <div 
                      className="cooldown-overlay absolute inset-0 bg-black/70 flex items-center justify-center rounded"
                    >
                      <span 
                        className="cooldown-text text-red-500 text-sm font-bold drop-shadow-lg"
                      >
                        {slot.spell.currentCooldown}
                      </span>
                    </div>
                  )}
                  <button
                    className="remove-spell-btn absolute top-0.5 right-0.5 w-4 h-4 bg-red-500/80 border-none rounded-full text-white text-xs font-bold cursor-pointer flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSpellFromSlot(slot.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div 
                  className="empty-slot flex w-full items-center justify-center h-full text-gray-400 text-xs text-center opacity-50"
                >
                  {/* <span className="slot-hint"></span> */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
