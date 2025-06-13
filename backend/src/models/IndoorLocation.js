import mongoose from 'mongoose';

const indoorLocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nodeId: { type: String, required: true, unique: true },
  building: { type: String, required: true },
  floor: { type: Number, required: true },
  x: { type: Number, required: true }, // X position on floor plan
  y: { type: Number, required: true }, // Y position on floor plan
  category: { type: String, enum: ['room', 'stair', 'elevator', 'entrance'] },
  institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
});

indoorLocationSchema.index({ building: 1, floor: 1 });
const IndoorLocation = mongoose.model('IndoorLocation', indoorLocationSchema);
export default IndoorLocation;