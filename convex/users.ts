import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Upsert (create or update) a user from Clerk webhook or on login
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
            });
            return existingUser._id;
        }

        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            isOnline: false,
            lastSeen: Date.now(),
            createdAt: Date.now(),
        });

        return userId;
    },
});

// Get the current user by Clerk ID
export const getMe = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

// Get all users except the current user
export const getAllUsers = query({
    args: { currentUserClerkId: v.string() },
    handler: async (ctx, args) => {
        const users = await ctx.db.query("users").collect();
        return users.filter((user) => user.clerkId !== args.currentUserClerkId);
    },
});

// Search users by name
export const searchUsers = query({
    args: {
        searchQuery: v.string(),
        currentUserClerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const users = await ctx.db.query("users").collect();
        const filtered = users.filter(
            (user) =>
                user.clerkId !== args.currentUserClerkId &&
                user.name.toLowerCase().includes(args.searchQuery.toLowerCase())
        );
        return filtered;
    },
});

// Get a user by their Convex ID
export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

// Get multiple users by their IDs
export const getUsersByIds = query({
    args: { userIds: v.array(v.id("users")) },
    handler: async (ctx, args) => {
        const users = await Promise.all(args.userIds.map((id) => ctx.db.get(id)));
        return users.filter(Boolean);
    },
});

// Set a user's online status
export const setOnlineStatus = mutation({
    args: {
        clerkId: v.string(),
        isOnline: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: args.isOnline,
                lastSeen: Date.now(),
            });
        }
    },
});
