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
        <div key={index} className="inventory-slot filled">
          <img src={item.icon} alt={item.name} className="item-icon" />
          {item.quantity > 1 && (
            <span className="item-quantity">{item.quantity}</span>
          )}
          <span className="item-name">{item.name}</span>
        </div>
      );
    }
    
    return (
      <div key={index} className="inventory-slot empty">
        <div className="slot-placeholder" />
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
    <div className="inventory-panel">
      {/* Action buttons */}
      <div className="action-buttons-row">
        {actionButtons.map((button) => (
          <button key={button.id} className="action-button">
            <span className="action-icon">{button.icon}</span>
            <span className="action-label">{button.label}</span>
          </button>
        ))}
      </div>

      {/* Inventory grid */}
      <div className="inventory-grid">
        {inventorySlots.map((item, index) => renderInventorySlot(item, index))}
      </div>

      {/* Utility buttons */}
      <div className="utility-buttons">
        <button className="utility-button">
          <Backpack size={20} />
          <span>Inventory</span>
        </button>
        <button className="utility-button">
          <Copy size={20} />
          <span>Copy Identity</span>
        </button>
        <button className="utility-button">
          <CheckSquare size={20} />
          <span>Check</span>
        </button>
      </div>
    </div>
  );
};

