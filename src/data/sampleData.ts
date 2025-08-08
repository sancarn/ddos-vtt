import { Character, Map, Skill, InventoryItem, StatusEffect } from '../types';

// Sample skills
const sampleSkills: Skill[] = [
  { id: 'athletics', name: 'ATHLETICS', attribute: 'str', modifier: 2, icon: '🏃' },
  { id: 'acrobatics', name: 'ACROBATICS', attribute: 'dex', modifier: 3, icon: '🤸' },
  { id: 'arcana', name: 'ARCANA', attribute: 'int', modifier: 1, icon: '🔮' },
  { id: 'insight', name: 'INSIGHT', attribute: 'wis', modifier: 2, icon: '👁️' },
  { id: 'intimidation', name: 'INTIMIDATION', attribute: 'cha', modifier: 1, icon: '😠' },
  { id: 'investigation', name: 'INVESTIGATION', attribute: 'int', modifier: 2, icon: '🔍' },
  { id: 'medicine', name: 'MEDICINE', attribute: 'wis', modifier: 1, icon: '💊' },
  { id: 'nature', name: 'NATURE', attribute: 'int', modifier: 1, icon: '🌿' },
  { id: 'perception', name: 'PERCEPTION', attribute: 'wis', modifier: 3, icon: '👀' },
  { id: 'religion', name: 'RELIGION', attribute: 'int', modifier: 1, icon: '⛪' },
];

// Sample inventory items
const sampleInventory: InventoryItem[] = [
  { id: 'sword', name: 'Longsword', icon: '⚔️', type: 'weapon', quantity: 1 },
  { id: 'shield', name: 'Shield', icon: '🛡️', type: 'armor', quantity: 1 },
  { id: 'potion', name: 'Health Potion', icon: '🧪', type: 'consumable', quantity: 3 },
  { id: 'meat', name: 'Raw Meat', icon: '🥩', type: 'consumable', quantity: 2 },
];

// Sample status effects
const sampleStatusEffects: StatusEffect[] = [
  { id: 'blessed', name: 'Blessed', icon: '✨', duration: 3, type: 'buff' },
];

// Sample characters
export const sampleCharacters: Character[] = [
  {
    id: 'frodo',
    name: 'Frodo Baggins',
    portrait: 'https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=F',
    health: { current: 36, max: 47 },
    attributes: {
      str: 12,
      dex: 16,
      con: 14,
      int: 13,
      wis: 15,
      cha: 10,
    },
    skills: sampleSkills,
    inventory: sampleInventory,
    statusEffects: sampleStatusEffects,
    position: { x: 200, y: 300 },
    isPlayer: true,
    initiative: 18,
  },
  {
    id: 'aragorn',
    name: 'Aragorn',
    portrait: 'https://via.placeholder.com/64x64/50C878/FFFFFF?text=A',
    health: { current: 45, max: 52 },
    attributes: {
      str: 16,
      dex: 14,
      con: 15,
      int: 12,
      wis: 14,
      cha: 16,
    },
    skills: sampleSkills,
    inventory: sampleInventory,
    statusEffects: [],
    position: { x: 350, y: 250 },
    isPlayer: true,
    initiative: 15,
  },
  {
    id: 'orc1',
    name: 'Orc Warrior',
    portrait: 'https://via.placeholder.com/64x64/8B0000/FFFFFF?text=O',
    health: { current: 28, max: 28 },
    attributes: {
      str: 14,
      dex: 12,
      con: 13,
      int: 8,
      wis: 10,
      cha: 8,
    },
    skills: sampleSkills.slice(0, 5),
    inventory: [],
    statusEffects: [],
    position: { x: 500, y: 200 },
    isPlayer: false,
    initiative: 12,
  },
  {
    id: 'orc2',
    name: 'Orc Archer',
    portrait: 'https://via.placeholder.com/64x64/8B0000/FFFFFF?text=O',
    health: { current: 22, max: 22 },
    attributes: {
      str: 10,
      dex: 16,
      con: 11,
      int: 9,
      wis: 12,
      cha: 8,
    },
    skills: sampleSkills.slice(0, 5),
    inventory: [],
    statusEffects: [],
    position: { x: 600, y: 250 },
    isPlayer: false,
    initiative: 14,
  },
  {
    id: 'orc3',
    name: 'Orc Berserker',
    portrait: 'https://via.placeholder.com/64x64/8B0000/FFFFFF?text=O',
    health: { current: 35, max: 35 },
    attributes: {
      str: 18,
      dex: 10,
      con: 16,
      int: 7,
      wis: 9,
      cha: 6,
    },
    skills: sampleSkills.slice(0, 5),
    inventory: [],
    statusEffects: [],
    position: { x: 550, y: 350 },
    isPlayer: false,
    initiative: 10,
  },
  {
    id: 'orc4',
    name: 'Orc Shaman',
    portrait: 'https://via.placeholder.com/64x64/8B0000/FFFFFF?text=O',
    health: { current: 20, max: 20 },
    attributes: {
      str: 8,
      dex: 11,
      con: 10,
      int: 14,
      wis: 16,
      cha: 12,
    },
    skills: sampleSkills,
    inventory: [],
    statusEffects: [],
    position: { x: 650, y: 300 },
    isPlayer: false,
    initiative: 16,
  },
];

