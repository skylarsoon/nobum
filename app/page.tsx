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
    <main className="flex flex-col items-center">
      <h1 className="text-4xl font-bold tracking-tight mt-1"> nobum </h1>
      <h2 className="text-sm font-medium text-muted-foreground mt-1 mb-8"> Recent Activity </h2>
      <FriendFeed items={(feed as any)|| []}/>
    </main>
  );
}
