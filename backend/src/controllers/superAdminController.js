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