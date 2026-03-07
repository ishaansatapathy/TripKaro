import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole, getUserId } from "./lib/permissions";

export const getDashboard = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { myTrips: [], joinedTrips: [] };
        }
        const userId = identity.subject;

        // Trips I own
        const myTrips = await ctx.db
            .query("trips")
            .withIndex("by_owner", (q) => q.eq("ownerId", userId))
            .collect();

        // Trips I'm a member of (but not owner)
        const memberships = await ctx.db
            .query("tripMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const joinedTrips = [];
        for (const m of memberships) {
            if (m.role === "owner") continue;
            const trip = await ctx.db.get(m.tripId);
            if (trip) {
                joinedTrips.push({ ...trip, role: m.role });
            }
        }

        return { myTrips, joinedTrips };
    },
});

export const createTrip = mutation({
    args: {
        title: v.string(),
        startDate: v.string(),
        endDate: v.string(),
        userId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let userId: string;
        try {
            userId = await getUserId(ctx);
        } catch {
            if (args.userId) {
                userId = args.userId;
            } else {
                throw new Error("Not authenticated");
            }
        }

        const tripId = await ctx.db.insert("trips", {
            title: args.title,
            startDate: args.startDate,
            endDate: args.endDate,
            ownerId: userId,
            createdAt: Date.now(),
        });

        // Add owner as a trip member
        await ctx.db.insert("tripMembers", {
            tripId,
            userId,
            role: "owner",
        });

        return tripId;
    },
});

export const getTrip = query({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor", "viewer"]);
        const trip = await ctx.db.get(args.tripId);
        if (!trip) {
            throw new Error("Trip not found");
        }
        return trip;
    },
});
