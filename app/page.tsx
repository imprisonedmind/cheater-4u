import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Search, Shield, Users } from "lucide-react"

export default function Home() {
  return (
      <div className="space-y-8">
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Track and Report Suspected Cheaters
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Cheater4U provides the most advanced tools to identify, track, and report suspected cheaters in your
                    favorite games.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/profiles">
                      Browse Profiles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    <Search className="mr-2 h-4 w-4" />
                    Search Database
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-muted md:h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-background/0">
                    <div className="flex h-full items-center justify-center">
                      <Shield className="h-24 w-24 text-primary opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Track Profiles</CardTitle>
                  <CardDescription>Monitor suspected cheaters and their activity across games.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Users className="h-12 w-12 text-primary opacity-80" />
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/profiles">
                      View Profiles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Submit Reports</CardTitle>
                  <CardDescription>Report suspicious behavior and provide evidence.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Shield className="h-12 w-12 text-primary opacity-80" />
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/reports/page/new">
                      Submit Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Search Database</CardTitle>
                  <CardDescription>Find profiles by Steam ID, username, or other criteria.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Search className="h-12 w-12 text-primary opacity-80" />
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/search">
                      Search Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </div>
  )
}

