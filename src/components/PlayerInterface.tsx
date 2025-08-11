import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Map } from './Map';
import { ActionResource, Resources, SpellSlotResource } from './PlayerBar/Resources';
import { SpellBar } from './PlayerBar/SpellBar';
import { AvailableSpellsPopup } from './PlayerBar/AvailableSpellsPopup';
import Skill from './SideBar/Skill';
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

interface ResourceItem {
  name: string;
  element: React.ReactElement;
}

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  skillName: string;
}

const GRID_SIZE = 50;
const GRID_WIDTH = 24;
const GRID_HEIGHT = 12;

export const PlayerInterface: React.FC = () => {
  const { takeDamage } = useGameStore();
  
  // Current player ID (in real app, this would come from networking)
  const currentPlayerId = 'P1';
  
  // Character data for movement system
  const [characterSpeed, setCharacterSpeed] = useState(6);
  const characterData = {
    speed: {
      getCurrent: () => characterSpeed,
      setCurrent: (speed: number) => setCharacterSpeed(Math.max(0, speed))
    },
    canMoveThroughUnits: false,
    canOccupySameSpaceAsUnits: false
  };
  
  // Turn state (in real app, this would come from game logic)
  const [isMyTurn, setIsMyTurn] = useState(true);
  
  // State for blobs (tokens/characters)
  const [blobs, setBlobs] = useState<Blob[]>([
    { id: '1', x: 100, y: 100, isPlayer: true, health: 25, maxHealth: 30, color: '#10B981', speed: 6, controller: 'P1', name: 'Paladin' },
    { id: '2', x: 200, y: 150, isPlayer: true, health: 20, maxHealth: 25, color: '#3B82F6', speed: 6, controller: 'P2', name: 'Wizard' },
    { id: '3', x: 300, y: 200, isPlayer: false, health: 15, maxHealth: 20, color: '#EF4444', speed: 4, controller: 'DM', name: 'Goblin' },
    { id: '4', x: 400, y: 250, isPlayer: false, health: 18, maxHealth: 22, color: '#EF4444', speed: 4, controller: 'DM', name: 'Orc' },
    { id: '5', x: 400, y: 250, isPlayer: false, health: 18, maxHealth: 22, color: '#EF4444', speed: 4, controller: 'DM', name: 'Orc' },
    { id: '6', x: 400, y: 250, isPlayer: false, health: 18, maxHealth: 22, color: '#EF4444', speed: 4, controller: 'DM', name: 'Orc' },
    { id: '7', x: 400, y: 250, isPlayer: false, health: 18, maxHealth: 22, color: '#EF4444', speed: 4, controller: 'DM', name: 'Orc' },
    { id: '8', x: 400, y: 250, isPlayer: false, health: 18, maxHealth: 22, color: '#EF4444', speed: 4, controller: 'DM', name: 'Orc' },
  ]);

  // Selected blob state
  const [selectedBlob, setSelectedBlob] = useState<string>('1');
  
  // Skills state
  const [skillsSearchQuery, setSkillsSearchQuery] = useState('');
  const [skillsSortOrder, setSkillsSortOrder] = useState<'attribute' | 'alphabetical'>('attribute');
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    skillName: ''
  });
  
  // Spells popup state
  const [showSpellsPopup, setShowSpellsPopup] = useState(false);
  const [spellsPopupPosition, setSpellsPopupPosition] = useState({ x: 0, y: 0 });
  
  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Skills data
  const skills = [
    { name: 'Acrobatics', attribute: 'DEX', modifier: '+5', icon: '/assets/skills/Acrobatics.svg' },
    { name: 'Animal Handling', attribute: 'WIS', modifier: '+3', icon: '/assets/skills/AnimalHandling.svg' },
    { name: 'Arcana', attribute: 'INT', modifier: '+7', icon: '/assets/skills/Arcana.svg' },
    { name: 'Athletics', attribute: 'STR', modifier: '+4', icon: '/assets/skills/Athletics.svg' },
    { name: 'Deception', attribute: 'CHA', modifier: '+6', icon: '/assets/skills/Deception.svg' },
    { name: 'History', attribute: 'INT', modifier: '+5', icon: '/assets/skills/History.svg' },
    { name: 'Insight', attribute: 'WIS', modifier: '+4', icon: '/assets/skills/Insight.svg' },
    { name: 'Intimidation', attribute: 'CHA', modifier: '+3', icon: '/assets/skills/Intimidation.svg' },
    { name: 'Investigation', attribute: 'INT', modifier: '+6', icon: '/assets/skills/Investigation.svg' },
    { name: 'Medicine', attribute: 'WIS', modifier: '+2', icon: '/assets/skills/Medicine.svg' },
    { name: 'Nature', attribute: 'INT', modifier: '+4', icon: '/assets/skills/Nature.svg' },
    { name: 'Perception', attribute: 'WIS', modifier: '+5', icon: '/assets/skills/Perception.svg' },
    { name: 'Performance', attribute: 'CHA', modifier: '+4', icon: '/assets/skills/Performance.svg' },
    { name: 'Persuasion', attribute: 'CHA', modifier: '+5', icon: '/assets/skills/Insight.svg' },
    { name: 'Religion', attribute: 'INT', modifier: '+3', icon: '/assets/skills/Religion.svg' },
    { name: 'Sleight of Hand', attribute: 'DEX', modifier: '+4', icon: '/assets/skills/SleightOfHand.svg' },
    { name: 'Stealth', attribute: 'DEX', modifier: '+6', icon: '/assets/skills/Stealth.svg' },
    { name: 'Survival', attribute: 'WIS', modifier: '+3', icon: '/assets/skills/Survival.svg' },
  ];

  // Filter and sort skills
  const filteredSkills = skills
    .filter(skill => 
      skill.name.toLowerCase().includes(skillsSearchQuery.toLowerCase()) ||
      skill.attribute.toLowerCase().includes(skillsSearchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (skillsSortOrder === 'attribute') {
        return a.attribute.localeCompare(b.attribute) || a.name.localeCompare(b.name);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // Handle skill right click
  const handleSkillRightClick = (e: React.MouseEvent, skillName: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      skillName
    });
  };

  // Handle context menu close
  const handleContextMenuClose = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Handle advantage/disadvantage
  const handleAdvantage = (skillName: string) => {
    console.log(`Rolling ${skillName} with advantage`);
    handleContextMenuClose();
  };

  const handleDisadvantage = (skillName: string) => {
    console.log(`Rolling ${skillName} with disadvantage`);
    handleContextMenuClose();
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

  // Check if current player can control a blob
  const canControlBlob = (blob: Blob) => {
    return blob.controller === currentPlayerId;
  };

  // Handle blob movement from Map component
  const handleMoveBlob = (blobId: string, newGridPos: GridPosition) => {
    const newPixelPos = {
      x: newGridPos.x * GRID_SIZE + GRID_SIZE / 2,
      y: newGridPos.y * GRID_SIZE + GRID_SIZE / 2
    };
    
    setBlobs(prev => prev.map(blob => 
      blob.id === blobId 
        ? { ...blob, x: newPixelPos.x, y: newPixelPos.y }
        : blob
    ));
  };

  // Handle blob selection
  const handleBlobSelect = (id: string) => {
    setSelectedBlob(id);
    // Reset speed when selecting a new blob (in real app, this would be per-character)
    setCharacterSpeed(6);
  };

  // Damage/heal player for testing
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

  // Handle portrait click
  const handlePortraitClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpellsPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setShowSpellsPopup(true);
  };

  // Handle spell selection
  const handleSpellSelect = (spell: any) => {
    console.log(`Selected spell: ${spell.name}`);
    setShowSpellsPopup(false);
    // TODO: Implement spell selection logic
  };

  // Get all blobs controlled by current player
  const myBlobs = blobs.filter(b => b.controller === currentPlayerId);
  const otherPlayerBlobs = blobs.filter(b => b.controller === 'P2');
  const enemyBlobs = blobs.filter(b => b.controller === 'DM');

  // Handle mouse movement on the map
  const handleMapMouseMove = useCallback((e: React.MouseEvent) => {
    // This is now handled by the Map component internally
    // The Map component will calculate movement paths based on mouse position
  }, []);

  // Handle right click on the map
  const handleMapRightClick = useCallback((e: React.MouseEvent) => {
    // Could be used for context menus, targeting, etc.
    console.log('Right clicked on map at:', e.clientX, e.clientY);
  }, []);

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
                className="w-full px-3 py-2 bg-[#262420] border border-[#473D31] rounded text-[#A08A6E] text-sm hover:bg-[#2d2926] hover:border-[#5a4f42] transition-colors"
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
              Alphabetical
            </button>
          </div>
        </div>

        {/* Skills List */}
        <div className="flex flex-col gap-2 w-full p-4 max-h-96 overflow-y-auto overflow-x-hidden">
          {filteredSkills.map((skill) => (
            <Skill
              key={skill.name}
              name={skill.name}
              icon={skill.icon}
              onClick={() => console.log(`${skill.name} clicked`)}
              onContextMenu={(e) => handleSkillRightClick(e, skill.name)}
            />
          ))}
        </div>

        {/* Test Controls */}
        <div className="flex flex-col gap-2 w-full p-4 border-t border-game-gold">
          <h3 className="text-game-gold font-bold text-sm">Test Controls</h3>
          <div className="flex gap-2">
            <button
              onClick={damagePlayer}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
            >
              Damage
            </button>
            <button
              onClick={healPlayer}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
            >
              Heal
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMyTurn(!isMyTurn)}
              className={`px-3 py-2 rounded text-white text-sm transition-colors ${
                isMyTurn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isMyTurn ? 'End Turn' : 'Start Turn'}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCharacterSpeed(6)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
            >
              Reset Speed
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Map */}
        <div className="flex-1 p-4 min-h-0 overflow-hidden">
          <Map
            blobs={blobs}
            selectedBlob={selectedBlob}
            hoverPath={[]} // No longer used, but keeping for compatibility
            onBlobSelect={handleBlobSelect}
            onMouseMove={handleMapMouseMove}
            onRightClick={handleMapRightClick}
            canControlBlob={canControlBlob}
            characterData={characterData}
            isTurn={isMyTurn}
            onMoveBlob={handleMoveBlob}
          />
        </div>

        {/* Player Bar */}
        <div className="h-48 bg-game-gray border-t border-game-gold p-4 flex items-center gap-6">
          {/* Portrait */}
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
                <li>Use the movement controls in the bottom-left when it's your turn</li>
                <li>Each movement costs speed: 1 for cardinal directions, 1.4 for diagonal</li>
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
                <li>Diagonal movement allowed (costs 1.4 speed)</li>
                <li>Movement controls appear when it's your turn</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
