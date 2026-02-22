"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatMessageTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Trash2, SmilePlus } from "lucide-react";
import toast from "react-hot-toast";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageBubbleProps {
    message: {
        _id: Id<"messages">;
        content: string;
        senderId: Id<"users">;
        createdAt: number;
        isDeleted: boolean;
        messageType: string;
        reactions?: Array<{ userId: Id<"users">; emoji: string }>;
        sender?: {
            _id: Id<"users">;
            name: string;
            imageUrl?: string;
        } | null;
    };
    isSelf: boolean;
    currentUserId: Id<"users">;
    showAvatar?: boolean;
}

export function MessageBubble({
    message,
    isSelf,
    currentUserId,
    showAvatar,
}: MessageBubbleProps) {
    const [showActions, setShowActions] = useState(false);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const deleteMessage = useMutation(api.messages.deleteMessage);
    const addReaction = useMutation(api.messages.addReaction);

    const handleDelete = async () => {
        try {
            await deleteMessage({ messageId: message._id, userId: currentUserId });
        } catch {
            toast.error("Failed to delete message");
        }
    };

    const handleReaction = async (emoji: string) => {
        try {
            await addReaction({ messageId: message._id, userId: currentUserId, emoji });
        } catch {
            toast.error("Failed to add reaction");
        }
        setShowReactionPicker(false);
    };

    // Group reactions by emoji
    const reactionGroups = (message.reactions ?? []).reduce<
        Record<string, { count: number; hasReacted: boolean }>
    >((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasReacted: false };
        acc[r.emoji].count++;
        if (r.userId === currentUserId) acc[r.emoji].hasReacted = true;
        return acc;
    }, {});

    return (
        <div
            className={cn(
                "flex items-end gap-2 px-4 py-1 group animate-fade-in",
                isSelf ? "flex-row-reverse" : "flex-row"
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => {
                setShowActions(false);
                setShowReactionPicker(false);
            }}
        >
            {/* Avatar for received messages */}
            {!isSelf && showAvatar !== false && (
                <div className="flex-shrink-0 mb-1">
                    <UserAvatar
                        name={message.sender?.name ?? "?"}
                        imageUrl={message.sender?.imageUrl}
                        size="xs"
                    />
                </div>
            )}
            {!isSelf && showAvatar === false && (
                <div className="w-7 flex-shrink-0" />
            )}

            {/* Message column */}
            <div className={cn("flex flex-col max-w-[65%] min-w-0", isSelf && "items-end")}>
                {/* Sender name for group chats */}
                {!isSelf && showAvatar && message.sender && (
                    <span className="text-xs text-indigo-400 font-semibold mb-1 ml-1">
                        {message.sender.name}
                    </span>
                )}

                {/* Bubble + actions row */}
                <div className="relative flex items-center gap-2">
                    {/* Actions — left of sent, right of received */}
                    {showActions && !message.isDeleted && (
                        <div
                            className={cn(
                                "flex items-center gap-1 z-10 flex-shrink-0",
                                isSelf ? "order-first" : "order-last"
                            )}
                        >
                            <div className="flex items-center gap-1 bg-[#1a1a2e] border border-[#2d3f69] rounded-xl p-1 shadow-xl animate-fade-in">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowReactionPicker(!showReactionPicker);
                                    }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                                    title="Add reaction"
                                >
                                    <SmilePlus size={14} />
                                </button>
                                {isSelf && (
                                    <button
                                        onClick={handleDelete}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                        title="Delete message"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Emoji picker */}
                            {showReactionPicker && (
                                <div className="absolute bottom-full mb-2 bg-[#1a1a2e] border border-[#2d3f69] rounded-2xl p-2 shadow-2xl animate-fade-in z-20 flex gap-1">
                                    {REACTION_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(emoji)}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-slate-700 hover:scale-110 transition-all duration-150"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bubble */}
                    <div
                        className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed break-words min-w-0",
                            isSelf
                                ? "message-sent text-white rounded-br-sm shadow-md shadow-indigo-900/30"
                                : "bg-[#1a1a2e] border border-[#2d3f69] text-slate-100 rounded-bl-sm shadow-md"
                        )}
                    >
                        {message.isDeleted ? (
                            <em className="text-slate-400 text-sm">This message was deleted</em>
                        ) : (
                            <span className="whitespace-pre-wrap break-words">{message.content}</span>
                        )}
                    </div>
                </div>

                {/* Reactions */}
                {Object.keys(reactionGroups).length > 0 && (
                    <div className={cn("flex flex-wrap gap-1 mt-1.5", isSelf ? "justify-end" : "justify-start")}>
                        {Object.entries(reactionGroups).map(([emoji, { count, hasReacted }]) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className={cn(
                                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-150 border",
                                    hasReacted
                                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                                        : "bg-[#1a1a2e] border-[#2d3f69] text-slate-300 hover:border-slate-500"
                                )}
                            >
                                <span>{emoji}</span>
                                <span>{count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Timestamp */}
                <span className={cn(
                    "text-[11px] text-slate-500 mt-1 px-1 select-none",
                    isSelf ? "text-right" : "text-left"
                )}>
                    {formatMessageTime(message.createdAt)}
                </span>
            </div>
        </div>
    );
}
