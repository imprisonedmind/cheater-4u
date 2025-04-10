import Link from "next/link";
import { cn, isLoggedIn } from "@/lib/utils";
import { Search } from "lucide-react";
import { UserNav } from "@/components/navbar/user-nav";
import type React from "react";
import AdvertisementBar from "@/components/navbar/advertisement-bar";
import { getServerSession } from "@/lib/auth/get-server-session";

export async function Navbar() {
  const user = await getServerSession();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border bg-card/80 backdrop-blur-sm z-[10]",
      )}
    >
      <AdvertisementBar />
      <div className="container flex items-center mx-auto py-2">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-lg text-primary">
              SUS<span className={"text-orange-500"}>WATCH</span>
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              prefetch={true}
              href="/profiles"
              className="transition-colors hover:text-primary"
            >
              Suspects
            </Link>
            <Link
              prefetch={true}
              href="/reports"
              className="transition-colors hover:text-primary"
            >
              Reports
            </Link>
            {isLoggedIn(user) && (
              <Link
                href="/reports/new"
                className="transition-colors hover:text-primary"
              >
                Report Player
              </Link>
            )}
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
