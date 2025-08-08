# D&D OS VTT

A modern open source baldurs-gate-3 inspired Virtual Tabletop built with PeerJS for networking and PixiJS.

Specifically designed to have a D&D battle engine, automating away some of the annoying parts of D&D - rolling dice, remembering your character effects etc.

Including a custom scripting system, for characters. The battle engine has specific events like "TurnBegin", "TurnEnd", "PlayerStart", "PlayerEnd".

![vision](./docs/Vision.png)

This VTT is intended mainly as a Battleground and Resource management VTT. Currently exploration gameplay is not planned.

## Features

- **Modern Dark UI**: Beautiful dark-themed interface inspired by Baldur's Gate 3
- **Real-time Networking**: Peer-to-peer connections using PeerJS
- **Interactive Battle Map**: PixiJS-powered map rendering with lighting effects
- **Character Management**: Complete character sheets with attributes, skills, and inventory
- **Combat System**: Automated initiative tracking and turn management
- **Dice Rolling**: Integrated dice rolling system for checks and saves
- **DM Interface**: Separate interface for Dungeon Masters with additional controls

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ddos-vtt.git
cd ddos-vtt
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. **Important**: For networking features to work, you also need to start the PeerJS server in a separate terminal:
```bash
npm install -g peer
peer --port 9000
```

5. Open your browser and navigate to:
   - `http://localhost:3000` - Player interface
   - `http://localhost:3000/dm` - DM interface

**Note**: If you see PeerJS connection errors in the browser console, make sure the PeerJS server is running on port 9000.

## Troubleshooting

### Common Issues

1. **PixiJS Errors**: If you see `TypeError: PIXI.Sprite.from is not a constructor`, try:
   - Restart the development server: `npm run dev`
   - Clear browser cache and refresh the page

2. **PeerJS Connection Errors**: If you see `ERR_CONNECTION_REFUSED` for PeerJS:
   - Make sure the PeerJS server is running: `peer --port 9000`
   - Check that port 9000 is not being used by another application

3. **TypeScript Errors**: If you see module resolution errors:
   - Run `npm install` to ensure all dependencies are properly installed
   - Restart your IDE/editor

## Usage

### Player Interface (`/`)

The main player interface includes:
- **Character Sheet**: View and manage character attributes, skills, and status effects
- **Battle Map**: Interactive map with character tokens and lighting
- **Inventory**: Manage character inventory and items
- **Combat Controls**: Start/end combat and manage turns

### DM Interface (`/dm`)

The DM interface provides additional controls:
- **Character Management**: Add/remove NPCs and manage all characters
- **Fog of War**: Control visibility and lighting
- **Player Management**: Manage connected players
- **DM Settings**: Advanced configuration options

### Networking

The VTT uses PeerJS for peer-to-peer networking:
- Each player gets a unique Peer ID
- Players can connect to each other using these IDs
- All game state is synchronized in real-time

## Project Structure

```
src/
├── components/          # React components
│   ├── GameInterface.tsx
│   ├── DMInterface.tsx
│   ├── MapRenderer.tsx
│   ├── CharacterSheet.tsx
│   └── Inventory.tsx
├── store/              # State management
│   └── gameStore.ts
├── networking/         # PeerJS networking
│   └── peerManager.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── data/               # Sample data
│   └── sampleData.ts
└── styles/             # CSS styles
    └── App.css
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Character Types**: Extend the `Character` interface in `src/types/index.ts`
2. **New Map Features**: Add properties to the `Map` interface
3. **Custom Scripts**: Implement in the battle engine system
4. **UI Components**: Create new components in `src/components/`

### Networking Setup

For production deployment, you'll need to set up a PeerJS server:

```bash
npm install -g peer
peer --port 9000
```

Then update the PeerJS configuration in `src/networking/peerManager.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Baldur's Gate 3's UI design
- Built with React, TypeScript, PixiJS, and PeerJS
- Special thanks to the D&D community for feedback and testing