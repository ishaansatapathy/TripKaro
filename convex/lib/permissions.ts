import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export type TripRole = "owner" | "editor" | "viewer";

export async function requireTripRole(
    ctx: QueryCtx | MutationCtx,
    tripId: Id<"trips">,
    allowedRoles: TripRole[]
) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const member = await ctx.db
        .query("tripMembers")
        .withIndex("by_trip_user", (q) => q.eq("tripId", tripId).eq("userId", userId))
        .unique();

    if (!member) {
        throw new Error("Not a member of this trip");
    }

    if (!allowedRoles.includes(member.role)) {
        throw new Error("Insufficient permissions");
    }

    return { userId, role: member.role };
}

export async function getUserId(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Not authenticated");
    }
    return identity.subject;
}
