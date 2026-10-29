"use client"

import { useEffect, useState } from "react"

// Hidden idempotency key for a form. Generated after mount (not during render) so a
// statically prerendered page doesn't bake one shared id into its HTML.
export function RequestIdInput() {
    const [id, setId] = useState("")
    useEffect(() => setId(crypto.randomUUID()), [])
    return <input type="hidden" name="request_id" value={id} />
}
