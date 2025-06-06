import mongoose from 'mongoose';

const pathSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  waypoints: [{
    latitude: Number,
    longitude: Number,
    instruction: String
  }],
  distance: Number,
  estimatedTime: Number,
  accessibilityFriendly: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Path', pathSchema);