import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

// ── queries ──
export const getDayComments = query({
    args: { dayId: v.id("days") },
    handler: async (ctx, args) => {
        const day = await ctx.db.get(args.dayId);
        if (!day) throw new Error("Day not found");

        await requireTripRole(ctx, day.tripId, ["owner", "editor", "viewer"]);

        const comments = await ctx.db
            .query("dayComments")
            .withIndex("by_day", (q) => q.eq("dayId", args.dayId))
            .collect();

        return comments.sort((a, b) => a.createdAt - b.createdAt);
    },
});

// ── mutations ──
export const addDayComment = mutation({
    args: {
        dayId: v.id("days"),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const day = await ctx.db.get(args.dayId);
        if (!day) throw new Error("Day not found");

        const { userId } = await requireTripRole(ctx, day.tripId, ["owner", "editor"]);

        const identity = await ctx.auth.getUserIdentity();
        const userName = identity?.name ?? identity?.email ?? "Unknown";

        return await ctx.db.insert("dayComments", {
            dayId: args.dayId,
            userId,
            userName: userName as string,
            message: args.message,
            createdAt: Date.now(),
        });
    },
});

export const deleteDayComment = mutation({
    args: { commentId: v.id("dayComments") },
    handler: async (ctx, args) => {
        const comment = await ctx.db.get(args.commentId);
        if (!comment) throw new Error("Comment not found");

        const day = await ctx.db.get(comment.dayId);
        if (!day) throw new Error("Day not found");

        const { userId, role } = await requireTripRole(ctx, day.tripId, ["owner", "editor"]);

        // Only comment author or trip owner can delete
        if (comment.userId !== userId && role !== "owner") {
            throw new Error("Cannot delete another user's comment");
        }

        await ctx.db.delete(args.commentId);
    },
});
