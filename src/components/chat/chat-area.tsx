"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { MessageSkeleton } from "@/components/ui/skeleton";
import { formatMessageTime } from "@/lib/format";
import {
    ArrowLeft,
    Phone,
    Video,
    MoreVertical,
    MessageSquare,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ChatAreaProps {
    conversationId: Id<"conversations"> | null;
    currentUserId: Id<"users"> | null;
    onBack?: () => void;
    isMobile?: boolean;
}

export function ChatArea({
    conversationId,
    currentUserId,
    onBack,
    isMobile,
}: ChatAreaProps) {
    const { user } = useUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const prevMessageCountRef = useRef(0);

    const conversation = useQuery(
        api.conversations.getConversation,
        conversationId ? { conversationId } : "skip"
    );

    const messages = useQuery(
        api.messages.getMessages,
        conversationId ? { conversationId } : "skip"
    );

    const typingUsers = useQuery(
        api.typing.getTypingUsers,
        conversationId && currentUserId
            ? { conversationId, currentUserId }
            : "skip"
    );

    const markAsRead = useMutation(api.messages.markAsRead);

    // Get other participant for DMs
    const participants = conversation?.participantIds ?? [];
    const otherParticipantId = participants.find((id) => id !== currentUserId);

    const otherUser = useQuery(
        api.users.getUserById,
        otherParticipantId ? { userId: otherParticipantId } : "skip"
    );

    // Auto-scroll management
    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
        });
    }, []);

    const handleScroll = useCallback(() => {
        const el = scrollAreaRef.current;
        if (!el) return;
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
        setIsAtBottom(atBottom);
        if (atBottom) setHasNewMessages(false);
    }, []);

    // When messages arrive, auto-scroll or show "New messages" button
    useEffect(() => {
        if (!messages) return;
        const count = messages.length;
        if (count > prevMessageCountRef.current) {
            if (isAtBottom) {
                scrollToBottom();
                setHasNewMessages(false);
            } else {
                setHasNewMessages(true);
            }
        }
        prevMessageCountRef.current = count;
    }, [messages, isAtBottom, scrollToBottom]);

    // Scroll to bottom when conversation changes
    useEffect(() => {
        if (conversationId) {
            setTimeout(() => scrollToBottom(false), 100);
        }
    }, [conversationId, scrollToBottom]);

    // Mark as read when viewing a conversation
    useEffect(() => {
        if (conversationId && currentUserId) {
            markAsRead({ conversationId, userId: currentUserId }).catch(console.error);
        }
    }, [conversationId, currentUserId, messages?.length]);

    if (!conversationId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#080818]">
                <div className="text-center animate-fade-in">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center mb-6 mx-auto">
                        <MessageSquare size={40} className="text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-200 mb-2">
                        Select a conversation
                    </h2>
                    <p className="text-slate-500 text-sm max-w-xs">
                        Choose a conversation from the sidebar or search for people to start
                        chatting in real time.
                    </p>
                </div>
            </div>
        );
    }

    const displayName = conversation?.isGroup
        ? conversation.groupName
        : otherUser?.name ?? "Loading...";

    const isOnline = !conversation?.isGroup && otherUser?.isOnline;

    return (
        <div className="flex-1 flex flex-col bg-[#080818] relative overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-[#0f0f23] border-b border-[#1e2a4a] flex-shrink-0">
                {isMobile && (
                    <button
                        onClick={onBack}
                        className="w-9 h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all mr-1"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}

                <UserAvatar
                    name={displayName ?? "?"}
                    imageUrl={conversation?.isGroup ? undefined : otherUser?.imageUrl}
                    isOnline={!conversation?.isGroup ? isOnline : undefined}
                    size="sm"
                />

                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-slate-100 truncate">
                        {displayName}
                    </h2>
                    <p className="text-xs">
                        {conversation?.isGroup ? (
                            <span className="text-slate-500">
                                {conversation.participantIds.length} members
                            </span>
                        ) : isOnline ? (
                            <span className="text-emerald-400">● Active now</span>
                        ) : otherUser ? (
                            <span className="text-slate-500">● Offline</span>
                        ) : null}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        title="Video call (coming soon)"
                        className="w-9 h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all duration-200"
                    >
                        <Video size={18} />
                    </button>
                    <button
                        title="More options"
                        className="w-9 h-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all duration-200"
                    >
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Messages area */}
            <div
                ref={scrollAreaRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
            >
                {messages === undefined ? (
                    <div className="flex flex-col gap-4 pt-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <MessageSkeleton key={i} isSelf={i % 3 === 0} />
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center mb-5">
                            <MessageSquare size={32} className="text-indigo-400" />
                        </div>
                        <h3 className="text-slate-300 font-semibold mb-1">
                            No messages yet
                        </h3>
                        <p className="text-slate-600 text-sm">
                            {conversation?.isGroup
                                ? "Be the first to send a message to this group!"
                                : `Say hello to ${displayName}! 👋`}
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const prevMessage = messages[index - 1];
                            const showDateSeparator =
                                index === 0 ||
                                (prevMessage &&
                                    new Date(message.createdAt).toDateString() !==
                                    new Date(prevMessage.createdAt).toDateString());

                            return (
                                <div key={message._id}>
                                    {showDateSeparator && (
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px bg-[#1e2a4a]" />
                                            <span className="text-xs text-slate-600 px-2 py-1 bg-[#1a1a2e] rounded-full">
                                                {new Date(message.createdAt).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </span>
                                            <div className="flex-1 h-px bg-[#1e2a4a]" />
                                        </div>
                                    )}

                                    <MessageBubble
                                        message={message}
                                        isSelf={message.senderId === currentUserId}
                                        currentUserId={currentUserId!}
                                        showAvatar={
                                            !conversation?.isGroup
                                                ? false
                                                : message.senderId !== messages[index - 1]?.senderId
                                        }
                                    />
                                </div>
                            );
                        })}

                        {/* Typing indicator */}
                        {typingUsers && typingUsers.length > 0 && (
                            <div className="flex items-end gap-2 animate-fade-in">
                                <UserAvatar
                                    name={typingUsers[0]?.name ?? "?"}
                                    imageUrl={typingUsers[0]?.imageUrl}
                                    size="xs"
                                />
                                <div className="bg-[#1a1a2e] border border-[#1e2a4a] rounded-2xl rounded-bl-none px-4 py-3 max-w-[80px]">
                                    <div className="flex items-center gap-1">
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                    </div>
                                </div>
                                <span className="text-xs text-slate-500 mb-1">
                                    {typingUsers.map((u) => u?.name).join(", ")} is typing...
                                </span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* New messages button */}
            {hasNewMessages && !isAtBottom && (
                <button
                    onClick={() => {
                        scrollToBottom();
                        setHasNewMessages(false);
                    }}
                    className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg transition-all duration-200 animate-bounce-in"
                >
                    <ChevronDown size={14} />
                    New messages
                </button>
            )}

            {/* Message input */}
            {conversationId && currentUserId && (
                <MessageInput
                    conversationId={conversationId}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}
