import { createGoal } from "./actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function AddGoalPage(){
    return (
        <main className="flex flex-col px-6 pt-12 pb-8">
            <h1 className="text-3xl font-bold mb-6">New Goal</h1>

            <form action={createGoal} className="flex flex-col gap-5" >
                {/* Title */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Goal Title</label>
                    <input 
                        name="title"
                        placeholder="e.g Sleep" 
                        className="rounded-md px-4 py-2 bg-inherit border"
                        required/>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                        name="description"
                        placeholder="e.g. In bed by 11pm every night, no phone."
                        required
                    /> 
                </div>


                {/* Interval Dropdown */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">How often do you want to check in? (Weekly recommended)</label>
                    <select
                        name="interval"
                        className="rounded-md px-4 py-2 bg-inherit border h-10"
                    >
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>
                </div>
                <Button type="submit" className="mt-4">Save Goal</Button>
            </form>
        </main>
    )
}