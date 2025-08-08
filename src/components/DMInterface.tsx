import React from 'react';
import { GameInterface } from './GameInterface';
import { useGameStore } from '../store/gameStore';
import { Shield, Users, Settings, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export const DMInterface: React.FC = () => {
  const { 
    characters, 
    addCharacter, 
    removeCharacter,
    setIsDM,
    gameState,
    startCombat,
    endCombat,
    nextTurn
  } = useGameStore();

  React.useEffect(() => {
    setIsDM(true);
  }, [setIsDM]);

  const handleAddCharacter = () => {
    const newCharacter = {
      id: `npc-${Date.now()}`,
      name: `NPC ${characters.length + 1}`,
      portrait: `https://via.placeholder.com/64x64/666666/FFFFFF?text=N`,
      health: { current: 20, max: 20 },
      attributes: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
      skills: [],
      inventory: [],
      statusEffects: [],
      position: { x: 400, y: 300 },
      isPlayer: false,
      initiative: 10,
    };
    addCharacter(newCharacter);
  };

  return (
    <div className="dm-interface">
      {/* DM Toolbar */}
      <div className="dm-toolbar">
        <div className="dm-toolbar-left">
          <h2>DM Controls</h2>
        </div>
        <div className="dm-toolbar-center">
          <button className="btn btn-primary" onClick={handleAddCharacter}>
            <Plus size={16} />
            Add NPC
          </button>
          <button className="btn btn-secondary">
            <Shield size={16} />
            Fog of War
          </button>
          <button className="btn btn-outline">
            <Users size={16} />
            Manage Players
          </button>
        </div>
        <div className="dm-toolbar-right">
          <button className="btn btn-outline">
            <Settings size={16} />
            DM Settings
          </button>
        </div>
      </div>

      {/* Character Management Panel */}
      <div className="dm-character-panel">
        <h3>Characters</h3>
        <div className="character-list">
          {characters.map((character) => (
            <div key={character.id} className="character-item">
              <img 
                src={character.portrait} 
                alt={character.name}
                className="character-avatar"
              />
              <div className="character-details">
                <span className="character-name">{character.name}</span>
                <span className="character-type">
                  {character.isPlayer ? 'Player' : 'NPC'}
                </span>
                <span className="character-health">
                  HP: {character.health.current}/{character.health.max}
                </span>
              </div>
              <div className="character-actions">
                <button className="btn btn-small">
                  <Eye size={12} />
                </button>
                <button className="btn btn-small">
                  <EyeOff size={12} />
                </button>
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => removeCharacter(character.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="dm-game-area">
        <GameInterface />
      </div>
    </div>
  );
};

