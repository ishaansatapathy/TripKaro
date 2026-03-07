import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

export const getActivities = query({
    args: { dayId: v.id("days") },
    handler: async (ctx, args) => {
        const day = await ctx.db.get(args.dayId);
        if (!day) throw new Error("Day not found");
        await requireTripRole(ctx, day.tripId, ["owner", "editor", "viewer"]);

        const activities = await ctx.db
            .query("activities")
            .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
            .collect();
        return activities.sort((a, b) => a.order - b.order);
    },
});

export const addActivity = mutation({
    args: {
        dayId: v.id("days"),
        title: v.string(),
        description: v.optional(v.string()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        estimatedCost: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const day = await ctx.db.get(args.dayId);
        if (!day) throw new Error("Day not found");
        await requireTripRole(ctx, day.tripId, ["owner", "editor"]);

        const existing = await ctx.db
            .query("activities")
            .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
            .collect();

        const maxOrder = existing.reduce((max, a) => Math.max(max, a.order), 0);

        return await ctx.db.insert("activities", {
            dayId: args.dayId,
            title: args.title,
            description: args.description,
            startTime: args.startTime,
            endTime: args.endTime,
            order: maxOrder + 1,
            estimatedCost: args.estimatedCost,
        });
    },
});

export const editActivity = mutation({
    args: {
        activityId: v.id("activities"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        estimatedCost: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const activity = await ctx.db.get(args.activityId);
        if (!activity) throw new Error("Activity not found");

        const day = await ctx.db.get(activity.dayId);
        if (!day) throw new Error("Day not found");
        await requireTripRole(ctx, day.tripId, ["owner", "editor"]);

        const { activityId, ...updates } = args;
        const cleanUpdates: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                cleanUpdates[key] = value;
            }
        }

        await ctx.db.patch(activityId, cleanUpdates);
    },
});

export const deleteActivity = mutation({
    args: { activityId: v.id("activities") },
    handler: async (ctx, args) => {
        const activity = await ctx.db.get(args.activityId);
        if (!activity) throw new Error("Activity not found");

        const day = await ctx.db.get(activity.dayId);
        if (!day) throw new Error("Day not found");
        await requireTripRole(ctx, day.tripId, ["owner", "editor"]);

        await ctx.db.delete(args.activityId);

        const remaining = await ctx.db
            .query("activities")
            .withIndex("by_day", (q) => q.eq("dayId", activity.dayId))
            .collect();

        const sorted = remaining.sort((a, b) => a.order - b.order);
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].order !== i + 1) {
                await ctx.db.patch(sorted[i]._id, { order: i + 1 });
            }
        }
    },
});

export const reorderActivities = mutation({
    args: {
        dayId: v.id("days"),
        orderedIds: v.array(v.id("activities")),
    },
    handler: async (ctx, args) => {
        const day = await ctx.db.get(args.dayId);
        if (!day) throw new Error("Day not found");
        await requireTripRole(ctx, day.tripId, ["owner", "editor"]);

        for (let i = 0; i < args.orderedIds.length; i++) {
            await ctx.db.patch(args.orderedIds[i], { order: i + 1 });
        }
    },
});
