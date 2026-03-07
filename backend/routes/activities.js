import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Activity from "../models/Activity.js";
import Day from "../models/Day.js";
import TripMember from "../models/TripMember.js";

const router = Router();

// Helper: check user has edit access to the trip that owns a day
async function verifyEditAccess(userId, dayId) {
  const day = await Day.findById(dayId);
  if (!day) return { error: "Day not found", status: 404 };

  const member = await TripMember.findOne({ tripId: day.tripId, userId });
  if (!member || member.role === "Viewer") {
    return { error: "You don't have permission to modify activities", status: 403 };
  }
  return { day, member };
}

// POST /api/activities — add activity (order auto-assigned if omitted)
router.post("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { dayId, title, description, order, startTime, endTime, estimatedCost } = req.body;

    if (!dayId || !title) {
      return res.status(400).json({ error: "dayId and title are required" });
    }

    const access = await verifyEditAccess(userId, dayId);
    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }

    let assignedOrder = order;
    if (assignedOrder == null) {
      const lastActivity = await Activity.findOne({ dayId }).sort({ order: -1 });
      assignedOrder = lastActivity ? lastActivity.order + 1 : 1;
    }

    const activity = await Activity.create({
      dayId,
      title: title.trim(),
      description: description?.trim() || "",
      startTime: startTime || "",
      endTime: endTime || "",
      estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
      order: Number(assignedOrder),
    });

    res.status(201).json(activity);
  } catch (err) {
    console.error("Create activity error:", err);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

// PUT /api/activities/:id — update activity
router.put("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const access = await verifyEditAccess(userId, activity.dayId);
    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }

    const { title, description, order, startTime, endTime, estimatedCost } = req.body;
    if (title !== undefined) activity.title = title.trim();
    if (description !== undefined) activity.description = description.trim();
    if (order !== undefined) activity.order = Number(order);
    if (startTime !== undefined) activity.startTime = startTime;
    if (endTime !== undefined) activity.endTime = endTime;
    if (estimatedCost !== undefined) activity.estimatedCost = Number(estimatedCost);

    await activity.save();
    res.json(activity);
  } catch (err) {
    console.error("Update activity error:", err);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

// DELETE /api/activities/:id — delete activity
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const access = await verifyEditAccess(userId, activity.dayId);
    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }

    await activity.deleteOne();
    res.json({ message: "Activity deleted" });
  } catch (err) {
    console.error("Delete activity error:", err);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});

// GET /api/activities?dayId=xxx — get activities for a day
router.get("/", requireAuth(), async (req, res) => {
  try {
    const { dayId } = req.query;
    if (!dayId) {
      return res.status(400).json({ error: "dayId query param is required" });
    }

    const activities = await Activity.find({ dayId }).sort({ order: 1 });
    res.json(activities);
  } catch (err) {
    console.error("Get activities error:", err);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

export default router;
