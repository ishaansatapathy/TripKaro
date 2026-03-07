import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

const reservationType = v.union(
    v.literal("hotel"),
    v.literal("restaurant"),
    v.literal("tour"),
    v.literal("transport"),
    v.literal("other")
);

export const getReservations = query({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor", "viewer"]);

        const reservations = await ctx.db
            .query("reservations")
            .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
            .collect();

        return reservations.sort((a, b) => {
            if (a.date && b.date) return a.date.localeCompare(b.date);
            if (a.date) return -1;
            if (b.date) return 1;
            return a.createdAt - b.createdAt;
        });
    },
});

export const addReservation = mutation({
    args: {
        tripId: v.id("trips"),
        title: v.string(),
        type: reservationType,
        location: v.optional(v.string()),
        date: v.optional(v.string()),
        time: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor"]);

        return await ctx.db.insert("reservations", {
            tripId: args.tripId,
            title: args.title,
            type: args.type,
            location: args.location,
            date: args.date,
            time: args.time,
            notes: args.notes,
            createdAt: Date.now(),
        });
    },
});

export const editReservation = mutation({
    args: {
        reservationId: v.id("reservations"),
        title: v.optional(v.string()),
        type: v.optional(reservationType),
        location: v.optional(v.string()),
        date: v.optional(v.string()),
        time: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const reservation = await ctx.db.get(args.reservationId);
        if (!reservation) throw new Error("Reservation not found");
        await requireTripRole(ctx, reservation.tripId, ["owner", "editor"]);

        const { reservationId, ...updates } = args;
        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                cleanUpdates[key] = value;
            }
        }

        await ctx.db.patch(reservationId, cleanUpdates);
    },
});

export const deleteReservation = mutation({
    args: { reservationId: v.id("reservations") },
    handler: async (ctx, args) => {
        const reservation = await ctx.db.get(args.reservationId);
        if (!reservation) throw new Error("Reservation not found");
        await requireTripRole(ctx, reservation.tripId, ["owner"]);

        await ctx.db.delete(args.reservationId);
    },
});
