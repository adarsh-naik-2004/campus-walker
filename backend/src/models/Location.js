// src/models/Location.js
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String, // URL to the image
    default: ''
  },
  floor: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'building', 
      'entrance', 
      'parking', 
      'landmark', 
      'facility', 
      'emergency', 
      'library', 
      'cafeteria', 
      'gym', 
      'auditorium', 
      'main_gate',
      'classroom',
      'office',
      'lab',
      'toilet',
      'garden'
    ]
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    altitude: {
      type: Number,
      default: 0
    }
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // AR-specific fields
  arMarker: {
    type: String, // URL or identifier for AR marker
    default: ''
  },
  qrCode: {
    type: String, // QR code data or URL
    default: ''
  },
  // Additional metadata
  openingHours: {
    type: String,
    default: ''
  },
  contactInfo: {
    phone: String,
    email: String
  },
  capacity: {
    type: Number,
    default: 0
  },
  amenities: [{
    type: String
  }],
  accessibility: {
    wheelchairAccessible: {
      type: Boolean,
      default: true
    },
    elevatorAccess: {
      type: Boolean,
      default: true
    },
    rampAccess: {
      type: Boolean,
      default: true
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
locationSchema.index({ institute: 1, isActive: 1 });
locationSchema.index({ university: 1, isActive: 1 });
locationSchema.index({ category: 1 });
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Virtual for getting connected paths
locationSchema.virtual('connectedPaths', {
  ref: 'Path',
  localField: '_id',
  foreignField: 'from'
});

// Method to get nearby locations (within a certain radius)
locationSchema.methods.findNearbyLocations = function(radiusInMeters = 100) {
  const earthRadiusInMeters = 6371000;
  const radiusInRadians = radiusInMeters / earthRadiusInMeters;
  
  return this.constructor.find({
    _id: { $ne: this._id },
    institute: this.institute,
    isActive: true,
    'coordinates.latitude': {
      $gte: this.coordinates.latitude - (radiusInRadians * 180 / Math.PI),
      $lte: this.coordinates.latitude + (radiusInRadians * 180 / Math.PI)
    },
    'coordinates.longitude': {
      $gte: this.coordinates.longitude - (radiusInRadians * 180 / Math.PI) / Math.cos(this.coordinates.latitude * Math.PI / 180),
      $lte: this.coordinates.longitude + (radiusInRadians * 180 / Math.PI) / Math.cos(this.coordinates.latitude * Math.PI / 180)
    }
  });
};

// Static method to find locations by category
locationSchema.statics.findByCategory = function(category, instituteId) {
  return this.find({
    category: category,
    institute: instituteId,
    isActive: true
  });
};

// Pre-save middleware to ensure coordinates are valid
locationSchema.pre('save', function(next) {
  if (this.coordinates.latitude < -90 || this.coordinates.latitude > 90) {
    return next(new Error('Invalid latitude. Must be between -90 and 90.'));
  }
  if (this.coordinates.longitude < -180 || this.coordinates.longitude > 180) {
    return next(new Error('Invalid longitude. Must be between -180 and 180.'));
  }
  next();
});

export default mongoose.model('Location', locationSchema);