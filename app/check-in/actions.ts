'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function submitCheckIn(formData: FormData) {
    const supabase = await createClient()

    // Ensure the user is actually logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Extract the values from the form
    const scoreString = formData.get('score') as string
    const score = parseFloat(scoreString)
    const note = formData.get('note') as string
    const goal_id = formData.get('goal_id') as string

    // Insert row into check_ins table
    const { error } = await supabase
        .from('check_ins')
        .insert({
            user_id: user.id,
            goal_id: goal_id,
            score: score,
            note: note
        })

    if (error) {
        console.error("Error inserting check-in: ", error)
        throw new Error('Failed to save check-in')
    }

    // Send them back to the feed to see their post
    redirect('/')
}