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
      <div className="game-interface">
        <div className="no-map-message">
          <h2>No Map Loaded</h2>
          <p>Please load a map to begin the game.</p>
        </div>
      </div>
    );
  }

  const currentCharacter = gameState.initiativeOrder.length > 0 
    ? characters.find(c => c.id === gameState.initiativeOrder[gameState.currentTurn])
    : null;

  return (
    <div className="game-interface">
      {/* Top toolbar */}
      <div className="top-toolbar">
        <div className="toolbar-left">
          <h1>D&D OS VTT</h1>
        </div>
        <div className="toolbar-center">
          {gameState.phase === 'combat' && (
            <div className="combat-info">
              <span className="turn-indicator">
                Turn: {gameState.currentTurn + 1} / {gameState.initiativeOrder.length}
              </span>
              {currentCharacter && (
                <span className="current-character">
                  {currentCharacter.name}'s turn
                </span>
              )}
            </div>
          )}
        </div>
        <div className="toolbar-right">
          <button 
            className="btn btn-primary"
            onClick={gameState.phase === 'combat' ? endCombat : startCombat}
          >
            <Sword size={16} />
            {gameState.phase === 'combat' ? 'End Combat' : 'Start Combat'}
          </button>
          {gameState.phase === 'combat' && (
            <button className="btn btn-secondary" onClick={nextTurn}>
              Next Turn
            </button>
          )}
          <button className="btn btn-outline">
            <Users size={16} />
            Players
          </button>
          <button className="btn btn-outline">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Main game area */}
      <div className="game-main">
        {/* Left sidebar - Character sheet */}
        <div className="left-sidebar">
          {selectedCharacter ? (
            <CharacterSheet character={selectedCharacter} />
          ) : (
            <div className="no-character-selected">
              <h3>No Character Selected</h3>
              <p>Click on a character token to view their sheet.</p>
            </div>
          )}
        </div>

        {/* Center - Map */}
        <div className="map-container">
          <MapRenderer 
            map={currentMap}
            width={800}
            height={600}
          />
        </div>

        {/* Right sidebar - Inventory */}
        <div className="right-sidebar">
          {selectedCharacter ? (
            <Inventory character={selectedCharacter} />
          ) : (
            <div className="no-character-selected">
              <h3>Inventory</h3>
              <p>Select a character to view their inventory.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="bottom-status">
        <div className="status-left">
          <span>Phase: {gameState.phase}</span>
          <span>Characters: {characters.length}</span>
          {isDM && <span className="dm-badge">DM Mode</span>}
        </div>
        <div className="status-right">
          <span>Map: {currentMap.name}</span>
        </div>
      </div>
    </div>
  );
};

