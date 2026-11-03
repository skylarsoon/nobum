import { redirect } from "next/navigation"
import { createGoal } from "./actions"
import { RequestIdInput } from "@/components/ui/request-id-input"
import { SubmitButton } from "@/components/ui/submit-button"
import { Textarea } from "@/components/ui/textarea"
import { createClient, getCurrentUser } from "@/utils/supabase/server"

export default async function AddGoalPage(props: { searchParams: Promise<{ group?: string }> }){
    const supabase = await createClient()

    const user = await getCurrentUser()
    if (!user) {
        redirect('/login')
    }

    // Groups the user can attach this goal to
    const [{ group: groupParam }, { data: memberships }] = await Promise.all([
        props.searchParams,
        supabase
            .from('group_members')
            .select('groups(id, name)')
            .eq('user_id', user.id),
    ])
    const groups = (memberships || []).flatMap((m) => (m.groups ? [m.groups] : []))
    // Only preselect a group from ?group= if the user is actually in it
    const defaultGroupId = groups.some((g) => g.id === groupParam) ? groupParam : ""

    return (
        <main className="flex flex-col px-6 pt-12 pb-8">
            <h1 className="text-3xl font-bold mb-6">New Goal</h1>

            <form action={createGoal} className="flex flex-col gap-5" >
                <RequestIdInput />
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
                {/* Group: a sub-goal is only visible to that group's members */}
                {groups.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Group</label>
                        <select
                            name="group_id"
                            defaultValue={defaultGroupId}
                            className="rounded-md px-4 py-2 bg-inherit border h-10"
                        >
                            <option value="">None (personal goal, visible in the main feed)</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name} (only group members can see it)
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <SubmitButton className="mt-4">Save Goal</SubmitButton>
            </form>
        </main>
    )
}