import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="flex flex-col gap-6 px-6 pt-12 pb-8 items-center">
            <Skeleton className="h-9 w-32 self-start" />
            <Skeleton className="h-64 w-full rounded-3xl" />
        </main>
    )
}
