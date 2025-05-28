import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  meetingId: {
    type: String,
  },
  timeOnline:{
    type: Number,
    default: 0, // Default to 0 if not provided
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
