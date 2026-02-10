import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import type { User } from '../drizzle/schema';

export interface GameState {
  playerId: string;
  villageId: string;
  x: number;
  y: number;
  resources: Record<string, number>;
  armies: any[];
  buildings: Record<string, number>;
}

export interface ArmyMovement {
  id: string;
  playerId: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  units: Record<string, number>;
  arrivalTime: number;
  status: 'marching' | 'attacking' | 'returning';
}

// Store active player connections
const playerConnections = new Map<string, Socket>();
const armyMovements = new Map<string, ArmyMovement>();
const worldState = new Map<string, GameState>();

export function initializeWebSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? undefined : '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    // Verify user authentication
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('Authentication required'));
    }
    socket.data.userId = userId;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    playerConnections.set(userId, socket);

    console.log(`[WebSocket] Player ${userId} connected`);

    // Player joins game world
    socket.on('join-world', (data: { playerId: string; villageId: string; x: number; y: number }) => {
      socket.join(`world:${data.playerId}`);
      socket.join('world:all');

      // Broadcast player joined
      io.to('world:all').emit('player-joined', {
        playerId: data.playerId,
        x: data.x,
        y: data.y,
        timestamp: Date.now(),
      });

      // Send current world state to new player
      const worldSnapshot = Array.from(worldState.values());
      socket.emit('world-state', {
        villages: worldSnapshot,
        armies: Array.from(armyMovements.values()),
      });
    });

    // Player sends army
    socket.on('send-army', (data: { playerId: string; from: { x: number; y: number }; to: { x: number; y: number }; units: Record<string, number>; arrivalTime: number }) => {
      const armyId = `army_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const movement: ArmyMovement = {
        id: armyId,
        playerId: data.playerId,
        from: data.from,
        to: data.to,
        units: data.units,
        arrivalTime: data.arrivalTime,
        status: 'marching',
      };

      armyMovements.set(armyId, movement);

      // Broadcast army movement to all players
      io.to('world:all').emit('army-movement', {
        armyId,
        playerId: data.playerId,
        from: data.from,
        to: data.to,
        units: data.units,
        arrivalTime: data.arrivalTime,
        status: 'marching',
      });

      // Schedule army arrival
      setTimeout(() => {
        handleArmyArrival(io, armyId);
      }, data.arrivalTime - Date.now());
    });

    // Player updates resources
    socket.on('update-resources', (data: { playerId: string; resources: Record<string, number> }) => {
      const state = worldState.get(data.playerId);
      if (state) {
        state.resources = data.resources;
        io.to('world:all').emit('player-resources-updated', {
          playerId: data.playerId,
          resources: data.resources,
        });
      }
    });

    // Player starts building
    socket.on('start-build', (data: { playerId: string; villageId: string; building: string; level: number; endTime: number }) => {
      io.to('world:all').emit('build-started', {
        playerId: data.playerId,
        villageId: data.villageId,
        building: data.building,
        level: data.level,
        endTime: data.endTime,
      });
    });

    // Player completes build
    socket.on('build-complete', (data: { playerId: string; villageId: string; building: string; level: number }) => {
      io.to('world:all').emit('build-completed', {
        playerId: data.playerId,
        villageId: data.villageId,
        building: data.building,
        level: data.level,
      });
    });

    // Battle report
    socket.on('battle-report', (data: any) => {
      io.to('world:all').emit('battle-occurred', {
        attacker: data.attacker,
        defender: data.defender,
        result: data.result,
        timestamp: Date.now(),
      });
    });

    // Chat message
    socket.on('chat-message', (data: { playerId: string; message: string; alliance?: string }) => {
      if (data.alliance) {
        io.to(`alliance:${data.alliance}`).emit('chat-message', {
          playerId: data.playerId,
          message: data.message,
          timestamp: Date.now(),
        });
      } else {
        io.to('world:all').emit('chat-message', {
          playerId: data.playerId,
          message: data.message,
          timestamp: Date.now(),
        });
      }
    });

    // Player disconnects
    socket.on('disconnect', () => {
      playerConnections.delete(userId);
      io.to('world:all').emit('player-disconnected', {
        playerId: userId,
        timestamp: Date.now(),
      });
      console.log(`[WebSocket] Player ${userId} disconnected`);
    });

    socket.on('error', (error) => {
      console.error(`[WebSocket] Error from ${userId}:`, error);
    });
  });

  return io;
}

function handleArmyArrival(io: SocketIOServer, armyId: string) {
  const army = armyMovements.get(armyId);
  if (!army) return;

  // Update army status
  army.status = 'attacking';

  io.to('world:all').emit('army-arrived', {
    armyId,
    playerId: army.playerId,
    location: army.to,
    timestamp: Date.now(),
  });

  // Simulate battle resolution (simplified)
  setTimeout(() => {
    army.status = 'returning';
    io.to('world:all').emit('army-returning', {
      armyId,
      playerId: army.playerId,
      location: army.to,
      timestamp: Date.now(),
    });

    // Remove army after return journey
    setTimeout(() => {
      armyMovements.delete(armyId);
    }, 5000);
  }, 10000);
}

export function getPlayerSocket(userId: string): Socket | undefined {
  return playerConnections.get(userId);
}

export function broadcastToWorld(event: string, data: any) {
  const io = (global as any).io as SocketIOServer;
  if (io) {
    io.to('world:all').emit(event, data);
  }
}
