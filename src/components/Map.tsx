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
    canMoveThroughUnits: boolean;
    canOccupySameSpaceAsUnits: boolean;
  };
  isTurn?: boolean;
  onMoveBlob?: (blobId: string, newGridPos: GridPosition) => void;
}

const GRID_SIZE = 50;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapTransform, setMapTransform] = useState({ offsetX: 0, offsetY: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [mouseGridPosition, setMouseGridPosition] = useState<GridPosition | null>(null);
  const [movementPath, setMovementPath] = useState<GridPosition[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

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

  // Check if a grid position is occupied by another entity
  const isPositionOccupied = useCallback((gridPos: GridPosition, excludeBlobId?: string): boolean => {
    return blobs.some(blob => {
      if (excludeBlobId && blob.id === excludeBlobId) return false;
      const blobGridPos = worldToGrid(blob.x, blob.y);
      return blobGridPos.x === gridPos.x && blobGridPos.y === gridPos.y;
    });
  }, [blobs, worldToGrid]);

  // Calculate straight-line movement path, clamped to speed.
  // Supports passing through units and optionally ending on an occupied tile.
  const calculateMovementPath = useCallback(
    (
      start: GridPosition,
      end: GridPosition,
      maxDistance: number,
      options?: {
        excludeBlobId?: string;
        canMoveThroughUnits?: boolean;
        canOccupySameSpaceAsUnits?: boolean;
      }
    ): GridPosition[] => {
      if (maxDistance <= 0) return [];

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const targetDistance = Math.sqrt(dx * dx + dy * dy);

      const previewDistance = Math.min(maxDistance, targetDistance);
      if (previewDistance === 0) return [];

      const previewRatio = targetDistance === 0 ? 0 : previewDistance / targetDistance;
      const previewEndX = start.x + dx * previewRatio;
      const previewEndY = start.y + dy * previewRatio;

      const steps = Math.max(1, Math.floor(previewDistance));

      const path: GridPosition[] = [];
      for (let i = 1; i <= steps; i++) {
        const stepRatio = i / steps;
        const stepX = Math.round(start.x + (previewEndX - start.x) * stepRatio);
        const stepY = Math.round(start.y + (previewEndY - start.y) * stepRatio);
        const stepPos = { x: stepX, y: stepY };

        const occupied = isPositionOccupied(stepPos, options?.excludeBlobId);
        const isFinalStep = i === steps;

        if (occupied) {
          // If we can't pass through units, stop before the occupied cell
          if (!options?.canMoveThroughUnits) break;

          // We can pass through units. For the final step, only include it if we're allowed to end on occupied
          if (isFinalStep) {
            if (options?.canOccupySameSpaceAsUnits) {
              path.push(stepPos);
            }
            // If we can't end on occupied, do not push final occupied cell
          } else {
            // Intermediate occupied cell but canMoveThroughUnits: include the step and continue
            path.push(stepPos);
          }
        } else {
          // Unoccupied cell: always include
          path.push(stepPos);
        }
      }

      return path;
    },
    [isPositionOccupied]
  );

  // Visible grid range based on current viewport
  const getVisibleGridRange = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    const topLeft = {
      x: -mapTransform.offsetX / mapTransform.scale,
      y: -mapTransform.offsetY / mapTransform.scale
    };
    const bottomRight = {
      x: (canvasWidth - mapTransform.offsetX) / mapTransform.scale,
      y: (canvasHeight - mapTransform.offsetY) / mapTransform.scale
    };

    const padding = 2;
    const minX = Math.floor(topLeft.x / GRID_SIZE) - padding;
    const maxX = Math.ceil(bottomRight.x / GRID_SIZE) + padding;
    const minY = Math.floor(topLeft.y / GRID_SIZE) - padding;
    const maxY = Math.ceil(bottomRight.y / GRID_SIZE) + padding;

    return { minX, maxX, minY, maxY };
  }, [mapTransform]);

  // Build a set of occupied grid cells for fast lookup
  const getOccupiedSet = useCallback((excludeBlobId?: string): Set<string> => {
    const set = new Set<string>();
    for (const blob of blobs) {
      if (excludeBlobId && blob.id === excludeBlobId) continue;
      const gp = worldToGrid(blob.x, blob.y);
      set.add(`${gp.x},${gp.y}`);
    }
    return set;
  }, [blobs, worldToGrid]);

  // Get current search bounds from the visible grid range
  const getSearchBounds = useCallback(() => {
    const { minX, maxX, minY, maxY } = getVisibleGridRange();
    return { minX, maxX, minY, maxY };
  }, [getVisibleGridRange]);

  // A* pathfinding avoiding occupied cells. 8-directional, no corner cutting.
  const findPathAvoidingUnits = useCallback((start: GridPosition, goal: GridPosition, excludeBlobId?: string, options?: { allowEndOnOccupied?: boolean }): GridPosition[] => {
    const occupied = getOccupiedSet(excludeBlobId);
    const bounds = getSearchBounds();

    const key = (p: GridPosition) => `${p.x},${p.y}`;
    const inBounds = (p: GridPosition) => p.x >= bounds.minX && p.x <= bounds.maxX && p.y >= bounds.minY && p.y <= bounds.maxY;
    const isBlocked = (p: GridPosition) => {
      const blocked = occupied.has(key(p));
      if (!blocked) return false;
      // Allow stepping into goal even if occupied when enabled
      if (options?.allowEndOnOccupied && p.x === goal.x && p.y === goal.y) return false;
      return true;
    };

    // If goal is blocked, we will still search to it but likely won't reach; callers may clamp.

    type Node = { x: number; y: number; g: number; h: number; f: number; parent?: Node };

    const heuristic = (a: GridPosition, b: GridPosition) => {
      // Chebyshev distance fits 8-direction unit-cost movement
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      return Math.max(dx, dy);
    };

    const startNode: Node = { x: start.x, y: start.y, g: 0, h: heuristic(start, goal), f: 0 };
    startNode.f = startNode.g + startNode.h;

    const open: Node[] = [startNode];
    const openSet = new globalThis.Map<string, Node>([[key(start), startNode]]);
    const closed = new Set<string>();

    const reconstructPath = (node: Node): GridPosition[] => {
      const rev: GridPosition[] = [];
      let cur: Node | undefined = node;
      while (cur) {
        rev.push({ x: cur.x, y: cur.y });
        cur = cur.parent;
      }
      rev.reverse();
      // Exclude the start cell to match existing path semantics
      return rev.slice(1);
    };

    const neighbors = (x: number, y: number): GridPosition[] => {
      const result: GridPosition[] = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          const np: GridPosition = { x: nx, y: ny };
          if (!inBounds(np)) continue;
          if (isBlocked(np)) continue;
          // Prevent cutting corners on diagonals
          if (dx !== 0 && dy !== 0) {
            const n1: GridPosition = { x: x + dx, y };
            const n2: GridPosition = { x, y: y + dy };
            if (isBlocked(n1) || isBlocked(n2)) continue;
          }
          result.push(np);
        }
      }
      return result;
    };

    while (open.length > 0) {
      // Pick node with lowest f (simple linear search is fine for small open sets)
      let bestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[bestIdx].f) bestIdx = i;
      }
      const current = open.splice(bestIdx, 1)[0];
      openSet.delete(key({ x: current.x, y: current.y }));

      const curKey = key({ x: current.x, y: current.y });
      if (closed.has(curKey)) continue;
      closed.add(curKey);

      if (current.x === goal.x && current.y === goal.y) {
        return reconstructPath(current);
      }

      for (const nb of neighbors(current.x, current.y)) {
        const nbKey = key(nb);
        if (closed.has(nbKey)) continue;

        const tentativeG = current.g + 1; // unit cost
        const existing = openSet.get(nbKey);
        if (!existing || tentativeG < existing.g) {
          const h = heuristic(nb, goal);
          const node: Node = {
            x: nb.x,
            y: nb.y,
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current
          };
          open.push(node);
          openSet.set(nbKey, node);
        }
      }
    }

    // No path found
    return [];
  }, [getOccupiedSet, getSearchBounds]);

  // Compute a path considering canMoveThroughUnits and canOccupySameSpaceAsUnits, clamped to maxDistance
  const computeMovementPreviewPath = useCallback(
    (
      start: GridPosition,
      desiredEnd: GridPosition,
      maxDistance: number,
      options?: {
        excludeBlobId?: string;
        canMoveThroughUnits?: boolean;
        canOccupySameSpaceAsUnits?: boolean;
      }
    ): GridPosition[] => {
      if (maxDistance <= 0) return [];
      const canGhost = !!options?.canMoveThroughUnits;
      const canShare = !!options?.canOccupySameSpaceAsUnits;

      if (canGhost) {
        return calculateMovementPath(start, desiredEnd, maxDistance, {
          excludeBlobId: options?.excludeBlobId,
          canMoveThroughUnits: true,
          canOccupySameSpaceAsUnits: canShare
        });
      }

      // Avoid units: pathfind to target (or closest free cell if cannot share) and clamp
      const targetIsBlocked = !canShare && isPositionOccupied(desiredEnd, options?.excludeBlobId);
      let goal = desiredEnd;
      if (targetIsBlocked) {
        // Try ring search up to radius = maxDistance to find closest unoccupied cell near the desired end
        const bounds = getSearchBounds();
        let found: GridPosition | null = null;
        outer: for (let r = 1; r <= Math.max(1, Math.floor(maxDistance)); r++) {
          for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
              const cand: GridPosition = { x: desiredEnd.x + dx, y: desiredEnd.y + dy };
              const inDiamond = Math.max(Math.abs(dx), Math.abs(dy)) === r; // only ring
              if (!inDiamond) continue;
              if (cand.x < bounds.minX || cand.x > bounds.maxX || cand.y < bounds.minY || cand.y > bounds.maxY) continue;
              if (isPositionOccupied(cand, options?.excludeBlobId)) continue;
              found = cand;
              break outer;
            }
          }
        }
        if (found) goal = found;
      }

      const fullPath = findPathAvoidingUnits(start, goal, options?.excludeBlobId, { allowEndOnOccupied: canShare });
      if (fullPath.length === 0) return [];
      return fullPath.slice(0, Math.max(0, Math.floor(maxDistance)));
    },
    [calculateMovementPath, isPositionOccupied, getSearchBounds, findPathAvoidingUnits]
  );

  // NOTE: duplicate left intentionally removed above

  // (removed duplicate getVisibleGridRange definition)

  // Get the center grid position of the current viewport
  const getCenterGridPosition = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    
    return screenToGrid(centerX, centerY);
  }, [screenToGrid]);

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
        const path = computeMovementPreviewPath(startPos, gridPos, maxDistance, {
          excludeBlobId: selectedBlob,
          canMoveThroughUnits: characterData.canMoveThroughUnits,
          canOccupySameSpaceAsUnits: characterData.canOccupySameSpaceAsUnits
        });
        
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
  }, [isPanning, lastPanPosition, onMouseMove, screenToGrid, isTurn, selectedBlob, characterData, blobs, canControlBlob, worldToGrid, computeMovementPreviewPath]);

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
        
        // Unified movement handling
        if (characterData.canMoveThroughUnits) {
          const path = calculateMovementPath(startPos, targetGridPos, maxDistance, {
            excludeBlobId: selectedBlob,
            canMoveThroughUnits: true,
            canOccupySameSpaceAsUnits: characterData.canOccupySameSpaceAsUnits
          });
          if (path.length > 0) {
            const finalStep = path[path.length - 1];
            onMoveBlob(selectedBlob, finalStep);
          }
        } else {
          // Obstacle-aware pathing respecting canOccupySameSpaceAsUnits for landing
          const previewPath = computeMovementPreviewPath(startPos, targetGridPos, maxDistance, {
            excludeBlobId: selectedBlob,
            canMoveThroughUnits: false,
            canOccupySameSpaceAsUnits: characterData.canOccupySameSpaceAsUnits
          });
          if (previewPath.length > 0) {
            const finalStep = previewPath[Math.min(previewPath.length, Math.max(1, Math.floor(maxDistance))) - 1];
            onMoveBlob(selectedBlob, finalStep);
          }
        }
        
        setMovementPath([]); // Clear the path after moving
        return; // Don't call onRightClick if we handled movement
      }
    }
    
    // Call the parent's right-click handler if we didn't handle movement
    onRightClick(e);
  }, [onRightClick, isTurn, selectedBlob, characterData, onMoveBlob, blobs, canControlBlob, screenToGrid, worldToGrid, calculateMovementPath, computeMovementPreviewPath]);

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
    ctx.lineWidth = Math.max(0.5, 1 / mapTransform.scale);
    ctx.globalAlpha = 0.3;

    const { minX, maxX, minY, maxY } = getVisibleGridRange();

    for (let x = minX; x <= maxX; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, minY * GRID_SIZE);
      ctx.lineTo(x * GRID_SIZE, maxY * GRID_SIZE);
      ctx.stroke();
    }

    for (let y = minY; y <= maxY; y++) {
      ctx.beginPath();
      ctx.moveTo(minX * GRID_SIZE, y * GRID_SIZE);
      ctx.lineTo(maxX * GRID_SIZE, y * GRID_SIZE);
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
  }, [blobs, selectedBlob, hoverPath, mapTransform, gridToScreen, isTurn, movementPath, gridToWorld, characterData, canControlBlob, getVisibleGridRange]);

  // Render on changes
  useEffect(() => {
    render();
  }, [render]);

  // Keep canvas pixel size in sync with its displayed size
  useEffect(() => {
    const syncCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        render();
      }
    };

    // Initial sync
    syncCanvasSize();

    // Resize observer to handle flex/layout changes
    const ro = new ResizeObserver(() => syncCanvasSize());
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    // Window resize fallback
    window.addEventListener('resize', syncCanvasSize);

    return () => {
      window.removeEventListener('resize', syncCanvasSize);
      ro.disconnect();
    };
  }, [render]);

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle debug info
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebugInfo(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-game-gray border-2 border-gray-700 rounded-lg cursor-crosshair block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
      

      {/* Debug Info Overlay */}
      {showDebugInfo && (
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
            <p><strong>Grid Range:</strong> {(() => {
              const range = getVisibleGridRange();
              return `X: ${range.minX} to ${range.maxX}, Y: ${range.minY} to ${range.maxY}`;
            })()}</p>
            <p><strong>Center Grid:</strong> {(() => {
              const center = getCenterGridPosition();
              return `${center.x}, ${center.y}`;
            })()}</p>
            <p className="mb-1"><strong>Zoom:</strong> {Math.round(mapTransform.scale * 100)}%</p>
            <p className="mb-1"><strong>Pan:</strong> Middle-click + drag</p>
            <p className="mb-2"><strong>Zoom:</strong> Mouse wheel</p>
            <p className="mb-1"><strong>Grid:</strong> {mouseGridPosition ? `${mouseGridPosition.x}, ${mouseGridPosition.y}` : 'None'}</p>
            <p className="mb-1"><strong>World:</strong> {mouseGridPosition ? `${mouseGridPosition.x * GRID_SIZE}, ${mouseGridPosition.y * GRID_SIZE}` : 'None'}</p>
            <p className="mb-1"><strong>Center:</strong> {(() => {
              const center = getCenterGridPosition();
              return `${center.x}, ${center.y}`;
            })()}</p>
            <p><strong>My Tokens:</strong> {blobs.filter(b => b.controller === 'P1').map(b => b.name).join(', ')}</p>
            <p><strong>Other Player:</strong> {blobs.filter(b => b.controller === 'P2').map(b => b.name).join(', ')}</p>
            <p><strong>Enemies:</strong> {blobs.filter(b => b.controller === 'DM').map(b => b.name).join(', ')}</p>
            <p className="text-game-gold text-xs mt-2">Press Ctrl+Shift+D to toggle</p>
          </div>
        </div>
      )}
    </div>
  );
};
