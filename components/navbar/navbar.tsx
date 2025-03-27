"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { UserNav } from "@/components/navbar/user-nav";
import type React from "react";
import AdvertisementBar from "@/components/navbar/advertisement-bar";

export function Navbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border bg-card/80 backdrop-blur-sm z-[500]",
      )}
    >
      <AdvertisementBar />
      <div className="container flex h-14 items-center mx-auto">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-lg text-primary">Cheater4U</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              prefetch={true}
              href="/profiles"
              className="transition-colors hover:text-primary"
            >
              Profiles
            </Link>
            <Link
              prefetch={true}
              href="/reports"
              className="transition-colors hover:text-primary"
            >
              Reports
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative w-full max-w-[200px] md:max-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search profiles..."
              className="w-full rounded-md border border-input bg-background py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
