import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import superAdminRoutes from './src/routes/superAdminRoutes.js';
import universityRoutes from './src/routes/universityRoutes.js';
import instituteRoutes from './src/routes/instituteRoutes.js';
import visitorRoutes from './src/routes/visitorRoutes.js';
import { getUniversities } from './src/controllers/universityController.js';
import navigationRoutes from './src/routes/navigation.js';
import indoorRoutes from './src/routes/indoor.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();
const app = express();

// Middleware
// Update CORS middleware

const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

const createDummyAdmin = async () => {
  const exists = await User.findOne({ email: 'super@admin.com' });
  if (!exists) {
    await User.create({
      email: 'super@admin.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'super'
    });
    console.log('Dummy super admin created');
  }
};
createDummyAdmin();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/visitors', visitorRoutes);

// Add public university route
app.use('/api/public', express.Router()
  .get('/universities', getUniversities)
);

app.use('/api/navigation', navigationRoutes);

app.use('/api/indoor', indoorRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));