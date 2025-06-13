import mongoose from 'mongoose';

const indoorPathSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'IndoorLocation', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'IndoorLocation', required: true },
  distance: Number,
  isStair: Boolean,
  isElevator: Boolean,
  floorChange: Number, // 0 = same floor, +1 = up, -1 = down
  institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true }
});

const IndoorPath = mongoose.model('IndoorPath', indoorPathSchema);
export default IndoorPath;