import Peer, { DataConnection } from 'peerjs';
import { useGameStore } from '../store/gameStore';

export interface NetworkMessage {
  type: string;
  data: any;
  senderId: string;
  timestamp: number;
}

export class PeerManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private gameStore = useGameStore.getState();

  constructor() {
    this.initializePeer();
  }

  private initializePeer() {
    this.peer = new Peer({
      host: 'localhost',
      port: 9000,
      path: '/peerjs',
      debug: 3,
    });

    this.peer.on('open', (id) => {
      console.log('Peer connection opened with ID:', id);
      this.gameStore.setPeerId(id);
    });

    this.peer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      this.handleConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
    });
  }

  private handleConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn);

    conn.on('data', (data: NetworkMessage) => {
      this.handleMessage(data);
    });

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer);
      this.connections.delete(conn.peer);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }

  private handleMessage(message: NetworkMessage) {
    const { type, data, senderId } = message;
    
    switch (type) {
      case 'CHARACTER_UPDATE':
        this.gameStore.updateCharacter(data.id, data.updates);
        break;
      case 'GAME_STATE_UPDATE':
        this.gameStore.setGameState(data);
        break;
      case 'MAP_UPDATE':
        this.gameStore.setCurrentMap(data);
        break;
      case 'COMBAT_START':
        this.gameStore.startCombat();
        break;
      case 'COMBAT_END':
        this.gameStore.endCombat();
        break;
      case 'NEXT_TURN':
        this.gameStore.nextTurn();
        break;
      case 'DICE_ROLL':
        // Handle dice roll results
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }

  public connectToPeer(peerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error('Peer not initialized'));
        return;
      }

      const conn = this.peer.connect(peerId);
      
      conn.on('open', () => {
        console.log('Connected to peer:', peerId);
        this.connections.set(peerId, conn);
        resolve();
      });

      conn.on('error', (err) => {
        console.error('Connection error:', err);
        reject(err);
      });

      this.handleConnection(conn);
    });
  }

  public sendMessage(type: string, data: any) {
    const message: NetworkMessage = {
      type,
      data,
      senderId: this.peer?.id || '',
      timestamp: Date.now(),
    };

    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  public broadcastCharacterUpdate(characterId: string, updates: any) {
    this.sendMessage('CHARACTER_UPDATE', { id: characterId, updates });
  }

  public broadcastGameStateUpdate(state: any) {
    this.sendMessage('GAME_STATE_UPDATE', state);
  }

  public broadcastMapUpdate(map: any) {
    this.sendMessage('MAP_UPDATE', map);
  }

  public broadcastCombatStart() {
    this.sendMessage('COMBAT_START', {});
  }

  public broadcastCombatEnd() {
    this.sendMessage('COMBAT_END', {});
  }

  public broadcastNextTurn() {
    this.sendMessage('NEXT_TURN', {});
  }

  public getPeerId(): string | null {
    return this.peer?.id || null;
  }

  public getConnections(): string[] {
    return Array.from(this.connections.keys());
  }

  public disconnect() {
    this.connections.forEach((conn) => {
      conn.close();
    });
    this.connections.clear();
    
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

// Singleton instance
export const peerManager = new PeerManager();

