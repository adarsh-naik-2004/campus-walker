# Hybrid AR Navigation System for Indoor-Outdoor Campus Wayfinding

## Project Overview

The **Development of a Hybrid AR Navigation System for Indoor–Outdoor Campus Wayfinding with Multi-level Building Support** is a comprehensive internship project that revolutionizes campus navigation by seamlessly blending physical campus geography with augmented reality (AR) overlays.


# AR Navigation System - Deployment Guide

This guide provides instructions for deploying the AR Navigation System on a custom server with offline database support.

## Prerequisites
- Node.js v18+ (LTS recommended)
- MongoDB Community Edition v6+
- npm v9+
- Git

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

# Set to your domain or server IP
CORS_ORIGINS=http://your-server-ip,http://localhost

# Backend url
BASE_URL=http://localhost:5000
```
### Database Setup:
Update MONGODB_URI in .env put your local url:
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
Put /api in frontend of backend url
```env
VITE_API_URL=http://your-server-ip:5000/api
```

### ✅ Important Configuration Steps

1. **Update API Base URL in Frontend Files**  
   The `navigation.html` and `indoor.html` files have hardcoded backend URLs.  
   You need to update these URLs to match your deployed backend endpoint.

   - Replace with your actual backend API base URL, e.g.:
     ```
     http://your-server-ip:5000/api
     ```

2. **Edit the Following Lines in HTML Files:**
   - `navigation.html`  
     🔹 Line **1393**: Update the API URL to use the correct backend IP.

   - `indoor.html`  
     🔹 Line **1060**: Update the URL **only up to the `/api` part**. Do not modify the rest of the endpoint structure.
     
3. **Match Backend URL with `.env` Configuration**  
   - Ensure the same base URL is reflected in the `.env` file using:
     ```env
     VITE_API_URL=http://your-server-ip:5000/api
     ```
### Build production version:
```env
npm run build
```
