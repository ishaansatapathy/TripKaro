import mongoose from "mongoose";

const tripMemberSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ["Owner", "Editor", "Viewer"],
    default: "Viewer",
  },
});

tripMemberSchema.index({ tripId: 1, userId: 1 }, { unique: true });

export default mongoose.model("TripMember", tripMemberSchema);
