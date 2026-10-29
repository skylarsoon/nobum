import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="flex flex-col gap-6 px-6 pt-12 pb-8">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
        </main>
    )
}
