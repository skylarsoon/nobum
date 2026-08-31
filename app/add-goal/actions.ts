'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createGoal(formData: FormData) {
    const supabase = await createClient()

    const { data: {user} } = await supabase.auth.getUser()
    if(!user) {
        redirect('/login')
    }

    // Extract the form fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const interval = formData.get('interval') as string

    const { error } = await supabase
        .from('goals')
        .insert({
            user_id: user.id,
            title: title,
            description: description,
            interval: interval
        })
    
    if (error){
        console.error("Error creating goal: ", error)
        throw new Error('Failed to create goal')
    }
    // redirect to the check-in page so they can use their new goal
    redirect('/check-in')
}