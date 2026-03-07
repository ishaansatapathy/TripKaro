import { mutation } from "./_generated/server";

export const seedTrip = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.subject;

        const tripId = await ctx.db.insert("trips", {
            title: "Tokyo Adventure 2026",
            startDate: "2026-04-01",
            endDate: "2026-04-05",
            ownerId: userId,
            createdAt: Date.now(),
        });

        await ctx.db.insert("tripMembers", {
            tripId,
            userId,
            role: "owner",
        });

        const day1 = await ctx.db.insert("days", {
            tripId,
            date: "2026-04-01",
            order: 1,
        });

        const day2 = await ctx.db.insert("days", {
            tripId,
            date: "2026-04-02",
            order: 2,
        });

        await ctx.db.insert("activities", {
            dayId: day1,
            title: "Visit Senso-ji Temple",
            description: "Explore the oldest temple in Tokyo",
            startTime: "09:00",
            endTime: "11:00",
            order: 1,
            estimatedCost: 0,
        });

        await ctx.db.insert("activities", {
            dayId: day1,
            title: "Lunch at Tsukiji Market",
            description: "Fresh sushi and street food",
            startTime: "12:00",
            endTime: "13:30",
            order: 2,
            estimatedCost: 3000,
        });

        await ctx.db.insert("activities", {
            dayId: day2,
            title: "Shibuya Crossing & Shopping",
            startTime: "10:00",
            endTime: "14:00",
            order: 1,
            estimatedCost: 5000,
        });

        return tripId;
    },
});
