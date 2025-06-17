import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    const exists = await User.findOne({ email: 'super@admin.com' });
    if (!exists) {
      await User.create({
        email: 'super@admin.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'super'
      });
      console.log('Dummy super admin created');
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;