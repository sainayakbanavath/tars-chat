import { format, isToday, isThisYear, formatDistanceToNow } from "date-fns";

/**
 * Format a message timestamp:
 * - Today: "2:34 PM"
 * - This year (but not today): "Feb 15, 2:34 PM"
 * - Different year: "Feb 15 2023, 2:34 PM"
 */
export function formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "h:mm a");
    }

    if (isThisYear(date)) {
        return format(date, "MMM d, h:mm a");
    }

    return format(date, "MMM d yyyy, h:mm a");
}

/**
 * Format a short timestamp for conversation sidebar previews
 */
export function formatConversationTime(timestamp: number): string {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "h:mm a");
    }

    if (isThisYear(date)) {
        return format(date, "MMM d");
    }

    return format(date, "MM/dd/yy");
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Generate a consistent color for a user avatar based on their name
 */
export function getAvatarColor(name: string): string {
    const colors = [
        "from-indigo-500 to-purple-600",
        "from-rose-500 to-pink-600",
        "from-amber-500 to-orange-600",
        "from-emerald-500 to-teal-600",
        "from-sky-500 to-blue-600",
        "from-violet-500 to-purple-600",
        "from-fuchsia-500 to-pink-600",
        "from-cyan-500 to-sky-600",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}
