"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, ListFilter } from "lucide-react"

interface FeedFilterProps {
    groups: { id: string; name: string }[]
    // "all", "main", or a group id
    current: string
}

// A filter button for the feed header. Each option is a plain link to /?view=..., so the server
// re-renders the feed and the chosen filter lives in the URL (shareable, survives refresh).
export default function FeedFilter({ groups, current }: FeedFilterProps) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close when clicking or tapping anywhere outside the filter. (A full-screen overlay doesn't work here:
    // the header's backdrop-blur makes `fixed` children size to the header instead of the viewport.)
    useEffect(() => {
        if (!open) return
        function onPointerDown(e: PointerEvent) {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [open])

    const options = [
        { value: "all", label: "Everything", hint: "Everything you have access to" },
        { value: "main", label: "Main feed", hint: "Check-ins that aren't in a group" },
        ...groups.map((g) => ({ value: g.id, label: g.name, hint: "Group" })),
    ]

    return (
        <div ref={containerRef} className="absolute right-4 top-4">
            <button
                type="button"
                aria-label="Filter feed"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-muted"
            >
                <ListFilter className="h-4 w-4" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border bg-background shadow-lg">
                    {options.map((option) => (
                        <Link
                            key={option.value}
                            href={option.value === "all" ? "/" : `/?view=${option.value}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted"
                        >
                            <span className="flex flex-col">
                                <span className="text-sm font-medium">{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.hint}</span>
                            </span>
                            {current === option.value && <Check className="h-4 w-4 shrink-0" />}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
