// src/models/Institute.js
import mongoose from 'mongoose';

const instituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  university: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  // No need for locations array here
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Institute', instituteSchema);