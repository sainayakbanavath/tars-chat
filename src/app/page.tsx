"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUserSync } from "@/hooks/use-user-sync";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { cn } from "@/lib/utils";

export default function ChatLayout() {
  const { user, isLoaded } = useUser();
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Sync user to Convex and manage presence
  useUserSync();

  // Get the current user from Convex
  const currentUser = useQuery(
    api.users.getMe,
    user ? { clerkId: user.id } : "skip"
  );

  const currentUserId = currentUser?._id ?? null;

  const handleSelectConversation = (convId: Id<"conversations">) => {
    setSelectedConversationId(convId);
    setIsMobileChatOpen(true);
  };

  const handleMobileBack = () => {
    setIsMobileChatOpen(false);
  };

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#080818]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="text-slate-500 text-sm">Loading Tars Chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#080818]">
      {/* Sidebar - hidden on mobile when chat is open */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col",
          "md:border-r md:border-[#1e2a4a]",
          // Mobile: hide sidebar when chat is open
          "transition-transform duration-300",
          isMobileChatOpen ? "hidden md:flex" : "flex"
        )}
      >
        <Sidebar
          currentUserId={currentUserId}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          isMobile={true}
          onCloseSidebar={() => setIsMobileChatOpen(true)}
        />
      </div>

      {/* Chat area - full width on mobile when open */}
      <div
        className={cn(
          "flex-1 flex",
          // Mobile: show chat only when open
          isMobileChatOpen ? "flex" : "hidden md:flex"
        )}
      >
        <ChatArea
          conversationId={selectedConversationId}
          currentUserId={currentUserId}
          onBack={handleMobileBack}
          isMobile={true}
        />
      </div>
    </div>
  );
}
