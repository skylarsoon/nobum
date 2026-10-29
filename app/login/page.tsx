import Link from 'next/link'
import { login } from './actions'
import { SubmitButton } from '@/components/ui/submit-button'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams

  return (
    <main className="flex flex-col flex-1 justify-center items-center px-6">
      <form action={login} className="flex flex-col w-full gap-4 text-foreground">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your Nobum account.</p>
        </div>

        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        <SubmitButton className="mt-4">Sign In</SubmitButton>

        {searchParams?.message && (
          <p className="p-4 bg-muted text-foreground text-center rounded-md" role="alert">
            {searchParams.message}
          </p>
        )}

        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-foreground font-medium underline">
            Create one
          </Link>
        </p>
      </form>
    </main>
  )
}
