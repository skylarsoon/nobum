"use client";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button";
import { submitCheckIn } from "@/app/check-in/actions";



export default function CheckInForm() {
    const [rating, setRating] = useState(5);
    const [note, setNote] = useState("");

    return (
        <form action={submitCheckIn} className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">\Check-In</h1>
            <input type="hidden" name="score" value={rating} /> 
            <input type="hidden" name="goal_id" value="444bea91-e5a6-4066-8fec-1bdb375dcab5"/>
            {/* The question — will come from user's goal data later */}
            <p className="text-lg font-medium leading-snug">
                How did you do this week at studying for your NCLEX?
            </p>

            {/* Re-state their set goal */}
            <p> 
                Your current goal is 3 videos per week. 
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