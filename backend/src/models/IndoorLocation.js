import mongoose from 'mongoose';

const indoorLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nodeId: { type: String, required: true, unique: true },
  building: { type: String, required: true },
  floor: { type: Number, required: true },
  x: { type: Number, required: true }, // X position on floor plan
  y: { type: Number, required: true }, // Y position on floor plan
  category: { type: String, enum: ['room', 'stair', 'elevator', 'entrance'] },
  qrCode: { type: String, required: true }, // URL to QR code image
  institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true }
});

const IndoorLocation = mongoose.model('IndoorLocation', indoorLocationSchema);
export default IndoorLocation;