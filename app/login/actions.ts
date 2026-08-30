'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extract values from the form
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Attempt to log in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  // Refresh the layout and redirect to the home page (feed)
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // Attempt to sign up. Notice we pass the username in the 'data' object!
  // This triggers that cool SQL function we wrote earlier to create their profile.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  })

  if (error) {
    redirect('/login?message=Could not sign up user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

