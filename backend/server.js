import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import { clerkMiddleware } from "./middleware/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import tripRoutes from "./routes/trips.js";
import dayRoutes from "./routes/days.js";
import activityRoutes from "./routes/activities.js";
import commentRoutes from "./routes/comments.js";
import checklistRoutes from "./routes/checklists.js";
import checklistItemRoutes from "./routes/checklistItems.js";
import expenseRoutes from "./routes/expenses.js";
import explorerRoutes from "./routes/explorer.js";
import sosRoutes from "./routes/sos.js";
import attachmentRoutes from "./routes/attachments.js";
import reservationRoutes from "./routes/reservations.js";
import dealRoutes from "./routes/dealRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
        ],
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(clerkMiddleware());

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/days", dayRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/checklist-items", checklistItemRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/explorer", explorerRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/deals", dealRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