// Sample map
export const sampleMap: Map = {
  id: 'cobblestone-street',
  name: 'Cobblestone Street',
  background: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJjb2JibGVzdG9uZSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIj4KICAgICAgPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjM2EzYTM5Ii8+CiAgICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjIyIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzQ0NCIvPgogICAgICA8Y2lyY2xlIGN4PSIzOCIgY3k9IjEyIiByPSIyIiBmaWxsPSIjNDQ0Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjEyIiBjeT0iMzgiIHI9IjIiIGZpbGw9IiM0NDQiLz4KICAgICAgPGNpcmNsZSBjeD0iMzgiIGN5PSIzOCIgcj0iMiIgZmlsbD0iIzQ0NCIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NvYmJsZXN0b25lKSIvPgogIDwhLS0gQnVpbGRpbmdzIC0tPgogIDxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NDQyMiIvPgogIDxyZWN0IHg9IjU1MCIgeT0iMTUwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjODg2NjQ0Ii8+CiAgPHJlY3QgeD0iMzAwIiB5PSIzMDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNzAiIGZpbGw9IiM2NjQ0MjIiLz4KICA8IS0tIExpZ2h0cyAtLT4KICA8Y2lyY2xlIGN4PSI0MDAiIGN5PSIzMDAiIHI9IjMwIiBmaWxsPSIjZmZkNzAwIiBvcGFjaXR5PSIwLjYiLz4KICA8Y2lyY2xlIGN4PSI2MDAiIGN5PSIyMDAiIHI9IjIwIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjQiLz4KICA8Y2lyY2xlIGN4PSIyMDAiIGN5PSI0MDAiIHI9IjE1IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjQiLz4KPC9zdmc+',
  width: 800,
  height: 600,
  lighting: [
    {
      id: 'fire-pit',
      position: { x: 400, y: 300 },
      radius: 100,
      intensity: 0.8,
      color: '#ffd700',
    },
    {
      id: 'lantern-1',
      position: { x: 600, y: 200 },
      radius: 60,
      intensity: 0.6,
      color: '#ffffff',
    },
    {
      id: 'lantern-2',
      position: { x: 200, y: 400 },
      radius: 50,
      intensity: 0.5,
      color: '#ffffff',
    },
  ],
  tokens: [
    { id: 'token-frodo', characterId: 'frodo', position: { x: 200, y: 300 }, size: 40, visible: true },
    { id: 'token-aragorn', characterId: 'aragorn', position: { x: 350, y: 250 }, size: 40, visible: true },
    { id: 'token-orc1', characterId: 'orc1', position: { x: 500, y: 200 }, size: 40, visible: true },
    { id: 'token-orc2', characterId: 'orc2', position: { x: 600, y: 250 }, size: 40, visible: true },
    { id: 'token-orc3', characterId: 'orc3', position: { x: 550, y: 350 }, size: 40, visible: true },
    { id: 'token-orc4', characterId: 'orc4', position: { x: 650, y: 300 }, size: 40, visible: true },
  ],
};

