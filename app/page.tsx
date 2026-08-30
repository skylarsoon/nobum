import FriendFeed from "@/components/friendfeed/friend-feed";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <h1 className="text-4xl font-bold tracking-tight"> nobum </h1>
      <h2 className="text-sm font-medium text-muted-foreground mt-1"> Your friends </h2>
      <FriendFeed/>
    </main>
  );
}
