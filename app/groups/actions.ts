'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Returns the logged-in user and a client, or sends the visitor to /login
async function requireUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }
    return { supabase, user }
}

export async function createGroup(formData: FormData) {
    const { supabase } = await requireUser()

    const name = ((formData.get('name') as string) || '').trim()
    const goal = ((formData.get('goal') as string) || '').trim()

    if (!name || name.length > 60) {
        throw new Error('Group name must be 1-60 characters')
    }
    if (!goal || goal.length > 120) {
        throw new Error('Group goal must be 1-120 characters')
    }

    // The database function also makes the creator the group's owner, in one step
    const { data: groupId, error } = await supabase.rpc('create_group', { p_name: name, p_goal: goal })
    if (error || !groupId) {
        console.error('Error creating group: ', error)
        throw new Error('Failed to create group')
    }

    revalidatePath('/groups')
    redirect(`/groups/${groupId}`)
}

export async function joinGroup(formData: FormData) {
    const { supabase } = await requireUser()

    // Accept either a bare code or a pasted invite link (https://.../join/<code>)
    const code = ((formData.get('code') as string) || '').trim().split('?')[0].split('/').filter(Boolean).pop() ?? ''
    if (!code) {
        redirect('/groups')
    }

    const { data: groupId, error } = await supabase.rpc('join_group', { p_invite_code: code })
    if (error || !groupId) {
        // join_group raises 'Invalid invite code' for unknown codes
        redirect(`/join/${encodeURIComponent(code)}`)
    }

    revalidatePath('/groups')
    redirect(`/groups/${groupId}`)
}

export async function leaveGroup(formData: FormData) {
    const { supabase, user } = await requireUser()
    const groupId = formData.get('group_id') as string

    // RLS only allows non-owners to delete their own membership, so 0 rows means "you're the owner"
    const { data, error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .select()

    if (error || !data || data.length === 0) {
        throw new Error("Couldn't leave the group. Owners must delete the group instead.")
    }

    revalidatePath('/groups')
    redirect('/groups')
}

export async function removeMember(formData: FormData) {
    const { supabase } = await requireUser()
    const groupId = formData.get('group_id') as string
    const memberId = formData.get('user_id') as string

    const { data, error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', memberId)
        .select()

    if (error || !data || data.length === 0) {
        throw new Error("Couldn't remove that member")
    }

    revalidatePath(`/groups/${groupId}`)
}

export async function setMemberRole(formData: FormData) {
    const { supabase } = await requireUser()
    const groupId = formData.get('group_id') as string
    const memberId = formData.get('user_id') as string
    const role = formData.get('role') as string

    // Ownership transfer is out of scope for v1, so only admin <-> member is allowed here
    if (role !== 'admin' && role !== 'member') {
        throw new Error('Invalid role')
    }

    const { data, error } = await supabase
        .from('group_members')
        .update({ role })
        .eq('group_id', groupId)
        .eq('user_id', memberId)
        .select()

    if (error || !data || data.length === 0) {
        throw new Error("Couldn't change that member's role")
    }

    revalidatePath(`/groups/${groupId}`)
}

export async function deleteGroup(formData: FormData) {
    const { supabase } = await requireUser()
    const groupId = formData.get('group_id') as string

    // Only the owner passes the delete policy. Members, goals and check-ins cascade away with it.
    const { data, error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)
        .select()

    if (error || !data || data.length === 0) {
        throw new Error("Couldn't delete the group")
    }

    revalidatePath('/groups')
    redirect('/groups')
}
