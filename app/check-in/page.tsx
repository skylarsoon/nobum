import CheckInForm from "@/components/check-in/check-in-form";
import { createClient, getCurrentUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CheckInPage() {
    const supabase = await createClient();

    const user = await getCurrentUser();
    if(!user){
        redirect('/login')
    }

    // Fetch all goals for this user
    const [{ data: goals }, { data: pastCheckIns }] = await Promise.all([
        supabase
            .from('goals')
            .select('id, title, description, interval')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        supabase
            .from('check_ins')
            .select('id, goal_id, score, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
    ]);



    // 3. If they don't have a goal yet, handle it gracefully so the page doesn't crash
    if (!goals || goals.length === 0) {
        return (
            <main className="flex flex-col px-6 pt-12 pb-8">
                <h1 className="text-2xl font-bold">No goal found!</h1>
                <p>Please create a goal before checking in.</p>
            </main>
        );
    }

    return (
        <main className="flex flex-col px-6 pt-12 pb-8">
            <CheckInForm 
                goals={goals}
                pastCheckIns={pastCheckIns || []} 
            />
        </main>
    );
}