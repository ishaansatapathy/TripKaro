import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Reservation from "../models/Reservation.js";
import TripMember from "../models/TripMember.js";

const router = Router();

// POST /api/reservations — create a reservation
router.post("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId, title, location, date, time, notes } = req.body;

    if (!tripId || !title || !title.trim()) {
      return res.status(400).json({ error: "tripId and title are required" });
    }

    const member = await TripMember.findOne({ tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to add reservations" });
    }

    const reservation = await Reservation.create({
      tripId,
      title: title.trim(),
      location: location?.trim() || "",
      date: date || "",
      time: time || "",
      notes: notes?.trim() || "",
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.error("Create reservation error:", err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

// GET /api/reservations/:tripId — list reservations for a trip
router.get("/:tripId", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You must be a trip member to view reservations" });
    }

    const reservations = await Reservation.find({ tripId }).sort({ date: 1, time: 1 });
    res.json(reservations);
  } catch (err) {
    console.error("Get reservations error:", err);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

// DELETE /api/reservations/:id — delete a reservation
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    const member = await TripMember.findOne({ tripId: reservation.tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to delete reservations" });
    }

    await reservation.deleteOne();
    res.json({ message: "Reservation deleted" });
  } catch (err) {
    console.error("Delete reservation error:", err);
    res.status(500).json({ error: "Failed to delete reservation" });
  }
});

export default router;
