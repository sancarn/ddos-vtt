import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface Blob {
  id: string;
  x: number;
  y: number;
  isPlayer: boolean;
  health: number;
  maxHealth: number;
  color: string;
  speed: number;
  controller: string; // 'P1', 'P2', 'DM' for enemies
  name: string;
}

interface GridPosition {
  x: number;
  y: number;
}

interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start to current node
  h: number; // Heuristic (estimated cost from current to end)
  f: number; // Total cost (g + h)
  parent?: PathNode;
}

export const SimplePlayerInterface: React.FC = () => {
  const { takeDamage } = useGameStore();
  
  // Current player ID (in real app, this would come from networking)
  const currentPlayerId = 'P1';
  
  const [blobs, setBlobs] = useState<Blob[]>([
    // P1's tokens (you control these)
    { id: 'player1', x: 100, y: 100, isPlayer: true, health: 20, maxHealth: 20, color: '#4CAF50', speed: 6, controller: 'P1', name: 'Fighter' },
    { id: 'player2', x: 150, y: 100, isPlayer: true, health: 18, maxHealth: 18, color: '#4CAF50', speed: 5, controller: 'P1', name: 'Ranger' },
    
    // P2's tokens (friend would control these)
    { id: 'player3', x: 200, y: 100, isPlayer: true, health: 16, maxHealth: 16, color: '#2196F3', speed: 4, controller: 'P2', name: 'Wizard' },
    { id: 'player4', x: 250, y: 100, isPlayer: true, health: 22, maxHealth: 22, color: '#2196F3', speed: 6, controller: 'P2', name: 'Cleric' },
    
    // Enemy tokens (no one controls these)
    { id: 'enemy1', x: 300, y: 100, isPlayer: false, health: 15, maxHealth: 15, color: '#F44336', speed: 4, controller: 'DM', name: 'Orc' },
    { id: 'enemy2', x: 500, y: 100, isPlayer: false, health: 15, maxHealth: 15, color: '#F44336', speed: 4, controller: 'DM', name: 'Goblin' },
    { id: 'enemy3', x: 300, y: 300, isPlayer: false, health: 15, maxHealth: 15, color: '#F44336', speed: 4, controller: 'DM', name: 'Troll' },
    { id: 'enemy4', x: 500, y: 300, isPlayer: false, health: 15, maxHealth: 15, color: '#F44336', speed: 4, controller: 'DM', name: 'Dragon' },
  ]);

  const [selectedBlob, setSelectedBlob] = useState<string>('player1');
  const [hoverPath, setHoverPath] = useState<GridPosition[]>([]);
  const [mousePosition, setMousePosition] = useState<GridPosition>({ x: 0, y: 0 });
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const battlefieldRef = useRef<HTMLDivElement>(null);

  const GRID_SIZE = 50;
  const GRID_WIDTH = 24; // 24 squares across
  const GRID_HEIGHT = 12; // 12 squares height

  // Convert pixel coordinates to grid coordinates
  const pixelToGrid = (pixelX: number, pixelY: number): GridPosition => {
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const relativeX = pixelX - rect.left;
    const relativeY = pixelY - rect.top;
    
    return {
      x: Math.floor(relativeX / GRID_SIZE),
      y: Math.floor(relativeY / GRID_SIZE)
    };
  };

  // Convert grid coordinates to pixel coordinates (center of grid cell)
  const gridToPixel = (gridX: number, gridY: number): GridPosition => {
    return {
      x: gridX * GRID_SIZE + GRID_SIZE / 2,
      y: gridY * GRID_SIZE + GRID_SIZE / 2
    };
  };

  // Get current selected blob data
  const selectedBlobData = blobs.find(b => b.id === selectedBlob);

  // Check if current player can control the selected blob
  const canControlBlob = (blob: Blob) => {
    return blob.controller === currentPlayerId;
  };

  // A* pathfinding algorithm
  const findPath = (start: GridPosition, end: GridPosition, maxDistance: number): GridPosition[] => {
    if (start.x === end.x && start.y === end.y) return [];

    const openSet: PathNode[] = [{ x: start.x, y: start.y, g: 0, h: 0, f: 0 }];
    const closedSet = new Set<string>();
    const cameFrom = new Map<string, PathNode>();

    while (openSet.length > 0) {
      // Find node with lowest f cost
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const currentKey = `${current.x},${current.y}`;

      if (current.x === end.x && current.y === end.y) {
        // Reconstruct path
        const path: GridPosition[] = [];
        let node: PathNode | undefined = current;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = cameFrom.get(`${node.x},${node.y}`);
        }
        return path;
      }

      closedSet.add(currentKey);

      // Check all 8 adjacent cells (including diagonals)
      const directions = [
        { dx: -1, dy: -1, cost: 1.4 }, // Diagonal
        { dx: 0, dy: -1, cost: 1 },    // Up
        { dx: 1, dy: -1, cost: 1.4 },  // Diagonal
        { dx: -1, dy: 0, cost: 1 },    // Left
        { dx: 1, dy: 0, cost: 1 },     // Right
        { dx: -1, dy: 1, cost: 1.4 },  // Diagonal
        { dx: 0, dy: 1, cost: 1 },     // Down
        { dx: 1, dy: 1, cost: 1.4 },   // Diagonal
      ];

      for (const dir of directions) {
        const neighborX = current.x + dir.dx;
        const neighborY = current.y + dir.dy;
        const neighborKey = `${neighborX},${neighborY}`;

        // Check bounds
        if (neighborX < 0 || neighborX >= GRID_WIDTH || neighborY < 0 || neighborY >= GRID_HEIGHT) {
          continue;
        }

        // Check if already evaluated
        if (closedSet.has(neighborKey)) {
          continue;
        }

        // Check if blob is blocking this position
        const pixelPos = gridToPixel(neighborX, neighborY);
        const blockingBlob = blobs.find(blob => 
          Math.abs(blob.x - pixelPos.x) < 30 && Math.abs(blob.y - pixelPos.y) < 30
        );
        if (blockingBlob && blockingBlob.id !== selectedBlob) {
          continue;
        }

        const tentativeG = current.g + dir.cost;

        // Check if this path is better than any previous one
        const existingNode = openSet.find(n => n.x === neighborX && n.y === neighborY);
        if (!existingNode) {
          const h = Math.sqrt((end.x - neighborX) ** 2 + (end.y - neighborY) ** 2);
          const f = tentativeG + h;
          
          // Only add if within movement range
          if (tentativeG <= maxDistance) {
            const neighbor: PathNode = { x: neighborX, y: neighborY, g: tentativeG, h, f };
            openSet.push(neighbor);
            cameFrom.set(neighborKey, current);
          }
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = tentativeG + existingNode.h;
          cameFrom.set(neighborKey, current);
        }
      }
    }

    return []; // No path found
  };

  // Handle mouse move to update hover path
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedBlobData || !canControlBlob(selectedBlobData)) return;

    const gridPos = pixelToGrid(e.clientX, e.clientY);
    setMousePosition(gridPos);

    // Get selected blob's current grid position
    const blobPixelPos = { x: selectedBlobData.x, y: selectedBlobData.y };
    const blobGridPos = pixelToGrid(
      battlefieldRef.current!.getBoundingClientRect().left + blobPixelPos.x,
      battlefieldRef.current!.getBoundingClientRect().top + blobPixelPos.y
    );

    // Find path to hover position
    const path = findPath(blobGridPos, gridPos, selectedBlobData.speed);
    setHoverPath(path);
  };

  // Handle right click to move
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedBlobData || !canControlBlob(selectedBlobData)) return;

    const gridPos = pixelToGrid(e.clientX, e.clientY);
    const blobPixelPos = { x: selectedBlobData.x, y: selectedBlobData.y };
    const blobGridPos = pixelToGrid(
      battlefieldRef.current!.getBoundingClientRect().left + blobPixelPos.x,
      battlefieldRef.current!.getBoundingClientRect().top + blobPixelPos.y
    );

    const path = findPath(blobGridPos, gridPos, selectedBlobData.speed);
    
    if (path.length > 0) {
      // Move to the last position in the path
      const targetPixelPos = gridToPixel(path[path.length - 1].x, path[path.length - 1].y);
      
      setBlobs(prev => prev.map(blob => 
        blob.id === selectedBlob 
          ? { ...blob, x: targetPixelPos.x, y: targetPixelPos.y }
          : blob
      ));
    }
  };

  const moveBlob = (id: string, dx: number, dy: number) => {
    setBlobs(prev => prev.map(blob => 
      blob.id === id 
        ? { ...blob, x: Math.max(50, Math.min(1150, blob.x + dx)), y: Math.max(50, Math.min(550, blob.y + dy)) }
        : blob
    ));
  };

  const damagePlayer = () => {
    setBlobs(prev => prev.map(blob => 
      blob.controller === currentPlayerId 
        ? { ...blob, health: Math.max(0, blob.health - 5) }
        : blob
    ));
  };

  const healPlayer = () => {
    setBlobs(prev => prev.map(blob => 
      blob.controller === currentPlayerId 
        ? { ...blob, health: Math.min(blob.maxHealth, blob.health + 5) }
        : blob
    ));
  };

  // Get all blobs controlled by current player
  const myBlobs = blobs.filter(b => b.controller === currentPlayerId);
  const otherPlayerBlobs = blobs.filter(b => b.controller === 'P2');
  const enemyBlobs = blobs.filter(b => b.controller === 'DM');

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-dark to-game-darker text-white">
      {/* Game Header */}
      <div className="bg-game-gray border-b-2 border-game-gold p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-game-gold">Simple VTT - Player View (P1)</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-green-600 rounded">My Tokens: {myBlobs.length}</span>
            <span className="px-2 py-1 bg-blue-600 rounded">Other Players: {otherPlayerBlobs.length}</span>
            <span className="px-2 py-1 bg-red-600 rounded">Enemies: {enemyBlobs.length}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={damagePlayer} 
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
            >
              Damage My Tokens (-5)
            </button>
            <button 
              onClick={healPlayer} 
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
            >
              Heal My Tokens (+5)
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHelpModal(true)} 
              className="w-10 h-10 rounded-full border border-game-gold text-game-gold hover:bg-game-gold hover:text-black transition-colors flex items-center justify-center text-xl"
              title="Help"
            >
              ❓
            </button>
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)} 
              className="w-10 h-10 rounded-full border border-game-gold text-game-gold hover:bg-game-gold hover:text-black transition-colors flex items-center justify-center text-xl"
              title="Toggle Debug Info"
            >
              🐛
            </button>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-7xl mx-auto p-4">
        <div 
          className="relative w-[1200px] h-[600px] bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-game-gold rounded-lg overflow-hidden cursor-crosshair"
          style={{
            position: 'relative',
            width: '1200px',
            height: '600px',
            background: 'linear-gradient(to bottom right, #374151, #111827)',
            border: '2px solid #d4af37',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'crosshair'
          }}
          ref={battlefieldRef}
          onMouseMove={handleMouseMove}
          onContextMenu={handleRightClick}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: GRID_WIDTH + 1 }, (_, x) => (
              <div
                key={`v-${x}`}
                className="absolute top-0 bottom-0 w-px bg-game-gold opacity-30"
                style={{ 
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: '#d4af37',
                  opacity: 0.3,
                  left: `${x * GRID_SIZE}px` 
                }}
              />
            ))}
            {Array.from({ length: GRID_HEIGHT + 1 }, (_, y) => (
              <div
                key={`h-${y}`}
                className="absolute left-0 right-0 h-px bg-game-gold opacity-30"
                style={{ 
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: '#d4af37',
                  opacity: 0.3,
                  top: `${y * GRID_SIZE}px` 
                }}
              />
            ))}
          </div>

          {/* Hover path */}
          {hoverPath.length > 0 && selectedBlobData && canControlBlob(selectedBlobData) && (
            <div className="absolute inset-0 pointer-events-none" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {hoverPath.map((pos, index) => {
                const pixelPos = gridToPixel(pos.x, pos.y);
                return (
                  <div
                    key={`path-${index}`}
                    className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-pulse-slow"
                    style={{
                      position: 'absolute',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#fbbf24',
                      borderRadius: '50%',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      left: `${pixelPos.x - 6}px`,
                      top: `${pixelPos.y - 6}px`,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Debug Info Overlay */}
          {showDebugInfo && (
            <div className="absolute top-4 right-4 z-10" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
              <div className="bg-black/90 border border-game-gold rounded-lg p-4 text-xs text-gray-300 max-w-xs backdrop-blur-sm"
                   style={{
                     backgroundColor: 'rgba(0, 0, 0, 0.9)',
                     border: '1px solid #d4af37',
                     borderRadius: '8px',
                     padding: '16px',
                     fontSize: '12px',
                     color: '#d1d5db',
                     maxWidth: '300px',
                     backdropFilter: 'blur(4px)'
                   }}>
                <h4 className="text-game-gold font-semibold mb-2" style={{ color: '#d4af37', fontWeight: 600, marginBottom: '8px' }}>Debug Information</h4>
                <p><strong>Selected:</strong> {selectedBlobData?.name || 'None'}</p>
                <p><strong>Controller:</strong> {selectedBlobData?.controller || 'None'}</p>
                <p><strong>Can Control:</strong> {selectedBlobData && canControlBlob(selectedBlobData) ? 'Yes' : 'No'}</p>
                <p><strong>Speed:</strong> {selectedBlobData?.speed || 0}</p>
                <p><strong>Mouse Position:</strong> ({mousePosition.x}, {mousePosition.y})</p>
                <p><strong>Path Length:</strong> {hoverPath.length}</p>
                <p><strong>My Tokens:</strong> {myBlobs.map(b => b.name).join(', ')}</p>
                <p><strong>Other Player:</strong> {otherPlayerBlobs.map(b => b.name).join(', ')}</p>
                <p><strong>Enemies:</strong> {enemyBlobs.map(b => b.name).join(', ')}</p>
              </div>
            </div>
          )}

          {/* Blobs */}
          {blobs.map(blob => (
            <div
              key={blob.id}
              className={`absolute w-16 h-16 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                selectedBlob === blob.id 
                  ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 scale-110' 
                  : 'border-white/50'
              } ${canControlBlob(blob) ? 'hover:scale-105' : 'opacity-70'}`}
              style={{
                position: 'absolute',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: selectedBlob === blob.id ? '2px solid #fbbf24' : '2px solid rgba(255, 255, 255, 0.5)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                left: `${blob.x - 32}px`,
                top: `${blob.y - 32}px`,
                backgroundColor: blob.color,
                transform: selectedBlob === blob.id ? 'scale(1.1)' : 'scale(1)',
                boxShadow: selectedBlob === blob.id ? '0 10px 25px rgba(251, 191, 36, 0.5)' : 'none',
                opacity: canControlBlob(blob) ? 1 : 0.7
              }}
              onClick={() => setSelectedBlob(blob.id)}
            >
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-xs font-bold text-white"
                   style={{
                     position: 'absolute',
                     top: '-8px',
                     right: '-8px',
                     width: '24px',
                     height: '24px',
                     backgroundColor: 'rgba(0, 0, 0, 0.8)',
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '12px',
                     fontWeight: 'bold',
                     color: 'white'
                   }}>
                {blob.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -left-2 px-1 py-0.5 bg-black/80 rounded text-xs font-bold text-white"
                   style={{
                     position: 'absolute',
                     bottom: '-8px',
                     left: '-8px',
                     padding: '2px 4px',
                     backgroundColor: 'rgba(0, 0, 0, 0.8)',
                     borderRadius: '4px',
                     fontSize: '12px',
                     fontWeight: 'bold',
                     color: 'white'
                   }}>
                {blob.controller}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 rounded-b-full overflow-hidden"
                   style={{
                     position: 'absolute',
                     bottom: 0,
                     left: 0,
                     right: 0,
                     height: '4px',
                     backgroundColor: 'rgba(0, 0, 0, 0.5)',
                     borderBottomLeftRadius: '32px',
                     borderBottomRightRadius: '32px',
                     overflow: 'hidden'
                   }}>
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ 
                    height: '100%',
                    backgroundColor: '#10b981',
                    transition: 'all 0.3s ease',
                    width: `${(blob.health / blob.maxHealth) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" 
             style={{
               position: 'fixed',
               inset: 0,
               backgroundColor: 'rgba(0, 0, 0, 0.8)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 50
             }}
             onClick={() => setShowHelpModal(false)}>
          <div className="bg-gradient-to-br from-game-gray to-game-dark border-2 border-game-gold rounded-lg w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl" 
               style={{
                 background: 'linear-gradient(to bottom right, #2a2a2a, #1a1a1a)',
                 border: '2px solid #d4af37',
                 borderRadius: '8px',
                 width: '500px',
                 maxWidth: '90vw',
                 maxHeight: '80vh',
                 overflowY: 'auto',
                 boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
               }}
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-game-light-gray"
                 style={{
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center',
                   padding: '16px',
                   borderBottom: '1px solid #444'
                 }}>
              <h3 className="text-xl font-bold text-game-gold" 
                  style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#d4af37',
                    margin: 0
                  }}>
                How to Play
              </h3>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full hover:bg-game-light-gray transition-colors flex items-center justify-center text-2xl text-gray-400 hover:text-white"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#444';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}>
                ×
              </button>
            </div>
            <div className="p-4 text-gray-300"
                 style={{
                   padding: '16px',
                   color: '#d1d5db'
                 }}>
              <h4 className="text-game-gold font-semibold mt-4 mb-2" 
                  style={{ 
                    color: '#d4af37', 
                    fontWeight: 600, 
                    marginTop: '16px', 
                    marginBottom: '8px',
                    fontSize: '16px'
                  }}>
                Movement Controls
              </h4>
              <ul className="list-disc list-inside space-y-1 mb-4"
                  style={{
                    listStyleType: 'disc',
                    listStylePosition: 'inside',
                    margin: '0 0 16px 0',
                    paddingLeft: '0'
                  }}>
                <li style={{ margin: '4px 0' }}>Click on your tokens (green ones) to select them</li>
                <li style={{ margin: '4px 0' }}>Hover your mouse to see the path</li>
                <li style={{ margin: '4px 0' }}>Right-click to move to that location</li>
                <li style={{ margin: '4px 0' }}>You can only control tokens assigned to P1</li>
                <li style={{ margin: '4px 0' }}>Movement follows the grid and respects speed</li>
              </ul>
              
              <h4 className="text-game-gold font-semibold mt-4 mb-2" 
                  style={{ 
                    color: '#d4af37', 
                    fontWeight: 600, 
                    marginTop: '16px', 
                    marginBottom: '8px',
                    fontSize: '16px'
                  }}>
                Token Types
              </h4>
              <ul className="list-disc list-inside space-y-1 mb-4"
                  style={{
                    listStyleType: 'disc',
                    listStylePosition: 'inside',
                    margin: '0 0 16px 0',
                    paddingLeft: '0'
                  }}>
                <li style={{ margin: '4px 0' }}><strong>Green Tokens:</strong> Your characters (P1)</li>
                <li style={{ margin: '4px 0' }}><strong>Blue Tokens:</strong> Other player's characters (P2)</li>
                <li style={{ margin: '4px 0' }}><strong>Red Tokens:</strong> Enemies (DM controlled)</li>
              </ul>
              
              <h4 className="text-game-gold font-semibold mt-4 mb-2" 
                  style={{ 
                    color: '#d4af37', 
                    fontWeight: 600, 
                    marginTop: '16px', 
                    marginBottom: '8px',
                    fontSize: '16px'
                  }}>
                Grid System
              </h4>
              <ul className="list-disc list-inside space-y-1"
                  style={{
                    listStyleType: 'disc',
                    listStylePosition: 'inside',
                    margin: '0',
                    paddingLeft: '0'
                  }}>
                <li style={{ margin: '4px 0' }}>24×12 grid (1200×600 pixels)</li>
                <li style={{ margin: '4px 0' }}>50px per grid square</li>
                <li style={{ margin: '4px 0' }}>Diagonal movement allowed</li>
                <li style={{ margin: '4px 0' }}>Pathfinding avoids obstacles</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Character Bar */}
      <div className="bg-gradient-to-r from-game-gray to-game-dark border-t-2 border-game-gold p-4"
           style={{
             background: 'linear-gradient(to right, #2a2a2a, #1a1a1a)',
             borderTop: '2px solid #d4af37',
             padding: '16px'
           }}>
        <div className="max-w-7xl mx-auto flex items-center gap-6"
             style={{
               maxWidth: '1400px',
               margin: '0 auto',
               display: 'flex',
               alignItems: 'center',
               gap: '24px'
             }}>
          {/* Character Portrait */}
          <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full border-2 border-game-gold flex items-center justify-center text-2xl font-bold text-game-gold"
               style={{
                 width: '64px',
                 height: '64px',
                 background: 'linear-gradient(to bottom right, #4b5563, #374151)',
                 borderRadius: '50%',
                 border: '2px solid #d4af37',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: '24px',
                 fontWeight: 'bold',
                 color: '#d4af37'
               }}>
            P
          </div>
          
          {/* Status Effects */}
          <div className="flex-1" style={{ flex: 1 }}>
            <h4 className="text-game-gold font-semibold mb-2" 
                style={{ color: '#d4af37', fontWeight: 600, marginBottom: '8px' }}>
              Status Effects
            </h4>
            <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
              <span className="px-2 py-1 bg-green-600/20 border border-green-500 rounded text-green-300 text-sm"
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid #10b981',
                      borderRadius: '4px',
                      color: '#6ee7b7',
                      fontSize: '14px'
                    }}>
                Blessed
              </span>
              <span className="px-2 py-1 bg-blue-600/20 border border-blue-500 rounded text-blue-300 text-sm"
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid #3b82f6',
                      borderRadius: '4px',
                      color: '#93c5fd',
                      fontSize: '14px'
                    }}>
                Haste
              </span>
            </div>
          </div>
          
          {/* Health and Resources */}
          <div className="flex-1 space-y-2" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <h4 className="text-game-gold font-semibold mb-1" 
                  style={{ color: '#d4af37', fontWeight: 600, marginBottom: '4px' }}>
                Health
              </h4>
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden"
                   style={{
                     width: '100%',
                     height: '16px',
                     backgroundColor: '#374151',
                     borderRadius: '8px',
                     overflow: 'hidden'
                   }}>
                <div className="h-full bg-red-500 transition-all duration-300" 
                     style={{ 
                       height: '100%',
                       backgroundColor: '#ef4444',
                       transition: 'all 0.3s ease',
                       width: '75%' 
                     }}></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-game-gold font-semibold mb-1" 
                  style={{ color: '#d4af37', fontWeight: 600, marginBottom: '4px' }}>
                Resources
              </h4>
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden"
                   style={{
                     width: '100%',
                     height: '16px',
                     backgroundColor: '#374151',
                     borderRadius: '8px',
                     overflow: 'hidden'
                   }}>
                <div className="h-full bg-blue-500 transition-all duration-300" 
                     style={{ 
                       height: '100%',
                       backgroundColor: '#3b82f6',
                       transition: 'all 0.3s ease',
                       width: '60%' 
                     }}></div>
              </div>
            </div>
          </div>
          
          {/* Spell Slots */}
          <div className="flex-1" style={{ flex: 1 }}>
            <h4 className="text-game-gold font-semibold mb-2" 
                style={{ color: '#d4af37', fontWeight: 600, marginBottom: '8px' }}>
              Spells
            </h4>
            <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm font-bold"
                   style={{
                     width: '32px',
                     height: '32px',
                     backgroundColor: '#2563eb',
                     borderRadius: '4px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     color: 'white'
                   }}>
                1
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm font-bold"
                   style={{
                     width: '32px',
                     height: '32px',
                     backgroundColor: '#2563eb',
                     borderRadius: '4px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     color: 'white'
                   }}>
                2
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm font-bold"
                   style={{
                     width: '32px',
                     height: '32px',
                     backgroundColor: '#2563eb',
                     borderRadius: '4px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     color: 'white'
                   }}>
                3
              </div>
              <div className="w-8 h-8 bg-gray-700 border border-gray-600 rounded flex items-center justify-center text-sm font-bold text-gray-400"
                   style={{
                     width: '32px',
                     height: '32px',
                     backgroundColor: '#374151',
                     border: '1px solid #4b5563',
                     borderRadius: '4px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     color: '#9ca3af'
                   }}>
                4
              </div>
            </div>
          </div>
          
          {/* Inventory Button */}
          <div>
            <button className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border border-game-gold rounded-lg transition-all duration-200 flex items-center gap-2"
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(to right, #374151, #1f2937)',
                      border: '1px solid #d4af37',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #4b5563, #374151)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #374151, #1f2937)';
                    }}>
              <span className="text-xl" style={{ fontSize: '20px' }}>🎒</span>
              <span className="font-semibold" style={{ fontWeight: 600 }}>Inventory</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
