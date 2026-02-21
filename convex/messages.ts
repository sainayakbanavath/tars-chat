import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a message
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        messageType: v.union(
            v.literal("text"),
            v.literal("image"),
            v.literal("file")
        ),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: args.senderId,
            content: args.content,
            messageType: args.messageType,
            isDeleted: false,
            reactions: [],
            createdAt: Date.now(),
        });

        // Update conversation's lastMessageId and lastMessageAt
        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
            lastMessageAt: Date.now(),
        });

        // Mark as read for the sender
        const existingReceipt = await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_and_user", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", args.senderId)
            )
            .unique();

        if (existingReceipt) {
            await ctx.db.patch(existingReceipt._id, {
                lastReadMessageId: messageId,
                lastReadAt: Date.now(),
            });
        } else {
            await ctx.db.insert("readReceipts", {
                conversationId: args.conversationId,
                userId: args.senderId,
                lastReadMessageId: messageId,
                lastReadAt: Date.now(),
            });
        }

        return messageId;
    },
});

// Get all messages in a conversation
export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation_and_time", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("asc")
            .collect();

        // Get sender info for each message
        const messagesWithSender = await Promise.all(
            messages.map(async (message) => {
                const sender = await ctx.db.get(message.senderId);
                return { ...message, sender };
            })
        );

        return messagesWithSender;
    },
});

// Soft delete a message
export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");
        if (message.senderId !== args.userId)
            throw new Error("Cannot delete others' messages");

        await ctx.db.patch(args.messageId, {
            isDeleted: true,
            deletedAt: Date.now(),
            content: "This message was deleted",
        });
    },
});

// Add a reaction to a message
export const addReaction = mutation({
    args: {
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        const reactions = message.reactions ?? [];

        // Check if user already reacted with this emoji
        const existingReactionIndex = reactions.findIndex(
            (r) => r.userId === args.userId && r.emoji === args.emoji
        );

        let updatedReactions;
        if (existingReactionIndex >= 0) {
            // Remove the reaction (toggle off)
            updatedReactions = reactions.filter(
                (_, i) => i !== existingReactionIndex
            );
        } else {
            // Add the reaction
            updatedReactions = [...reactions, { userId: args.userId, emoji: args.emoji }];
        }

        await ctx.db.patch(args.messageId, { reactions: updatedReactions });
    },
});

// Mark messages as read
export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existingReceipt = await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_and_user", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", args.userId)
            )
            .unique();

        if (existingReceipt) {
            await ctx.db.patch(existingReceipt._id, {
                lastReadAt: Date.now(),
            });
        } else {
            await ctx.db.insert("readReceipts", {
                conversationId: args.conversationId,
                userId: args.userId,
                lastReadAt: Date.now(),
            });
        }
    },
});
