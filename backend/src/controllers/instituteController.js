// src/controllers/instituteController.js
import Location from '../models/Location.js';
import User from '../models/User.js';
import Institute from '../models/Institute.js'; // Make sure this import exists

export const getInstituteById = async (req, res) => {
  try {
    console.log('Fetching institute with ID:', req.params.id); // Debug log
    
    const institute = await Institute.findById(req.params.id)
      .populate('university');

    if (!institute) {
      console.log('Institute not found for ID:', req.params.id); // Debug log
      return res.status(404).json({ message: 'Institute not found' });
    }

    console.log('Institute found:', institute.name); // Debug log
    res.json(institute);
  } catch (err) {
    console.error('Error fetching institute:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const addLocation = async (req, res) => {
  try {
    const { name, floor, category, instituteId, coordinates } = req.body;

    // Validate institute exists and get university reference
    const institute = await Institute.findById(instituteId).populate('university');
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    // Create location with proper schema structure
    const location = new Location({
      name,
      floor: Number(floor),
      category,
      coordinates: {
        latitude: parseFloat(coordinates.y),
        longitude: parseFloat(coordinates.x),
        altitude: parseFloat(coordinates.z || 0)
      },
      university: institute.university._id, // Use university ID from institute
      institute: instituteId
    });

    await location.save();
    res.status(201).json(location);
  } catch (err) {
    console.error('Error adding location:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find().populate('institute');
    res.json(locations);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInstituteAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: 'institute',
      institute: req.params.id
    });
    res.json(admins);
  } catch (err) {
    console.error('Error fetching institute admins:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInstituteLocations = async (req, res) => {
  try {
    const locations = await Location.find({
      institute: req.params.id
    }).populate('institute');
    
    res.json(locations);
  } catch (err) {
    console.error('Error fetching institute locations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to instituteController.js
export const deleteInstitute = async (req, res) => {
  try {
    const institute = await Institute.findByIdAndDelete(req.params.id);
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    // Delete associated locations and admins
    await Location.deleteMany({ institute: req.params.id });
    await User.deleteMany({ institute: req.params.id, role: 'institute' });

    res.json({ message: 'Institute deleted successfully' });
  } catch (err) {
    console.error('Delete institute error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteInstituteAdmin = async (req, res) => {
  try {
    const admin = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'institute'
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Delete institute admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    console.error('Delete location error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};