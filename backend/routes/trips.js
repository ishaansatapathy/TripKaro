import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createClerkClient } from "@clerk/express";
import { Resend } from "resend";
import Trip from "../models/Trip.js";
import TripMember from "../models/TripMember.js";
import Day from "../models/Day.js";
import Expense from "../models/Expense.js";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const router = Router();

// POST /api/trips — create a new trip
router.post("/", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { title, startDate, endDate } = req.body;

    // 1. Validate request
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    if (end < start) {
      return res.status(400).json({ error: "endDate must be after startDate" });
    }

    // 2. Create new Trip document with logged-in user as owner
    const trip = await Trip.create({
      title: title.trim(),
      startDate: start,
      endDate: end,
      ownerId: userId,
    });

    // 3. Create TripMember record with role = Owner
    await TripMember.create({
      tripId: trip._id,
      userId,
      role: "Owner",
    });

    // 4. Return created trip id
    res.status(201).json({ tripId: trip._id });
  } catch (err) {
    console.error("Trip creation error:", err);
    res.status(500).json({ error: "Failed to create trip" });
  }
});

// GET /api/trips/:tripId — get single trip
router.get("/:tripId", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) return res.status(403).json({ error: "You are not a member of this trip" });

    res.json(trip);
  } catch (err) {
    console.error("Get trip error:", err);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

// GET /api/trips/:tripId/members — get trip members
router.get("/:tripId/members", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) return res.status(403).json({ error: "You are not a member of this trip" });

    const members = await TripMember.find({ tripId });
    res.json(members);
  } catch (err) {
    console.error("Get members error:", err);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// GET /api/trips/:tripId/role — get current user's role
router.get("/:tripId/role", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) return res.status(403).json({ error: "You are not a member of this trip" });

    res.json({ role: member.role });
  } catch (err) {
    console.error("Get role error:", err);
    res.status(500).json({ error: "Failed to fetch role" });
  }
});

// POST /api/trips/:tripId/join — join an existing trip
router.post("/:tripId/join", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    // 1. Check trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // 2. Check if user already joined
    const existing = await TripMember.findOne({ tripId, userId });
    if (existing) {
      return res.status(409).json({ error: "You have already joined this trip", role: existing.role });
    }

    // 3. Create TripMember record with default role = Viewer
    const member = await TripMember.create({
      tripId,
      userId,
      role: "Viewer",
    });

    res.status(201).json({ message: "Successfully joined trip", role: member.role });
  } catch (err) {
    console.error("Join trip error:", err);
    res.status(500).json({ error: "Failed to join trip" });
  }
});

// POST /api/trips/:tripId/invite — invite a user by email
router.post("/:tripId/invite", requireAuth(), async (req, res) => {
  try {
    const inviterId = req.auth.userId;
    const { tripId } = req.params;
    const { email, role } = req.body;

    // 1. Validate inputs
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "email is required" });
    }
    const allowedRoles = ["Owner", "Editor", "Viewer"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${allowedRoles.join(", ")}` });
    }

    // 2. Check trip exists
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // 3. Verify inviter is the trip Owner
    const inviterMember = await TripMember.findOne({ tripId, userId: inviterId });
    if (!inviterMember || inviterMember.role !== "Owner") {
      return res.status(403).json({ error: "Only the trip Owner can invite members" });
    }

    // 4. Find the user by email via Clerk
    const { data: users } = await clerkClient.users.getUserList({
      emailAddress: [email.trim().toLowerCase()],
    });
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No user found with that email" });
    }
    const inviteeId = users[0].id;

    // 5. Prevent duplicate invites
    const existing = await TripMember.findOne({ tripId, userId: inviteeId });
    if (existing) {
      return res.status(409).json({ error: "User is already a member of this trip", role: existing.role });
    }

    // 6. Create TripMember record
    await TripMember.create({
      tripId,
      userId: inviteeId,
      role,
    });

    // 7. Send invite email via Resend (best-effort, don't fail the request if email fails)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    const tripLink = `${frontendUrl}/trip/${tripId}`;
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "TripKaro <onboarding@resend.dev>",
          to: email.trim().toLowerCase(),
          subject: `You've been invited to "${trip.title}" on TripKaro`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#0f172a">You're invited to a trip! ✈️</h2>
              <p style="color:#475569">Someone added you as a <strong>${role}</strong> on the trip:</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:16px 0">
                <p style="font-size:18px;font-weight:600;color:#0f172a;margin:0">${trip.title}</p>
                <p style="color:#64748b;font-size:13px;margin:6px 0 0">${new Date(trip.startDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})} → ${new Date(trip.endDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
              </div>
              <a href="${tripLink}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">View Trip →</a>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you didn't expect this, you can ignore this email.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Resend email error (non-fatal):", emailErr.message);
      }
    }

    res.status(201).json({ message: "User invited successfully", role });
  } catch (err) {
    console.error("Invite member error:", err);
    res.status(500).json({ error: "Failed to invite member" });
  }
});

// POST /api/trips/:tripId/days — add a day (auto-order)
router.post("/:tripId/days", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: "date is required" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const member = await TripMember.findOne({ tripId, userId });
    if (!member || member.role === "Viewer") {
      return res.status(403).json({ error: "You don't have permission to add days" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Auto-assign order: next after the current max
    const lastDay = await Day.findOne({ tripId }).sort({ order: -1 });
    const order = lastDay ? lastDay.order + 1 : 1;

    const day = await Day.create({ tripId, date: parsedDate, order });
    res.status(201).json(day);
  } catch (err) {
    console.error("Create day error:", err);
    res.status(500).json({ error: "Failed to create day" });
  }
});

// GET /api/trips/:tripId/days — get all days sorted by order
router.get("/:tripId/days", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You are not a member of this trip" });
    }

    const days = await Day.find({ tripId }).sort({ order: 1 });
    res.json(days);
  } catch (err) {
    console.error("Get days error:", err);
    res.status(500).json({ error: "Failed to fetch days" });
  }
});

// GET /api/trips/:tripId/expenses — get expenses with totalTripCost & perPersonShare
router.get("/:tripId/expenses", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You must be a trip member to view expenses" });
    }

    const [expenses, memberCount] = await Promise.all([
      Expense.find({ tripId }).sort({ createdAt: -1 }),
      TripMember.countDocuments({ tripId }),
    ]);

    const totalTripCost = expenses.reduce((sum, e) => sum + e.amount, 0);
    const perPersonShare = memberCount > 0 ? Math.ceil(totalTripCost / memberCount) : 0;

    res.json({ totalTripCost, perPersonShare, memberCount, expenses });
  } catch (err) {
    console.error("Get trip expenses error:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

export default router;
