import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar/navbar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Cheater4U",
  description: "Track and report suspected cheaters.",
}

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  return (
      <html lang="en" suppressHydrationWarning className="dark">
      <body className={cn(inter.className, "min-h-screen bg-background text-foreground")}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        {/* Navbar visible on every page */}
        <Navbar />

        {/* Main content container */}
        <div className="container mx-auto py-8">{children}</div>
      </ThemeProvider>
      </body>
      </html>
  )
}

