import University from '../models/University.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';

export const createUniversity = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No logo file uploaded' });
    }

    // Convert buffer to base64 for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'university-logos',
      resource_type: 'auto'
    });

    const university = new University({
      name: req.body.name,
      logo: result.secure_url
    });

    await university.save();
    res.status(201).json(university);
  } catch (err) {
    console.error('University creation error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message
    });
  }
};

export const createUniversityAdmin = async (req, res) => {
  try {
    const { email, password, universityId } = req.body;
        
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: 'university',
      university: universityId // Make sure this is set
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// NEW: Create Super Admin function
export const createSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const superAdmin = new User({
      email,
      password: hashedPassword,
      role: 'super'
    });

    await superAdmin.save();
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = superAdmin.toObject();
    
    res.status(201).json({
      message: 'Super Admin created successfully',
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Super admin creation error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message
    });
  }
};

// NEW: Get all super admins
export const deleteSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Debug logging
    console.log("=== DELETE SUPER ADMIN DEBUG ===");
    console.log("ID to delete:", id);
    console.log("ID type:", typeof id);
    console.log("Request user:", req.user);
    
    // Get the requesting user ID from the token
    let requestingUserId;
    if (req.user && req.user.userId) {
      requestingUserId = req.user.userId;
    } else if (req.user && req.user._id) {
      requestingUserId = req.user._id;
    } else {
      console.log("Cannot determine requesting user ID");
      return res.status(401).json({ message: 'Unable to verify user identity' });
    }
    
    console.log("Requesting user ID:", requestingUserId);
    console.log("Requesting user ID type:", typeof requestingUserId);
    
    // Convert both to strings for comparison
    const idToDelete = id.toString();
    const currentUserId = requestingUserId.toString();
    
    console.log("Comparison:", { idToDelete, currentUserId, areEqual: idToDelete === currentUserId });
    
    // Prevent self-deletion
    if (idToDelete === currentUserId) {
      console.log("BLOCKED: User trying to delete themselves");
      return res.status(403).json({ 
        message: 'You cannot delete yourself' 
      });
    }
    
    // Check if the admin exists and is a super admin
    const adminToDelete = await User.findOne({ _id: id, role: 'super' });
    if (!adminToDelete) {
      return res.status(404).json({ message: 'Super admin not found' });
    }
    
    // Prevent deletion if this would leave no super admins
    const superAdminCount = await User.countDocuments({ role: 'super' });
    console.log("Super admin count:", superAdminCount);
    
    if (superAdminCount <= 1) {
      return res.status(400).json({ 
        message: 'Cannot delete the last super admin. At least one super admin must exist.' 
      });
    }

    await User.findByIdAndDelete(id);
    console.log("Successfully deleted admin:", adminToDelete.email);
    
    res.json({ 
      message: 'Super admin deleted successfully',
      deletedAdmin: {
        id: adminToDelete._id,
        email: adminToDelete.email
      }
    });
  } catch (err) {
    console.error('Delete super admin error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Enhanced get super admins to include current user info
export const getSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await User.find({ role: 'super' }).select('-password');
    const currentUserId = req.user.id;
    
    // Add a flag to identify the current user
    const adminsWithCurrentFlag = superAdmins.map(admin => ({
      ...admin.toObject(),
      isCurrentUser: admin._id.toString() === currentUserId
    }));
    
    res.json(adminsWithCurrentFlag);
  } catch (err) {
    console.error('Get super admins error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversities = async (req, res) => {
  try {
    const universities = await University.find()
      .populate('institutes')
      .populate('visitors');
    res.json(universities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUniversityAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'university' }).populate('university')
    res.json(admins)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
        
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    // Delete associated university admins
    await User.deleteMany({ university: req.params.id, role: 'university' });

    res.json({ message: 'University deleted successfully' });
  } catch (err) {
    console.error('Delete university error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUniversityAdmin = async (req, res) => {
  try {
    const admin = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'university'
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
