import Image from 'next/image'

// Decorative doodles that fill the empty desktop gutters beside the mobile column.
// Hidden below `lg` so phones only ever see the column itself.
export function SideDoodles() {
  return (
    <div aria-hidden className="hidden lg:block pointer-events-none fixed inset-0">
      {/* Left gutter: going it alone */}
      <div className="absolute inset-y-0 left-0 w-[calc((100vw-430px)/2)] flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-hand text-3xl">you, alone...</p>
        <Image
          src="/you_and_red_healthbar.svg"
          alt=""
          width={500}
          height={670}
          className="w-full max-w-[240px] h-auto dark:invert"
        />
      </div>

      {/* Right gutter: with friends */}
      <div className="absolute inset-y-0 right-0 w-[calc((100vw-430px)/2)] flex flex-col items-center justify-center gap-4 px-6">
        <Image
          src="/three_friends.svg"
          alt=""
          width={500}
          height={670}
          className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-2/3 w-[70%] max-w-[210px] h-auto opacity-10 dark:invert"
        />
        <p className="relative font-hand text-3xl">you + friends!</p>
        <Image
          src="/you_and_green_healthbar.svg"
          alt=""
          width={500}
          height={670}
          className="relative w-full max-w-[240px] h-auto dark:invert"
        />
      </div>
    </div>
  )
}
