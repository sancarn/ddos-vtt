import React from 'react';
import { MapRenderer } from './MapRenderer';
import { CharacterSheet } from './CharacterSheet';
import { Inventory } from './Inventory';
import { useGameStore } from '../store/gameStore';
import { Sword, Users, Settings } from 'lucide-react';

export const GameInterface: React.FC = () => {
  const { 
    characters, 
    selectedCharacter, 
    currentMap, 
    gameState,
    startCombat,
    endCombat,
    nextTurn,
    isDM
  } = useGameStore();

  if (!currentMap) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-game-dark to-game-darker">
        <div className="flex flex-col items-center justify-center h-screen text-center text-gray-400">
          <h2 className="text-2xl text-gray-300 mb-4">No Map Loaded</h2>
          <p>Please load a map to begin the game.</p>
        </div>
      </div>
    );
  }

  const currentCharacter = gameState.initiativeOrder.length > 0 
    ? characters.find(c => c.id === gameState.initiativeOrder[gameState.currentTurn])
    : null;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-game-dark to-game-darker">
      {/* Top toolbar */}
      <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-game-gray to-game-dark border-b-2 border-gray-700 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-game-yellow to-game-orange bg-clip-text text-transparent">
            D&D OS VTT
          </h1>
        </div>
        <div className="flex items-center gap-5">
          {gameState.phase === 'combat' && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm text-game-yellow font-bold">
                Turn: {gameState.currentTurn + 1} / {gameState.initiativeOrder.length}
              </span>
              {currentCharacter && (
                <span className="text-xs text-gray-300">
                  {currentCharacter.name}'s turn
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <button 
            className="px-4 py-2 bg-gradient-to-r from-game-yellow to-game-orange text-black rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-game-orange hover:to-game-yellow hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-300/30"
            onClick={gameState.phase === 'combat' ? endCombat : startCombat}
          >
            <Sword size={16} />
            {gameState.phase === 'combat' ? 'End Combat' : 'Start Combat'}
          </button>
          {gameState.phase === 'combat' && (
            <button 
              className="px-4 py-2 bg-gradient-to-r from-game-blue to-blue-600 text-white rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:from-blue-600 hover:to-game-blue hover:-translate-y-0.5"
              onClick={nextTurn}
            >
              Next Turn
            </button>
          )}
          <button className="px-4 py-2 bg-transparent text-gray-300 border border-gray-600 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:bg-gray-700 hover:text-white">
            <Users size={16} />
            Players
          </button>
          <button className="px-4 py-2 bg-transparent text-gray-300 border border-gray-600 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center gap-1.5 hover:bg-gray-700 hover:text-white">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Main game area */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Left sidebar - Character sheet */}
        <div className="w-80 bg-gradient-to-b from-game-gray to-game-dark border-r-2 border-gray-700 overflow-y-auto p-5">
          {selectedCharacter ? (
            <CharacterSheet character={selectedCharacter} />
          ) : (
            <div className="text-center py-10 px-5 text-gray-400">
              <h3 className="text-gray-300 mb-2">No Character Selected</h3>
              <p>Click on a character token to view their sheet.</p>
            </div>
          )}
        </div>

        {/* Center - Map */}
        <div className="flex-1 flex justify-center items-center p-5 bg-game-darker">
          <MapRenderer 
            map={currentMap}
            width={800}
            height={600}
          />
        </div>

        {/* Right sidebar - Inventory */}
        <div className="w-80 bg-gradient-to-b from-game-gray to-game-dark border-l-2 border-gray-700 overflow-y-auto p-5">
          {selectedCharacter ? (
            <Inventory character={selectedCharacter} />
          ) : (
            <div className="text-center py-10 px-5 text-gray-400">
              <h3 className="text-gray-300 mb-2">Inventory</h3>
              <p>Select a character to view their inventory.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex justify-between items-center px-5 py-2 bg-gradient-to-r from-game-gray to-game-dark border-t-2 border-gray-700 text-xs text-gray-400">
        <div className="flex gap-4 items-center">
          <span>Phase: {gameState.phase}</span>
          <span>Characters: {characters.length}</span>
          {isDM && <span className="bg-game-yellow text-black px-1.5 py-0.5 rounded text-xs font-bold">DM Mode</span>}
        </div>
        <div className="flex gap-4 items-center">
          <span>Map: {currentMap.name}</span>
        </div>
      </div>
    </div>
  );
};

