# AK CHAUFFAGE - CMS-Powered Website

A modern, self-contained website with an integrated admin dashboard for managing all content without external CMS services.

## 🎯 Features

- **Admin CMS Dashboard**: Full-featured admin panel to manage all website content
- **Dynamic Content**: All content is stored in JSON files and loaded dynamically
- **Professional Design**: Modern UI with Tailwind CSS and React 19
- **Type-Safe**: Full TypeScript support with Zod validation
- **Authentication**: JWT-based admin authentication with bcrypt password hashing
- **Media Management**: Upload and manage images
- **Real-time Updates**: Content changes reflect immediately on the public site
- **Production Ready**: Optimized build process and single-server deployment

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start both frontend and backend servers
npm run dev:all
```

- **Public Site**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin/login
  - Username: `admin`
  - Password: `admin`
- **API**: http://localhost:3001/api

### Production

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

Server runs on port 3000 (configurable via `PORT` env variable)

## 📁 Project Structure

```
ak-chauffage/
├── data/                      # Content storage (JSON files)
│   ├── content.json          # All website content (services, FAQs, testimonials, etc.)
│   └── settings.json         # Site settings (contact, hours, etc.)
├── uploads/                   # User uploaded images
├── server/                    # Express backend (.cjs files)
│   ├── index.cjs             # Express entry point
│   ├── .env                  # Environment variables
│   ├── routes/               # API routes (auth, content, settings, media)
│   ├── middleware/           # Auth & upload middleware
│   └── utils/                # File management utilities
├── src/
│   ├── admin/                # Admin dashboard
│   ├── components/           # Public site components
│   ├── contexts/             # React contexts (Content, Auth)
│   ├── types/                # TypeScript definitions
│   └── utils/                # API client
└── server.cjs                # Production server
```

## 🔑 Admin Access

### Login

1. Navigate to http://localhost:5173/admin/login
2. Enter credentials:
   - Username: `admin`
   - Password: `admin`

### Changing Password

1. Generate new password hash:
```bash
node -e "console.log(require('bcrypt').hashSync('YOUR_NEW_PASSWORD', 10))"
```

2. Update `server/.env`:
```env
ADMIN_PASSWORD_HASH=$2b$10$YOUR_NEW_HASH
```

3. Restart server

## 📝 Managing Content

### Available Editors

All editors are fully implemented:
- **Services Editor** (`/admin/services`) - Manage service offerings
- **FAQs Editor** (`/admin/faqs`) - Manage frequently asked questions
- **Testimonials Editor** (`/admin/testimonials`) - Manage customer testimonials
- **Projects Editor** (`/admin/projects`) - Manage project case studies

### Content Types in JSON

All content in `/data/content.json`:
- `services` - 6 service offerings
- `faqs` - 8 frequently asked questions
- `testimonials` - 5 customer testimonials
- `projects` - 3 recent projects
- `advantages` - 4 competitive advantages
- `certifications` - 6 official certifications
- `hero` - Hero section content
- `ctaBanner` - CTA banner content

### Site Settings

Configuration in `/data/settings.json`:
- Company information
- Contact details (phone, email, address)
- Business hours
- Service area cities
- Social media links
- Navigation menu
- Legal information

## 🔧 API Endpoints

### Public (No Auth)
- `GET /api/content` - Get all content
- `GET /api/content/:type` - Get specific type
- `GET /api/settings` - Get settings
- `GET /api/health` - Health check

### Protected (Requires JWT)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token
- `PUT /api/content` - Update all content
- `PUT /api/content/:type` - Update type
- `PUT /api/settings` - Update settings
- `GET /api/media` - List images
- `POST /api/media/upload` - Upload image
- `DELETE /api/media/:filename` - Delete image

## 🏗️ Production Deployment

### Environment Setup

Update `server/.env` for production:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=strong-random-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$production-hash
ALLOWED_ORIGINS=https://yourdomain.com
```

### Deployment Steps

1. Build frontend: `npm run build`
2. Update environment variables
3. Start server: `npm start`
4. Ensure `/data` and `/uploads` persist (use volumes)
5. Set up HTTPS/reverse proxy

### Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET to random value
- [ ] Configure ALLOWED_ORIGINS
- [ ] Enable HTTPS/SSL
- [ ] Set up automated backups
- [ ] Configure firewall rules

## 🔒 Security Features

- JWT authentication (8-hour expiry)
- Rate limiting (5 attempts/15 min)
- Bcrypt password hashing
- File upload validation (5MB, images only)
- CORS protection
- Path traversal prevention

## 🛠️ Development

### Run Servers Separately

```bash
# Terminal 1 - Frontend (port 5173)
npm run dev

# Terminal 2 - Backend (port 3001)
npm run server
```

### Updating Components

To make components use dynamic content:

```typescript
import { useContent } from '../contexts/ContentContext';

function MyComponent() {
  const { content, settings } = useContent();

  // Use content.services, content.faqs, etc.
  return <div>{content?.services.map(...)}</div>;
}
```

## 📦 Backup & Restore

### Backup

```bash
tar -czf backup-$(date +%Y%m%d).tar.gz data/ uploads/
```

### Restore

```bash
tar -xzf backup-YYYYMMDD.tar.gz
```

## 🚦 Common Issues

### Port in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Module Not Found

Server files must use `.cjs` extension. All require statements must include extension:

```javascript
// Correct
const module = require('./module.cjs');

// Incorrect
const module = require('./module');
```

### CORS Errors

Add frontend URL to `ALLOWED_ORIGINS` in `server/.env`

## 📊 Content Statistics

- **Total Services**: 6
- **Total FAQs**: 8
- **Total Testimonials**: 5
- **Total Projects**: 3
- **Service Areas**: 9 cities

## 🧪 Testing

Test the API:

```bash
# Health check
curl http://localhost:3001/api/health

# Get content
curl http://localhost:3001/api/content

# Get settings
curl http://localhost:3001/api/settings
```

## 📚 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router
- **Backend**: Express.js, JWT, Bcrypt, Multer
- **Data**: JSON file storage
- **Validation**: Zod schemas

---

**Login Credentials**: admin / admin (change in production!)
**API Port**: 3001 (dev) / 3000 (prod)
**Frontend Port**: 5173 (dev)
