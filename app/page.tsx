import { redirect } from "next/navigation";
import FriendFeed from "@/components/friendfeed/friend-feed";
import FeedFilter from "@/components/friendfeed/feed-filter";
import { createClient, getCurrentUser } from "@/utils/supabase/server"

export default async function Home(props: { searchParams: Promise<{ view?: string }> }) {
  const supabase = await createClient();

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [{ view }, { data: memberships }] = await Promise.all([
    props.searchParams,
    supabase
      .from('group_members')
      .select('groups(id, name)')
      .eq('user_id', user.id),
  ]);

  const groups = (memberships || []).flatMap((m) => (m.groups ? [m.groups] : []));

  // ?view= is "main", a group id the user belongs to, or anything else (= everything)
  const selectedGroup = groups.find((g) => g.id === view);
  const current = view === 'main' ? 'main' : selectedGroup ? selectedGroup.id : 'all';
  const subtitle = current === 'main' ? 'Main feed' : selectedGroup ? selectedGroup.name : 'Recent Activity';

  // Relational query
  // Fetch the check in, username from profiles, and the goal title plus its group (if any).
  // RLS already limits this to what the user may see: personal check-ins and their groups' check-ins.
  // goals!inner makes the filters on goals below remove the check-ins, not just blank out the goal.
  let query = supabase
    .from('check_ins')
    .select(`
      id,
      score,
      note,
      created_at,
      profiles (username, avatar_url),
      goals!inner (title, group_id, groups (name))
    `);

  if (current === 'main') {
    query = query.is('goals.group_id', null);
  } else if (selectedGroup) {
    query = query.eq('goals.group_id', selectedGroup.id);
  }

  const { data: feed } = await query
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <>
      <div className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur pt-4 pb-4 flex flex-col items-center border-b">
        <h1 className="text-4xl font-bold tracking-tight">nobum</h1>
        <h2 className="text-sm font-medium text-muted-foreground mt-1">{subtitle}</h2>
        <FeedFilter groups={groups} current={current} />
      </div>
      <main className="mt-4 pb-12">
        <div className="mt-4">
          <FriendFeed items={feed || []} />
        </div>
      </main>
    </>
  );
}
