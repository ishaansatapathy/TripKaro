import mongoose from "mongoose";

const checklistSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.model("Checklist", checklistSchema);
