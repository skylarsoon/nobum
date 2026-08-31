"use client";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button";
import { submitCheckIn } from "@/app/check-in/actions";


// Define what data we need to function
interface Goal {
    id: string;
    title: string;
    description: string;
    interval: string;
}

interface CheckInFormProps {
    goals: Goal[];
}

// Recieve the props
export default function CheckInForm({ goals } : CheckInFormProps) {
    const [rating, setRating] = useState(5);
    const [note, setNote] = useState("");

    // State to track which goal is selected in the dropdown
    const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0].id);

    // Find the actual goal object based on the currently selected ID
    const selectedGoal = goals.find(g => g.id === selectedGoalId) || (goals[0])

    return (
        <form action={submitCheckIn} className="flex flex-col gap-6">
            <input type="hidden" name="score" value={rating} /> 
            <input type="hidden" name="goal_id" value={selectedGoal.id}/>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">\Check-In</h1>
                {/* The dropdown menu */}
                    <select
                        value={selectedGoalId}
                        onChange={(e) => setSelectedGoalId(e.target.value)}
                        className="p-2 border rounded-md bg-inherit font-medium"
                        >
                            {goals.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.title}
                                </option>
                            ))}

                    </select>
            </div>

            {/* The question — will come from user's goal data later */}
            <p className="text-lg font-medium leading-snug">
                How did you do this {selectedGoal.interval} at {selectedGoal.title}?
            </p>

            {/* Re-state their set goal */}
            <p> 
                Your current goal is:&nbsp;
                <span className="font-bold">
                    {selectedGoal.description}.
                </span>
                 
            </p>

            {/* Slider section */}
            <div className="flex flex-col gap-3">
                {/* Score display */}
                <p className="text-center text-2xl font-bold tabular-nums"> 
                    {rating} / 10
                </p>

                <Slider 
                    min={1}
                    max={10}
                    step={0.5}
                    value={[rating]}
                    onValueChange={(val) => setRating(val as number)}
                />
            </div>

            <Textarea
                name="note"
                placeholder="any context for your friends..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
            <Button type="submit"> Submit </Button>
        </form>
    );
}