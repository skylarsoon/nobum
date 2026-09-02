import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProgressView from "@/components/progress/progress-view";

export default async function ProgressPage(){
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if(!user){
        redirect('/login');
    }    
    
    const {data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false});

    const {data: checkIns } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false})

    return (
        <main className="flex flex-col min-h-full">
            <ProgressView goals={goals || []} checkIns={checkIns || []}/> 
        </main>
    )
}