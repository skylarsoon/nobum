import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored safely because we will set up middleware 
            // later to handle refreshing user sessions.
          }
        },
      },
    }
  )
}


// Verifies the session JWT locally (no Auth server round trip when the project uses
// asymmetric JWT signing keys). Memoized per request. Use supabase.auth.getUser() in
// mutations where a revoked session must be rejected.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return null
  return { id: data.claims.sub, email: data.claims.email as string | undefined }
})
