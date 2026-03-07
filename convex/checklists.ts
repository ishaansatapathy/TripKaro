import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

export const getChecklists = query({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor", "viewer"]);

        const checklists = await ctx.db
            .query("checklists")
            .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
            .collect();

        return checklists.sort((a, b) => a.createdAt - b.createdAt);
    },
});

export const createChecklist = mutation({
    args: {
        tripId: v.id("trips"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor"]);

        return await ctx.db.insert("checklists", {
            tripId: args.tripId,
            title: args.title,
            createdAt: Date.now(),
        });
    },
});

export const deleteChecklist = mutation({
    args: { checklistId: v.id("checklists") },
    handler: async (ctx, args) => {
        const checklist = await ctx.db.get(args.checklistId);
        if (!checklist) throw new Error("Checklist not found");
        await requireTripRole(ctx, checklist.tripId, ["owner"]);

        const items = await ctx.db
            .query("checklistItems")
            .withIndex("by_checklist", (q) => q.eq("checklistId", args.checklistId))
            .collect();

        for (const item of items) {
            await ctx.db.delete(item._id);
        }

        await ctx.db.delete(args.checklistId);
    },
});

export const getChecklistItems = query({
    args: { checklistId: v.id("checklists") },
    handler: async (ctx, args) => {
        const checklist = await ctx.db.get(args.checklistId);
        if (!checklist) throw new Error("Checklist not found");
        await requireTripRole(ctx, checklist.tripId, ["owner", "editor", "viewer"]);

        const items = await ctx.db
            .query("checklistItems")
            .withIndex("by_checklist", (q) => q.eq("checklistId", args.checklistId))
            .collect();

        return items.sort((a, b) => a.order - b.order);
    },
});

export const addChecklistItem = mutation({
    args: {
        checklistId: v.id("checklists"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const checklist = await ctx.db.get(args.checklistId);
        if (!checklist) throw new Error("Checklist not found");
        await requireTripRole(ctx, checklist.tripId, ["owner", "editor"]);

        const existing = await ctx.db
            .query("checklistItems")
            .withIndex("by_checklist", (q) => q.eq("checklistId", args.checklistId))
            .collect();

        const maxOrder = existing.reduce((max, item) => Math.max(max, item.order), 0);

        return await ctx.db.insert("checklistItems", {
            checklistId: args.checklistId,
            text: args.text,
            completed: false,
            order: maxOrder + 1,
        });
    },
});

export const toggleChecklistItem = mutation({
    args: { itemId: v.id("checklistItems") },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.itemId);
        if (!item) throw new Error("Item not found");

        const checklist = await ctx.db.get(item.checklistId);
        if (!checklist) throw new Error("Checklist not found");
        await requireTripRole(ctx, checklist.tripId, ["owner", "editor"]);

        await ctx.db.patch(args.itemId, { completed: !item.completed });
    },
});

export const deleteChecklistItem = mutation({
    args: { itemId: v.id("checklistItems") },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.itemId);
        if (!item) throw new Error("Item not found");

        const checklist = await ctx.db.get(item.checklistId);
        if (!checklist) throw new Error("Checklist not found");
        await requireTripRole(ctx, checklist.tripId, ["owner", "editor"]);

        await ctx.db.delete(args.itemId);
    },
});
