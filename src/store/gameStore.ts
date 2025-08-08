import { create } from 'zustand';
import { Character, GameState, Map, BattleEvent, DiceRoll } from '../types';

interface GameStore {
  // State
  characters: Character[];
  gameState: GameState;
  currentMap: Map | null;
  selectedCharacter: Character | null;
  isDM: boolean;
  peerId: string | null;
  
  // Actions
  setCharacters: (characters: Character[]) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  
  setGameState: (state: Partial<GameState>) => void;
  setCurrentMap: (map: Map | null) => void;
  setSelectedCharacter: (character: Character | null) => void;
  setIsDM: (isDM: boolean) => void;
  setPeerId: (peerId: string | null) => void;
  
  // Battle actions
  startCombat: () => void;
  endCombat: () => void;
  nextTurn: () => void;
  rollDice: (dice: number, sides: number, modifier?: number) => DiceRoll;
  
  // Character actions
  rollAttributeCheck: (characterId: string, attribute: keyof Character['attributes']) => DiceRoll;
  rollSkillCheck: (characterId: string, skillId: string) => DiceRoll;
  takeDamage: (characterId: string, damage: number) => void;
  heal: (characterId: string, amount: number) => void;
}

const initialGameState: GameState = {
  currentTurn: 0,
  initiativeOrder: [],
  phase: 'preparation',
  selectedCharacter: null,
  map: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  characters: [],
  gameState: initialGameState,
  currentMap: null,
  selectedCharacter: null,
  isDM: false,
  peerId: null,
  
  // Character actions
  setCharacters: (characters) => set({ characters }),
  addCharacter: (character) => set((state) => ({ 
    characters: [...state.characters, character] 
  })),
  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map(char => 
      char.id === id ? { ...char, ...updates } : char
    )
  })),
  removeCharacter: (id) => set((state) => ({
    characters: state.characters.filter(char => char.id !== id)
  })),
  
  // Game state actions
  setGameState: (state) => set((currentState) => ({
    gameState: { ...currentState.gameState, ...state }
  })),
  setCurrentMap: (map) => set({ currentMap: map }),
  setSelectedCharacter: (character) => set({ selectedCharacter: character }),
  setIsDM: (isDM) => set({ isDM }),
  setPeerId: (peerId) => set({ peerId }),
  
  // Battle actions
  startCombat: () => {
    const { characters } = get();
    const initiativeOrder = characters
      .map(char => ({ id: char.id, initiative: char.initiative }))
      .sort((a, b) => b.initiative - a.initiative)
      .map(char => char.id);
    
    set((state) => ({
      gameState: {
        ...state.gameState,
        phase: 'combat',
        initiativeOrder,
        currentTurn: 0
      }
    }));
  },
  
  endCombat: () => set((state) => ({
    gameState: {
      ...state.gameState,
      phase: 'preparation',
      initiativeOrder: [],
      currentTurn: 0
    }
  })),
  
  nextTurn: () => set((state) => {
    const { initiativeOrder, currentTurn } = state.gameState;
    const nextTurn = (currentTurn + 1) % initiativeOrder.length;
    return {
      gameState: {
        ...state.gameState,
        currentTurn: nextTurn
      }
    };
  }),
  
  rollDice: (dice, sides, modifier = 0) => {
    const rolls = Array.from({ length: dice }, () => 
      Math.floor(Math.random() * sides) + 1
    );
    const result = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
    
    return {
      dice,
      sides,
      modifier,
      result,
      rolls
    };
  },
  
  rollAttributeCheck: (characterId, attribute) => {
    const { characters, rollDice } = get();
    const character = characters.find(c => c.id === characterId);
    if (!character) throw new Error('Character not found');
    
    const attributeValue = character.attributes[attribute];
    const modifier = Math.floor((attributeValue - 10) / 2);
    
    return rollDice(1, 20, modifier);
  },
  
  rollSkillCheck: (characterId, skillId) => {
    const { characters, rollDice } = get();
    const character = characters.find(c => c.id === characterId);
    if (!character) throw new Error('Character not found');
    
    const skill = character.skills.find(s => s.id === skillId);
    if (!skill) throw new Error('Skill not found');
    
    const attributeValue = character.attributes[skill.attribute];
    const attributeModifier = Math.floor((attributeValue - 10) / 2);
    const totalModifier = attributeModifier + skill.modifier;
    
    return rollDice(1, 20, totalModifier);
  },
  
  takeDamage: (characterId, damage) => {
    const { characters, updateCharacter } = get();
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    
    const newHealth = Math.max(0, character.health.current - damage);
    updateCharacter(characterId, {
      health: { ...character.health, current: newHealth }
    });
  },
  
  heal: (characterId, amount) => {
    const { characters, updateCharacter } = get();
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    
    const newHealth = Math.min(character.health.max, character.health.current + amount);
    updateCharacter(characterId, {
      health: { ...character.health, current: newHealth }
    });
  }
}));
