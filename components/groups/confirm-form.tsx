"use client"

// A form that asks "are you sure?" before running its server action, for destructive actions.
export function ConfirmForm({
    action,
    message,
    children,
    className,
}: {
    action: (formData: FormData) => void | Promise<void>
    message: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <form
            action={action}
            className={className}
            onSubmit={(e) => {
                if (!window.confirm(message)) e.preventDefault()
            }}
        >
            {children}
        </form>
    )
}
