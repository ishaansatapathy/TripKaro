import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  trips: defineTable({
    title: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    ownerId: v.string(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  tripMembers: defineTable({
    tripId: v.id("trips"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
  })
    .index("by_trip", ["tripId"])
    .index("by_user", ["userId"])
    .index("by_trip_user", ["tripId", "userId"]),

  days: defineTable({
    tripId: v.id("trips"),
    date: v.string(),
    order: v.number(),
  }).index("by_trip", ["tripId"]),

  activities: defineTable({
    dayId: v.id("days"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    order: v.number(),
    estimatedCost: v.optional(v.number()),
  }).index("by_day", ["dayId"]),

  comments: defineTable({
    activityId: v.id("activities"),
    userId: v.string(),
    userName: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_activity", ["activityId"]),

  dayComments: defineTable({
    dayId: v.id("days"),
    userId: v.string(),
    userName: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_day", ["dayId"]),

  checklists: defineTable({
    tripId: v.id("trips"),
    title: v.string(),
    createdAt: v.number(),
  }).index("by_trip", ["tripId"]),

  checklistItems: defineTable({
    checklistId: v.id("checklists"),
    text: v.string(),
    completed: v.boolean(),
    order: v.number(),
  }).index("by_checklist", ["checklistId"]),

  attachments: defineTable({
    tripId: v.id("trips"),
    uploadedBy: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    createdAt: v.number(),
  }).index("by_trip", ["tripId"]),

  reservations: defineTable({
    tripId: v.id("trips"),
    title: v.string(),
    type: v.union(
      v.literal("hotel"),
      v.literal("restaurant"),
      v.literal("tour"),
      v.literal("transport"),
      v.literal("other")
    ),
    location: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_trip", ["tripId"]),

  expenses: defineTable({
    tripId: v.id("trips"),
    title: v.string(),
    amount: v.number(),
    category: v.union(
      v.literal("hotel"),
      v.literal("transport"),
      v.literal("food"),
      v.literal("tickets"),
      v.literal("other")
    ),
    paidBy: v.string(),
    splitBetween: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_trip", ["tripId"]),
});
