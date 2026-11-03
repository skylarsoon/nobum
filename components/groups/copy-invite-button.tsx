"use client"

import { useState } from "react"
import { Check, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

// Copies the full invite link (needs window.location.origin, hence a client component)
export function CopyInviteButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false)

    async function copy() {
        const link = `${window.location.origin}/join/${code}`
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard can be blocked (e.g. non-secure context): fall back to a prompt the user can copy from
            window.prompt("Copy this invite link:", link)
        }
    }

    return (
        <Button type="button" variant="outline" size="lg" onClick={copy}>
            {copied ? <Check /> : <LinkIcon />}
            {copied ? "Copied!" : "Copy invite link"}
        </Button>
    )
}
