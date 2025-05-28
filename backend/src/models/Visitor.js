import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  purpose: { type: String, required: true },
  university: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute'
  },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Visitor', visitorSchema);