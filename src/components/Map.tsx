import React, { useRef, useEffect, useState, useCallback } from 'react';

interface GridPosition {
  x: number;
  y: number;
}

interface Blob {
  id: string;
  x: number;
  y: number;
  isPlayer: boolean;
  health: number;
  maxHealth: number;
  color: string;
  speed: number;
  controller: string;
  name: string;
}

interface MapProps {
  blobs: Blob[];
  selectedBlob: string;
  hoverPath: GridPosition[];
  onBlobSelect: (id: string) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onRightClick: (e: React.MouseEvent) => void;
  canControlBlob: (blob: Blob) => boolean;
  // New props for character movement
  characterData?: {
    speed: {
      getCurrent: () => number;
      setCurrent: (i: number) => void;
    };
  };
  isTurn?: boolean;
  onMoveBlob?: (blobId: string, newGridPos: GridPosition) => void;
}

const GRID_SIZE = 50;
const GRID_WIDTH = 24;
const GRID_HEIGHT = 12;

export const Map: React.FC<MapProps> = ({
  blobs,
  selectedBlob,
  hoverPath,
  onBlobSelect,
  onMouseMove,
  onRightClick,
  canControlBlob,
  characterData,
  isTurn = false,
  onMoveBlob
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapTransform, setMapTransform] = useState({ offsetX: 0, offsetY: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [mouseGridPosition, setMouseGridPosition] = useState<GridPosition | null>(null);
  const [movementPath, setMovementPath] = useState<GridPosition[]>([]);

  // Convert screen coordinates to grid coordinates
  const screenToGrid = useCallback((screenX: number, screenY: number): GridPosition => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    // Apply inverse transform
    const worldX = (screenX - rect.left - mapTransform.offsetX) / mapTransform.scale;
    const worldY = (screenY - rect.top - mapTransform.offsetY) / mapTransform.scale;

    return {
      x: Math.floor(worldX / GRID_SIZE),
      y: Math.floor(worldY / GRID_SIZE)
    };
  }, [mapTransform]);

  // Convert grid coordinates to screen coordinates
  const gridToScreen = useCallback((gridX: number, gridY: number): { x: number, y: number } => {
    const worldX = gridX * GRID_SIZE + GRID_SIZE / 2;
    const worldY = gridY * GRID_SIZE + GRID_SIZE / 2;

    return {
      x: worldX * mapTransform.scale + mapTransform.offsetX,
      y: worldY * mapTransform.scale + mapTransform.offsetY
    };
  }, [mapTransform]);

  // Convert grid coordinates to world pixel coordinates
  const gridToWorld = useCallback((gridX: number, gridY: number): { x: number, y: number } => {
    return {
      x: gridX * GRID_SIZE + GRID_SIZE / 2,
      y: gridY * GRID_SIZE + GRID_SIZE / 2
    };
  }, []);

  // Convert world pixel coordinates to grid coordinates
  const worldToGrid = useCallback((worldX: number, worldY: number): GridPosition => {
    return {
      x: Math.floor(worldX / GRID_SIZE),
      y: Math.floor(worldY / GRID_SIZE)
    };
  }, []);

  // Calculate movement path, clamped to speed, with last dot at the reachable endpoint
  const calculateMovementPath = useCallback((start: GridPosition, end: GridPosition, maxDistance: number): GridPosition[] => {
    if (maxDistance <= 0) return [];

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const targetDistance = Math.sqrt(dx * dx + dy * dy);

    // Limit how far we preview to the reachable distance
    const previewDistance = Math.min(maxDistance, targetDistance);
    if (previewDistance === 0) return [];

    // Compute the actual endpoint we will preview to (either the target or the max reachable point)
    const previewRatio = targetDistance === 0 ? 0 : previewDistance / targetDistance;
    const previewEndX = start.x + dx * previewRatio;
    const previewEndY = start.y + dy * previewRatio;

    // Number of dots: equal to speed when out of range, or fewer if target is closer
    const steps = Math.max(1, Math.floor(previewDistance));

    const path: GridPosition[] = [];
    for (let i = 1; i <= steps; i++) {
      const stepRatio = i / steps;
      const stepX = Math.round(start.x + (previewEndX - start.x) * stepRatio);
      const stepY = Math.round(start.y + (previewEndY - start.y) * stepRatio);
      path.push({ x: stepX, y: stepY });
    }

    return path;
  }, []);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault();
      setIsPanning(true);
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle panning
    if (isPanning) {
      const deltaX = e.clientX - lastPanPosition.x;
      const deltaY = e.clientY - lastPanPosition.y;
      
      setMapTransform(prev => ({
        ...prev,
        offsetX: prev.offsetX + deltaX,
        offsetY: prev.offsetY + deltaY
      }));
      
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }

    // Update mouse grid position for movement preview
    const gridPos = screenToGrid(e.clientX, e.clientY);
    setMouseGridPosition(gridPos);

    // Calculate movement path if it's the player's turn and they have a selected character
    if (isTurn && selectedBlob && characterData) {
      const selectedBlobData = blobs.find(b => b.id === selectedBlob);
      if (selectedBlobData && canControlBlob(selectedBlobData)) {
        const startPos = worldToGrid(selectedBlobData.x, selectedBlobData.y);
        const maxDistance = characterData.speed.getCurrent();
        const path = calculateMovementPath(startPos, gridPos, maxDistance);
        
        // Debug logging
        console.log('Movement path calculation:', {
          start: startPos,
          target: gridPos,
          maxDistance,
          pathLength: path.length,
          path
        });
        
        setMovementPath(path);
      }
    }

    // Call the parent's mouse move handler
    onMouseMove(e);
  }, [isPanning, lastPanPosition, onMouseMove, screenToGrid, isTurn, selectedBlob, characterData, blobs, canControlBlob, worldToGrid, calculateMovementPath]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, mapTransform.scale * zoomFactor));
    
    const scaleRatio = newScale / mapTransform.scale;
    const newOffsetX = mouseX - (mouseX - mapTransform.offsetX) * scaleRatio;
    const newOffsetY = mouseY - (mouseY - mapTransform.offsetY) * scaleRatio;
    
    setMapTransform({
      offsetX: newOffsetX,
      offsetY: newOffsetY,
      scale: newScale
    });
  }, [mapTransform]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Check if click is on a blob
    for (const blob of blobs) {
      const blobScreenPos = gridToScreen(blob.x / GRID_SIZE, blob.y / GRID_SIZE);
      const distance = Math.sqrt(
        Math.pow(e.clientX - rect.left - blobScreenPos.x, 2) + 
        Math.pow(e.clientY - rect.top - blobScreenPos.y, 2)
      );
      
      if (distance <= 32) { // 32px radius for blob selection
        onBlobSelect(blob.id);
        return;
      }
    }
  }, [blobs, gridToScreen, onBlobSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Handle movement if it's the player's turn and they have a selected character
    if (isTurn && selectedBlob && characterData && onMoveBlob) {
      const selectedBlobData = blobs.find(b => b.id === selectedBlob);
      if (selectedBlobData && canControlBlob(selectedBlobData)) {
        const targetGridPos = screenToGrid(e.clientX, e.clientY);
        const startPos = worldToGrid(selectedBlobData.x, selectedBlobData.y);
        const maxDistance = characterData.speed.getCurrent();
        
        // Calculate the actual distance to the target
        const dx = targetGridPos.x - startPos.x;
        const dy = targetGridPos.y - startPos.y;
        const targetDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (targetDistance <= maxDistance) {
          // Can reach the target - move there
          onMoveBlob(selectedBlob, targetGridPos);
        } else {
          // Can't reach the target - move as far as possible
          const ratio = maxDistance / targetDistance;
          const maxX = Math.round(startPos.x + dx * ratio);
          const maxY = Math.round(startPos.y + dy * ratio);
          onMoveBlob(selectedBlob, { x: maxX, y: maxY });
        }
        
        setMovementPath([]); // Clear the path after moving
        return; // Don't call onRightClick if we handled movement
      }
    }
    
    // Call the parent's right-click handler if we didn't handle movement
    onRightClick(e);
  }, [onRightClick, isTurn, selectedBlob, characterData, onMoveBlob, blobs, canControlBlob, screenToGrid, worldToGrid]);

  // Render everything to canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transform
    ctx.save();
    ctx.translate(mapTransform.offsetX, mapTransform.offsetY);
    ctx.scale(mapTransform.scale, mapTransform.scale);

    // Draw grid
    ctx.strokeStyle = '#A08A6E';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, GRID_HEIGHT * GRID_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(GRID_WIDTH * GRID_SIZE, y * GRID_SIZE);
      ctx.stroke();
    }

    // Draw hover path (legacy, from parent component)
    if (hoverPath.length > 0) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FBBF24';
      
      for (const pos of hoverPath) {
        const worldPos = gridToWorld(pos.x, pos.y);
        ctx.beginPath();
        ctx.arc(worldPos.x, worldPos.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw movement path (new system)
    if (isTurn && movementPath.length > 0) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FBBF24';
      
      for (const pos of movementPath) {
        const worldPos = gridToWorld(pos.x, pos.y);
        ctx.beginPath();
        ctx.arc(worldPos.x, worldPos.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a subtle border
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }



    // Draw blobs
    ctx.globalAlpha = 1;
    for (const blob of blobs) {
      // Convert blob's pixel coordinates to grid coordinates, then to world coordinates
      const gridX = Math.floor(blob.x / GRID_SIZE);
      const gridY = Math.floor(blob.y / GRID_SIZE);
      const worldPos = gridToWorld(gridX, gridY);
      
      // Draw blob circle
      ctx.fillStyle = blob.color;
      ctx.strokeStyle = selectedBlob === blob.id ? '#FBBF24' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = selectedBlob === blob.id ? 3 : 2;
      
      ctx.beginPath();
      ctx.arc(worldPos.x, worldPos.y, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw name initial
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(worldPos.x + 16, worldPos.y - 16, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(blob.name.charAt(0), worldPos.x + 16, worldPos.y - 16);

      // Draw controller
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(worldPos.x - 16, worldPos.y + 16, 32, 16);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(blob.controller, worldPos.x, worldPos.y + 24);

      // Draw health bar
      const healthPercent = blob.health / blob.maxHealth;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(worldPos.x - 16, worldPos.y + 32, 32, 4);
      
      ctx.fillStyle = '#10B981';
      ctx.fillRect(worldPos.x - 16, worldPos.y + 32, 32 * healthPercent, 4);
    }

    ctx.restore();
  }, [blobs, selectedBlob, hoverPath, mapTransform, gridToScreen, isTurn, movementPath, gridToWorld, characterData, canControlBlob]);

  // Render on changes
  useEffect(() => {
    render();
  }, [render]);

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="w-[1200px] h-[600px] bg-game-gray border-2 border-gray-700 rounded-lg cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
      
      {/* Pan and Zoom Info */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/90 border border-game-gold rounded-lg p-3 text-xs text-gray-300 backdrop-blur-sm">
          <h4 className="text-game-gold font-semibold mb-2 text-center">Map Controls</h4>
          <p className="mb-1"><strong>Zoom:</strong> {Math.round(mapTransform.scale * 100)}%</p>
          <p className="mb-1"><strong>Pan:</strong> Middle-click + drag</p>
          <p className="mb-2"><strong>Zoom:</strong> Mouse wheel</p>
          <button 
            onClick={() => setMapTransform({ offsetX: 0, offsetY: 0, scale: 1 })}
            className="w-full px-2 py-1 bg-game-gold/20 border border-game-gold rounded text-game-gold text-xs hover:bg-game-gold/30 transition-colors"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Debug Info Overlay */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/90 border border-game-gold rounded-lg p-4 text-xs text-gray-300 max-w-xs backdrop-blur-sm">
          <h4 className="text-game-gold font-semibold mb-2">Debug Information</h4>
          <p><strong>Selected:</strong> {blobs.find(b => b.id === selectedBlob)?.name || 'None'}</p>
          <p><strong>Controller:</strong> {blobs.find(b => b.id === selectedBlob)?.controller || 'None'}</p>
          <p><strong>Can Control:</strong> {blobs.find(b => b.id === selectedBlob) && canControlBlob(blobs.find(b => b.id === selectedBlob)!) ? 'Yes' : 'No'}</p>
          <p><strong>Speed:</strong> {blobs.find(b => b.id === selectedBlob)?.speed || 0}</p>
          <p><strong>Character Speed:</strong> {characterData?.speed.getCurrent() || 'N/A'}</p>
          <p><strong>Path Length:</strong> {hoverPath.length}</p>
          <p><strong>Movement Path:</strong> {movementPath.length} steps</p>
          <p><strong>Mouse Grid:</strong> {mouseGridPosition ? `${mouseGridPosition.x}, ${mouseGridPosition.y}` : 'None'}</p>
          <p><strong>Is Turn:</strong> {isTurn ? 'Yes' : 'No'}</p>
          <p><strong>My Tokens:</strong> {blobs.filter(b => b.controller === 'P1').map(b => b.name).join(', ')}</p>
          <p><strong>Other Player:</strong> {blobs.filter(b => b.controller === 'P2').map(b => b.name).join(', ')}</p>
          <p><strong>Enemies:</strong> {blobs.filter(b => b.controller === 'DM').map(b => b.name).join(', ')}</p>
        </div>
      </div>
    </div>
  );
};
