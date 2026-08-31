import CheckInForm from "@/components/check-in/check-in-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CheckInPage() {
    const supabase = await createClient();

    const { data: {user} } = await supabase.auth.getUser();
    if(!user){
        redirect('/login')
    }

    // Fetch all goals for this user
    const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false})



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
            />
        </main>
    );
}