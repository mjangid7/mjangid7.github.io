# Redis Integration Setup Guide

## Overview
This guide covers the setup and deployment of the Redis-backed portfolio analytics and contact management system.

## Backend Setup

### Prerequisites
- Node.js (v16 or higher)
- Redis instance (local or cloud)
- Gmail account with App Password for email notifications

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Redis Configuration (Railway)
REDIS_URL=redis://default:pkBNZGuCsUuZjMNuHTvDQbkcKhBNCpdd@switchback.proxy.rlwy.net:44804

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings > Security > 2-Step Verification
3. Generate an App Password for "Mail"
4. Use this 16-character password in `EMAIL_APP_PASSWORD`

### Running the Backend

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Analytics Endpoints

- `POST /api/visits` - Track page visits
- `GET /api/analytics` - Get analytics summary
- `GET /health` - Health check

### Contact Management

- `POST /api/contact` - Submit contact form
- `GET /api/contacts` - Get contact submissions (admin)

### Example API Usage

**Track a visit:**
```javascript
fetch('http://localhost:3001/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        visitorId: 'visitor_123',
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href,
        viewport: { width: 1920, height: 1080 },
        isNewSession: true
    })
});
```

**Submit contact form:**
```javascript
fetch('http://localhost:3001/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello!',
        visitorId: 'visitor_123'
    })
});
```

## Redis Data Structure

### Visit Tracking
- `visit:{visitId}` - Hash with visit details
- `analytics:total_visits` - Counter
- `analytics:total_sessions` - Counter  
- `analytics:unique_visitors` - Set
- `analytics:recent_visits` - List (last 100)

### Contact Management
- `contact:{contactId}` - Hash with contact details
- `contacts:submissions` - List of all submissions
- `analytics:total_contacts` - Counter

### Visitor Sessions
- `visitor:{visitorId}` - Hash with visitor info

## Frontend Integration

The frontend automatically integrates with the Redis backend through `redis-integration.js`:

### Key Classes
- `RedisVisitTracker` - Handles analytics with Redis backend
- `RedisContactForm` - Manages contact form submissions

### Configuration
Update `API_CONFIG.baseUrl` in `redis-integration.js`:
```javascript
const API_CONFIG = {
    baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://your-backend-domain.com' 
        : 'http://localhost:3001'
};
```

## Deployment Options

### Local Development
1. Run Redis locally: `redis-server`
2. Start backend: `npm run dev`
3. Serve frontend: `open index.html`

### Cloud Deployment

**Backend (Heroku/Railway/DigitalOcean):**
1. Deploy Node.js app with environment variables
2. Use Redis Cloud/AWS ElastiCache for Redis
3. Configure CORS for your domain

**Frontend (GitHub Pages/Netlify/Vercel):**
1. Update API base URL to production backend
2. Deploy static assets
3. Ensure HTTPS for both frontend and backend

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
  
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
```

## Monitoring & Analytics

### Built-in Analytics
- Visit tracking with unique visitor identification
- Session management
- Real-time analytics dashboard (coming soon)

### Redis Monitoring
Use Redis CLI to monitor data:
```bash
# Connect to Redis
redis-cli

# View analytics
GET analytics:total_visits
SCARD analytics:unique_visitors
LLEN contacts:submissions

# View recent visits
LRANGE analytics:recent_visits 0 9
```

### Debug Functions
Frontend provides debug functions:
```javascript
// View current analytics
getAnalytics()

// Track custom events  
trackEvent('button_click', { button: 'cta' })

// Check modal status
getModalStatus()
```

## Security Considerations

1. **API Rate Limiting** - Implement rate limiting for production
2. **Input Validation** - All inputs are validated server-side
3. **CORS Configuration** - Only allow trusted domains
4. **Redis Security** - Use Redis AUTH in production
5. **HTTPS** - Always use HTTPS in production
6. **Environment Variables** - Never commit secrets to git

## Troubleshooting

### Common Issues

**Backend not starting:**
- Check Redis connection
- Verify environment variables
- Check port conflicts

**Email not sending:**
- Verify Gmail App Password
- Check 2FA is enabled
- Test email configuration

**Analytics not tracking:**
- Check API endpoints are accessible
- Verify CORS configuration
- Check browser console for errors

**Contact form not working:**
- Verify backend is running
- Check network tab for API calls
- Test with curl/Postman

### Logs and Debugging

**View backend logs:**
```bash
# Development
npm run dev

# Production with PM2
pm2 logs portfolio-backend
```

**Frontend debugging:**
```javascript
// Check API configuration
console.log(API_CONFIG);

// Test API connectivity
fetch(API_CONFIG.baseUrl + '/health')
  .then(r => r.json())
  .then(console.log);
```

## Performance Optimization

1. **Redis Memory** - Configure appropriate memory limits
2. **API Caching** - Implement response caching where appropriate
3. **Connection Pooling** - Use Redis connection pooling
4. **Data Retention** - Implement data cleanup policies
5. **CDN** - Use CDN for static assets

## Backup and Recovery

**Redis Backup:**
```bash
# Manual backup
redis-cli BGSAVE

# Automated backups
redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

**Data Export:**
```bash
# Export analytics data
redis-cli --json GET analytics:total_visits > analytics_backup.json
```

This setup provides a robust, scalable solution for portfolio analytics and contact management with Redis as the backbone.