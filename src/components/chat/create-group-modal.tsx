"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { X, Search, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateGroupModalProps {
    currentUserId: Id<"users">;
    onClose: () => void;
    onCreated: (conversationId: Id<"conversations">) => void;
}

export function CreateGroupModal({
    currentUserId,
    onClose,
    onCreated,
}: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    const { user } = useUser();

    const users = useQuery(
        api.users.searchUsers,
        user ? { searchQuery, currentUserClerkId: user.id } : "skip"
    );

    const createGroupConversation = useMutation(
        api.conversations.createGroupConversation
    );

    const toggleUser = (userId: Id<"users">) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUsers.length < 2) return;
        setIsCreating(true);
        try {
            const conversationId = await createGroupConversation({
                currentUserId,
                participantIds: selectedUsers,
                groupName: groupName.trim(),
            });
            onCreated(conversationId);
        } catch (error) {
            console.error("Failed to create group:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#0f0f23] border border-[#1e2a4a] rounded-2xl w-full max-w-md shadow-2xl animate-bounce-in">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#1e2a4a]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                            <Users size={16} className="text-indigo-400" />
                        </div>
                        <h2 className="font-bold text-slate-100">Create Group Chat</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Group name input */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                            Group Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter group name..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full bg-[#1a1a2e] border border-[#1e2a4a] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all duration-200"
                        />
                    </div>

                    {/* Selected users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map((userId) => {
                                const u = users?.find((u) => u._id === userId);
                                if (!u) return null;
                                return (
                                    <div
                                        key={userId}
                                        className="flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full pl-1 pr-2 py-1"
                                    >
                                        <UserAvatar name={u.name} imageUrl={u.imageUrl} size="xs" />
                                        <span className="text-xs text-indigo-300 font-medium">
                                            {u.name}
                                        </span>
                                        <button
                                            onClick={() => toggleUser(userId)}
                                            className="text-indigo-400 hover:text-indigo-200 ml-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* User search */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                            Add Members (min. 2)
                        </label>
                        <div className="relative mb-2">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />
                            <input
                                type="text"
                                placeholder="Search people..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1a1a2e] border border-[#1e2a4a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all duration-200"
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-0.5 rounded-xl">
                            {users?.map((u) => (
                                <button
                                    key={u._id}
                                    onClick={() => toggleUser(u._id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                                        selectedUsers.includes(u._id)
                                            ? "bg-indigo-600/10 border border-indigo-500/30"
                                            : "hover:bg-[#1a1a2e] border border-transparent"
                                    )}
                                >
                                    <UserAvatar
                                        name={u.name}
                                        imageUrl={u.imageUrl}
                                        isOnline={u.isOnline}
                                        size="xs"
                                    />
                                    <span className="text-sm text-slate-200 flex-1 text-left">
                                        {u.name}
                                    </span>
                                    {selectedUsers.includes(u._id) && (
                                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Create button */}
                    <button
                        onClick={handleCreate}
                        disabled={!groupName.trim() || selectedUsers.length < 2 || isCreating}
                        className={cn(
                            "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                            groupName.trim() && selectedUsers.length >= 2 && !isCreating
                                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                : "bg-slate-800 text-slate-600 cursor-not-allowed"
                        )}
                    >
                        {isCreating
                            ? "Creating..."
                            : selectedUsers.length < 2
                                ? `Select at least ${2 - selectedUsers.length} more member${2 - selectedUsers.length !== 1 ? "s" : ""}`
                                : `Create Group with ${selectedUsers.length + 1} members`}
                    </button>
                </div>
            </div>
        </div>
    );
}
