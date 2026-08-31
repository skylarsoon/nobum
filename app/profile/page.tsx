import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser()
    if (!user){
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    const { count: goalCount } = await supabase
        .from('goals')
        .select('*' , { count: 'exact', head: true})
        .eq('user_id', user.id);
    
    return (
        <main className="flex flex-col px-6 pt-12 pb-8 items-center min-h-full">
            <h1 className="text-3xl font-bold mb-8 w-full">Profile</h1>
            {/* Profile Card */}
            <div className="flex flex-col items-center gap-4 bg-muted/30 w-full p-6 rounded-3xl border shadow-sm">

                {/* Avatar Placeholder */}
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl font-bold mb-2">
                    {profile?.username?.charAt(0).toUpperCase() || "?"}
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold">@{profile?.username}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                </div>
                {/* Stats Row */}
                <div className="flex gap-4 mt-4 w-full">
                    <div className="flex-1 bg-background rounded-2xl p-4 text-center border shadow-sm">
                        <p className="text-3xl font-bold">{goalCount || 0}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Active Goals</p>
                    </div>
                </div>
            </div>
            {/* Sign Out Button anchored to bottom */}
            <div className="mt-auto w-full pt-12">
                <form action={signOut}>
                    <Button variant="destructive" className="w-full rounded-xl h-12 text-md">
                        Sign Out
                    </Button>
                </form>
            </div>
        </main>
    )
}