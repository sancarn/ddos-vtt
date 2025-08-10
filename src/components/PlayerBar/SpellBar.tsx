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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slotId: string } | null>(null);

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
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, slotId: string) => {
    e.preventDefault();
    const slot = slots.find(s => s.id === slotId);
    if (slot?.spell) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        slotId
      });
    }
  };

  const handleClickOutside = () => {
    setContextMenu(null);
  };

  return (
    <div 
      className={`spell-bar bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-game-gold rounded-xl p-4 shadow-2xl relative ${className}`}
      onClick={handleClickOutside}
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
          className="overflow-x-auto overflow-y-auto py-1 relative z-10 max-h-[100px]"
          ref={containerRef}
        >
          <div 
            className="grid grid-cols-16 grid-rows-9 w-max"
          >
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`spell-slot relative w-8 h-8 bg-transparent rounded border border-gray-600 cursor-pointer transition-all duration-200 overflow-hidden flex-shrink-0 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/30 ${
                dragOverSlot === slot.id ? 'border-game-gold scale-105 shadow-lg shadow-game-gold/30' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, slot.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, slot.id)}
              onClick={() => handleSlotClick(slot)}
              onContextMenu={(e) => handleContextMenu(e, slot.id)}
            >
              {slot.spell ? (
                <div 
                  className="relative flex items-center justify-center h-full w-full cursor-grab"
                  draggable
                  onDragStart={(e) => handleDragStart(e, slot.spell!)}
                >
                  <img 
                    src={slot.spell.icon} 
                    alt={slot.spell.name}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              ) : (
                <div 
                  className="flex w-full items-center justify-center h-full text-gray-400 text-xs text-center opacity-50"
                >
                  {/* <span className="slot-hint"></span> */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-1 min-w-[120px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors duration-200 flex items-center gap-2"
            onClick={() => removeSpellFromSlot(contextMenu.slotId)}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Remove Spell
          </button>
        </div>
      )}
    </div>
  );
};
