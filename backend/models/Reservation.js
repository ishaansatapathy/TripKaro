import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
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
  location: {
    type: String,
    default: "",
    trim: true,
  },
  date: {
    type: String,
    default: "",
  },
  time: {
    type: String,
    default: "",
  },
  notes: {
    type: String,
    default: "",
    trim: true,
  },
});

export default mongoose.model("Reservation", reservationSchema);
