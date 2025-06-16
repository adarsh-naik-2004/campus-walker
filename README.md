# Hybrid AR Navigation System for Indoor-Outdoor Campus Wayfinding

## Project Overview

The **Development of a Hybrid AR Navigation System for Indoor–Outdoor Campus Wayfinding with Multi-level Building Support** is a comprehensive 4-week internship project that revolutionizes campus navigation by seamlessly blending physical campus geography with augmented reality (AR) overlays.

This system provides real-time wayfinding that transitions smoothly between outdoor and indoor environments, supports multi-floor routing, and incorporates advanced monitoring and research components.

## 🎯 Key Objectives

1. **Unified Authentication & Role Management** - Multi-tenant login system with custom university domains
2. **Augmented Reality (AR) Navigation** - QR-code marker based indoor wayfinding with 3D overlays
3. **Map-Based Routing** - Interactive 2D maps with floor selectors and path rendering
4. **Multi-Floor Support** - Elevator and stair transitions across building levels
5. **Alternative Localization** - Wi-Fi fingerprinting comparison with QR-based methods
6. **Role-Based Content Management** - Admin interfaces for POI and path management
7. **Super Admin System Monitoring** - Real-time dashboards and performance metrics
8. **Research Documentation** - Comprehensive analysis and comparison reports


## 👥 User Roles

### 🎓 Visitor (End User)
- Self-register via university-specific URLs
- Access AR and map-based navigation
- Receive turn-by-turn guidance with voice support
- Interact with multilingual chatbot assistance

### 🏫 Institute Admin
- Manage department-specific campus areas
- Create and edit nodes (labs, lecture halls, etc.)
- Upload images and accessibility information
- Monitor localized usage statistics

### 🎓 University Admin
- Oversee entire campus navigation ecosystem
- Manage Institute Admin accounts
- Review and approve content updates
- Access campus-wide analytics and reporting

### ⚡ Super Admin
- System-wide oversight and monitoring
- Manage University Admin accounts globally
- Monitor server performance and security
- Configure system-wide policies and alerts


# AR Navigation System - Deployment Guide

This guide provides instructions for deploying the AR Navigation System on a custom server with offline database support.

## Prerequisites
- Node.js v18+ (LTS recommended)
- MongoDB Community Edition v6+
- npm v9+
- Git
- Cloudinary account (for image storage) - *optional for offline mode*

## 1. Server Setup
### Clone the repository:
```bash
git clone https://github.com/adarsh-naik-2004/ar-nav-system.git
cd ar-nav-system
```

## 2. Backend Configuration
### Install dependencies:
```bash
cd backend
npm install
```

### Create .env file:
Update .env with local settings:
```env
PORT=5000
# Use local MongoDB instead of Atlas
MONGODB_URI=mongodb://localhost:27017/ar_nav_db
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=production

# For offline image storage (remove Cloudinary)
# CLOUDINARY_CLOUD_NAME= 
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=

# Set to your domain or server IP
CORS_ORIGINS=http://your-server-ip,http://localhost
```
### Database Setup:
1. Install MongoDB
2. Start MongoDB service:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```
3. Create database:
   ```bash
   mongo
   > use ar_nav_db
   > db.createUser({user: "admin", pwd: "securepassword", roles: ["readWrite", "dbAdmin"]})
   ```
Update MONGODB_URI in .env:
```bash
MONGODB_URI=mongodb://admin:securepassword@localhost:27017/ar_nav_db?authSource=ar_nav_db
```

3. Frontend Configuration
### Install dependencies:
```bash
cd frontend
npm install
```
### Create .env file:
```env
VITE_API_URL=http://your-server-ip:5000/api
```

### Build production version:
```env
npm run build
```
