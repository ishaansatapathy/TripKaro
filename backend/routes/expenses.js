import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Expense from "../models/Expense.js";
import TripMember from "../models/TripMember.js";

const router = Router();

// POST /api/expenses — create expense
router.post("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId, title, amount, paidBy, category, splitBetween } = req.body;

    if (!tripId || !title || !title.trim() || amount == null || !paidBy) {
      return res.status(400).json({ error: "tripId, title, amount, and paidBy are required" });
    }

    if (typeof amount !== "number" || amount < 0) {
      return res.status(400).json({ error: "amount must be a non-negative number" });
    }

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You must be a trip member to add expenses" });
    }

    const expense = await Expense.create({
      tripId,
      title: title.trim(),
      amount,
      category: category || "other",
      paidBy: paidBy.trim(),
      splitBetween: Array.isArray(splitBetween) ? splitBetween : [],
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// GET /api/expenses/trip/:tripId — get expenses for a trip with total
router.get("/trip/:tripId", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You must be a trip member to view expenses" });
    }

    const expenses = await Expense.find({ tripId }).sort({ createdAt: -1 });
    const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0);

    const memberCount = await TripMember.countDocuments({ tripId });
    const perPersonShare = memberCount > 0 ? Math.ceil(totalCost / memberCount) : 0;

    res.json({ totalCost, perPersonShare, memberCount, expenses });
  } catch (err) {
    console.error("Get expenses error:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// DELETE /api/expenses/:id — delete expense
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    const member = await TripMember.findOne({ tripId: expense.tripId, userId });
    if (!member || member.role !== "Owner") {
      return res.status(403).json({ error: "Only the trip Owner can delete expenses" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Delete expense error:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

export default router;
