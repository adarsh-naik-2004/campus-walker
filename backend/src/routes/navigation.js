import express from 'express';
import Location from '../models/Location.js';
import Path from '../models/Path.js';
import Visitor from '../models/Visitor.js';

const router = express.Router();

// Get all locations for a university
router.get('/locations/:universityId', async (req, res) => {
  try {
    const locations = await Location.find({
      university: req.params.universityId,
      isActive: true
    }).populate('institute', 'name');
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start navigation session
router.post('/start-navigation', async (req, res) => {
  try {
    const { visitorId, destinationId, currentLocation } = req.body;
    
    // Generate session token
    const sessionToken = Math.random().toString(36).substring(2, 15);
    
    // Update visitor with navigation session
    await Visitor.findByIdAndUpdate(visitorId, {
      navigationSession: {
        destination: destinationId,
        currentLocation,
        sessionToken,
        isActive: true
      }
    });
    
    res.json({ 
      sessionToken,
      message: 'Navigation session started'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get navigation directions
router.post('/directions', async (req, res) => {
  try {
    const { fromCoords, toLocationId } = req.body;
    
    const destination = await Location.findById(toLocationId);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    // Simple pathfinding (you can enhance this with actual routing algorithms)
    const directions = calculateDirections(fromCoords, destination.coordinates);
    
    res.json({
      destination: destination,
      directions: directions,
      distance: calculateDistance(fromCoords, destination.coordinates)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate simple directions
function calculateDirections(from, to) {
  const bearing = calculateBearing(from, to);
  const distance = calculateDistance(from, to);
  
  return {
    bearing,
    distance,
    instruction: `Head ${getDirection(bearing)} for ${Math.round(distance)}m`
  };
}

function calculateBearing(from, to) {
  const lat1 = from.latitude * Math.PI / 180;
  const lat2 = to.latitude * Math.PI / 180;
  const deltaLong = (to.longitude - from.longitude) * Math.PI / 180;
  
  const y = Math.sin(deltaLong) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLong);
  
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function calculateDistance(from, to) {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = from.latitude * Math.PI / 180;
  const lat2 = to.latitude * Math.PI / 180;
  const deltaLat = (to.latitude - from.latitude) * Math.PI / 180;
  const deltaLong = (to.longitude - from.longitude) * Math.PI / 180;
  
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.sin(deltaLong/2) * Math.sin(deltaLong/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

function getDirection(bearing) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(bearing / 45) % 8];
}

export default router;