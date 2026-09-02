import FriendFeed from "@/components/friendfeed/friend-feed";
import { createClient } from "@/utils/supabase/server"

export default async function Home() {
  const supabase = await createClient();

  // Relational query
  // Fetch the check in, username from profiles and the title from goals
  const  { data: feed } = await supabase
    .from('check_ins')
    .select(`
      id,
      score,
      note,
      created_at,
      profiles (username, avatar_url),
      goals (title)
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <>
      <div className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur pt-4 pb-4 flex flex-col items-center border-b">
        <h1 className="text-4xl font-bold tracking-tight">nobum</h1>
        <h2 className="text-sm font-medium text-muted-foreground mt-1">Recent Activity</h2>
      </div>
      <main className="mt-4 pb-12">
        <div className="mt-4">
          <FriendFeed items={(feed as any) || []} />
        </div>
      </main>
    </>
  );
}
