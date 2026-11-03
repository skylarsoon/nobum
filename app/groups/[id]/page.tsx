import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/utils/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import FriendFeed from "@/components/friendfeed/friend-feed";
import { CopyInviteButton } from "@/components/groups/copy-invite-button";
import { ConfirmForm } from "@/components/groups/confirm-form";
import { deleteGroup, leaveGroup, removeMember, setMemberRole } from "../actions";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    // RLS only returns the group to its members, so a non-member (or a bad id) gets a 404
    const { data: group } = await supabase
        .from('groups')
        .select('id, name, goal, invite_code')
        .eq('id', id)
        .maybeSingle();

    if (!group) {
        notFound();
    }

    const [{ data: members }, { data: goals }, { data: scores }, { data: recent }] = await Promise.all([
        supabase
            .from('group_members')
            .select('user_id, role, joined_at, profiles(username)')
            .eq('group_id', id)
            .order('joined_at', { ascending: true }),
        supabase
            .from('goals')
            .select('id, user_id, title, interval')
            .eq('group_id', id)
            .order('created_at', { ascending: true }),
        // Newest first, so the first score we see per goal is its latest
        supabase
            .from('check_ins')
            .select('goal_id, score, goals!inner(group_id)')
            .eq('goals.group_id', id)
            .order('created_at', { ascending: false })
            .limit(200),
        supabase
            .from('check_ins')
            .select('id, score, note, created_at, profiles(username, avatar_url), goals!inner(title, group_id, groups(name))')
            .eq('goals.group_id', id)
            .order('created_at', { ascending: false })
            .limit(20),
    ]);

    const latestScore = new Map<string, number>();
    for (const s of scores || []) {
        if (!latestScore.has(s.goal_id)) latestScore.set(s.goal_id, s.score);
    }

    const myRole = members?.find((m) => m.user_id === user.id)?.role;
    const isOwner = myRole === 'owner';
    const isAdmin = myRole === 'admin';

    return (
        <main className="flex flex-col px-6 pt-12 pb-8 gap-8">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <Link href="/groups" className="text-sm text-muted-foreground underline">All groups</Link>
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <div className="rounded-xl border p-4 flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Group goal</span>
                    <span className="font-medium">{group.goal}</span>
                </div>
                <div className="flex gap-2">
                    <CopyInviteButton code={group.invite_code} />
                    <Link href={`/add-goal?group=${group.id}`} className={buttonVariants({ size: "lg" })}>
                        Add your sub-goal
                    </Link>
                </div>
            </div>

            {/* Members and their sub-goals */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Members</h2>
                {(members || []).map((member) => {
                    const memberGoals = (goals || []).filter((g) => g.user_id === member.user_id);
                    const isMe = member.user_id === user.id;
                    // Owners manage everyone but themselves; admins can remove plain members
                    const canRemove = member.role !== 'owner' && !isMe && (isOwner || (isAdmin && member.role === 'member'));
                    const canChangeRole = isOwner && member.role !== 'owner' && !isMe;

                    return (
                        <div key={member.user_id} className="rounded-xl border p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold">
                                    @{member.profiles?.username || "unknown"}
                                    {isMe && <span className="text-muted-foreground font-normal"> (you)</span>}
                                </span>
                                {member.role !== 'member' && (
                                    <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                                        {member.role}
                                    </span>
                                )}
                            </div>

                            {memberGoals.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No sub-goals yet.</p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {memberGoals.map((goal) => {
                                        const score = latestScore.get(goal.id);
                                        return (
                                            <li key={goal.id} className="flex items-center justify-between text-sm">
                                                <span>{goal.title}</span>
                                                <span className="text-muted-foreground">
                                                    {score !== undefined ? `${score}/10` : "no check-ins"}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {(canRemove || canChangeRole) && (
                                <div className="flex gap-2 pt-1">
                                    {canChangeRole && (
                                        <form action={setMemberRole}>
                                            <input type="hidden" name="group_id" value={group.id} />
                                            <input type="hidden" name="user_id" value={member.user_id} />
                                            <input type="hidden" name="role" value={member.role === 'admin' ? 'member' : 'admin'} />
                                            <SubmitButton variant="outline" size="sm">
                                                {member.role === 'admin' ? "Remove admin" : "Make admin"}
                                            </SubmitButton>
                                        </form>
                                    )}
                                    {canRemove && (
                                        <ConfirmForm
                                            action={removeMember}
                                            message={`Remove @${member.profiles?.username || "this member"} from the group?`}
                                        >
                                            <input type="hidden" name="group_id" value={group.id} />
                                            <input type="hidden" name="user_id" value={member.user_id} />
                                            <SubmitButton variant="destructive" size="sm">Remove</SubmitButton>
                                        </ConfirmForm>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>

            {/* Recent check-ins from this group */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Recent check-ins</h2>
                <FriendFeed
                    items={recent || []}
                    showGroup={false}
                    empty={<p className="text-sm text-muted-foreground">No check-ins in this group yet.</p>}
                />
            </section>

            {/* Leave / delete */}
            <section className="flex flex-col gap-3 border-t pt-6">
                {isOwner ? (
                    <>
                        <ConfirmForm
                            action={deleteGroup}
                            message={`Delete "${group.name}"? This permanently removes the group, everyone's sub-goals in it, and all of their check-ins. This can't be undone.`}
                        >
                            <input type="hidden" name="group_id" value={group.id} />
                            <SubmitButton variant="destructive" className="w-full h-11">Delete group</SubmitButton>
                        </ConfirmForm>
                        <p className="text-xs text-muted-foreground">Owners can&apos;t leave a group, only delete it.</p>
                    </>
                ) : (
                    <ConfirmForm action={leaveGroup} message={`Leave "${group.name}"? You'll lose access to its goals and check-ins.`}>
                        <input type="hidden" name="group_id" value={group.id} />
                        <SubmitButton variant="destructive" className="w-full h-11">Leave group</SubmitButton>
                    </ConfirmForm>
                )}
            </section>
        </main>
    );
}
