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
    const request_id = (formData.get('request_id') as string) || null
    // Empty means a personal goal; otherwise it's a sub-goal in that group
    const group_id = (formData.get('group_id') as string) || null

    if (!title?.trim()) {
        throw new Error('Goal title is required')
    }
    if (!['day', 'week', 'month'].includes(interval)) {
        throw new Error('Invalid interval')
    }
    // RLS also enforces this, but check here for a clear error message
    if (group_id) {
        const { data: membership } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('group_id', group_id)
            .eq('user_id', user.id)
            .maybeSingle()
        if (!membership) {
            throw new Error("You're not a member of that group")
        }
    }

    const { error } = await supabase
        .from('goals')
        .insert({
            user_id: user.id,
            title: title,
            description: description,
            interval: interval,
            group_id: group_id,
            request_id: request_id
        })
    
    // 23505 = unique violation: duplicate submit of the same request_id, treat as success
    if (error && error.code !== '23505'){
        console.error("Error creating goal: ", error)
        throw new Error('Failed to create goal')
    }
    // redirect to the check-in page so they can use their new goal
    redirect('/check-in')
}