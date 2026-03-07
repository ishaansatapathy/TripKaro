/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as attachments from "../attachments.js";
import type * as checklists from "../checklists.js";
import type * as comments from "../comments.js";
import type * as dayComments from "../dayComments.js";
import type * as days from "../days.js";
import type * as expenses from "../expenses.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as members from "../members.js";
import type * as reservations from "../reservations.js";
import type * as seed from "../seed.js";
import type * as trips from "../trips.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  attachments: typeof attachments;
  checklists: typeof checklists;
  comments: typeof comments;
  dayComments: typeof dayComments;
  days: typeof days;
  expenses: typeof expenses;
  "lib/permissions": typeof lib_permissions;
  members: typeof members;
  reservations: typeof reservations;
  seed: typeof seed;
  trips: typeof trips;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
