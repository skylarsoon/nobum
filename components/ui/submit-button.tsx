"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Must be rendered inside a <form>; disables itself while the form's action is in flight
// so repeated clicks can't fire duplicate server actions.
export function SubmitButton({
    children,
    disabled,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending || disabled} aria-disabled={pending} {...props}>
            {pending && <Loader2 className="animate-spin" />}
            {children}
        </Button>
    )
}
