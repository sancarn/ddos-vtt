import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { SpellBar } from './PlayerBar/SpellBar';
import { AvailableSpellsPopup } from './PlayerBar/AvailableSpellsPopup';
import { Resources, ResourceItem, ActionResource, SpellSlotResource, KiResource, SorceryPointResource, ChannelDivinityResource, WildshapeResource, BardicInspirationResource, RageResource } from './PlayerBar/Resources';
import Skill from './SideBar/Skill';

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

export const PlayerInterface: React.FC = () => {
  const { takeDamage } = useGameStore();
  
  // Current player ID (in real app, this would come from networking)
  const currentPlayerId = 'P1';
  
  // Skills search and sort state
  const [skillsSearchQuery, setSkillsSearchQuery] = useState('');
  const [skillsSortOrder, setSkillsSortOrder] = useState<'attribute' | 'alphabetical'>('alphabetical');
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    skillName: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    skillName: ''
  });
  
  // Skills data with attribute information
  const skillsData = [
    { name: "Athletics", icon: "/assets/skills/Athletics.svg", attribute: "Strength" },
    { name: "Acrobatics", icon: "/assets/skills/Acrobatics.svg", attribute: "Dexterity" },
    { name: "Sleight of Hand", icon: "/assets/skills/SleightOfHand.svg", attribute: "Dexterity" },
    { name: "Stealth", icon: "/assets/skills/Stealth.svg", attribute: "Dexterity" },
    { name: "Arcana", icon: "/assets/skills/Arcana.svg", attribute: "Intelligence" },
    { name: "History", icon: "/assets/skills/History.svg", attribute: "Intelligence" },
    { name: "Investigation", icon: "/assets/skills/Investigation.svg", attribute: "Intelligence" },
    { name: "Nature", icon: "/assets/skills/Nature.svg", attribute: "Intelligence" },
    { name: "Religion", icon: "/assets/skills/Religion.svg", attribute: "Intelligence" },
    { name: "Animal Handling", icon: "/assets/skills/AnimalHandling.svg", attribute: "Wisdom" },
    { name: "Insight", icon: "/assets/skills/Insight.svg", attribute: "Wisdom" },
    { name: "Medicine", icon: "/assets/skills/Medicine.svg", attribute: "Wisdom" },
    { name: "Perception", icon: "/assets/skills/Perception.svg", attribute: "Wisdom" },
    { name: "Survival", icon: "/assets/skills/Survival.svg", attribute: "Wisdom" },
    { name: "Deception", icon: "/assets/skills/Deception.svg", attribute: "Charisma" },
    { name: "Intimidation", icon: "/assets/skills/Intimidation.svg", attribute: "Charisma" },
    { name: "Performance", icon: "/assets/skills/Performance.svg", attribute: "Charisma" },
    { name: "Persuasion", icon: "/assets/skills/Persuasion.svg", attribute: "Charisma" },
  ];

  // Filter and sort skills based on search query and sort order
  const filteredAndSortedSkills = skillsData
    .filter(skill => 
      skill.name.toLowerCase().includes(skillsSearchQuery.toLowerCase()) ||
      skill.attribute.toLowerCase().includes(skillsSearchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (skillsSortOrder === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else {
        // Sort by attribute order: STR, DEX, CON, INT, WIS, CHA
        const attributeOrder = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
        const aIndex = attributeOrder.indexOf(a.attribute);
        const bIndex = attributeOrder.indexOf(b.attribute);
        if (aIndex === bIndex) {
          return a.name.localeCompare(b.name);
        }
        return aIndex - bIndex;
      }
    });

  // Context menu handlers
  const handleSkillRightClick = (e: React.MouseEvent, skillName: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      skillName
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  const handleAdvantage = (skillName: string) => {
    console.log(`Advantage applied to ${skillName}`);
    handleContextMenuClose();
    // TODO: Implement advantage logic
  };

  const handleDisadvantage = (skillName: string) => {
    console.log(`Disadvantage applied to ${skillName}`);
    handleContextMenuClose();
    // TODO: Implement disadvantage logic
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        handleContextMenuClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  // Mock resources data for UI design - moved from Resources component
  const mockResources = {
    actions: { current: 1, max: 1 },
    bonusActions: { current: 1, max: 1 },
    reactions: { current: 1, max: 1 },
    spellSlots: [
      { level: 1, available: 4, max: 4 },
      { level: 2, available: 3, max: 3 },
      { level: 3, available: 2, max: 2 },
    ],
    ki: { available: 5, max: 5 },
    sorceryPoints: { available: 3, max: 5 },
    channelDivinity: { available: 1, max: 1 },
    wildshape: { available: 2, max: 2 },
    bardicInspiration: { available: 3, max: 3 },
    rage: { available: 2, max: 2 },
  };

  // Function to generate resources data for the Resources component
  const getResourcesData = (): ResourceItem[] => {
    return [
      {
        name: "Action",
        element: <ActionResource type="action" current={mockResources.actions.current} max={mockResources.actions.max} onClick={() => console.log('Action clicked')} />
      },
      {
        name: "Bonus",
        element: <ActionResource type="bonusAction" current={mockResources.bonusActions.current} max={mockResources.bonusActions.max} onClick={() => console.log('Bonus Action clicked')} />
      },
      {
        name: "Reaction",
        element: <ActionResource type="reaction" current={mockResources.reactions.current} max={mockResources.reactions.max} onClick={() => console.log('Reaction clicked')} />
      },
      ...mockResources.spellSlots.map((slot) => ({
        name: `L${slot.level}`,
        element: <SpellSlotResource level={slot.level} available={slot.available} max={slot.max} onClick={() => console.log(`Spell slot ${slot.level} clicked`)} />
      })),
      // {
      //   name: "Ki",
      //   element: <KiResource available={mockResources.ki.available} max={mockResources.ki.max} onClick={() => console.log('Ki clicked')} />
      // },
      // {
      //   name: "SP",
      //   element: <SorceryPointResource available={mockResources.sorceryPoints.available} max={mockResources.sorceryPoints.max} onClick={() => console.log('Sorcery Point clicked')} />
      // },
      // {
      //   name: "CD",
      //   element: <ChannelDivinityResource available={mockResources.channelDivinity.available} max={mockResources.channelDivinity.max} onClick={() => console.log('Channel Divinity clicked')} />
      // },
      // {
      //   name: "WS",
      //   element: <WildshapeResource available={mockResources.wildshape.available} max={mockResources.wildshape.max} onClick={() => console.log('Wildshape clicked')} />
      // },
      // {
      //   name: "BI",
      //   element: <BardicInspirationResource available={mockResources.bardicInspiration.available} max={mockResources.bardicInspiration.max} onClick={() => console.log('Bardic Inspiration clicked')} />
      // },
      // {
      //   name: "Rage",
      //   element: <RageResource available={mockResources.rage.available} max={mockResources.rage.max} onClick={() => console.log('Rage clicked')} />
      // }
    ];
  };

  const [blobs, setBlobs] = useState<Blob[]>([
    // P1's tokens (you control these)
    { id: 'player1', x: 2 * 50 + 25, y: 2 * 50 + 25, isPlayer: true, health: 20, maxHealth: 20, color: '#4CAF50', speed: 6, controller: 'P1', name: 'Fighter' },
    { id: 'player2', x: 3 * 50 + 25, y: 2 * 50 + 25, isPlayer: true, health: 18, maxHealth: 18, color: '#4CAF50', speed: 5, controller: 'P1', name: 'Ranger' },
    
    // P2's tokens (friend would control these)
    { id: 'player3', x: 4 * 50 + 25, y: 2 * 50 + 25, isPlayer: true, health: 16, maxHealth: 16, color: '#2196F3', speed: 4, controller: 'P2', name: 'Wizard' },
    { id: 'player4', x: 5 * 50 + 25, y: 2 * 50 + 25, isPlayer: true, health: 22, maxHealth: 22, color: '#2196F3', speed: 6, controller: 'P2', name: 'Cleric' },
    
    // Enemy tokens (no one controls these)
    { id: 'enemy1', x: 6 * 50 + 25, y: 2 * 50 + 25, isPlayer: false, health: 15, maxHealth: 15, color: '#F44336', speed: 4, controller: 'DM', name: 'Orc' },
    { id: 'enemy2', x: 10 * 50 + 25, y: 2 * 50 + 25, isPlayer: false, health: 15, maxHealth: 15, color: '#F44336', speed: 4, controller: 'DM', name: 'Goblin' },
    { id: 'enemy3', x: 6 * 50 + 25, y: 6 * 50 + 25, isPlayer: false, health: 15, maxHealth: 15, color: '#F44336', speed: 4, controller: 'DM', name: 'Troll' },
    { id: 'enemy4', x: 10 * 50 + 25, y: 6 * 50 + 25, isPlayer: false, health: 15, maxHealth: 15, color: '#F44336', speed: 4, controller: 'DM', name: 'Dragon' },
  ]);

  const [selectedBlob, setSelectedBlob] = useState<string>('player1');
  const [hoverPath, setHoverPath] = useState<GridPosition[]>([]);
  const [mousePosition, setMousePosition] = useState<GridPosition>({ x: 0, y: 0 });
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [showSpellsPopup, setShowSpellsPopup] = useState<boolean>(false);
  const [spellsPopupPosition, setSpellsPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
  const findClosestReachablePosition = (start: GridPosition, target: GridPosition, maxDistance: number): GridPosition | null => {
    // If target is already within range, return it
    const directDistance = Math.max(Math.abs(target.x - start.x), Math.abs(target.y - start.y));
    if (directDistance <= maxDistance) {
      return target;
    }

    // Calculate the direction vector from start to target
    const dx = target.x - start.x;
    const dy = target.y - start.y;
    
    // Normalize the direction and scale to maxDistance
    const distance = Math.max(Math.abs(dx), Math.abs(dy));
    const scale = maxDistance / distance;
    
    // Calculate the closest reachable position
    const reachableX = start.x + Math.round(dx * scale);
    const reachableY = start.y + Math.round(dy * scale);
    
    return { x: reachableX, y: reachableY };
  };

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
        { dx: -1, dy: -1, cost: 1 }, // Diagonal
        { dx: 0, dy: -1, cost: 1 },  // Up
        { dx: 1, dy: -1, cost: 1 },  // Diagonal
        { dx: -1, dy: 0, cost: 1 },  // Left
        { dx: 1, dy: 0, cost: 1 },   // Right
        { dx: -1, dy: 1, cost: 1 },  // Diagonal
        { dx: 0, dy: 1, cost: 1 },   // Down
        { dx: 1, dy: 1, cost: 1 },   // Diagonal
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

    // First try to find path to exact cursor position
    let path = findPath(blobGridPos, gridPos, selectedBlobData.speed);
    
    // If no path found (out of range), find closest reachable position
    if (path.length === 0) {
      const closestReachable = findClosestReachablePosition(blobGridPos, gridPos, selectedBlobData.speed);
      if (closestReachable) {
        path = findPath(blobGridPos, closestReachable, selectedBlobData.speed);
      }
    }
    
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

    // First try to find path to exact cursor position
    let path = findPath(blobGridPos, gridPos, selectedBlobData.speed);
    
    // If no path found (out of range), find closest reachable position
    if (path.length === 0) {
      const closestReachable = findClosestReachablePosition(blobGridPos, gridPos, selectedBlobData.speed);
      if (closestReachable) {
        path = findPath(blobGridPos, closestReachable, selectedBlobData.speed);
      }
    }
    
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

  const handlePortraitClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpellsPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setShowSpellsPopup(true);
  };

  const handleSpellSelect = (spell: any) => {
    console.log(`Selected spell: ${spell.name}`);
    setShowSpellsPopup(false);
    // TODO: Implement spell selection logic
  };

  // Get all blobs controlled by current player
  const myBlobs = blobs.filter(b => b.controller === currentPlayerId);
  const otherPlayerBlobs = blobs.filter(b => b.controller === 'P2');
  const enemyBlobs = blobs.filter(b => b.controller === 'DM');

  return (
    <div className="h-screen bg-game-dark text-white flex">

      

      {/* Skills Sidebar */}
      <div className="flex flex-col gap-2 w-fit p-4 border-r border-game-gold">
        {/* General checks and saves*/}{/* General checks and saves */}
        <div className="flex flex-col gap-2 w-full p-4">
          {/* Header */}
          <div className="flex gap-8 mb-2 w-full justify-center items-center">
            <span className="flex-1 text-game-gold font-bold text-sm flex justify-center items-center">CHECKS</span>
            <span className="flex-1 text-game-gold font-bold text-sm flex justify-center items-center">SAVES</span>
          </div>
          
          {/* Checks and Saves Grid */}
          <div className="flex gap-8">
            {/* Checks Column */}
            <div className="flex flex-1  flex-col gap-2">
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                STR
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                DEX
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                CON
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                INT
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                WIS
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                CHA
              </button>
            </div>
            
            {/* Saves Column */}
            <div className="flex flex-1  flex-col gap-2">
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                STR
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                DEX
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                CON
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                INT
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                WIS
              </button>
              <button className="px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors">
                CHA
              </button>
            </div>
          </div>
        </div>

        {/* Skills */}
        <h2 className="text-game-gold font-bold text-sm flex justify-center items-center">SKILLS</h2>
        
        {/* Search and Sort Controls */}
        <div className="flex flex-col gap-2 w-full p-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search skills..."
              value={skillsSearchQuery}
              onChange={(e) => setSkillsSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm placeholder-[#6B5B4A] focus:outline-none focus:border-[#5a4f42] focus:bg-[#2d2926] transition-colors"
            />
            {skillsSearchQuery && (
              <button
                onClick={() => setSkillsSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#6B5B4A] hover:text-[#A08A6E] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Sort Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setSkillsSortOrder('attribute')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                skillsSortOrder === 'attribute'
                  ? 'bg-[#5a4f42] text-[#A08A6E] border border-[#A08A6E]'
                  : 'bg-[#262420] text-[#6B5B4A] border border-[#473D31] hover:bg-[#2d2926] hover:border-[#5a4f42]'
              }`}
            >
              By Attribute
            </button>
            <button
              onClick={() => setSkillsSortOrder('alphabetical')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                skillsSortOrder === 'alphabetical'
                  ? 'bg-[#5a4f42] text-[#A08A6E] border border-[#A08A6E]'
                  : 'bg-[#262420] text-[#6B5B4A] border border-[#473D31] hover:bg-[#2d2926] hover:border-[#5a4f42]'
              }`}
            >
              A-Z
            </button>
          </div>
        </div>
        
        {/* Skills List */}
        <div className="flex flex-col gap-2 w-full p-4 overflow-y-auto max-h-96">
          {filteredAndSortedSkills.length > 0 ? (
            filteredAndSortedSkills.map((skill, index) => (
              <div key={skill.name} className="flex flex-col gap-1">
                {skillsSortOrder === 'attribute' && (index === 0 || filteredAndSortedSkills[index - 1].attribute !== skill.attribute) && (
                  <div className="text-[#6B5B4A] text-xs font-medium px-2 py-1 bg-[#1a1816] rounded border-l-2 border-[#473D31]">
                    {skill.attribute}
                  </div>
                )}
                <Skill 
                  name={skill.name} 
                  icon={skill.icon} 
                  onClick={() => console.log(`${skill.name} clicked`)}
                  onContextMenu={(e) => handleSkillRightClick(e, skill.name)}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-[#6B5B4A] text-sm py-4">
              No skills found matching "{skillsSearchQuery}"
            </div>
          )}
        </div>
      </div>

      

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
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
        <div className="flex-1 flex gap-4 p-4 max-w-7xl mx-auto">
        <div 
          className="w-[1200px] h-[600px] bg-game-gray border-2 border-gray-700 rounded-lg relative overflow-hidden flex-shrink-0"
          ref={battlefieldRef}
          onMouseMove={handleMouseMove}
          onContextMenu={handleRightClick}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: GRID_WIDTH + 1 }, (_, x) => (
              <div
                key={`v-${x}`}
                className="absolute top-0 bottom-0 w-px bg-game-gold opacity-30"
                style={{ left: `${x * GRID_SIZE}px` }}
              />
            ))}
            {Array.from({ length: GRID_HEIGHT + 1 }, (_, y) => (
              <div
                key={`h-${y}`}
                className="absolute left-0 right-0 h-px bg-game-gold opacity-30"
                style={{ top: `${y * GRID_SIZE}px` }}
              />
            ))}
          </div>

          {/* Hover path */}
          {hoverPath.length > 0 && selectedBlobData && canControlBlob(selectedBlobData) && (
            <div className="absolute inset-0 pointer-events-none">
              {hoverPath.map((pos, index) => {
                const pixelPos = gridToPixel(pos.x, pos.y);
                return (
                  <div
                    key={`path-${index}`}
                    className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-pulse-slow"
                    style={{
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
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/90 border border-game-gold rounded-lg p-4 text-xs text-gray-300 max-w-xs backdrop-blur-sm">
                <h4 className="text-game-gold font-semibold mb-2">Debug Information</h4>
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
                left: `${blob.x - 32}px`,
                top: `${blob.y - 32}px`,
                backgroundColor: blob.color,
              }}
              onClick={() => setSelectedBlob(blob.id)}
            >
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {blob.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -left-2 px-1 py-0.5 bg-black/80 rounded text-xs font-bold text-white">
                {blob.controller}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 rounded-b-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(blob.health / blob.maxHealth) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Character Bar */}
      <div className="bg-gradient-to-r from-game-dark to-game-gray border-t-2 border-game-gold p-4 flex items-center gap-4 h-30 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center gap-6 w-full">
          {/* Character Portrait */}
          <div 
            className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full border-2 border-game-gold flex items-center justify-center text-2xl font-bold text-game-gold cursor-pointer hover:scale-105 transition-transform"
            onClick={handlePortraitClick}
          >
            P
          </div>
          
          {/* Status Effects */}
          <div className="flex-1">
            <h4 className="text-game-gold font-semibold mb-2">
              Status Effects
            </h4>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-600/20 border border-green-500 rounded text-green-300 text-sm">
                Blessed
              </span>
              <span className="px-2 py-1 bg-blue-600/20 border border-blue-500 rounded text-blue-300 text-sm">
                Haste
              </span>
            </div>
          </div>
          
          {/* Health and Resources */}
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="text-game-gold font-semibold mb-1">
                Health
              </h4>
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <h4 className="text-game-gold font-semibold mb-1">
                Resources
              </h4>
              <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
          
          {/* Resources and Spell Bar Container */}
          <div className="flex-1 flex flex-col">
            {/* Resources */}
            <div className="flex flex-row">
              <div className="flex-1"/>
              <div className="flex-1">
                <Resources data={getResourcesData} />
              </div>
              <div className="flex-1"/>
            </div>
            
            {/* Spell Bar */}
            <div>
              <SpellBar />
            </div>
          </div>
          
          {/* Inventory Button */}
          <div className="self-end">
            <button className="w-32 h-32 transition-all duration-200 flex items-center gap-2 group">
              <img 
                src="/assets/Inventory_Closed.png" 
                alt="Inventory"
                className="w-full h-full transition-all duration-200 group-hover:hidden"
              />
              <img 
                src="/assets/Inventory_Open.png" 
                alt="Inventory"
                className="w-full h-full transition-all duration-200 hidden group-hover:block"
              />
              
            </button>
          </div>
        </div>
      </div>

      {/* Available Spells Popup */}
      <AvailableSpellsPopup
        isVisible={showSpellsPopup}
        onClose={() => setShowSpellsPopup(false)}
        onSpellSelect={handleSpellSelect}
        position={spellsPopupPosition}
      />

      {/* Skills Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed z-50 bg-[#1a1816] border border-[#473D31] rounded-lg shadow-2xl py-2 min-w-32"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px'
          }}
        >
          <div className="px-3 py-1 text-xs text-[#6B5B4A] border-b border-[#473D31] mb-1">
            {contextMenu.skillName}
          </div>
          <button
            onClick={() => handleAdvantage(contextMenu.skillName)}
            className="w-full px-3 py-2 text-left text-[#A08A6E] hover:bg-[#2d2926] transition-colors text-sm"
          >
            Advantage
          </button>
          <button
            onClick={() => handleDisadvantage(contextMenu.skillName)}
            className="w-full px-3 py-2 text-left text-[#A08A6E] hover:bg-[#2d2926] transition-colors text-sm"
          >
            Disadvantage
          </button>
        </div>
      )}
      
    </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" 
             onClick={() => setShowHelpModal(false)}>
          <div className="bg-gradient-to-br from-game-gray to-game-dark border-2 border-game-gold rounded-lg w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl" 
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-game-light-gray">
              <h3 className="text-xl font-bold text-game-gold">
                How to Play
              </h3>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full hover:bg-game-light-gray transition-colors flex items-center justify-center text-2xl text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="p-4 text-gray-300">
              <h4 className="text-game-gold font-semibold mt-4 mb-2">
                Movement Controls
              </h4>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Click on your tokens (green ones) to select them</li>
                <li>Hover your mouse to see the path</li>
                <li>Right-click to move to that location</li>
                <li>You can only control tokens assigned to P1</li>
                <li>Movement follows the grid and respects speed</li>
              </ul>
              
              <h4 className="text-game-gold font-semibold mt-4 mb-2">
                Token Types
              </h4>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li><strong>Green Tokens:</strong> Your characters (P1)</li>
                <li><strong>Blue Tokens:</strong> Other player's characters (P2)</li>
                <li><strong>Red Tokens:</strong> Enemies (DM controlled)</li>
              </ul>
              
              <h4 className="text-game-gold font-semibold mt-4 mb-2">
                Grid System
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>24×12 grid (1200×600 pixels)</li>
                <li>50px per grid square</li>
                <li>Diagonal movement allowed</li>
                <li>Pathfinding avoids obstacles</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
      
  );
};
