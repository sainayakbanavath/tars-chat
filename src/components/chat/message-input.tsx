"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Send, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

interface MessageInputProps {
    conversationId: Id<"conversations">;
    currentUserId: Id<"users">;
}

export function MessageInput({
    conversationId,
    currentUserId,
}: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sendMessage = useMutation(api.messages.sendMessage);
    const setTyping = useMutation(api.typing.setTyping);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleTyping = (value: string) => {
        setMessage(value);

        // Send typing indicator
        setTyping({
            conversationId,
            userId: currentUserId,
            isTyping: true,
        }).catch(console.error);

        // Clear typing after 2 seconds of inactivity
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            setTyping({
                conversationId,
                userId: currentUserId,
                isTyping: false,
            }).catch(console.error);
        }, 2000);
    };

    const handleSend = async () => {
        const trimmed = message.trim();
        if (!trimmed || isSending) return;

        setIsSending(true);
        setMessage("");

        // Clear typing indicator
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        await setTyping({
            conversationId,
            userId: currentUserId,
            isTyping: false,
        }).catch(console.error);

        try {
            await sendMessage({
                conversationId,
                senderId: currentUserId,
                content: trimmed,
                messageType: "text",
            });
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message. Try again.", {
                icon: "⚠️",
            });
            setMessage(trimmed); // Restore message for retry
        } finally {
            setIsSending(false);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const insertEmoji = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        setShowEmoji(false);
        textareaRef.current?.focus();
    };

    return (
        <div className="px-4 pb-4 pt-2 bg-[#080818] flex-shrink-0">
            <div className="relative flex items-end gap-2 bg-[#0f0f23] border border-[#1e2a4a] rounded-2xl p-2 focus-within:border-indigo-500/50 transition-all duration-200">
                {/* Emoji picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all duration-200 flex-shrink-0"
                    >
                        <Smile size={20} />
                    </button>

                    {showEmoji && (
                        <div className="absolute bottom-12 left-0 bg-[#1a1a2e] border border-[#1e2a4a] rounded-2xl p-3 shadow-xl animate-fade-in z-50">
                            <div className="grid grid-cols-4 gap-2">
                                {EMOJI_LIST.map((emoji) => (
                                    <button
                                        key={emoji}
                                        onClick={() => insertEmoji(emoji)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl hover:bg-slate-700 transition-all duration-150 hover:scale-110"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-600 text-sm resize-none focus:outline-none max-h-[120px] leading-relaxed py-1.5 px-1"
                />

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                        message.trim() && !isSending
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-100"
                            : "bg-slate-800 text-slate-600 cursor-not-allowed scale-95"
                    )}
                >
                    <Send size={16} className={isSending ? "animate-pulse" : ""} />
                </button>
            </div>
            <p className="text-xs text-slate-700 text-center mt-2">
                Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
}
