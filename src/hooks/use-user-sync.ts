"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook that syncs the Clerk user to Convex on mount and login,
 * and manages online/offline status.
 */
export function useUserSync() {
    const { user, isLoaded } = useUser();
    const upsertUser = useMutation(api.users.upsertUser);
    const setOnlineStatus = useMutation(api.users.setOnlineStatus);

    useEffect(() => {
        if (!isLoaded || !user) return;

        // Upsert user in Convex
        upsertUser({
            clerkId: user.id,
            name: user.fullName ?? user.username ?? "Anonymous",
            email: user.primaryEmailAddress?.emailAddress ?? "",
            imageUrl: user.imageUrl,
        }).catch(console.error);

        // Set online status
        setOnlineStatus({ clerkId: user.id, isOnline: true }).catch(console.error);

        // Set offline on tab close/hide
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                setOnlineStatus({ clerkId: user.id, isOnline: false }).catch(
                    console.error
                );
            } else {
                setOnlineStatus({ clerkId: user.id, isOnline: true }).catch(
                    console.error
                );
            }
        };

        const handleBeforeUnload = () => {
            setOnlineStatus({ clerkId: user.id, isOnline: false }).catch(
                console.error
            );
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isLoaded, user]);
}
