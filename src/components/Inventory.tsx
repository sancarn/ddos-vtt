import React from 'react';
import { Character, InventoryItem } from '../types';
import { Backpack, Copy, CheckSquare } from 'lucide-react';

interface InventoryProps {
  character: Character;
}

export const Inventory: React.FC<InventoryProps> = ({ character }) => {
  const actionButtons = [
    { id: 'action1', icon: '🟢', label: 'Action I' },
    { id: 'action2', icon: '🟠', label: 'Action II' },
    { id: 'action3', icon: '➕', label: 'Add' },
    { id: 'action4', icon: 'I', label: 'Action I' },
    { id: 'action5', icon: 'II', label: 'Action II' },
  ];

  const renderInventorySlot = (item: InventoryItem | null, index: number) => {
    if (item) {
      return (
        <div key={index} className="aspect-square border border-gray-600 rounded flex flex-col items-center justify-center relative bg-gradient-to-br from-gray-700 to-gray-800">
          <img src={item.icon} alt={item.name} className="w-6 h-6 mb-0.5" />
          {item.quantity > 1 && (
            <span className="absolute top-0.5 right-0.5 bg-game-yellow text-black text-xs font-bold px-1 py-0.5 rounded">
              {item.quantity}
            </span>
          )}
          <span className="text-xs text-gray-300 text-center max-w-full overflow-hidden text-ellipsis">{item.name}</span>
        </div>
      );
    }
    
    return (
      <div key={index} className="aspect-square border border-dashed border-gray-600 bg-transparent rounded flex flex-col items-center justify-center">
        <div />
      </div>
    );
  };

  // Create inventory grid with items and empty slots
  const inventorySlots = [];
  const maxSlots = 24; // 6x4 grid
  
  // Add filled slots
  character.inventory.forEach((item, index) => {
    inventorySlots.push(item);
  });
  
  // Add empty slots
  for (let i = character.inventory.length; i < maxSlots; i++) {
    inventorySlots.push(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        {actionButtons.map((button) => (
          <button key={button.id} className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded text-gray-300 cursor-pointer transition-all duration-200 hover:from-gray-800 hover:to-gray-700 hover:text-game-yellow">
            <span className="text-base">{button.icon}</span>
            <span className="text-xs">{button.label}</span>
          </button>
        ))}
      </div>

      {/* Inventory grid */}
      <div className="grid grid-cols-6 gap-1 max-h-72 overflow-y-auto">
        {inventorySlots.map((item, index) => renderInventorySlot(item, index))}
      </div>

      {/* Utility buttons */}
      <div className="flex flex-col gap-2">
        <button className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded text-gray-300 cursor-pointer transition-all duration-200 hover:from-gray-800 hover:to-gray-700 hover:text-game-yellow">
          <Backpack size={20} />
          <span>Inventory</span>
        </button>
        <button className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded text-gray-300 cursor-pointer transition-all duration-200 hover:from-gray-800 hover:to-gray-700 hover:text-game-yellow">
          <Copy size={20} />
          <span>Copy Identity</span>
        </button>
        <button className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded text-gray-300 cursor-pointer transition-all duration-200 hover:from-gray-800 hover:to-gray-700 hover:text-game-yellow">
          <CheckSquare size={20} />
          <span>Check</span>
        </button>
      </div>
    </div>
  );
};

