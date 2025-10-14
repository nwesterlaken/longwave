# Longwave Simplified - Deployment Guide

## Quick Start - Docker (Recommended)

### Prerequisites
- Docker & Docker Compose installed
- Port 3001 available

### Steps

1. **Clone & Navigate**
```bash
cd longwave-simplified
```

2. **Build & Run**
```bash
docker-compose up -d
```

3. **Access Application**
```
http://localhost:3001
```

4. **Check Status**
```bash
docker-compose ps
docker-compose logs -f longwave
```

5. **Stop**
```bash
docker-compose down
```

### Persistent Data
Database is stored in Docker volume `longwave-data`. 
To backup: `docker cp longwave-simplified-longwave-1:/app/data/longwave.db ./backup.db`

---

## Manual Deployment

### Prerequisites
- Node.js v18+
- npm v9+

### Production Build

**1. Build Client**
```bash
cd client
npm install
npm run build
```

**2. Setup Server**
```bash
cd ../server
npm install --production
```

**3. Configure Environment**
```bash
cp ../.env.example .env
# Edit .env with production values
```

**4. Start Server**
```bash
NODE_ENV=production node index.js
```

Server serves built client from `client/dist` automatically.

---

## Deployment Platforms

### Railway / Render / Heroku

**Setup:**
1. Connect GitHub repository
2. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `CLIENT_URL=https://your-app.railway.app`
3. Build command: `cd client && npm install && npm run build && cd ../server && npm install`
4. Start command: `cd server && node index.js`
5. Root directory: `longwave-simplified`

### DigitalOcean / AWS / GCP

**Using Docker:**
```bash
# Build image
docker build -t longwave:latest .

# Run container
docker run -d \
  -p 3001:3001 \
  -v longwave-data:/app/data \
  -e NODE_ENV=production \
  -e CLIENT_URL=https://your-domain.com \
  --name longwave \
  longwave:latest
```

### Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support for Socket.io
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Environment Variables

### Required
```bash
NODE_ENV=production
PORT=3001
```

### Optional
```bash
CLIENT_URL=https://your-domain.com  # For CORS
DATABASE_PATH=./data/longwave.db    # Custom DB location
```

---

## Health Checks

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1697280000000
}
```

**Usage in monitoring:**
```bash
curl http://localhost:3001/health
```

---

## Database Management

### Backup
```bash
# Docker
docker cp longwave-simplified-longwave-1:/app/data/longwave.db ./backup-$(date +%Y%m%d).db

# Manual
cp server/longwave.db ./backups/backup-$(date +%Y%m%d).db
```

### Restore
```bash
# Docker
docker cp ./backup.db longwave-simplified-longwave-1:/app/data/longwave.db
docker-compose restart

# Manual
cp ./backup.db server/longwave.db
```

### Reset Database
```bash
# Docker
docker-compose down -v
docker-compose up -d

# Manual
rm server/longwave.db
npm start  # Auto-creates new DB
```

---

## Scaling & Performance

### Recommended Resources
- **CPU:** 1 vCPU minimum, 2 vCPU for 50+ concurrent users
- **RAM:** 512MB minimum, 1GB for 50+ concurrent users
- **Storage:** 1GB (database grows ~1MB per 1000 games)

### Connection Limits
- **Socket.io:** Default handles 1000+ concurrent connections
- **SQLite:** Handles 100+ concurrent reads/writes efficiently

### Load Balancing
For multi-instance deployment, consider:
- Redis adapter for Socket.io
- PostgreSQL instead of SQLite
- Session sticky routing

---

## Monitoring

### Logs
```bash
# Docker
docker-compose logs -f longwave

# PM2 (if using PM2)
pm2 logs longwave
```

### Metrics to Monitor
- Active connections (Socket.io)
- Database size
- Memory usage
- CPU usage
- Error rates

---

## Security Checklist

- [x] HTTPS enabled (via reverse proxy or platform)
- [x] CORS configured (CLIENT_URL)
- [x] No sensitive data in logs
- [x] Database in persistent volume
- [x] Health checks configured
- [ ] Rate limiting (optional, add if needed)
- [ ] DDoS protection (platform/reverse proxy level)

---

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3001
kill -9 <PID>

# Or change port
PORT=3002 node index.js
```

### Database Locked
```bash
# Check for zombie processes
ps aux | grep node
kill -9 <PID>

# Restart application
docker-compose restart
```

### Socket.io Connection Issues
- Check CLIENT_URL matches actual domain
- Verify WebSocket support in reverse proxy
- Check CORS settings

### High Memory Usage
- Increase container memory limit
- Check for memory leaks in logs
- Restart application periodically

---

## Production Checklist

Before going live:
- [x] Environment variables configured
- [x] Database backup strategy in place
- [x] Health checks working
- [x] HTTPS configured
- [x] Domain/DNS configured
- [ ] Monitoring set up
- [ ] Error tracking (Sentry, etc.) - optional
- [ ] Load testing completed
- [ ] Backup & restore tested

---

## Support

For issues or questions:
1. Check server logs
2. Verify environment variables
3. Test health endpoint
4. Check GitHub issues

---

## Updates & Maintenance

### Updating Application
```bash
# Docker
git pull
docker-compose build
docker-compose up -d

# Manual
git pull
cd client && npm install && npm run build
cd ../server && npm install
pm2 restart longwave  # or your process manager
```

### Database Migrations
Currently no migrations needed. Future updates will include migration scripts if schema changes.

---

## Cost Estimates

### Free Tier Options
- **Railway:** 500 hours/month free (enough for testing)
- **Render:** 750 hours/month free
- **Fly.io:** Generous free tier

### Paid Hosting (est. monthly)
- **DigitalOcean Droplet:** $6-12/month
- **AWS Lightsail:** $5-10/month
- **Heroku Hobby:** $7/month
- **Railway Pro:** $5/month + usage

**Recommended for production:** DigitalOcean or Railway
