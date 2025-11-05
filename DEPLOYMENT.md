# PocketPilot - Deployment Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud - MongoDB Atlas)
- npm or yarn

## Local Development Setup

### 1. Clone and Install

```bash
cd PocketPilot
npm run install-all
```

### 2. Environment Setup

Create `.env` file in root:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/pocketpilot
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000

# Mindee API Configuration (Required for OCR)
MINDEE_API_KEY=your_mindee_api_key_here
MINDEE_MODEL_ID=your_model_id_or_leave_empty_for_default
```

**Get Mindee API Key:**
- Sign up at https://platform.mindee.com/
- Create API key in dashboard
- Add to `.env` file

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string and update MONGO_URI in .env

### 4. Run Development Server

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

## Production Deployment

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku App**
```bash
heroku create pocketpilot-app
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_production_secret
heroku config:set CLIENT_URL=https://pocketpilot-app.herokuapp.com
heroku config:set MINDEE_API_KEY=your_mindee_api_key
heroku config:set MINDEE_MODEL_ID=your_model_id_optional
```

4. **Deploy**
```bash
git add .
git commit -m "Initial deployment"
git push heroku main
```

### Option 2: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
```bash
cd client
npm install -g vercel
vercel
```

**Backend (Railway):**
1. Go to https://railway.app
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

### Option 3: VPS (DigitalOcean, AWS, Linode)

1. **Install Node.js and MongoDB on server**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install PM2 for process management**
```bash
npm install -g pm2
```

3. **Clone and setup**
```bash
git clone <your-repo>
cd PocketPilot
npm run install-all
```

4. **Create .env file with production values**

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_production_secret
CLIENT_URL=https://yourdomain.com
MINDEE_API_KEY=your_mindee_api_key
MINDEE_MODEL_ID=your_model_id_optional
```

5. **Build frontend**
```bash
npm run build
```

6. **Start with PM2**
```bash
pm2 start server/server.js --name pocketpilot
pm2 startup
pm2 save
```

7. **Setup Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 4: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm run install-all

# Copy all files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/pocketpilot
      - JWT_SECRET=your_secret
      - MINDEE_API_KEY=your_mindee_api_key
      - MINDEE_MODEL_ID=your_model_id_optional
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Run with Docker:
```bash
docker-compose up -d
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb+srv://user:pass@cluster.mongodb.net/db |
| JWT_SECRET | Secret key for JWT | random_secure_string |
| JWT_EXPIRE | Token expiration | 30d |
| CLIENT_URL | Frontend URL | https://yourdomain.com |

## Post-Deployment Checklist

- [ ] Test all features (login, expenses, OCR, voice)
- [ ] Verify MongoDB connection
- [ ] Check API endpoints
- [ ] Test file uploads (receipts)
- [ ] Verify SSL certificate (HTTPS)
- [ ] Set up monitoring (optional)
- [ ] Configure backups for MongoDB
- [ ] Test voice assistant on HTTPS (required for Web Speech API)

## Troubleshooting

**Issue: Voice assistant not working**
- Solution: Voice API requires HTTPS. Deploy on secure domain or use localhost.

**Issue: Receipt scanning slow**
- Solution: OCR is CPU intensive. Consider using cloud OCR service for production.

**Issue: MongoDB connection failed**
- Solution: Check MONGO_URI, whitelist IP in MongoDB Atlas, verify network access.

**Issue: CORS errors**
- Solution: Update CLIENT_URL in .env to match frontend URL.

## Monitoring & Maintenance

**Check logs:**
```bash
# PM2
pm2 logs pocketpilot

# Heroku
heroku logs --tail

# Docker
docker-compose logs -f
```

**Database backup:**
```bash
mongodump --uri="your_mongo_uri" --out=./backup
```

## Scaling Considerations

1. **Use Redis for caching** frequent queries
2. **CDN for static assets** (images, receipts)
3. **Load balancer** for multiple instances
4. **Separate OCR service** to avoid blocking main server
5. **Database indexing** already implemented in models

## Security Best Practices

✅ Passwords hashed with bcrypt
✅ JWT token authentication
✅ Rate limiting implemented
✅ Helmet.js for security headers
✅ Input validation with express-validator
✅ File upload restrictions

**Additional recommendations:**
- Use environment-specific secrets
- Enable MongoDB authentication
- Regular security updates
- Monitor for vulnerabilities
- Implement request logging

## Support

For issues and questions:
- Check GitHub Issues
- Review API documentation
- Test endpoints with Postman

---

Built with ❤️ by PocketPilot Team
