import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Day from "../models/Day.js";
import Trip from "../models/Trip.js";
import TripMember from "../models/TripMember.js";
import Activity from "../models/Activity.js";

const router = Router();

// POST /api/days — create a new day (order auto-assigned if omitted)
router.post("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId, date, order } = req.body;

    if (!tripId || !date) {
      return res.status(400).json({ error: "tripId and date are required" });
    }

    // Verify trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Verify user is a member with edit access
    const member = await TripMember.findOne({ tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to add days" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Auto-assign order if not provided
    let assignedOrder = order;
    if (assignedOrder == null) {
      const lastDay = await Day.findOne({ tripId }).sort({ order: -1 });
      assignedOrder = lastDay ? lastDay.order + 1 : 1;
    }

    const day = await Day.create({
      tripId,
      date: parsedDate,
      order: Number(assignedOrder),
    });

    res.status(201).json(day);
  } catch (err) {
    console.error("Create day error:", err);
    res.status(500).json({ error: "Failed to create day" });
  }
});

// GET /api/days/:dayId/activities — handled in activities route
// GET /api/days?tripId=xxx — get all days for a trip
router.get("/", requireAuth(), async (req, res) => {
  try {
    const { tripId } = req.query;
    if (!tripId) {
      return res.status(400).json({ error: "tripId query param is required" });
    }

    const days = await Day.find({ tripId }).sort({ order: 1 });
    res.json(days);
  } catch (err) {
    console.error("Get days error:", err);
    res.status(500).json({ error: "Failed to fetch days" });
  }
});

// ─── Activities nested under days ───

// POST /api/days/:dayId/activities — add activity (auto-order)
router.post("/:dayId/activities", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { dayId } = req.params;
    const { title, description } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    const day = await Day.findById(dayId);
    if (!day) return res.status(404).json({ error: "Day not found" });

    const member = await TripMember.findOne({ tripId: day.tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to add activities" });
    }

    const lastActivity = await Activity.findOne({ dayId }).sort({ order: -1 });
    const order = lastActivity ? lastActivity.order + 1 : 1;

    const activity = await Activity.create({
      dayId,
      title: title.trim(),
      description: description?.trim() || "",
      order,
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error("Create activity error:", err);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// GET /api/days/:dayId/activities — fetch activities sorted by order
router.get("/:dayId/activities", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { dayId } = req.params;

    const day = await Day.findById(dayId);
    if (!day) return res.status(404).json({ error: "Day not found" });

    const member = await TripMember.findOne({ tripId: day.tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You are not a member of this trip" });
    }

    const activities = await Activity.find({ dayId }).sort({ order: 1 });
    res.json(activities);
  } catch (err) {
    console.error("Get activities error:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// PUT /api/days/:dayId/reorder-activities — drag-and-drop reorder
router.put("/:dayId/reorder-activities", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { dayId } = req.params;
    const { activities } = req.body;

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({ error: "activities array is required" });
    }

    const day = await Day.findById(dayId);
    if (!day) return res.status(404).json({ error: "Day not found" });

    const member = await TripMember.findOne({ tripId: day.tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to reorder activities" });
    }

    const bulkOps = activities.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id, dayId },
        update: { $set: { order } },
      },
    }));

    await Activity.bulkWrite(bulkOps);

    const updated = await Activity.find({ dayId }).sort({ order: 1 });
    res.json(updated);
  } catch (err) {
    console.error("Reorder activities error:", err);
    res.status(500).json({ error: "Failed to reorder activities" });
  }
});

export default router;
