"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser, UserButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ConversationItem } from "./conversation-item";
import { UserSearch } from "./user-search";
import { CreateGroupModal } from "./create-group-modal";
import { ConversationSkeleton } from "@/components/ui/skeleton";
import {
    MessageSquare,
    Search,
    Users,
    Plus,
    X,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    currentUserId: Id<"users"> | null;
    selectedConversationId: Id<"conversations"> | null;
    onSelectConversation: (id: Id<"conversations">) => void;
    isMobile?: boolean;
    onCloseSidebar?: () => void;
}

type ActiveTab = "messages" | "users";

export function Sidebar({
    currentUserId,
    selectedConversationId,
    onSelectConversation,
    isMobile,
    onCloseSidebar,
}: SidebarProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>("messages");
    const [searchQuery, setSearchQuery] = useState("");
    const [showGroupModal, setShowGroupModal] = useState(false);
    const { user } = useUser();

    const conversations = useQuery(
        api.conversations.getUserConversations,
        currentUserId ? { userId: currentUserId } : "skip"
    );

    const filteredConversations = conversations?.filter((conv) => {
        if (!searchQuery) return true;
        if (conv.isGroup && conv.groupName) {
            return conv.groupName.toLowerCase().includes(searchQuery.toLowerCase());
        }
        const otherParticipant = conv.participants.find(
            (p) => p && p._id !== currentUserId
        );
        return otherParticipant?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
    });

    return (
        <>
            <aside className="flex flex-col h-full bg-[#0f0f23] border-r border-[#1e2a4a]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-[#1e2a4a]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <MessageSquare size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">Tars Chat</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {activeTab === "messages" && (
                            <button
                                onClick={() => setShowGroupModal(true)}
                                title="Create group chat"
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all duration-200"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8",
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Search bar */}
                <div className="px-3 py-3">
                    <div className="relative">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                            type="text"
                            placeholder={
                                activeTab === "messages" ? "Search conversations..." : "Search people..."
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1a1a2e] border border-[#1e2a4a] rounded-xl pl-9 pr-9 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-[#16213e] transition-all duration-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex mx-3 mb-2 rounded-xl bg-[#1a1a2e] p-1">
                    <button
                        onClick={() => setActiveTab("messages")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === "messages"
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-slate-300"
                        )}
                    >
                        <MessageSquare size={14} />
                        Messages
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === "users"
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "text-slate-400 hover:text-slate-300"
                        )}
                    >
                        <Users size={14} />
                        People
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === "messages" ? (
                        <>
                            {conversations === undefined ? (
                                // Loading skeleton
                                <div>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <ConversationSkeleton key={i} />
                                    ))}
                                </div>
                            ) : filteredConversations && filteredConversations.length > 0 ? (
                                <div className="px-2 py-1 space-y-0.5">
                                    {filteredConversations.map((conv) => (
                                        <ConversationItem
                                            key={conv._id}
                                            conversation={conv as any}
                                            currentUserId={currentUserId!}
                                            isSelected={conv._id === selectedConversationId}
                                            onClick={() => {
                                                onSelectConversation(conv._id);
                                                if (isMobile) onCloseSidebar?.();
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                // Empty state
                                <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                                    <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] flex items-center justify-center mb-4">
                                        <MessageSquare size={28} className="text-slate-600" />
                                    </div>
                                    <p className="text-slate-400 font-medium text-sm">
                                        {searchQuery ? "No conversations found" : "No conversations yet"}
                                    </p>
                                    <p className="text-slate-600 text-xs mt-1">
                                        {searchQuery
                                            ? "Try a different search"
                                            : "Go to People tab to start chatting"}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <UserSearch
                            currentUserId={currentUserId}
                            searchQuery={searchQuery}
                            onSelectUser={(convId) => {
                                onSelectConversation(convId);
                                setActiveTab("messages");
                                if (isMobile) onCloseSidebar?.();
                            }}
                        />
                    )}
                </div>
            </aside>

            {showGroupModal && currentUserId && (
                <CreateGroupModal
                    currentUserId={currentUserId}
                    onClose={() => setShowGroupModal(false)}
                    onCreated={(convId) => {
                        onSelectConversation(convId);
                        setShowGroupModal(false);
                        setActiveTab("messages");
                    }}
                />
            )}
        </>
    );
}
