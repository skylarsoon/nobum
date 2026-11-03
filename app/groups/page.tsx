import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/utils/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { joinGroup } from "./actions";

export default async function GroupsPage() {
    const supabase = await createClient();

    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    // Your memberships, with each group and how many people are in it
    const { data: memberships } = await supabase
        .from('group_members')
        .select('role, groups(id, name, goal, group_members(count))')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

    const groups = (memberships || []).filter((m) => m.groups);

    return (
        <main className="flex flex-col px-6 pt-12 pb-8 gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Groups</h1>
                <Link href="/groups/new" className={buttonVariants({ size: "lg" })}>
                    New group
                </Link>
            </div>

            {groups.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    You&apos;re not in any groups yet. Create one and invite your friends, or join one with an invite link or code below.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {groups.map((m) => {
                        const group = m.groups!;
                        const memberCount = group.group_members?.[0]?.count ?? 1;
                        return (
                            <Link
                                key={group.id}
                                href={`/groups/${group.id}`}
                                className="rounded-xl border p-4 flex flex-col gap-1 hover:bg-muted/40 transition-colors"
                            >
                                <span className="font-semibold">{group.name}</span>
                                <span className="text-sm text-muted-foreground">Goal: {group.goal}</span>
                                <span className="text-xs text-muted-foreground">
                                    {memberCount} {memberCount === 1 ? "member" : "members"}
                                    {m.role !== "member" && ` · you're ${m.role === "owner" ? "the owner" : "an admin"}`}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Join with a code or pasted link */}
            <form action={joinGroup} className="flex flex-col gap-2 border-t pt-6">
                <label htmlFor="code" className="text-sm font-medium">Have an invite?</label>
                <div className="flex gap-2">
                    <input
                        id="code"
                        name="code"
                        placeholder="Paste invite link or code"
                        className="flex-1 rounded-md px-4 py-2 bg-inherit border"
                        required
                    />
                    <SubmitButton variant="outline" className="h-10">Join</SubmitButton>
                </div>
            </form>
        </main>
    );
}
