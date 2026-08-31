interface FriendCardProps {
    username: string;
    goalName: string;
    score: number;
    note: string;
    date: string;
}

export default function FriendCard({ username, goalName, score, note, date } : FriendCardProps ){
    return (
        <div className="rounded border bg-card-note border-black p-4 flex flex-col gap-3"> 
            {/* Top Row */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold text-black/60">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm">{username}</span>
                </div>

                {/* The Date! */}
                <span className="text-xs text-muted-foreground/80 font-medium">{date}</span>
            </div>

            {/* Goal description */}
            <p className="text-sm text-muted-foreground"> 
                worked towards their 
                <span className="font-semibold text-foreground"> {goalName} </span> 
                goal this week:
            </p>
            {/* Score */}

            <p className="text-xl font-bold"> {score}/10 </p>

            {/* Personal note */}
            <p className="text-sm">{note}</p>

            {/* Comment CTA */}
            <p className="text-sm text-muted-foreground">comment or dm them</p>
        </div>
    )
}