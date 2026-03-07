import "dotenv/config";
import mongoose from "mongoose";
import Deal from "../models/dealModel.js";

const sampleDeals = [
  { routeFrom: "Bangalore", routeTo: "Goa", price: 3299, provider: "IndiGo", airline: "IndiGo", redirectUrl: "https://www.goindigo.in/", departureTime: "07:30", arrivalTime: "09:00" },
  { routeFrom: "Bangalore", routeTo: "Goa", price: 3399, provider: "Goibibo", airline: "Air India Express", redirectUrl: "https://www.goibibo.com/flights/", departureTime: "12:20", arrivalTime: "13:50" },
  { routeFrom: "Bangalore", routeTo: "Goa", price: 3499, provider: "MakeMyTrip", airline: "IndiGo", redirectUrl: "https://www.makemytrip.com/flights/", departureTime: "08:10", arrivalTime: "09:40" },
  { routeFrom: "Bangalore", routeTo: "Goa", price: 3599, provider: "ixigo", airline: "Akasa Air", redirectUrl: "https://www.ixigo.com/flights", departureTime: "14:05", arrivalTime: "15:35" },
  { routeFrom: "Bangalore", routeTo: "Goa", price: 3699, provider: "Yatra", airline: "SpiceJet", redirectUrl: "https://www.yatra.com/flights", departureTime: "18:10", arrivalTime: "19:45" },
  { routeFrom: "Bangalore", routeTo: "Goa", price: 3899, provider: "EaseMyTrip", airline: "Air India", redirectUrl: "https://www.easemytrip.com/flights.html", departureTime: "20:25", arrivalTime: "21:55" },

  { routeFrom: "Bangalore", routeTo: "Delhi", price: 5299, provider: "Cleartrip", airline: "Air India", redirectUrl: "https://www.cleartrip.com/flights", departureTime: "06:15", arrivalTime: "09:05" },
  { routeFrom: "Bangalore", routeTo: "Delhi", price: 5499, provider: "MakeMyTrip", airline: "IndiGo", redirectUrl: "https://www.makemytrip.com/flights/", departureTime: "09:25", arrivalTime: "12:15" },
  { routeFrom: "Bangalore", routeTo: "Delhi", price: 5599, provider: "Goibibo", airline: "Akasa Air", redirectUrl: "https://www.goibibo.com/flights/", departureTime: "11:10", arrivalTime: "14:05" },
  { routeFrom: "Bangalore", routeTo: "Delhi", price: 5799, provider: "ixigo", airline: "Air India", redirectUrl: "https://www.ixigo.com/flights", departureTime: "15:20", arrivalTime: "18:10" },
  { routeFrom: "Bangalore", routeTo: "Delhi", price: 5999, provider: "Yatra", airline: "SpiceJet", redirectUrl: "https://www.yatra.com/flights", departureTime: "19:00", arrivalTime: "21:55" },

  { routeFrom: "Mumbai", routeTo: "Goa", price: 2899, provider: "MakeMyTrip", airline: "IndiGo", redirectUrl: "https://www.makemytrip.com/flights/", departureTime: "10:40", arrivalTime: "11:55" },
  { routeFrom: "Mumbai", routeTo: "Goa", price: 2999, provider: "Cleartrip", airline: "Air India Express", redirectUrl: "https://www.cleartrip.com/flights", departureTime: "07:15", arrivalTime: "08:25" },
  { routeFrom: "Mumbai", routeTo: "Goa", price: 3099, provider: "Goibibo", airline: "Akasa Air", redirectUrl: "https://www.goibibo.com/flights/", departureTime: "09:30", arrivalTime: "10:45" },
  { routeFrom: "Mumbai", routeTo: "Goa", price: 3199, provider: "Yatra", airline: "SpiceJet", redirectUrl: "https://www.yatra.com/flights", departureTime: "13:35", arrivalTime: "14:50" },
  { routeFrom: "Mumbai", routeTo: "Goa", price: 3399, provider: "EaseMyTrip", airline: "IndiGo", redirectUrl: "https://www.easemytrip.com/flights.html", departureTime: "17:20", arrivalTime: "18:35" },

  { routeFrom: "Delhi", routeTo: "Leh", price: 6199, provider: "Cleartrip", airline: "SpiceJet", redirectUrl: "https://www.cleartrip.com/flights", departureTime: "05:50", arrivalTime: "07:15" },
  { routeFrom: "Delhi", routeTo: "Leh", price: 6399, provider: "Goibibo", airline: "Air India", redirectUrl: "https://www.goibibo.com/flights/", departureTime: "06:35", arrivalTime: "07:55" },
  { routeFrom: "Delhi", routeTo: "Leh", price: 6499, provider: "IndiGo", airline: "IndiGo", redirectUrl: "https://www.goindigo.in/", departureTime: "08:00", arrivalTime: "09:25" },
  { routeFrom: "Delhi", routeTo: "Leh", price: 6699, provider: "ixigo", airline: "Air India Express", redirectUrl: "https://www.ixigo.com/flights", departureTime: "09:10", arrivalTime: "10:35" },
  { routeFrom: "Delhi", routeTo: "Leh", price: 6899, provider: "EaseMyTrip", airline: "IndiGo", redirectUrl: "https://www.easemytrip.com/flights.html", departureTime: "13:25", arrivalTime: "14:45" },

  { routeFrom: "Delhi", routeTo: "Goa", price: 4299, provider: "MakeMyTrip", airline: "IndiGo", redirectUrl: "https://www.makemytrip.com/flights/", departureTime: "05:40", arrivalTime: "08:15" },
  { routeFrom: "Delhi", routeTo: "Goa", price: 4499, provider: "Cleartrip", airline: "Air India", redirectUrl: "https://www.cleartrip.com/flights", departureTime: "07:10", arrivalTime: "09:45" },
  { routeFrom: "Delhi", routeTo: "Goa", price: 4699, provider: "ixigo", airline: "Air India Express", redirectUrl: "https://www.ixigo.com/flights", departureTime: "12:30", arrivalTime: "15:05" },
  { routeFrom: "Delhi", routeTo: "Goa", price: 4899, provider: "Yatra", airline: "Akasa Air", redirectUrl: "https://www.yatra.com/flights", departureTime: "16:55", arrivalTime: "19:25" },
  { routeFrom: "Delhi", routeTo: "Goa", price: 5099, provider: "Paytm Travel", airline: "SpiceJet", redirectUrl: "https://tickets.paytm.com/flights/", departureTime: "20:15", arrivalTime: "22:50" },

  { routeFrom: "Mumbai", routeTo: "Delhi", price: 3999, provider: "Goibibo", airline: "IndiGo", redirectUrl: "https://www.goibibo.com/flights/", departureTime: "06:05", arrivalTime: "08:20" },
  { routeFrom: "Mumbai", routeTo: "Delhi", price: 4199, provider: "EaseMyTrip", airline: "Air India", redirectUrl: "https://www.easemytrip.com/flights.html", departureTime: "10:25", arrivalTime: "12:45" },
  { routeFrom: "Mumbai", routeTo: "Delhi", price: 4399, provider: "Skyscanner", airline: "Akasa Air", redirectUrl: "https://www.skyscanner.co.in/flights", departureTime: "14:10", arrivalTime: "16:25" },
  { routeFrom: "Mumbai", routeTo: "Delhi", price: 4599, provider: "Yatra", airline: "SpiceJet", redirectUrl: "https://www.yatra.com/flights", departureTime: "19:40", arrivalTime: "22:00" },

  { routeFrom: "Chennai", routeTo: "Bangalore", price: 2399, provider: "MakeMyTrip", airline: "IndiGo", redirectUrl: "https://www.makemytrip.com/flights/", departureTime: "08:45", arrivalTime: "09:45" },
  { routeFrom: "Chennai", routeTo: "Bangalore", price: 2499, provider: "Cleartrip", airline: "Air India Express", redirectUrl: "https://www.cleartrip.com/flights", departureTime: "11:30", arrivalTime: "12:35" },
  { routeFrom: "Chennai", routeTo: "Bangalore", price: 2699, provider: "ixigo", airline: "Akasa Air", redirectUrl: "https://www.ixigo.com/flights", departureTime: "17:00", arrivalTime: "18:05" },

  { routeFrom: "Kolkata", routeTo: "Delhi", price: 4699, provider: "MakeMyTrip", airline: "IndiGo", redirectUrl: "https://www.makemytrip.com/flights/", departureTime: "06:30", arrivalTime: "08:45" },
  { routeFrom: "Kolkata", routeTo: "Delhi", price: 4899, provider: "Goibibo", airline: "Air India", redirectUrl: "https://www.goibibo.com/flights/", departureTime: "12:20", arrivalTime: "14:35" },
  { routeFrom: "Kolkata", routeTo: "Delhi", price: 5099, provider: "Paytm Travel", airline: "SpiceJet", redirectUrl: "https://tickets.paytm.com/flights/", departureTime: "18:10", arrivalTime: "20:25" }
];

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  await Deal.deleteMany({});
  await Deal.insertMany(sampleDeals.map((deal) => ({ ...deal, createdAt: new Date() })));

  console.log(`Seeded ${sampleDeals.length} deals`);
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Deal seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
