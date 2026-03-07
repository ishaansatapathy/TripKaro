import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Checklist from "../models/Checklist.js";
import ChecklistItem from "../models/ChecklistItem.js";
import TripMember from "../models/TripMember.js";

const router = Router();

// POST /api/checklists — create checklist
router.post("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId, title } = req.body;

    if (!tripId || !title || !title.trim()) {
      return res.status(400).json({ error: "tripId and title are required" });
    }

    const member = await TripMember.findOne({ tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to create checklists" });
    }

    const checklist = await Checklist.create({ tripId, title: title.trim() });
    res.status(201).json(checklist);
  } catch (err) {
    console.error("Create checklist error:", err);
    res.status(500).json({ error: "Failed to create checklist" });
  }
});

// GET /api/checklists?tripId=xxx — get checklists with items
router.get("/", requireAuth(), async (req, res) => {
  try {
    const { tripId } = req.query;
    if (!tripId) {
      return res.status(400).json({ error: "tripId query param is required" });
    }

    const checklists = await Checklist.find({ tripId });
    const checklistIds = checklists.map((c) => c._id);
    const items = await ChecklistItem.find({ checklistId: { $in: checklistIds } });

    const result = checklists.map((cl) => ({
      ...cl.toObject(),
      items: items.filter((i) => i.checklistId.toString() === cl._id.toString()),
    }));

    res.json(result);
  } catch (err) {
    console.error("Get checklists error:", err);
    res.status(500).json({ error: "Failed to fetch checklists" });
  }
});

// POST /api/checklists/items — add checklist item
router.post("/items", requireAuth(), async (req, res) => {
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

// PUT /api/checklists/items/:id — update checklist item
router.put("/items/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const item = await ChecklistItem.findById(id);
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

// DELETE /api/checklists/items/:id — delete checklist item
router.delete("/items/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const item = await ChecklistItem.findById(id);
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

// DELETE /api/checklists/:id — delete entire checklist and its items
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

    const member = await TripMember.findOne({ tripId: checklist.tripId, userId });
    if (!member || member.role !== "Owner") {
      return res.status(403).json({ error: "Only the trip Owner can delete checklists" });
    }

    await ChecklistItem.deleteMany({ checklistId: checklist._id });
    await checklist.deleteOne();
    res.json({ message: "Checklist deleted" });
  } catch (err) {
    console.error("Delete checklist error:", err);
    res.status(500).json({ error: "Failed to delete checklist" });
  }
});

export default router;
