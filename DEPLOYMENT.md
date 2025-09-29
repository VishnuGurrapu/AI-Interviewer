# Deployment Guide

This guide covers different deployment options for the AI Interview Assistant application.

## Local Development

### Quick Start
```bash
# Install all dependencies
npm run install:all

# Set up environment and dependencies
npm run setup

# Seed the database
npm run seed

# Start backend (Terminal 1)
npm run dev:backend

# Start frontend (Terminal 2)
npm run dev:frontend
```

### Manual Setup
1. **Prerequisites**
   - Node.js 16+
   - MongoDB (local or cloud)
   - Git

2. **Environment Variables**
   
   **Backend (.env)**
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-interviewer
   PORT=5000
   OPENAI_API_KEY=your_openai_key_here  # Optional
   ```
   
   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Installation**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if local)
   mongod
   
   # Seed database
   cd backend
   npm run seed
   ```

5. **Start Services**
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (new terminal)
   cd frontend
   npm run dev
   ```

## Production Deployment

### Option 1: Traditional VPS/Server

#### Backend Deployment
```bash
# On your server
git clone <repository-url>
cd ai-interview-assistant

# Install dependencies
cd backend
npm install --production

# Set environment variables
cat > .env << EOF
MONGODB_URI=mongodb://your-mongo-connection-string
PORT=5000
NODE_ENV=production
OPENAI_API_KEY=your_openai_key
EOF

# Start with PM2
npm install -g pm2
pm2 start index.js --name "ai-interview-backend"
pm2 startup
pm2 save
```

#### Frontend Deployment
```bash
# Build frontend
cd frontend
npm install
npm run build

# Serve with nginx or serve
npm install -g serve
serve -s dist -l 3000

# Or configure nginx
sudo nano /etc/nginx/sites-available/ai-interview
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Deployment

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: ai-interview-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: ai-interviewer
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: ai-interview-backend
    restart: unless-stopped
    environment:
      MONGODB_URI: mongodb://mongodb:27017/ai-interviewer
      PORT: 5000
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    container_name: ai-interview-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p uploads/resumes

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Cloud Deployment

#### Heroku
```bash
# Install Heroku CLI
# Create Heroku apps
heroku create ai-interview-backend
heroku create ai-interview-frontend

# Backend deployment
cd backend
git init
heroku git:remote -a ai-interview-backend
heroku config:set MONGODB_URI=your-mongo-atlas-uri
heroku config:set NODE_ENV=production
git add .
git commit -m "Deploy backend"
git push heroku main

# Frontend deployment
cd ../frontend
# Update VITE_API_URL to Heroku backend URL
heroku git:remote -a ai-interview-frontend
heroku buildpacks:set heroku/nodejs
git add .
git commit -m "Deploy frontend"
git push heroku main
```

#### Vercel (Frontend) + Railway (Backend)
```bash
# Deploy backend to Railway
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard

# Deploy frontend to Vercel
npm i -g vercel
cd frontend
vercel --prod
# Set VITE_API_URL to Railway backend URL
```

#### AWS EC2 + MongoDB Atlas
```bash
# Launch EC2 instance
# Install Node.js and PM2
# Clone repository
# Set MongoDB Atlas connection string
# Configure security groups for ports 80, 443, 5000
# Set up SSL with Let's Encrypt
```

## Environment Variables Reference

### Backend
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `OPENAI_API_KEY`: OpenAI API key for AI features (optional)

### Frontend
- `VITE_API_URL`: Backend API URL

## Database Setup

### MongoDB Atlas (Recommended for production)
1. Create MongoDB Atlas account
2. Create cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update MONGODB_URI

### Local MongoDB
```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongod

# Enable auto-start
sudo systemctl enable mongod
```

## SSL/HTTPS Setup

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart app
pm2 restart ai-interview-backend
```

### Log Files
- Backend logs: `backend/logs/`
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`

## Backup Strategy

### Database Backup
```bash
# MongoDB backup
mongodump --uri="your-connection-string" --out=backup-$(date +%Y%m%d)

# Restore
mongorestore --uri="your-connection-string" backup-folder/
```

### File Backup
```bash
# Backup uploaded resumes
tar -czf resumes-backup-$(date +%Y%m%d).tar.gz backend/uploads/
```

## Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT in .env
2. **MongoDB connection failed**: Check MONGODB_URI
3. **File upload fails**: Check uploads directory permissions
4. **CORS errors**: Verify frontend URL in backend CORS config
5. **Build fails**: Check Node.js version compatibility

### Health Checks
```bash
# Backend health
curl http://localhost:5000/api/health

# Database connection
mongo your-connection-string --eval "db.runCommand('ping')"
```

## Performance Optimization

### Backend
- Enable gzip compression
- Implement rate limiting
- Use Redis for session storage
- Optimize database queries
- Enable MongoDB indexing

### Frontend
- Enable code splitting
- Optimize images
- Use CDN for static assets
- Implement lazy loading
- Enable service worker caching

## Security Considerations

1. **Environment Variables**: Never commit .env files
2. **File Uploads**: Validate file types and sizes
3. **Rate Limiting**: Implement API rate limiting
4. **HTTPS**: Always use HTTPS in production
5. **Database**: Use strong passwords and connection strings
6. **CORS**: Configure proper CORS origins
7. **Headers**: Set security headers (helmet.js)

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Deploy multiple backend instances
- Use MongoDB replica sets
- Implement session storage (Redis)

### Vertical Scaling
- Increase server resources
- Optimize database performance
- Use caching strategies
- Implement CDN for static assets
