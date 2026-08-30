interface FriendCardProps {
    username: string;
    goalName: string;
    score: number;
    note: string;
}

export default function FriendCard({ username, goalName, score, note } : FriendCardProps ){
    return (
        <div className="rounded border bg-card-note border-black p-4 flex flex-col gap-3"> 
            {/* Top Row */}
            <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                 <div className="w-10 h-10 rounded-full bg-muted"> </div> 
                 <span className="font-semibold text-sm"> {username} </span>
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