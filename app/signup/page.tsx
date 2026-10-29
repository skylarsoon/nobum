import Link from 'next/link'
import { signup } from '@/app/login/actions'
import { SideDoodles } from '@/components/landing/side-doodles'
import { SubmitButton } from '@/components/ui/submit-button'

export default async function SignupPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams

  return (
    <main className="flex flex-col flex-1 justify-center items-center px-6">
      <SideDoodles />
      <form action={signup} className="flex flex-col w-full gap-4 text-foreground">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join Nobum and start tracking your goals.</p>
        </div>

        <label className="text-sm font-medium" htmlFor="username">
          Username
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border"
          id="username"
          name="username"
          autoComplete="username"
          placeholder="plop"
          required
        />

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
          autoComplete="new-password"
          minLength={6}
          placeholder="At least 6 characters"
          required
        />

        <SubmitButton className="mt-4">Create Account</SubmitButton>

        {searchParams?.message && (
          <p className="p-4 bg-muted text-foreground text-center rounded-md" role="alert">
            {searchParams.message}
          </p>
        )}

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground font-medium underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
