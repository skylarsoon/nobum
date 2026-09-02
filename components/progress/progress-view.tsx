"use client"

import { useState } from "react";

interface Goal {
    id: string;
    title: string;
    interval: string;
}

interface CheckIn {
    id: string;
    goal_id: string;
    score: number;
    created_at: string;
    note: string;
}

export default function ProgressView({ goals, checkIns }: { goals: Goal[], checkIns: CheckIn[] }){
    const [selectedGoalId, setSelectedGoalId] = useState<string>("all");

    const filteredCheckIns = selectedGoalId === "all"
        ? checkIns
        : checkIns.filter(c => c.goal_id === selectedGoalId);


    const totalCommitment = filteredCheckIns.length;

    const uniqueDates = new Set(filteredCheckIns.map(c => new Date(c.created_at).toDateString()));
    let streak = 0;

    if (uniqueDates.size > 0){
        let current = new Date();
        const todayStr = current.toDateString();
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yeserdayStr = yesterday.toDateString();
        
        if (uniqueDates.has(todayStr)) {
            //start counting from today
        }
        else if (uniqueDates.has(yeserdayStr)){
            current = yesterday; // start counting from yesterday
        }
        else{
            current = new Date(0); // break streak
        }

        while (uniqueDates.has(current.toDateString())) {
            streak++;
            current.setDate(current.getDate() - 1);
        }
    }

    // 3. Distribution Math (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthCheckIns = filteredCheckIns.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
    // Create 10 buckets (1 through 10)
    const distribution = Array.from({ length: 10 }, (_, i) => ({
        score: i + 1,
        count: 0
    }));
    // Fill the buckets
    monthCheckIns.forEach(checkIn => {
        // Round to nearest whole number in case of 0.5 scores
        const bucket = Math.round(checkIn.score);
        if (bucket >= 1 && bucket <= 10) {
            distribution[bucket - 1].count += 1;
        }
    });

    // Find the highest count to scale the bars properly
    const maxCount = Math.max(...distribution.map(d => d.count), 1);

    return (
        <div className="flex flex-col px-6 pt-6 pb-6 gap-4 h-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-4 pb-4 -mx-6 px-6 flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Progress</h1>

                <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="p-2 border rounded-md bg-background font-medium"
                >
                    <option value="all">All Goals</option>
                    {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                            {goal.title}
                        </option>
                    ))}
                </select>
            </div>
            {/* Stats Row */}
            <div className="flex gap-4">
                <div className="flex-1 bg-muted/30 rounded-2xl p-4 text-center border shadow-sm flex flex-col justify-center">
                    <p className="text-3xl font-bold">{totalCommitment}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Total Logs</p>
                </div>
                <div className="flex-1 bg-muted/30 rounded-2xl p-4 text-center border shadow-sm flex flex-col justify-center">
                    <p className="text-3xl font-bold">{streak}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Day Streak</p>
                </div>
            </div>

            {/* NEW: 30-Day Score Distribution */}
            <div className="flex flex-col gap-4 mt-2 bg-muted/20 p-4 rounded-2xl border">
                <div className="flex justify-between items-end">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">30-Day Distribution</h3>
                    <span className="text-[10px] font-medium text-muted-foreground">{monthCheckIns.length} logs</span>
                </div>

                <div className="flex items-end justify-between h-32 pt-2 gap-1">
                    {distribution.map(d => (
                        <div key={d.score} className="flex flex-col items-center flex-1 h-full justify-end gap-1.5">
                            {/* Shows the number of check-ins hovering over the bar (only if > 0) */}
                            <span className="text-[10px] text-muted-foreground font-medium h-3">
                                {d.count > 0 ? d.count : ""}
                            </span>

                            {/* The Bar Track */}
                            <div className="w-full max-w-[24px] bg-muted/40 rounded-t-md relative flex items-end h-full">
                                {/* The Filled Bar */}
                                <div
                                    className="w-full bg-primary/50 rounded-t-md transition-all duration-700"
                                    style={{
                                        height: `${(d.count / maxCount) * 100}%`,
                                        minHeight: d.count > 0 ? '4px' : '0px'
                                    }}
                                />
                            </div>
                            {/* Score Label (1-10) */}
                            <span className="text-[10px] font-bold text-muted-foreground">{d.score}</span>
                        </div>
                    ))}
                </div>
            </div>


            {/* Expanded History Chart */}
            <div className="flex flex-col gap-4 mt-4 bg-muted/20 p-4 rounded-2xl border flex-1 overflow-hidden">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">History Log</h3>

                {filteredCheckIns.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-4 text-center">No check-ins yet.</p>
                ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto pb-4 pr-2">
                        {filteredCheckIns.map((item) => {
                            const dateStr = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            return (
                                <div key={item.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 text-[11px] font-medium text-muted-foreground text-right">{dateStr}</span>
                                        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/40 rounded-full"
                                                style={{ width: `${(item.score / 10) * 100}%` }}
                                            />
                                        </div>
                                        <span className="w-6 text-xs font-bold tabular-nums text-right">{item.score}</span>
                                    </div>
                                    {/* Optional: Show notes in the history log! */}
                                    {item.note && (
                                        <p className="text-[11px] text-muted-foreground pl-16 italic truncate">
                                            "{item.note}"
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
