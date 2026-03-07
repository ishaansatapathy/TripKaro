import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

export const getMembers = query({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor", "viewer"]);
        return await ctx.db
            .query("tripMembers")
            .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
            .collect();
    },
});

export const getMyRole = query({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const member = await ctx.db
            .query("tripMembers")
            .withIndex("by_trip_user", (q) =>
                q.eq("tripId", args.tripId).eq("userId", identity.subject)
            )
            .unique();

        return member?.role ?? null;
    },
});
