export type QueryCtx = any;
export type MutationCtx = any;
export type ActionCtx = any;

export declare function query<TArgs = any, TResult = any>(fn: (ctx: QueryCtx, args: TArgs) => TResult): (ctx: QueryCtx, args: TArgs) => TResult;
export declare function mutation<TArgs = any, TResult = any>(fn: (ctx: MutationCtx, args: TArgs) => TResult): (ctx: MutationCtx, args: TArgs) => TResult;
export declare function action<TArgs = any, TResult = any>(fn: (ctx: ActionCtx, args: TArgs) => TResult): (ctx: ActionCtx, args: TArgs) => TResult;
export declare function internalQuery<TArgs = any, TResult = any>(fn: (ctx: QueryCtx, args: TArgs) => TResult): (ctx: QueryCtx, args: TArgs) => TResult;
export declare function internalMutation<TArgs = any, TResult = any>(fn: (ctx: MutationCtx, args: TArgs) => TResult): (ctx: MutationCtx, args: TArgs) => TResult;
