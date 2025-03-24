// components/ui/navbar.tsx
"use client"
// Navbar often needs interactivity (click handlers, links), so mark as client component

import Link from "next/link"
import { cn } from "@/lib/utils"

export function Navbar() {
  return (
      <header
          className={cn(
              "sticky top-0 z-50 w-full",
              "bg-blue-700 text-white shadow-md"
          )}
      >
        <nav className="flex items-center justify-between px-4 py-3">
          <div className="font-bold text-lg">
            <Link href="/">Cheater4U</Link>
          </div>

          <div className="space-x-4">
            <Link href="/profiles" className="hover:text-blue-100">
              Profiles
            </Link>
            <Link href="/reports" className="hover:text-blue-100">
              Reports
            </Link>
            {/* Add more nav links or a user menu here */}
          </div>
        </nav>
      </header>
  )
}
