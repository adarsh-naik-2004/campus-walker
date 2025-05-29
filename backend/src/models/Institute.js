// Make sure the institute model references University
import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true
  },
  locations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location"
  }]
}, { timestamps: true });

const Institute = mongoose.model("Institute", instituteSchema);

export default Institute;