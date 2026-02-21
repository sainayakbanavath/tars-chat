"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserCardSkeleton } from "@/components/ui/skeleton";
import { Users, Search } from "lucide-react";

interface UserSearchProps {
    currentUserId: Id<"users"> | null;
    searchQuery: string;
    onSelectUser: (conversationId: Id<"conversations">) => void;
}

export function UserSearch({
    currentUserId,
    searchQuery,
    onSelectUser,
}: UserSearchProps) {
    const { user } = useUser();

    const users = useQuery(
        api.users.searchUsers,
        user
            ? { searchQuery, currentUserClerkId: user.id }
            : "skip"
    );

    const getOrCreateConversation = useMutation(
        api.conversations.getOrCreateConversation
    );

    const handleSelectUser = async (userId: Id<"users">) => {
        if (!currentUserId) return;
        try {
            const conversationId = await getOrCreateConversation({
                currentUserId,
                otherUserId: userId,
            });
            onSelectUser(conversationId);
        } catch (error) {
            console.error("Failed to create conversation:", error);
        }
    };

    if (users === undefined) {
        return (
            <div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <UserCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] flex items-center justify-center mb-4">
                    {searchQuery ? (
                        <Search size={28} className="text-slate-600" />
                    ) : (
                        <Users size={28} className="text-slate-600" />
                    )}
                </div>
                <p className="text-slate-400 font-medium text-sm">
                    {searchQuery ? "No users found" : "No other users yet"}
                </p>
                <p className="text-slate-600 text-xs mt-1">
                    {searchQuery
                        ? `No results for "${searchQuery}"`
                        : "Share this app and invite others to join"}
                </p>
            </div>
        );
    }

    return (
        <div className="px-2 py-1 space-y-0.5">
            {users.map((u) => (
                <button
                    key={u._id}
                    onClick={() => handleSelectUser(u._id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1a1a2e] transition-all duration-200 group text-left"
                >
                    <UserAvatar
                        name={u.name}
                        imageUrl={u.imageUrl}
                        isOnline={u.isOnline}
                        size="sm"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate transition-colors">
                            {u.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {u.isOnline ? (
                                <span className="text-emerald-400">● Online</span>
                            ) : (
                                u.email
                            )}
                        </p>
                    </div>
                    <span className="text-xs text-slate-600 group-hover:text-indigo-400 transition-colors">
                        Message →
                    </span>
                </button>
            ))}
        </div>
    );
}
