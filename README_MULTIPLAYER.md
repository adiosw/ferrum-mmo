# FERRUM MMO - Multiplayer Browser Game

A complete, production-ready browser-based MMO strategy game inspired by Tribal Wars, featuring real-time multiplayer, persistent world, dynasty systems, and tactical combat.

## 🎮 Features

### Core Gameplay
- **Real-Time Multiplayer**: Socket.io-powered live world synchronization
- **Persistent World**: 100x100 grid shared by all players
- **Resource Management**: Wood, Stone, Iron, Grain with real-time production
- **Building System**: 12 building types with progressive upgrades
- **Unit Recruitment**: 9 unit types with unique stats and costs
- **Tactical Combat**: Rock-paper-scissors tactic system with formations
- **Dynasty System**: Lord inheritance with 20+ traits and 10+ flaws
- **Vassalization**: Conquer and subjugate opponents for tribute

### Technical Features
- **tRPC API**: Type-safe end-to-end procedures
- **MySQL Database**: Persistent storage for all game data
- **Socket.io**: Real-time army movements and events
- **Authentication**: Manus OAuth integration
- **Docker Ready**: One-command deployment

## 🚀 Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Run with Docker Compose
docker-compose up --build
```

Access at `http://localhost:3000`

### Production

```bash
# Build for production
pnpm run build

# Start production server
pnpm start

# Or with Docker
docker build -t ferrum-mmo .
docker run -p 3000:3000 -e DATABASE_URL=mysql://... ferrum-mmo
```

## 📁 Project Structure

```
ferrum-mmo-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Game pages
│   │   ├── components/       # UI components
│   │   ├── contexts/         # Game state
│   │   └── lib/trpc.ts       # tRPC client
│   └── public/               # Static assets
├── server/                    # Express backend
│   ├── routers/              # tRPC procedures
│   │   └── game.ts           # Game logic
│   ├── websocket.ts          # Socket.io setup
│   ├── db.ts                 # Database queries
│   └── _core/                # Framework code
├── drizzle/                   # Database schema
│   ├── schema.ts             # User tables
│   └── mmo-schema.ts         # Game tables
├── Dockerfile                # Container config
├── docker-compose.yml        # Local dev setup
└── DEPLOYMENT.md             # Deployment guide
```

## 🎯 Game Systems

### Player Initialization
1. User registers/logs in via Manus OAuth
2. Creates player profile with unique name
3. Receives starting village at random coordinates
4. Gets starting resources and Lord with traits

### Village Management
- **Resources**: Automatically produced by buildings
- **Buildings**: Upgrade to increase production and unlock features
- **Population**: Managed through Farm levels
- **Walls**: Provide defensive bonuses in combat

### Army System
- **Recruitment**: Train units in Barracks/Stables
- **Marching**: Real-time movement across world map
- **Combat**: Automatic resolution with tactics
- **Losses**: Permanent removal of units

### Dynasty System
- **Lord Traits**: 20+ bonuses (Commander +10% Attack, Engineer +15% Build Speed, etc.)
- **Lord Flaws**: 10+ penalties (Sickly -20% Lifespan, Greedy -10% Morale, etc.)
- **Inheritance**: Successor inherits 1 trait, gains 1 random mutation
- **Lifespan**: 60 days per Lord, then succession

### Combat Mechanics
- **Tactics**: Klin, Mur Tarcz, Deszcz Strzał, Zasadzka
- **Counter System**: Each tactic counters another (+20% damage bonus)
- **Morale**: Affects unit performance and desertion rates
- **Walls**: Provide +20% defense bonus

## 🗄️ Database Schema

### Core Tables
- `users`: Manus OAuth accounts
- `player_profiles`: Game player data
- `villages`: Player settlements on map
- `armies`: Marching units
- `lords`: Dynasty leaders
- `buildings`: Construction queue
- `recruitment_queue`: Unit training
- `battle_reports`: Combat history
- `vassals`: Subjugation relationships
- `alliances`: Player groups

