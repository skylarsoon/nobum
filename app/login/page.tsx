import Link from 'next/link'
import { login } from './actions'
import { Hero } from '@/components/landing/hero'
import { SideDoodles } from '@/components/landing/side-doodles'
import { SubmitButton } from '@/components/ui/submit-button'
import { safeNext, withNext } from '@/utils/safe-next'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string; next?: string }> }) {
  const searchParams = await props.searchParams
  const next = safeNext(searchParams?.next)

  return (
    <main className="flex flex-col flex-1 items-center px-6 py-8">
      <SideDoodles />
      <div className="my-auto flex w-full flex-col gap-8">
        <Hero invited={next.startsWith('/join/')} />
        <form action={login} className="flex flex-col w-full gap-4 text-foreground">
          <input type="hidden" name="next" value={next} />
          {/* <div className="mb-4">
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your Nobum account.</p>
          </div> */}

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
            <Link href={withNext('/signup', next)} className="text-foreground font-medium underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
