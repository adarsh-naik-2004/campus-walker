import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: { type: String },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    altitude: { type: Number, default: 0 }
  },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
  category: {
    type: String,
    enum: ['building', 'entrance', 'parking', 'landmark', 'facility', 'emergency'],
    required: true
  },
  floor: { type: Number, default: 0 },
  arMarker: {
    type: { type: String, enum: ['qr', 'image', 'none'], default: 'none' },
    data: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Location', locationSchema);