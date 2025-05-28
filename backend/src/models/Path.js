import mongoose from 'mongoose';

const pathSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  waypoints: [{
    latitude: Number,
    longitude: Number,
    instruction: String // "Turn left", "Continue straight", etc.
  }],
  distance: Number, // in meters
  estimatedTime: Number, // in minutes
  accessibilityFriendly: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Path', pathSchema);