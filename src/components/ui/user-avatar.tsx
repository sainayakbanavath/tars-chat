"use client";

import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/lib/format";

interface UserAvatarProps {
    name: string;
    imageUrl?: string | null;
    isOnline?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
};

const indicatorSizes = {
    xs: "w-2 h-2 border",
    sm: "w-2.5 h-2.5 border",
    md: "w-3 h-3 border-2",
    lg: "w-3.5 h-3.5 border-2",
    xl: "w-4 h-4 border-2",
};

export function UserAvatar({
    name,
    imageUrl,
    isOnline,
    size = "md",
    className,
}: UserAvatarProps) {
    const initials = getInitials(name);
    const colorClass = getAvatarColor(name);

    return (
        <div className={cn("relative flex-shrink-0", className)}>
            <div
                className={cn(
                    "rounded-full flex items-center justify-center font-semibold overflow-hidden",
                    sizeClasses[size]
                )}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className={cn(
                            "w-full h-full flex items-center justify-center bg-gradient-to-br text-white",
                            colorClass
                        )}
                    >
                        {initials}
                    </div>
                )}
            </div>

            {isOnline !== undefined && (
                <span
                    className={cn(
                        "absolute bottom-0 right-0 rounded-full border-[#080818]",
                        indicatorSizes[size],
                        isOnline ? "bg-emerald-500 online-pulse" : "bg-slate-500"
                    )}
                />
            )}
        </div>
    );
}
