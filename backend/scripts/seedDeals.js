import "dotenv/config";
import mongoose from "mongoose";
import Deal from "../models/dealModel.js";
import { generateDeals } from "../data/dealCatalog.js";

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const sampleDeals = generateDeals();
  await Deal.deleteMany({});
  await Deal.insertMany(sampleDeals);

  console.log(`Seeded ${sampleDeals.length} deals`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Deal seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
