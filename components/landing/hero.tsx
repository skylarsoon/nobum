import { SlidersHorizontal, StickyNote, Users } from 'lucide-react'
import FriendCard from '@/components/friendfeed/friend-card'

const highlights = [
  { Icon: SlidersHorizontal, label: 'Rate your week' },
  { Icon: StickyNote, label: 'Share a note' },
  { Icon: Users, label: 'Start a group' },
]

// Short pitch shown above the login/signup forms. Logged-out visitors land on /login, so this is
// the first thing a newcomer sees. `invited` is set when they arrived through a group invite link.
export function Hero({ invited = false }: { invited?: boolean }) {
  return (
    <section className="flex flex-col gap-5">
      {invited && (
        <p className="self-start rounded-full border bg-muted px-3 py-1 text-xs font-medium">
          A friend invited you to join a group on Nobum
        </p>
      )}

      <div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight">Reach your goals with friends</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Rate your week 1-10, leave a quick note, and keep each other going.
        </p>
        <p className="font-hand text-2xl mt-1">no spreadsheets. no guilt.</p>
      </div>

      <ul className="grid grid-cols-3 gap-2 text-center">
        {highlights.map(({ Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-1.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-xs font-medium leading-tight">{label}</span>
          </li>
        ))}
      </ul>

      {/* Example check-in so newcomers see what the app is. It adds ~210px, so it only shows when the
          whole page (hero + form) fits on screen and never pushes the form below the fold on a phone. */}
      <div aria-hidden className="hidden [@media(min-height:960px)]:block -rotate-1 px-2">
        <FriendCard
          username="alex"
          goalName="1 LeetCode problem a day"
          groupName="Recruit Crew"
          score={7}
          note="solved two mediums, still stuck on graphs"
          date="Mon"
          showCta={false}
        />
      </div>
    </section>
  )
}
