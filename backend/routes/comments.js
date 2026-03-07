import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Comment from "../models/Comment.js";
import Activity from "../models/Activity.js";
import Day from "../models/Day.js";
import TripMember from "../models/TripMember.js";

const router = Router();

// POST /api/comments — add comment to an activity or a day
router.post("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { activityId, dayId, message, userName } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (!activityId && !dayId) {
      return res.status(400).json({ error: "Either activityId or dayId is required" });
    }

    let tripId;

    if (activityId) {
      const activity = await Activity.findById(activityId);
      if (!activity) return res.status(404).json({ error: "Activity not found" });
      const day = await Day.findById(activity.dayId);
      if (!day) return res.status(404).json({ error: "Day not found" });
      tripId = day.tripId;
    } else {
      const day = await Day.findById(dayId);
      if (!day) return res.status(404).json({ error: "Day not found" });
      tripId = day.tripId;
    }

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You must be a trip member to comment" });
    }

    const comment = await Comment.create({
      userId,
      tripId,
      activityId: activityId || null,
      dayId: dayId || null,
      userName: userName || "User",
      message: message.trim(),
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// GET /api/comments/activity/:activityId — fetch comments for an activity
router.get("/activity/:activityId", requireAuth(), async (req, res) => {
  try {
    const { activityId } = req.params;
    const comments = await Comment.find({ activityId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error("Fetch activity comments error:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// GET /api/comments/day/:dayId — fetch comments for a day
router.get("/day/:dayId", requireAuth(), async (req, res) => {
  try {
    const { dayId } = req.params;
    const comments = await Comment.find({ dayId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error("Fetch day comments error:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// DELETE /api/comments/:id — delete comment
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId !== userId) return res.status(403).json({ error: "You can only delete your own comments" });
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
