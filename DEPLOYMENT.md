# FERRUM MMO - Deployment Guide

## Local Development with Docker

### Prerequisites
- Docker and Docker Compose installed
- Node.js 22+ (for development without Docker)

### Quick Start

1. **Clone and setup**
```bash
git clone <repository>
cd ferrum-mmo-app
pnpm install
```

2. **Run with Docker Compose**
```bash
docker-compose up --build
```

This will:
- Start MySQL database on port 3306
- Build and start the FERRUM app on port 3000
- Automatically apply database migrations

3. **Access the application**
- Frontend: http://localhost:3000
- Database: mysql://ferrum_user:ferrum_password@localhost:3306/ferrum_mmo

### Environment Variables

Create a `.env.local` file:
```env
# Database
DATABASE_URL=mysql://ferrum_user:ferrum_password@localhost:3306/ferrum_mmo

# OAuth (Manus)
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OAUTH_SERVER_URL=https://api.manus.im

# App
VITE_APP_ID=your_app_id
JWT_SECRET=your_jwt_secret_key_here

# Node
NODE_ENV=development
PORT=3000
```

## Production Deployment on VPS

### Option 1: Docker on VPS (Recommended)

1. **SSH into your VPS**
```bash
ssh root@your_vps_ip
```

2. **Install Docker and Docker Compose**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

3. **Clone repository**
```bash
git clone <repository> /opt/ferrum-mmo
cd /opt/ferrum-mmo
```

4. **Create production environment file**
```bash
cat > .env.production << EOF
DATABASE_URL=mysql://ferrum_user:$(openssl rand -base64 32)@mysql:3306/ferrum_mmo
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OAUTH_SERVER_URL=https://api.manus.im
VITE_APP_ID=your_production_app_id
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3000
EOF
```

5. **Start with Docker Compose**
```bash
docker-compose -f docker-compose.yml up -d
```

6. **Setup Nginx reverse proxy**
```bash
# Install Nginx
apt-get update && apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx config
cat > /etc/nginx/sites-available/ferrum << 'EOF'
server {
    listen 80;
    server_name your_domain.com;

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
EOF

# Enable site
ln -s /etc/nginx/sites-available/ferrum /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL with Let's Encrypt
certbot --nginx -d your_domain.com
```

### Option 2: Manual Node.js Deployment

1. **SSH into VPS and install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt-get install -y nodejs
npm install -g pnpm
```

2. **Install MySQL**
```bash
apt-get install -y mysql-server
```

3. **Clone and setup**
```bash
git clone <repository> /opt/ferrum-mmo
cd /opt/ferrum-mmo
pnpm install
pnpm run build
```

4. **Create systemd service**
```bash
cat > /etc/systemd/system/ferrum-mmo.service << EOF
[Unit]
Description=FERRUM MMO Game Server
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ferrum-mmo
Environment="NODE_ENV=production"
Environment="DATABASE_URL=mysql://ferrum_user:password@localhost:3306/ferrum_mmo"
ExecStart=/usr/bin/node /opt/ferrum-mmo/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ferrum-mmo
systemctl start ferrum-mmo
```

5. **Setup Nginx (same as Option 1)**

## Database Migrations

### Running migrations
```bash
pnpm run db:push
```

### Backup database
```bash
mysqldump -u ferrum_user -p ferrum_mmo > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore database
```bash
mysql -u ferrum_user -p ferrum_mmo < backup_file.sql
```

## Monitoring

### Check application logs
```bash
# Docker
docker logs ferrum-app

# Systemd
journalctl -u ferrum-mmo -f
```

### Monitor database
```bash
# Connect to MySQL
mysql -u ferrum_user -p ferrum_mmo

# Check table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'ferrum_mmo'
ORDER BY size_mb DESC;
```

## Performance Optimization

### Database indexes
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_villages_player ON villages(playerId);
CREATE INDEX idx_armies_player ON armies(playerId);
CREATE INDEX idx_armies_status ON armies(status);
CREATE INDEX idx_battle_reports_attacker ON battle_reports(attackerId);
CREATE INDEX idx_battle_reports_defender ON battle_reports(defenderId);
```

### Caching strategy
- Use Redis for session storage (optional)
- Cache world map data with 1-minute TTL
- Cache player profiles with 5-minute TTL

### Database connection pooling
- MySQL connection pool size: 10-20
- Adjust based on concurrent players

## Scaling for Multiple Players

### Horizontal scaling
1. Use load balancer (HAProxy, Nginx)
2. Run multiple app instances
3. Use shared database (MySQL)
4. Use Redis for session sharing

### Vertical scaling
1. Increase server RAM
2. Upgrade CPU
3. Use SSD storage for database

## Security Checklist

- [ ] Change default MySQL password
- [ ] Enable SSL/TLS certificates
- [ ] Setup firewall rules (allow 80, 443, 3306 only from app)
- [ ] Enable database backups
- [ ] Setup monitoring and alerts
- [ ] Regular security updates
- [ ] Rate limiting on API endpoints
- [ ] DDoS protection (Cloudflare, etc.)

## Troubleshooting

### Database connection errors
```bash
# Check MySQL is running
systemctl status mysql

# Test connection
mysql -h localhost -u ferrum_user -p ferrum_mmo -e "SELECT 1"
```

### Application won't start
```bash
# Check logs
docker logs ferrum-app

# Verify environment variables
docker exec ferrum-app env | grep DATABASE_URL
```

### High memory usage
```bash
# Check Node.js process
ps aux | grep node

# Increase heap size
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js
```

## Support

For issues or questions:
1. Check application logs
2. Review database migrations
3. Verify environment configuration
4. Contact support team
