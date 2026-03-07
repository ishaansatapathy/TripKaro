import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireTripRole } from "./lib/permissions";

const expenseCategory = v.union(
    v.literal("hotel"),
    v.literal("transport"),
    v.literal("food"),
    v.literal("tickets"),
    v.literal("other")
);

export const getExpenses = query({
    args: { tripId: v.id("trips") },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor", "viewer"]);

        const expenses = await ctx.db
            .query("expenses")
            .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
            .collect();

        return expenses.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const addExpense = mutation({
    args: {
        tripId: v.id("trips"),
        title: v.string(),
        amount: v.number(),
        category: expenseCategory,
        paidBy: v.string(),
        splitBetween: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await requireTripRole(ctx, args.tripId, ["owner", "editor"]);

        return await ctx.db.insert("expenses", {
            tripId: args.tripId,
            title: args.title,
            amount: args.amount,
            category: args.category,
            paidBy: args.paidBy,
            splitBetween: args.splitBetween,
            createdAt: Date.now(),
        });
    },
});

export const deleteExpense = mutation({
    args: { expenseId: v.id("expenses") },
    handler: async (ctx, args) => {
        const expense = await ctx.db.get(args.expenseId);
        if (!expense) throw new Error("Expense not found");
        await requireTripRole(ctx, expense.tripId, ["owner"]);

        await ctx.db.delete(args.expenseId);
    },
});
