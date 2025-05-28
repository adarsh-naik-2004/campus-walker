import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super', 'university', 'institute'], required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  institute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' }
});

export default mongoose.model('User', userSchema);