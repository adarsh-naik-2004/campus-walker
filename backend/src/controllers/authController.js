import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // 1. Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 2. Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error(`Login attempt for non-existent user: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Password comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(`Password mismatch for user: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. JWT token generation
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        ...(user.university && { university: user.university }),
        ...(user.institute && { institute: user.institute })
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Increased session time
    );

    // 5. Response formatting
    const responseData = {
      token,
      role: user.role,
      ...(user.university && { university: user.university }),
      ...(user.institute && { institute: user.institute })
    };

    res.json(responseData);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};