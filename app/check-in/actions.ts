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
    const request_id = (formData.get('request_id') as string) || null

    // Never trust the client: enforce the slider's 1-10 range and the goal's ownership
    if (!Number.isFinite(score) || score < 1 || score > 10) {
        throw new Error('Score must be between 1 and 10')
    }
    if (!goal_id) {
        throw new Error('Please choose a goal')
    }
    const { data: goal } = await supabase
        .from('goals')
        .select('id')
        .eq('id', goal_id)
        .eq('user_id', user.id)
        .maybeSingle()
    if (!goal) {
        throw new Error('Goal not found')
    }

    // Insert row into check_ins table
    const { error } = await supabase
        .from('check_ins')
        .insert({
            user_id: user.id,
            goal_id: goal_id,
            score: score,
            note: note,
            request_id: request_id
        })

    // 23505 = unique violation: this request_id was already saved (duplicate submit), so treat as success
    if (error && error.code !== '23505') {
        console.error("Error inserting check-in: ", error)
        throw new Error('Failed to save check-in')
    }

    // Send them back to the feed to see their post
    redirect('/')
}