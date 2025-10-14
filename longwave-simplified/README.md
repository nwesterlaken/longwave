# Longwave Simplified

Een vereenvoudigde en uitgebreide versie van het Longwave party game, geoptimaliseerd voor professioneel gebruik en teamontwikkeling.

## Features

### Huidige Implementatie (FASE 1 - Voltooid)

✅ **Backend Infrastructure**
- Express.js + Socket.io server voor real-time communicatie
- SQLite database voor persistente opslag
- In-memory caching voor snelle toegang
- Automatische cleanup van inactieve rooms
- Reconnection handling
- Volledige unit test coverage

✅ **Frontend Basis**
- Vite-based React applicatie
- Moderne, responsive UI met CSS variabelen
- Socket.io client met automatic reconnection
- Room creation en join functionaliteit
- Error handling en status indicators

### Geplande Features (FASE 2 & 3)

🚧 **Classic Mode**
- Teams-based gameplay (originele Wavelength mechanics)
- Spectrum cards met Nederlandse vertalingen
- Score tracking
- Round-based gameplay

🚧 **Pulse Check Mode**
- Individueel en anoniem spelen
- 30+ nieuwe spectrum cards voor teamgezondheid
- Heatmap visualisatie van resultaten
- Export functionaliteit (JSON/CSV)
- Discussie moderatie tools

🚧 **Reflection Mode**
- Optionele reflectie tussen rondes
- Gestructureerde vragen
- Team notities
- PDF/JSON export

## Installatie

### Vereisten

- Node.js v18 of hoger
- npm v9 of hoger

### Setup

1. **Clone de repository**
```bash
git clone <repository-url>
cd longwave-simplified
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

## Development

### Quick Start

```bash
# Terminal 1 - Server
cd server
npm install
npm run dev

# Terminal 2 - Client
cd client
npm install
npm run dev
```

Server: `http://localhost:3001`  
Client: `http://localhost:5173`

### Tests uitvoeren

```bash
cd server
npm test  # 10 unit tests
```

---

## Production Deployment

### Docker (Recommended)

```bash
docker-compose up -d
```

Application available at `http://localhost:3001`

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Docker deployment
- Manual deployment
- Cloud platform guides (Railway, Render, DigitalOcean, AWS)
- Environment configuration
- Monitoring & scaling
- Backup & restore

---

## Quick Deployment Links

**Deploy to Railway:** [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**Deploy to Render:** [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for configuration details.

## Project Structuur

```
longwave-simplified/
├── server/
│   ├── index.js              # Express + Socket.io server
│   ├── database.js           # SQLite database wrapper
│   ├── roomManager.js        # Room state management
│   ├── database.test.js      # Unit tests
│   ├── package.json
│   └── longwave.db          # SQLite database (auto-generated)
│
├── client/
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Main app component
│   │   ├── socket.js        # Socket.io client wrapper
│   │   └── styles.css       # Global styles
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Technische Details

### Backend

**Stack:**
- Express.js 4.x
- Socket.io 4.x
- SQLite3 5.x

**Database Schema:**
- `rooms` - Room metadata en settings
- `game_states` - Huidige game state (JSON)
- `session_history` - Event logging voor analytics

**Key Features:**
- Automatic reconnection handling
- Room state persistence
- Event logging
- Periodic cleanup van oude rooms (24h inactief)

### Frontend

**Stack:**
- React 18.x
- Vite 5.x
- Socket.io Client 4.x

**Key Features:**
- Modern CSS met variabelen voor theming
- Responsive design (mobile & desktop)
- Real-time updates via WebSocket
- Automatic reconnection
- Error handling & user feedback

## Socket.io Events

### Room Management

**Client → Server:**
- `room:create` - Nieuwe room aanmaken
- `room:join` - Join bestaande room
- `game:update` - Update game state
- `game:event` - Custom game events

**Server → Client:**
- `room:joined` - Bevestiging van room join
- `room:players` - Updated players list
- `room:player_joined` - Nieuwe speler joined
- `room:player_left` - Speler left
- `game:state` - Updated game state
- `error` - Error messages

## Environment Variables

### Server

```bash
PORT=3001                    # Server port (default: 3001)
CLIENT_URL=http://localhost:5173  # Client URL voor CORS
NODE_ENV=development         # Environment
```

### Client

```bash
VITE_SERVER_URL=http://localhost:3001  # Server URL
```

## Testing

De server heeft volledige test coverage voor:
- Database operations (CRUD)
- Room creation en management
- State persistence
- Cleanup operations

Run tests:
```bash
cd server
npm test
```

## Development Roadmap

### Phase 1: Basis Infrastructuur ✅
- [x] Express + Socket.io server
- [x] SQLite database integratie
- [x] RoomManager met in-memory cache
- [x] Unit tests
- [x] Vite client setup
- [x] Socket client wrapper
- [x] Basis UI components

### Phase 2: Game Modes (In Progress)
- [ ] Classic Mode implementatie
- [ ] Spectrum component
- [ ] 30+ Nederlandse Pulse Check cards
- [ ] Pulse Check Mode
- [ ] Heatmap visualisatie
- [ ] Export functionaliteit

### Phase 3: Additional Features
- [ ] Reflection Mode
- [ ] i18next integratie
- [ ] Persistente spelersessies
- [ ] Analytics dashboard
- [ ] Admin tools

## Contributing

Dit is een work-in-progress project. Bijdragen zijn welkom!

## License

MIT

## Credits

Gebaseerd op het originele Longwave project - een online adaptatie van het Wavelength party game.
