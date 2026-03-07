import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
  routeFrom: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  routeTo: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true,
  },
  provider: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  airline: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  redirectUrl: {
    type: String,
    required: true,
    trim: true,
  },
  departureTime: {
    type: String,
    required: true,
    trim: true,
  },
  arrivalTime: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Deal", dealSchema);
