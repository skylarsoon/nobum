import { login, signup } from './actions'
import { Button } from '@/components/ui/button'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  // Await the searchParams promise (Next.js 15 requirement)
  const searchParams = await props.searchParams
  
  return (
    <main className="flex flex-col flex-1 justify-center items-center px-6">
      <form className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
        <h1 className="text-3xl font-bold mb-4">Welcome to Nobum</h1>
        
        {/* Username is required for Signup so our trigger creates the profile correctly */}
        <label className="text-sm font-medium" htmlFor="username">
          Username (for sign up)
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          name="username"
          placeholder="plop"
        />

        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          name="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <div className="flex flex-col gap-2 mt-4">
          {/* formAction tells the form to use the login server action when this button is clicked */}
          <Button type="submit" formAction={login}>
            Sign In
          </Button>
          
          {/* formAction tells the form to use the signup server action when THIS button is clicked */}
          <Button type="submit" formAction={signup} variant="outline">
            Sign Up
          </Button>
        </div>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-muted text-foreground text-center rounded-md">
            {searchParams.message}
          </p>
        )}
      </form>
    </main>
  )
}

