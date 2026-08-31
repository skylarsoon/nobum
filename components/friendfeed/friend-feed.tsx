"use client"
import FriendCard from "./friend-card";

interface FeedItem {
    id: string;
    score: number;
    note: string;
    created_at: string;
    profiles: {
        username: string;
        avatar_url: string | null;
    };
    goals: {
        title: string;
    }
}

export default function FriendFeed({ items }: { items: FeedItem[] }){
    if (items.length === 0){
        return <p className="text-muted-foreground text-sm mt-10">No check-ins yet! Your friends check-ins will show up here. </p>
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
                    score={item.score}
                    note={item.note || ""}
                    date={formattedDate}
                    />
                );
            })}
        </div>
    )
}