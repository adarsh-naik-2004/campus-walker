import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  institutes: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute' 
  }],
  visitors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor'
  }]
});

export default mongoose.model('University', universitySchema);