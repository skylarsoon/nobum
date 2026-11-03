'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { safeNext, withNext } from '@/utils/safe-next'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extract values from the form
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  // Where to go afterwards (e.g. an invite link they opened while logged out)
  const next = safeNext(formData.get('next'))

  // Attempt to log in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(withNext('/login?message=' + encodeURIComponent('Invalid email or password'), next))
  }

  // Refresh the layout and redirect to where they were headed (default: the feed)
  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const next = safeNext(formData.get('next'))

  // Attempt to sign up. Notice we pass the username in the 'data' object!
  // This triggers that cool SQL function we wrote earlier to create their profile.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  })

  if (error) {
    redirect(withNext('/signup?message=' + encodeURIComponent(error.message), next))
  }

  // No session means the project requires email confirmation: they can't be logged in yet
  if (!data.session) {
    redirect(
      withNext('/login?message=' + encodeURIComponent('Check your email to confirm your account, then sign in.'), next)
    )
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

