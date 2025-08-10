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
    <div className="flex flex-col h-screen">
      {/* DM Toolbar */}
      <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-game-dark to-game-darker border-b-2 border-gray-700">
        <div>
          <h2 className="text-game-yellow text-xl">DM Controls</h2>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            className="px-4 py-2 bg-gradient-to-r from-game-yellow to-game-orange text-black rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-game-orange hover:to-game-yellow hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-300/30"
            onClick={handleAddCharacter}
          >
            <Plus size={16} />
            Add NPC
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-game-blue to-blue-600 text-white rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-blue-600 hover:to-game-blue hover:-translate-y-0.5">
            <Shield size={16} />
            Fog of War
          </button>
          <button className="px-4 py-2 bg-transparent text-gray-300 border border-gray-600 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:bg-gray-700 hover:text-white">
            <Users size={16} />
            Manage Players
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <button className="px-4 py-2 bg-transparent text-gray-300 border border-gray-600 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:bg-gray-700 hover:text-white">
            <Settings size={16} />
            DM Settings
          </button>
        </div>
      </div>

      {/* Character Management Panel */}
      <div className="w-80 bg-gradient-to-b from-game-gray to-game-dark border-r-2 border-gray-700 p-5 overflow-y-auto">
        <h3 className="text-game-yellow mb-4 border-b border-gray-600 pb-2">Characters</h3>
        <div className="flex flex-col gap-3">
          {characters.map((character) => (
            <div key={character.id} className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 rounded-md">
              <img 
                src={character.portrait} 
                alt={character.name}
                className="w-10 h-10 rounded-full border-2 border-gray-500"
              />
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="font-bold text-gray-300 text-sm">{character.name}</span>
                <span className="text-xs text-gray-400">
                  {character.isPlayer ? 'Player' : 'NPC'}
                </span>
                <span className="text-xs text-game-red">
                  HP: {character.health.current}/{character.health.max}
                </span>
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 bg-gradient-to-r from-game-yellow to-game-orange text-black rounded text-xs font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-game-orange hover:to-game-yellow hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-300/30">
                  <Eye size={12} />
                </button>
                <button className="px-2 py-1 bg-gradient-to-r from-game-yellow to-game-orange text-black rounded text-xs font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-game-orange hover:to-game-yellow hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-300/30">
                  <EyeOff size={12} />
                </button>
                <button 
                  className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded text-xs font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-red-600 hover:to-red-500 hover:-translate-y-0.5"
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
      <div className="flex-1 flex">
        <GameInterface />
      </div>
    </div>
  );
};

