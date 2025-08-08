export interface Character {
  id: string;
  name: string;
  portrait: string;
  health: {
    current: number;
    max: number;
  };
  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  skills: Skill[];
  inventory: InventoryItem[];
  statusEffects: StatusEffect[];
  position: Position;
  isPlayer: boolean;
  initiative: number;
}

export interface Skill {
  id: string;
  name: string;
  attribute: keyof Character['attributes'];
  modifier: number;
  icon: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  type: 'weapon' | 'armor' | 'consumable' | 'tool';
  quantity: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  icon: string;
  duration: number;
  type: 'buff' | 'debuff' | 'neutral';
}

export interface Position {
  x: number;
  y: number;
}

export interface Map {
  id: string;
  name: string;
  background: string;
  width: number;
  height: number;
  lighting: LightSource[];
  tokens: Token[];
}

export interface Token {
  id: string;
  characterId: string;
  position: Position;
  size: number;
  visible: boolean;
}

export interface LightSource {
  id: string;
  position: Position;
  radius: number;
  intensity: number;
  color: string;
}

export interface GameState {
  currentTurn: number;
  initiativeOrder: string[];
  phase: 'preparation' | 'combat' | 'exploration';
  selectedCharacter: string | null;
  map: Map | null;
}

export interface BattleEvent {
  type: 'TurnBegin' | 'TurnEnd' | 'PlayerStart' | 'PlayerEnd' | 'CombatStart' | 'CombatEnd';
  characterId?: string;
  data?: any;
}

export interface DiceRoll {
  dice: number;
  sides: number;
  modifier: number;
  result: number;
  rolls: number[];
}

