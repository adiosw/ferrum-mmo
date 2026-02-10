# FERRUM MMO - Production Edition

**Medieval Strategy MMO like Tribal Wars with Real-Time Multiplayer**

## Features

✅ **Game Speed x1.5** - Faster gameplay like Tribal Wars  
✅ **72h Starter Protection** - New players protected from attacks  
✅ **Premium Account** - +20% building/recruitment speed, +1 build slot  
✅ **Soft Monetization** - Crowns (in-game currency), no pay-to-win  
✅ **Stripe Payments** - Secure payment processing (card, BLIK, Google Pay)  
✅ **Real-Time Multiplayer** - Socket.io synchronization  
✅ **Dynasty System** - Traits, flaws, inheritance mechanics  
✅ **Tactical Combat** - Formations, tactics, morale system  
✅ **World Map** - 100x100 grid with barbarian villages  
✅ **AI NPCs** - Barbarians gather resources, recruit, attack  

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm)
- MySQL 8.0+
- Stripe Account (for payments)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database and Stripe keys

# 3. Push database schema
pnpm db:push

# 4. Start development server
pnpm dev
```

The game will be available at **http://localhost:3000**

---

## Environment Variables

### Required

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/ferrum_mmo

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Manus OAuth (Authentication)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

### Optional

```env
# Game Settings
GAME_SPEED=1.5
STARTER_PROTECTION_HOURS=72

# Frontend URL (for Stripe redirects)
VITE_FRONTEND_URL=http://localhost:3000
```

---

## Game Balance

### Game Speed Multiplier

All timings are divided by `GAME_SPEED = 1.5`:

| Activity | Base Time | With 1.5x Speed |
|----------|-----------|-----------------|
| Spearman Recruitment | 60s | 40s |
| Tartak Building | 5min | 3.3min |
| Army March (1 tile) | 1min | 40s |
| Farm Production | 1h | 40min |

### Starter Protection

- **Duration**: 72 hours
- **Effect**: Cannot be attacked, no loot stolen
- **Removal**: Player can remove early with confirmation dialog
- **Auto-Removal**: Expires automatically after 72h

### Premium Account (25 PLN / 30 days)

- +20% building speed
- +20% recruitment speed
- +1 build queue slot
- Extended battle reports
- Map marking tools
- **No combat bonuses** (fair play)

### Crown Packages

| Package | Crowns | Price |
|---------|--------|-------|
| Small | 20 | 9 PLN |
| Medium | 50 | 19 PLN |
| Large | 120 | 39 PLN |
| XLarge | 300 | 79 PLN |

### Boosters (Paid with Crowns)

- **Instant Build** (50 crowns) - Complete building immediately
- **Instant Recruit** (40 crowns) - Complete recruitment immediately
- **Army Return** (30 crowns) - Instantly return army from march
- **+12h Protection** (25 crowns) - Extend starter protection

---

## Database Schema

### Core Tables

- `users` - Player accounts (Manus OAuth)
- `player_profiles` - Game player data (level, experience, gold)
- `villages` - World map villages (resources, buildings, population)
- `armies` - Marching armies (units, destination, arrival time)
- `lords` - Dynasty lords (traits, flaws, age)
- `battles` - Battle history (attacker, defender, result, loot)

### Monetization Tables

- `user_currency` - Crown balance per player
- `user_premium` - Premium subscription status
- `starter_protection` - Starter protection timers
- `purchases` - Purchase history (Stripe integration)
- `boosters` - Active booster effects

---

## API Endpoints

### Game (tRPC)

```
POST /api/trpc/game.getGameState
POST /api/trpc/game.startBuild
POST /api/trpc/game.recruit
POST /api/trpc/game.sendArmy
POST /api/trpc/game.getWorldMap
POST /api/trpc/game.getBattleReports
```

### Payments (tRPC)

```
POST /api/trpc/payments.createCheckoutSession
GET /api/trpc/payments.getCurrencyBalance
GET /api/trpc/payments.getPremiumStatus
POST /api/trpc/payments.spendCrowns
```

### Stripe Webhook

```
POST /api/webhooks/stripe
```

---

## Deployment

### Docker

```bash
# Build image
docker build -t ferrum-mmo .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e STRIPE_SECRET_KEY=sk_... \
  ferrum-mmo
```

### VPS (Ubuntu 22.04)

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install pnpm
npm install -g pnpm

# 3. Clone repository
git clone <your-repo> /app/ferrum-mmo
cd /app/ferrum-mmo

# 4. Install dependencies
pnpm install

# 5. Setup environment
cp .env.example .env.local
nano .env.local  # Edit with your secrets

# 6. Push database
pnpm db:push

# 7. Build for production
pnpm build

# 8. Start with PM2
npm install -g pm2
pm2 start "pnpm start" --name ferrum-mmo
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name ferrum.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Stripe Setup

### 1. Create Stripe Account

Visit https://stripe.com and create an account.

### 2. Get API Keys

- Go to Dashboard → Developers → API Keys
- Copy **Secret Key** (sk_test_...)
- Copy **Publishable Key** (pk_test_...)

### 3. Setup Webhook

- Go to Developers → Webhooks
- Add endpoint: `https://your-domain.com/api/webhooks/stripe`
- Select events: `checkout.session.completed`, `charge.refunded`, `customer.subscription.deleted`
- Copy **Signing Secret** (whsec_...)

### 4. Add to Environment

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Testing

### Run Tests

```bash
pnpm test
```

### Test Payment Flow

1. Start dev server: `pnpm dev`
2. Go to Shop page
3. Click "Buy Crowns"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Enter any future expiry date and CVC

---

## Troubleshooting

### "Database not available"

```bash
# Check MySQL is running
sudo systemctl status mysql

# Or start Docker MySQL
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=ferrum_mmo \
  mysql:8.0
```

### "Stripe key not configured"

Ensure `STRIPE_SECRET_KEY` is set in `.env.local`

### Socket.io connection fails

Check that WebSocket is not blocked by firewall. Add to Nginx:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

## Performance Tips

1. **Database Indexing** - Ensure indexes on `villages.playerId`, `armies.playerId`
2. **Redis Caching** - Cache world map data (updates every 30s)
3. **CDN** - Serve static assets from CDN
4. **Load Balancing** - Use multiple app instances with sticky sessions for Socket.io

---

## Support & Feedback

For issues, feature requests, or feedback:
- GitHub Issues: [Your Repo]
- Discord: [Your Community]
- Email: support@ferrum-mmo.com

---

## License

MIT License - See LICENSE file

---

**FERRUM MMO - Build your empire. Lead your armies. Rule the realm.**
