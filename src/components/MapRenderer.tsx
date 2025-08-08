import React, { useEffect, useRef } from 'react';
import { Application, Sprite, Graphics, Container } from 'pixi.js';
import { Map, Token, Character } from '../types';
import { useGameStore } from '../store/gameStore';

interface MapRendererProps {
  map: Map;
  width: number;
  height: number;
}

export const MapRenderer: React.FC<MapRendererProps> = ({ map, width, height }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const { characters, selectedCharacter, setSelectedCharacter } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create PIXI application
    const app = new Application({
      width,
      height,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // Create background
    const background = Sprite.from(map.background);
    background.width = width;
    background.height = height;
    app.stage.addChild(background);

    // Create lighting effects
    const lightingContainer = new Container();
    app.stage.addChild(lightingContainer);

    map.lighting.forEach(light => {
      const lightGraphics = new Graphics();
      lightGraphics.beginFill(0x000000, 0.7);
      lightGraphics.drawCircle(light.position.x, light.position.y, light.radius);
      lightGraphics.endFill();
      
      // Create a mask for the light
      const lightMask = new Graphics();
      lightMask.beginFill(0xFFFFFF);
      lightMask.drawCircle(light.position.x, light.position.y, light.radius);
      lightMask.endFill();
      
      lightingContainer.addChild(lightGraphics);
    });

    // Create tokens
    const tokenContainer = new Container();
    app.stage.addChild(tokenContainer);

    map.tokens.forEach(token => {
      const character = characters.find((c: Character) => c.id === token.characterId);
      if (!character) return;

      const tokenSprite = Sprite.from(character.portrait);
      tokenSprite.width = token.size;
      tokenSprite.height = token.size;
      tokenSprite.x = token.position.x;
      tokenSprite.y = token.position.y;
      tokenSprite.anchor.set(0.5);

      // Add border based on character type
      const border = new Graphics();
      const borderColor = character.isPlayer ? 0x00FF00 : 0xFF0000;
      border.lineStyle(3, borderColor);
      border.drawCircle(0, 0, token.size / 2);
      tokenSprite.addChild(border);

      // Add selection indicator
      if (selectedCharacter?.id === character.id) {
        const selectionIndicator = new Graphics();
        selectionIndicator.lineStyle(4, 0xFFFF00);
        selectionIndicator.drawCircle(0, 0, token.size / 2 + 5);
        tokenSprite.addChild(selectionIndicator);
      }

      // Make token interactive
      tokenSprite.eventMode = 'static';
      tokenSprite.cursor = 'pointer';
      
      tokenSprite.on('pointerdown', () => {
        setSelectedCharacter(character);
      });

      tokenContainer.addChild(tokenSprite);
    });

    // Add grid overlay
    const gridGraphics = new Graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.3);
    
    const gridSize = 50;
    for (let x = 0; x <= width; x += gridSize) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(width, y);
    }
    
    app.stage.addChild(gridGraphics);

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [map, characters, selectedCharacter, width, height, setSelectedCharacter]);

  return (
    <div 
      ref={canvasRef} 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
};

