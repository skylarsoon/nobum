import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <>
            <div className="sticky top-0 z-10 w-full bg-background pt-4 pb-4 flex flex-col items-center border-b">
                <h1 className="text-4xl font-bold tracking-tight">nobum</h1>
                <h2 className="text-sm font-medium text-muted-foreground mt-1">Recent Activity</h2>
            </div>
            <div className="mt-8 px-4 flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
            </div>
        </>
    )
}
