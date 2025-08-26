# 🚀 Production Deployment Guide

This guide covers deploying the Brain Flip Battle Server to production environments.

## 📋 Prerequisites

- **Server**: Ubuntu 20.04+ or CentOS 8+ (recommended)
- **Node.js**: 18.x LTS or higher
- **PostgreSQL**: 12+ with connection pooling
- **Redis**: 6+ with persistence enabled
- **Nginx**: For reverse proxy and SSL termination
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **Domain**: Configured DNS for your server

## 🏗️ Server Setup

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server
```

### 2. PostgreSQL Configuration

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE brain_flip_battle;
CREATE USER battle_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE brain_flip_battle TO battle_user;
ALTER USER battle_user CREATEDB;
\q

# Configure PostgreSQL for production
sudo nano /etc/postgresql/*/main/postgresql.conf

# Add/modify these settings:
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Redis Configuration

```bash
# Configure Redis for production
sudo nano /etc/redis/redis.conf

# Add/modify these settings:
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# Restart Redis
sudo systemctl restart redis-server
```

## 🚀 Application Deployment

### 1. Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /opt/brain-flip-battle
sudo chown $USER:$USER /opt/brain-flip-battle

# Clone repository
cd /opt/brain-flip-battle
git clone https://github.com/your-username/brain-flip-game.git .

# Install dependencies
npm ci --only=production

# Build application
npm run build
```

### 2. Environment Configuration

```bash
# Create production environment file
nano .env

# Production environment variables
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brain_flip_battle
DB_USER=battle_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_URL=redis://localhost:6379

# JWT (generate a strong secret)
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# Client URL
CLIENT_URL=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. PM2 Configuration

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'brain-flip-battle',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## 🌐 Nginx Configuration

### 1. Create Nginx Site Configuration

```bash
sudo nano /etc/nginx/sites-available/brain-flip-battle
```

```nginx
upstream battle_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Client Max Body Size
    client_max_body_size 10M;

    # Proxy Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # WebSocket Support
    location /socket.io/ {
        proxy_pass http://battle_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Routes
    location /api/ {
        proxy_pass http://battle_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health Check
    location /health {
        proxy_pass http://battle_backend;
        access_log off;
    }

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=websocket:10m rate=30r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://battle_backend;
    }

    location /socket.io/ {
        limit_req zone=websocket burst=50 nodelay;
        proxy_pass http://battle_backend;
    }

    # Static Files (if serving frontend)
    location / {
        root /var/www/brain-flip-frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 2. Enable Site and SSL

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/brain-flip-battle /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Install Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp

# Enable firewall
sudo ufw enable
```

### 2. Fail2Ban Configuration

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create custom jail for battle server
sudo nano /etc/fail2ban/jail.local
```

```ini
[battle-server]
enabled = true
port = 3001
filter = battle-server
logpath = /opt/brain-flip-battle/logs/combined.log
maxretry = 5
bantime = 3600
findtime = 600
```

### 3. System Hardening

```bash
# Disable root login
sudo passwd -l root

# Configure SSH
sudo nano /etc/ssh/sshd_config

# Add/modify these settings:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2

# Restart SSH
sudo systemctl restart sshd
```

## 📊 Monitoring and Logging

### 1. Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/brain-flip-battle
```

```
/opt/brain-flip-battle/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. System Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Install Prometheus Node Exporter (optional)
wget https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz
tar xvfz node_exporter-*.tar.gz
sudo mv node_exporter-* /opt/node_exporter
```

### 3. PM2 Monitoring

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs brain-flip-battle

# View status
pm2 status
```

## 🚀 Performance Optimization

### 1. Node.js Optimization

```bash
# Add to your environment
export NODE_OPTIONS="--max-old-space-size=2048 --optimize-for-size"
```

### 2. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_players_score ON players(score DESC);
CREATE INDEX CONCURRENTLY idx_players_username ON players(username);
CREATE INDEX CONCURRENTLY idx_rooms_status ON rooms(status);
CREATE INDEX CONCURRENTLY idx_battle_history_timestamp ON battle_history(timestamp);

-- Analyze tables
ANALYZE players;
ANALYZE rooms;
ANALYZE battle_history;
```

### 3. Redis Optimization

```bash
# Configure Redis for better performance
sudo nano /etc/redis/redis.conf

# Add these settings:
maxmemory-policy allkeys-lru
save ""
appendonly no
```

## 🔄 Backup Strategy

### 1. Database Backup

```bash
# Create backup script
nano /opt/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="brain_flip_battle"
DB_USER="battle_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

# Log backup
echo "Database backup completed: db_backup_$DATE.sql.gz" >> $BACKUP_DIR/backup.log
```

```bash
# Make executable and add to cron
chmod +x /opt/backup-db.sh
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /opt/backup-db.sh
```

### 2. Application Backup

```bash
# Create application backup script
nano /opt/backup-app.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/brain-flip-battle"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application (excluding node_modules and logs)
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
    --exclude=$APP_DIR/node_modules \
    --exclude=$APP_DIR/logs \
    --exclude=$APP_DIR/.git \
    $APP_DIR

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

# Log backup
echo "Application backup completed: app_backup_$DATE.tar.gz" >> $BACKUP_DIR/backup.log
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo netstat -tulpn | grep :3001
   sudo kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "SELECT version();"
   ```

3. **Redis Connection Issues**
   ```bash
   sudo systemctl status redis-server
   redis-cli ping
   ```

4. **PM2 Issues**
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

### Health Checks

```bash
# Check application status
curl -f http://localhost:3001/health

# Check WebSocket connection
wscat -c ws://localhost:3001

# Check logs
pm2 logs brain-flip-battle --lines 100
```

## 📈 Scaling Considerations

### 1. Load Balancing

- Use multiple application instances
- Implement Redis-based session sharing
- Use Nginx as load balancer

### 2. Database Scaling

- Implement read replicas
- Use connection pooling (PgBouncer)
- Consider database sharding for large datasets

### 3. Caching Strategy

- Implement Redis clustering
- Use CDN for static assets
- Implement application-level caching

## 🎯 Next Steps

1. **Set up monitoring**: Implement Prometheus + Grafana
2. **CI/CD Pipeline**: Automate deployment process
3. **Load Testing**: Test server under high load
4. **Disaster Recovery**: Implement backup restoration procedures
5. **Security Auditing**: Regular security assessments

---

**For support and questions, refer to the main README.md file.**
