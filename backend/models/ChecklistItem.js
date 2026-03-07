import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema({
  checklistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checklist",
    required: true,
    index: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("ChecklistItem", checklistItemSchema);
