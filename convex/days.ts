import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

export const getDays = query({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor", "viewer"]);
        const days = await ctx.db
            .query("days")
            .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
            .collect();
        return days.sort((a, b) => a.order - b.order);
    },
});

export const addDay = mutation({
    args: {
        tripId: v.id("trips"),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor"]);

        const existingDays = await ctx.db
            .query("days")
            .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
            .collect();

        const maxOrder = existingDays.reduce((max, d) => Math.max(max, d.order), 0);

        return await ctx.db.insert("days", {
            tripId: args.tripId,
            date: args.date,
            order: maxOrder + 1,
        });
    },
});
