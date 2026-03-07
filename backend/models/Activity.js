import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  dayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Day",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  startTime: {
    type: String,
    default: "",
  },
  endTime: {
    type: String,
    default: "",
  },
  estimatedCost: {
    type: Number,
    default: 0,
  },
  order: {
    type: Number,
    required: true,
  },
});

activitySchema.index({ dayId: 1, order: 1 });

export default mongoose.model("Activity", activitySchema);
