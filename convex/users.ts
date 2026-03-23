import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { internalQuery, mutation, query } from './_generated/server';

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const listAll = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    return users
      .filter((u) => u.email)
      .map((u) => ({ email: u.email as string, name: u.name ?? u.email as string }));
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }
    await ctx.db.patch(userId, args);
    return await ctx.db.get(userId);
  },
});
