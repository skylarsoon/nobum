import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { joinGroup } from "@/app/groups/actions";

// Invite landing page. Logged-out visitors are sent through /login (proxy.ts keeps this URL as ?next=).
// Joining needs an explicit click: a GET that joined automatically could be triggered by link prefetching.
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
    const { code: rawCode } = await params;
    const code = decodeURIComponent(rawCode);

    const supabase = await createClient();
    const { data } = await supabase.rpc('group_preview', { p_invite_code: code });
    const group = data?.[0];

    if (!group) {
        return (
            <main className="flex flex-col px-6 pt-12 pb-8 gap-4">
                <h1 className="text-2xl font-bold">Invite not found</h1>
                <p className="text-sm text-muted-foreground">
                    This invite link isn&apos;t valid. Ask your friend to send it again.
                </p>
                <Link href="/groups" className={buttonVariants({ variant: "outline", size: "lg" })}>
                    Go to my groups
                </Link>
            </main>
        );
    }

    return (
        <main className="flex flex-col px-6 pt-12 pb-8 gap-6">
            <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">You&apos;ve been invited to join</p>
                <h1 className="text-3xl font-bold">{group.name}</h1>
            </div>

            <div className="rounded-xl border p-4 flex flex-col gap-1">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Group goal</span>
                <span className="font-medium">{group.goal}</span>
                <span className="text-xs text-muted-foreground mt-2">
                    {group.member_count} {group.member_count === 1 ? "member" : "members"}
                </span>
            </div>

            <form action={joinGroup}>
                <input type="hidden" name="code" value={code} />
                <SubmitButton className="w-full h-11">Join group</SubmitButton>
            </form>
        </main>
    );
}