## 🔌 API Endpoints (tRPC)

### Game Procedures
```typescript
// Initialize new player
game.initializePlayer({ playerName: string })

// Get game state
game.getGameState()

// Get world map
game.getWorldMap()

// Send army to attack
game.sendArmy({ villageId, targetX, targetY, units, tactics })

// Start building
game.startBuild({ villageId, buildingType })

// Recruit units
game.recruitUnits({ villageId, unitType, count })

// Get battle reports
game.getBattleReports()
```

## 🔌 WebSocket Events

### Client → Server
```typescript
// Join world
socket.emit('join-world', { playerId, villageId, x, y })

// Send army
socket.emit('send-army', { playerId, from, to, units, arrivalTime })

// Update resources
socket.emit('update-resources', { playerId, resources })

// Start building
socket.emit('start-build', { playerId, villageId, building, level, endTime })

// Chat
socket.emit('chat-message', { playerId, message, alliance? })
```

### Server → Client
```typescript
// Player joined
socket.on('player-joined', { playerId, x, y, timestamp })

// Army movement
socket.on('army-movement', { armyId, playerId, from, to, units, arrivalTime })

// Army arrived
socket.on('army-arrived', { armyId, playerId, location })

// Battle occurred
socket.on('battle-occurred', { attacker, defender, result, timestamp })

// Chat message
socket.on('chat-message', { playerId, message, timestamp })
```

## ⚙️ Configuration

### Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/ferrum_mmo

# OAuth
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your_app_id

# Security
JWT_SECRET=your_secret_key_here

# Server
NODE_ENV=production
PORT=3000
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage
pnpm test:coverage
```

## 📊 Game Balance

### Building Costs
- Base cost: 100 resources
- Cost multiplier: 1.2x per level
- Build time: 5 minutes + 1 minute per level

### Unit Costs
| Unit | Wood | Iron | Grain | Time |
|------|------|------|-------|------|
| Spearman | 50 | - | 30 | 60s |
| Swordsman | 80 | 20 | 40 | 90s |
| Archer | 60 | 10 | 30 | 75s |
| Cavalry | 100 | 40 | 60 | 120s |

### Combat
- Attack vs Defense calculation with wall bonuses
- Morale affects unit performance (±20%)
- Tactics provide +20% bonus when countering
- Desertion chance: 10% at low morale

## 🚀 Deployment

### Docker (Recommended)
```bash
docker-compose up --build
```

### Manual VPS
See `DEPLOYMENT.md` for detailed instructions

### Scaling
- Use load balancer for multiple instances
- Share database across servers
- Use Redis for session storage
- Monitor with application logs

## 🛡️ Security

- OAuth authentication via Manus
- Password hashing with bcrypt
- SQL injection prevention via Drizzle ORM
- CORS protection
- Rate limiting on API endpoints
- SSL/TLS encryption in production

## 📈 Performance

- Database connection pooling
- Indexed queries for fast lookups
- Cached world map data
- Real-time updates via Socket.io
- Optimized React components

## 🐛 Known Limitations

- Single world per deployment
- AI villages have basic behavior
- No cross-server multiplayer
- Limited to 100x100 map size

## 🚀 Future Enhancements

- [ ] Advanced AI with strategic decision-making
- [ ] Alliance warfare and diplomacy
- [ ] Trading and market system
- [ ] Seasonal events and tournaments
- [ ] Mobile app version
- [ ] Cross-server multiplayer
- [ ] Guild halls and shared resources
- [ ] Leaderboards and rankings

## 📝 License

MIT

## 👥 Credits

Developed as a complete MMO strategy game prototype inspired by classic tribal warfare games like Tribal Wars.

---

**Status**: Production Ready - Fully playable multiplayer experience with all core mechanics implemented.

**Last Updated**: February 2026
