import { Router } from "express";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import Attachment from "../models/Attachment.js";
import TripMember from "../models/TripMember.js";

// Allowed MIME types — tickets, PDFs, images
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Storage: save to backend/uploads/ with a random name to prevent collisions
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve("uploads"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF documents and images (JPEG, PNG, WebP, GIF) are allowed"));
    }
  },
});

const router = Router();

// POST /api/attachments — upload a file for a trip
router.post("/", requireAuth(), (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds the 10 MB limit" });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.body;

    if (!tripId) {
      return res.status(400).json({ error: "tripId is required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "file is required" });
    }

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You must be a trip member to upload files" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await Attachment.create({
      tripId,
      fileUrl,
      fileName: req.file.originalname,
      uploadedBy: userId,
    });

    res.status(201).json(attachment);
  } catch (err) {
    console.error("Upload attachment error:", err);
    res.status(500).json({ error: "Failed to upload attachment" });
  }
});

// GET /api/attachments/:tripId — list attachments for a trip
router.get("/:tripId", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { tripId } = req.params;

    const member = await TripMember.findOne({ tripId, userId });
    if (!member) {
      return res.status(403).json({ error: "You must be a trip member to view attachments" });
    }

    const attachments = await Attachment.find({ tripId }).sort({ createdAt: -1 });
    res.json(attachments);
  } catch (err) {
    console.error("Get attachments error:", err);
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
});

// DELETE /api/attachments/:id — delete an attachment (Owner only)
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    const member = await TripMember.findOne({ tripId: attachment.tripId, userId });
    if (!member || (member.role !== "Owner" && attachment.uploadedBy !== userId)) {
      return res.status(403).json({ error: "You don't have permission to delete this attachment" });
    }

    await attachment.deleteOne();
    res.json({ message: "Attachment deleted" });
  } catch (err) {
    console.error("Delete attachment error:", err);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
});

export default router;
