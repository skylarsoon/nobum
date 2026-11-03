"use client"
import Link from "next/link";
import FriendCard from "./friend-card";

export interface FeedItem {
    id: string;
    score: number;
    note: string | null;
    created_at: string;
    profiles: {
        username: string | null;
        avatar_url: string | null;
    } | null;
    goals: {
        title: string;
        groups?: { name: string } | null;
    } | null;
}

interface FriendFeedProps {
    items: FeedItem[];
    // Show which group a check-in belongs to (hide it on a group's own page, where it's redundant)
    showGroup?: boolean;
    // Replaces the default empty state
    empty?: React.ReactNode;
}

export default function FriendFeed({ items, showGroup = true, empty }: FriendFeedProps){
    if (items.length === 0){
        return empty ?? (
            <div className="mt-10 flex flex-col gap-3 text-sm text-muted-foreground">
                <p>No check-ins yet! Check-ins from you and your groups will show up here.</p>
                <p>
                    <Link href="/add-goal" className="text-foreground font-medium underline">Create a goal</Link>
                    {" "}or{" "}
                    <Link href="/groups" className="text-foreground font-medium underline">create or join a group</Link>
                    {" "}to get started.
                </p>
            </div>
        );
    }
    return(
        <div className="flex flex-col gap-4">
            {items.map((item) => {
                const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            return (
                <FriendCard
                    key={item.id}
                    username={item.profiles?.username || "Unknown"}
                    goalName={item.goals?.title || "Unknown Goal"}
                    groupName={showGroup ? item.goals?.groups?.name : undefined}
                    score={item.score}
                    note={item.note || ""}
                    date={formattedDate}
                    />
                );
            })}
        </div>
    )
}
