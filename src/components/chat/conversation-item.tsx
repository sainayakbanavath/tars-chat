"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { formatConversationTime, truncate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

interface ConversationItemProps {
    conversation: {
        _id: Id<"conversations">;
        isGroup: boolean;
        groupName?: string;
        participantIds: Id<"users">[];
        participants: Array<{
            _id: Id<"users">;
            name: string;
            imageUrl?: string;
            isOnline: boolean;
        } | null>;
        lastMessage: {
            content: string;
            senderId: Id<"users">;
            isDeleted: boolean;
            createdAt: number;
        } | null;
        lastMessageAt: number;
        unreadCount: number;
    };
    currentUserId: Id<"users">;
    isSelected: boolean;
    onClick: () => void;
}

export function ConversationItem({
    conversation,
    currentUserId,
    isSelected,
    onClick,
}: ConversationItemProps) {
    const otherParticipant = conversation.participants.find(
        (p) => p && p._id !== currentUserId
    );

    const displayName = conversation.isGroup
        ? conversation.groupName
        : otherParticipant?.name ?? "Unknown User";

    const displayImage = conversation.isGroup ? undefined : otherParticipant?.imageUrl;
    const isOnline = conversation.isGroup ? false : otherParticipant?.isOnline ?? false;

    const lastMessagePreview = (() => {
        if (!conversation.lastMessage) return "No messages yet";
        if (conversation.lastMessage.isDeleted) return "Message was deleted";
        const prefix =
            conversation.lastMessage.senderId === currentUserId ? "You: " : "";
        return prefix + truncate(conversation.lastMessage.content, 35);
    })();

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left group",
                isSelected
                    ? "bg-indigo-600/20 border border-indigo-500/30"
                    : "hover:bg-[#1a1a2e] border border-transparent"
            )}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <UserAvatar
                    name={displayName ?? "?"}
                    imageUrl={displayImage}
                    isOnline={!conversation.isGroup ? isOnline : undefined}
                    size="sm"
                />
                {conversation.isGroup && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">
                            {conversation.participantIds.length}
                        </span>
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p
                        className={cn(
                            "text-sm font-semibold truncate transition-colors",
                            isSelected ? "text-white" : "text-slate-200",
                            !isSelected && "group-hover:text-white"
                        )}
                    >
                        {displayName}
                    </p>
                    <span className="text-xs text-slate-600 flex-shrink-0">
                        {formatConversationTime(conversation.lastMessageAt)}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-1">
                    <p
                        className={cn(
                            "text-xs truncate transition-colors",
                            isSelected ? "text-indigo-300" : "text-slate-500"
                        )}
                    >
                        {lastMessagePreview}
                    </p>
                    {conversation.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 animate-bounce-in">
                            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
