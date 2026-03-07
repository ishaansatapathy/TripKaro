import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Trip from "../models/Trip.js";
import TripMember from "../models/TripMember.js";

const router = Router();

// GET /api/dashboard — fetch user's own trips + joined trips
router.get("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;

    // 1. Trips owned by this user
    const myTrips = await Trip.find({ ownerId: userId }).sort({ createdAt: -1 });

    // 2. Trips where user is a member (but not owner)
    const memberships = await TripMember.find({ userId, role: { $ne: "Owner" } });
    const joinedTripIds = memberships.map((m) => m.tripId);
    const joinedTrips = await Trip.find({ _id: { $in: joinedTripIds } }).sort({ createdAt: -1 });

    // Attach role info to joined trips
    const joinedTripsWithRole = joinedTrips.map((trip) => {
      const membership = memberships.find((m) => m.tripId.toString() === trip._id.toString());
      return { ...trip.toObject(), role: membership?.role ?? "Viewer" };
    });

    res.json({ myTrips, joinedTrips: joinedTripsWithRole });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;
