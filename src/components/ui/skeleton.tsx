import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "skeleton rounded-md bg-slate-800/50",
                className
            )}
        />
    );
}

export function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3 p-4">
            <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-10" />
        </div>
    );
}

export function MessageSkeleton({ isSelf = false }: { isSelf?: boolean }) {
    return (
        <div className={cn("flex items-end gap-2 mb-4", isSelf && "flex-row-reverse")}>
            {!isSelf && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
            <div className={cn("space-y-1", isSelf && "items-end flex flex-col")}>
                <Skeleton className="h-10 w-48 rounded-2xl" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
    );
}

export function UserCardSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}
