# FERRUM MMO - Medieval Strategy Browser Game

A complete, browser-based MMO strategy game inspired by classic tribal warfare games, featuring real-time resource management, tactical combat, dynasty systems, and persistent world mechanics.

## 🎮 Features

- **Real-Time Resource Management**: Offline progression system with automatic resource production
- **Tactical Combat**: Rock-paper-scissors tactic system with formations and morale mechanics
- **Dynasty System**: Unique Lord DNA inheritance with 20+ traits and 10+ flaws
- **World Map**: 100x100 grid with multiple villages, AI opponents, and barbarian camps
- **Vassalization**: Conquer and subjugate opponents for tribute payments
- **Build Queue**: 3 simultaneous construction slots with automatic progression
- **Army Management**: Recruit, train, and deploy diverse unit types
- **Battle Reports**: Detailed combat analysis with losses, tactics, and rewards

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
ferrum-mmo-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Game pages (Home, Game)
│   │   ├── components/       # UI components
│   │   ├── contexts/         # React contexts (GameContext)
│   │   ├── hooks/            # Custom hooks (useGameAPI)
│   │   ├── App.tsx           # Main app component
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets
│   └── index.html            # HTML entry point
├── server/                    # Express backend
│   ├── api.ts                # API routes
│   ├── index.ts              # Server entry point
│   ├── core/                 # Game logic modules
│   │   ├── ResourceManager.js
│   │   ├── BuildQueueManager.js
│   │   ├── CombatEngine.js
│   │   ├── DynastyManager.js
│   │   ├── EconomyManager.js
│   │   ├── MapManager.js
│   │   ├── RecruitmentManager.js
│   │   └── GameBalanceCalculator.js
│   └── data/                 # Game data
│       ├── schema.json
│       ├── tech_tree.json
│       ├── economic_balance.json
│       └── military_balance.json
└── package.json
```

## 🎯 Core Game Systems

### 1. City Management
- **Resources**: Wood, Stone, Iron, Grain
- **Buildings**: 12 building types with progressive upgrades
- **Population**: Managed through Farm levels
- **Production**: Real-time calculation based on building levels

### 2. Combat System
- **Units**: 9 unit types (Spearmen, Swordsmen, Archers, Cavalry, Siege Weapons, etc.)
- **Tactics**: Klin, Mur Tarcz, Deszcz Strzał, Zasadzka with counter-bonuses
- **Morale**: Affects unit performance and desertion rates
- **Walls**: Provide defensive bonuses

### 3. Dynasty & Inheritance
- **Lord Traits**: 20+ traits providing gameplay bonuses
- **Flaws**: 10+ flaws providing penalties
- **Inheritance**: Successors inherit traits and gain mutations
- **Lifespan**: 60-day cycle with succession mechanics

### 4. World Map
- **100x100 Grid**: Large explorable world
- **Multiple Villages**: Manage up to 10+ settlements
- **AI Opponents**: 20 AI-controlled villages
- **Barbarian Camps**: PvE targets for early expansion

## 🎮 Gameplay Flow

### First 30 Minutes
1. **Tutorial**: Learn building, recruitment, and combat basics
2. **First Build**: Upgrade Woodcutter to level 2
3. **First Recruitment**: Train 5 Spearmen
4. **First Scout**: Gather intelligence on nearby barbarian camp
5. **First Combat**: Attack and conquer barbarian village

### Mid-Game
- Expand to 2-3 villages
- Build military infrastructure (Barracks, Stables)
- Engage in player-vs-player combat
- Form alliances with other players

### Late-Game
- Manage 5-10 villages
- Lead large armies in coordinated attacks
- Subjugate other players as vassals
- Participate in world events and sieges

## 🛠️ API Endpoints

### Game State
- `GET /api/state?player_id=<id>` - Get current game state

### Building
- `POST /api/build` - Start building structure
  ```json
  {
    "player_id": "player_1",
    "village_id": "village_1",
    "building_type": "woodcutter",
    "level": 2
  }
  ```

### Recruitment
- `POST /api/recruit` - Recruit units
  ```json
  {
    "player_id": "player_1",
    "village_id": "village_1",
    "unit_type": "spearman",
    "count": 10
  }
  ```

### Combat
- `POST /api/attack` - Send army to attack
  ```json
  {
    "player_id": "player_1",
    "village_id": "village_1",
    "target_x": 52,
    "target_y": 48,
    "units": { "spearman": 20, "archer": 10 }
  }
  ```

### Scouting
- `POST /api/scout` - Send scout to gather intelligence
  ```json
  {
    "player_id": "player_1",
    "target_x": 52,
    "target_y": 48
  }
  ```

## 📊 Game Balance

### Building Costs
- Base cost multiplier: 1.2x per level
- Build times: 5 minutes base + 1 minute per level
- Population requirements scale with building level

### Unit Costs
- **Spearman**: 50 Wood, 30 Grain
- **Swordsman**: 80 Wood, 20 Iron, 40 Grain
- **Archer**: 60 Wood, 10 Iron, 30 Grain
- **Cavalry**: 100 Wood, 40 Iron, 60 Grain

### Combat Mechanics
- Attack vs Defense calculation with wall bonuses
- Morale affects unit performance (±20%)
- Tactics provide +20% bonus when countering
- Desertion chance: 10% at low morale

## 💾 Data Persistence

Game state is automatically saved to:
- **Browser localStorage**: For quick saves during gameplay
- **Server database**: For persistent cross-session data

Auto-save occurs every 30 seconds during gameplay.

## 🎨 UI/UX Design

- **Dark Medieval Theme**: Slate and amber color scheme
- **Responsive Layout**: Works on desktop and tablet
- **Real-Time Updates**: Live resource counters and timers
- **Intuitive Navigation**: Tab-based interface for different game sections

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run check    # TypeScript type checking
npm run format   # Format code with Prettier
```

### Adding New Features

1. **New Building Type**: Add to `tech_tree.json` and update balance data
2. **New Unit Type**: Update military balance and recruitment logic
3. **New Trait/Flaw**: Add to `DynastyManager.js`
4. **New Event**: Implement in `GameSystemsManager.js`

## 📚 Game Design Documents

- `FERRUM_MMO_System_Documentation.md` - Core systems overview
- `FERRUM_MMO_Balance_Documentation.md` - Detailed balance tables
- `FERRUM_UI_Design_Specification.md` - UI/UX specifications

## 🐛 Known Limitations

- Single-player singleplayer mode (no multiplayer yet)
- AI villages have basic behavior (no advanced tactics)
- No persistent world between server restarts
- Limited to 100x100 map size

## 🚀 Future Enhancements

- [ ] Multiplayer support with real players
- [ ] Advanced AI with strategic decision-making
- [ ] Alliance system with shared resources
- [ ] Trading and market mechanics
- [ ] Seasonal events and tournaments
- [ ] Mobile app version
- [ ] Persistent database integration

## 📝 License

MIT

## 👥 Credits

Developed as a complete MMO strategy game prototype inspired by classic tribal warfare games.

---

**Status**: MVP Ready - Fully playable single-player experience with all core mechanics implemented.
