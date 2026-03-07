import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

export const getAttachments = query({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor", "viewer"]);

        const attachments = await ctx.db
            .query("attachments")
            .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
            .collect();

        const withUrls = await Promise.all(
            attachments.map(async (att) => {
                const url = await ctx.storage.getUrl(att.storageId);
                return { ...att, fileUrl: url };
            })
        );

        return withUrls.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const generateUploadUrl = mutation({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor"]);
        return await ctx.storage.generateUploadUrl();
    },
});

export const saveAttachment = mutation({
    args: {
        tripId: v.id("trips"),
        storageId: v.id("_storage"),
        fileName: v.string(),
        fileType: v.string(),
        fileSize: v.number(),
    },
    handler: async (ctx, args) => {
        const { userId } = await requireTripRole(ctx, args.tripId, ["owner", "editor"]);

        return await ctx.db.insert("attachments", {
            tripId: args.tripId,
            uploadedBy: userId,
            storageId: args.storageId,
            fileName: args.fileName,
            fileType: args.fileType,
            fileSize: args.fileSize,
            createdAt: Date.now(),
        });
    },
});

export const deleteAttachment = mutation({
    args: { attachmentId: v.id("attachments") },
    handler: async (ctx, args) => {
        const attachment = await ctx.db.get(args.attachmentId);
        if (!attachment) throw new Error("Attachment not found");

        await requireTripRole(ctx, attachment.tripId, ["owner"]);

        await ctx.storage.delete(attachment.storageId);
        await ctx.db.delete(args.attachmentId);
    },
});
