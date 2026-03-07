import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

// ── queries ──
export const getComments = query({
    args: { activityId: v.id("activities") },
    handler: async (ctx, args) => {
        const activity = await ctx.db.get(args.activityId);
        if (!activity) throw new Error("Activity not found");

        const day = await ctx.db.get(activity.dayId);
        if (!day) throw new Error("Day not found");

        await requireTripRole(ctx, day.tripId, ["owner", "editor", "viewer"]);

        const comments = await ctx.db
            .query("comments")
            .withIndex("by_activity", (q) => q.eq("activityId", args.activityId))
            .collect();

        return comments.sort((a, b) => a.createdAt - b.createdAt);
    },
});

// ── mutations ──
export const addComment = mutation({
    args: {
        activityId: v.id("activities"),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const activity = await ctx.db.get(args.activityId);
        if (!activity) throw new Error("Activity not found");

        const day = await ctx.db.get(activity.dayId);
        if (!day) throw new Error("Day not found");

        const { userId } = await requireTripRole(ctx, day.tripId, ["owner", "editor"]);

        const identity = await ctx.auth.getUserIdentity();
        const userName = identity?.name ?? identity?.email ?? "Unknown";

        return await ctx.db.insert("comments", {
            activityId: args.activityId,
            userId,
            userName: userName as string,
            message: args.message,
            createdAt: Date.now(),
        });
    },
});

export const deleteComment = mutation({
    args: { commentId: v.id("comments") },
    handler: async (ctx, args) => {
        const comment = await ctx.db.get(args.commentId);
        if (!comment) throw new Error("Comment not found");

        const activity = await ctx.db.get(comment.activityId);
        if (!activity) throw new Error("Activity not found");

        const day = await ctx.db.get(activity.dayId);
        if (!day) throw new Error("Day not found");

        const { userId, role } = await requireTripRole(ctx, day.tripId, ["owner", "editor"]);

        // Only comment author or trip owner can delete
        if (comment.userId !== userId && role !== "owner") {
            throw new Error("Cannot delete another user's comment");
        }

        await ctx.db.delete(args.commentId);
    },
});
