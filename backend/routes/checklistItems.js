import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Checklist from "../models/Checklist.js";
import ChecklistItem from "../models/ChecklistItem.js";
import TripMember from "../models/TripMember.js";

const router = Router();

// POST /api/checklist-items — add item to a checklist
router.post("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { checklistId, text } = req.body;

    if (!checklistId || !text || !text.trim()) {
      return res.status(400).json({ error: "checklistId and text are required" });
    }

    const checklist = await Checklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    const member = await TripMember.findOne({ tripId: checklist.tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to add items" });
    }

    const item = await ChecklistItem.create({ checklistId, text: text.trim() });
    res.status(201).json(item);
  } catch (err) {
    console.error("Create checklist item error:", err);
    res.status(500).json({ error: "Failed to create checklist item" });
  }
});

// PUT /api/checklist-items/:id — update text or toggle completed
router.put("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const item = await ChecklistItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Checklist item not found" });
    }

    const checklist = await Checklist.findById(item.checklistId);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    const member = await TripMember.findOne({ tripId: checklist.tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to update items" });
    }

    const { text, completed } = req.body;
    if (text !== undefined) item.text = text.trim();
    if (completed !== undefined) item.completed = Boolean(completed);

    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Update checklist item error:", err);
    res.status(500).json({ error: "Failed to update checklist item" });
  }
});

// DELETE /api/checklist-items/:id — remove an item
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const item = await ChecklistItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Checklist item not found" });
    }

    const checklist = await Checklist.findById(item.checklistId);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    const member = await TripMember.findOne({ tripId: checklist.tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to delete items" });
    }

    await item.deleteOne();
    res.json({ message: "Checklist item deleted" });
  } catch (err) {
    console.error("Delete checklist item error:", err);
    res.status(500).json({ error: "Failed to delete checklist item" });
  }
});

export default router;
