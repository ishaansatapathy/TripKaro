import { Router } from "express";
import { getDeals } from "../controllers/dealController.js";

const router = Router();

// GET /api/deals?from=Bangalore&to=Goa
router.get("/", getDeals);

export default router;
