import mongoose from "mongoose";

const daySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

daySchema.index({ tripId: 1, order: 1 });

export default mongoose.model("Day", daySchema);
