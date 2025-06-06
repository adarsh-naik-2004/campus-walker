// src/controllers/campusController.js
import Location from '../models/Location.js';
import Path from '../models/Path.js';

export const getCampusData = async (req, res) => {
  try {
    const instituteId = req.params.instituteId;
    
    // Fetch locations
    const locations = await Location.find({ institute: instituteId, isActive: true });
    
    // Fetch paths with populated from/to references
    const paths = await Path.find({ institute: instituteId }).populate('from to');
    
    // Format response
    const nodes = locations.reduce((acc, loc) => {
      acc[loc._id] = {
        lat: loc.coordinates.latitude,
        lng: loc.coordinates.longitude,
        name: loc.name,
        category: loc.category,
        floor: loc.floor,
        description: loc.description,
        image: loc.image,
        accessibility: loc.accessibility
      };
      return acc;
    }, {});
    
    const formattedPaths = paths.map(path => ({
      id: path._id,
      from: path.from._id.toString(),
      to: path.to._id.toString(),
      distance: path.distance,
      waypoints: path.waypoints || [],
      estimatedTime: path.estimatedTime,
      accessibilityFriendly: path.accessibilityFriendly || false
    }));
    
    const destinations = locations
      .filter(loc => ['building', 'landmark', 'library', 'cafeteria', 'gym', 'auditorium', 'main_gate'].includes(loc.category))
      .reduce((acc, loc) => {
        acc[loc._id] = {
          node: loc._id,
          name: loc.name,
          icon: getIconForCategory(loc.category),
          floor: loc.floor,
          category: loc.category
        };
        return acc;
      }, {});
    
    res.json({ 
      nodes, 
      paths: formattedPaths, 
      destinations,
      totalLocations: locations.length,
      totalPaths: paths.length
    });
  } catch (err) {
    console.error('Error fetching campus data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get locations by category
export const getLocationsByCategory = async (req, res) => {
  try {
    const { instituteId, category } = req.params;
    
    const locations = await Location.findByCategory(category, instituteId);
    
    res.json(locations);
  } catch (err) {
    console.error('Error fetching locations by category:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get nearby locations
export const getNearbyLocations = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { radius = 100 } = req.query;
    
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    const nearbyLocations = await location.findNearbyLocations(parseInt(radius));
    
    res.json(nearbyLocations);
  } catch (err) {
    console.error('Error fetching nearby locations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

function getIconForCategory(category) {
  const icons = {
    building: '🏢',
    entrance: '🚪',
    parking: '🅿️',
    landmark: '📍',
    facility: '⚙️',
    emergency: '🆘',
    library: '📚',
    cafeteria: '🍔',
    gym: '🏋️‍♂️',
    auditorium: '🎭',
    main_gate: '🚪',
    classroom: '🎓',
    office: '🏢',
    lab: '🔬',
    toilet: '🚻',
    garden: '🌳'
  };
  return icons[category] || '📍';
}