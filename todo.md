# FERRUM MMO Frontend - Development TODO

## Phase 1: Core Layout & Navigation
- [x] Update App.tsx with game routes and layout
- [x] Create GameLayout component with sidebar navigation
- [x] Create Header with player info and resources display
- [x] Create Sidebar with navigation menu
- [x] Setup dark medieval theme and styling

## Phase 2: City View
- [x] Create CityView page component
- [x] Build BuildingsList component
- [x] Build ResourcesDisplay component with real-time updates
- [x] Build BuildQueue component with progress bars
- [x] Build RecruitmentPanel component
- [x] Implement building upgrade/construction logic

## Phase 3: World Map
- [x] Create WorldMap page with Canvas
- [x] Implement 100x100 grid rendering
- [x] Add village markers and icons
- [x] Add player village highlight
- [x] Implement zoom and pan functionality
- [x] Add village info tooltip on hover
- [x] Add click handlers for village selection

## Phase 4: Army Management
- [x] Create ArmyManagement page
- [x] Build ArmyList component
- [x] Build SendArmyForm component
- [x] Implement unit selection interface
- [x] Implement tactics selection (Klin, Mur, etc.)
- [x] Add march timer display

## Phase 5: Battle Reports & Lord Profile
- [x] Create BattleReports page
- [x] Build BattleReportCard component
- [x] Create LordProfile page
- [x] Build TraitsDisplay component
- [x] Build FlawsDisplay component
- [x] Add dynasty inheritance info

## Phase 6: Socket.io Integration
- [ ] Setup Socket.io client connection
- [ ] Implement real-time army movement events
- [ ] Implement battle notification system
- [ ] Implement resource update broadcasts
- [ ] Add chat system (optional)

## Phase 7: AI Barbarians
- [ ] Create AIBarbarian class
- [ ] Implement resource gathering logic
- [ ] Implement recruitment logic
- [ ] Implement random attack logic
- [ ] Add barbarian villages to world map

## Phase 8: Animations & Polish
- [ ] Add page transition animations
- [ ] Add building upgrade animations
- [ ] Add army march animations on map
- [ ] Add battle effect animations
- [ ] Polish hover states and interactions
- [ ] Add sound effects (optional)

## Phase 9: Testing & Deployment
- [ ] Test all game flows
- [ ] Test responsive design
- [ ] Test Socket.io real-time features
- [ ] Create production build
- [ ] Package for deployment
