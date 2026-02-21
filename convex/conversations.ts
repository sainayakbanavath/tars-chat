import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or get a direct message conversation between two users
export const getOrCreateConversation = mutation({
    args: {
        currentUserId: v.id("users"),
        otherUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Find existing conversation with exactly these two participants
        const conversations = await ctx.db.query("conversations").collect();

        const existingConversation = conversations.find((conv) => {
            if (conv.isGroup) return false;
            const participants = conv.participantIds;
            return (
                participants.length === 2 &&
                participants.includes(args.currentUserId) &&
                participants.includes(args.otherUserId)
            );
        });

        if (existingConversation) {
            return existingConversation._id;
        }

        // Create new conversation
        const conversationId = await ctx.db.insert("conversations", {
            participantIds: [args.currentUserId, args.otherUserId],
            isGroup: false,
            createdBy: args.currentUserId,
            lastMessageAt: Date.now(),
            createdAt: Date.now(),
        });

        return conversationId;
    },
});

// Create a group conversation
export const createGroupConversation = mutation({
    args: {
        currentUserId: v.id("users"),
        participantIds: v.array(v.id("users")),
        groupName: v.string(),
    },
    handler: async (ctx, args) => {
        const allParticipants = [args.currentUserId, ...args.participantIds];

        const conversationId = await ctx.db.insert("conversations", {
            participantIds: allParticipants,
            isGroup: true,
            groupName: args.groupName,
            createdBy: args.currentUserId,
            lastMessageAt: Date.now(),
            createdAt: Date.now(),
        });

        return conversationId;
    },
});

// Get all conversations for a user (with last message and participant info)
export const getUserConversations = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const conversations = await ctx.db
            .query("conversations")
            .withIndex("by_last_message_at")
            .order("desc")
            .collect();

        const userConversations = conversations.filter((conv) =>
            conv.participantIds.includes(args.userId)
        );

        const conversationsWithDetails = await Promise.all(
            userConversations.map(async (conv) => {
                // Get participants
                const participants = await Promise.all(
                    conv.participantIds.map((id) => ctx.db.get(id))
                );

                // Get last message
                const lastMessage = conv.lastMessageId
                    ? await ctx.db.get(conv.lastMessageId)
                    : null;

                // Get unread count
                const readReceipt = await ctx.db
                    .query("readReceipts")
                    .withIndex("by_conversation_and_user", (q) =>
                        q.eq("conversationId", conv._id).eq("userId", args.userId)
                    )
                    .unique();

                let unreadCount = 0;
                if (lastMessage) {
                    const allMessages = await ctx.db
                        .query("messages")
                        .withIndex("by_conversation", (q) =>
                            q.eq("conversationId", conv._id)
                        )
                        .collect();

                    const lastReadAt = readReceipt?.lastReadAt ?? 0;
                    unreadCount = allMessages.filter(
                        (msg) =>
                            msg.createdAt > lastReadAt && msg.senderId !== args.userId
                    ).length;
                }

                return {
                    ...conv,
                    participants: participants.filter(Boolean),
                    lastMessage,
                    unreadCount,
                };
            })
        );

        return conversationsWithDetails;
    },
});

// Get a single conversation by ID
export const getConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.conversationId);
    },
});
