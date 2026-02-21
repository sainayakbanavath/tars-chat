import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Set typing status
export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const existingIndicator = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .unique();

        if (existingIndicator) {
            await ctx.db.patch(existingIndicator._id, {
                isTyping: args.isTyping,
                lastTypingAt: Date.now(),
            });
        } else {
            await ctx.db.insert("typingIndicators", {
                conversationId: args.conversationId,
                userId: args.userId,
                isTyping: args.isTyping,
                lastTypingAt: Date.now(),
            });
        }
    },
});

// Get typing indicators for a conversation
export const getTypingUsers = query({
    args: {
        conversationId: v.id("conversations"),
        currentUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const twoSecondsAgo = Date.now() - 2000;

        const indicators = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const activeTypers = indicators.filter(
            (ind) =>
                ind.userId !== args.currentUserId &&
                ind.isTyping &&
                ind.lastTypingAt > twoSecondsAgo
        );

        const typersWithInfo = await Promise.all(
            activeTypers.map(async (ind) => {
                const user = await ctx.db.get(ind.userId);
                return user;
            })
        );

        return typersWithInfo.filter(Boolean);
    },
});
