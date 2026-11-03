import { createGroup } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";

export default function NewGroupPage() {
    return (
        <main className="flex flex-col px-6 pt-12 pb-8">
            <h1 className="text-3xl font-bold mb-2">New Group</h1>
            <p className="text-sm text-muted-foreground mb-6">
                A group has one shared goal. Everyone in it then adds their own sub-goals toward it and checks in weekly.
            </p>

            <form action={createGroup} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-medium">Group name</label>
                    <input
                        id="name"
                        name="name"
                        placeholder="e.g. Recruit Crew"
                        maxLength={60}
                        className="rounded-md px-4 py-2 bg-inherit border"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="goal" className="text-sm font-medium">Group goal</label>
                    <input
                        id="goal"
                        name="goal"
                        placeholder="e.g. Recruiting"
                        maxLength={120}
                        className="rounded-md px-4 py-2 bg-inherit border"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        The overarching goal. Each member adds their own sub-goals, like &ldquo;1 LeetCode problem a day&rdquo;.
                    </p>
                </div>

                <SubmitButton className="mt-4">Create Group</SubmitButton>
            </form>
        </main>
    );
}
