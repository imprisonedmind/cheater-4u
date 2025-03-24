"use client"

import { useState } from "react"
import { Search } from "lucide-react"

// If you generated shadcn/ui's components, you might import them like:
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

// For illustration, here's a minimal example (replace with your real shadcn/ui imports):
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SuspectForm() {
  const [url, setUrl] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url) return
    // Example - in production, you’d call a server action or API route.
    alert(`Submitted URL: ${url}`)
    setUrl("")
  }

  return (
      <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-md space-y-4 bg-white/5 p-4 rounded-md shadow-sm"
      >
        <div className="space-y-2 text-left">
          <Label htmlFor="steamProfile">Steam Profile URL</Label>
          <Input
              id="steamProfile"
              type="url"
              placeholder="https://steamcommunity.com/profiles/123456789..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <Button type="submit" variant="default" className="w-full">
          <Search className="mr-2 h-4 w-4" />
          Submit Suspect
        </Button>
      </form>
  )
}
