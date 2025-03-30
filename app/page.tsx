import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Search, Shield, Users } from "lucide-react";
import Image from "next/image";
import { FeatureCard } from "@/components/card/feature-card";
import hero from "@/public/png/hero_13.png";
import SusWatchBento from "@/components/bento/grid-bento";

export default function Home() {
  const features = [
    {
      title: "Track Profiles",
      description:
        "Monitor suspected cheaters and their activity across games.",
      icon: Users,
      linkText: "View Profiles",
      linkHref: "/profiles",
    },
    {
      title: "Submit Reports",
      description: "Report suspicious behavior and provide evidence.",
      icon: Shield,
      linkText: "Submit Report",
      linkHref: "/reports/page/new",
    },
    {
      title: "Search Database",
      description: "Find profiles by Steam ID, username, or other criteria.",
      icon: Search,
      linkText: "Search Now",
      linkHref: "/search",
    },
  ];

  return (
    <div className=" min-h-screen  ">
      {/* Hero background image with gradient overlay */}
      <div className="absolute top-0 left-0 inset-0 h-[1100px] w-full">
        <Image
          src={hero}
          placeholder={"blur"}
          alt="cheater4u.co.za hero image - detective catching wall hacker"
          className="h-full w-full object-cover scale-x-[-1]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/0" />
      </div>

      <div className="relative space-y-8">
        <section className="py-12 pt-[380px]">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Track and Report <br />
                  <span className={"text-orange-500"}>Suspected</span> Cheaters
                </h1>
                <p className="text-zinc-400 md:text-xl max-w-[600px]">
                  SusWatch provides the most advanced tools to identify, track,
                  and report suspected cheaters in your favorite games.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-black"
                >
                  <Link href="/profiles">
                    Browse Suspects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search Database
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  linkText={feature.linkText}
                  linkHref={feature.linkHref}
                />
              ))}
            </div>
          </div>
        </section>

        <div className={"container px-8 py-24"}>
          <div className={"h-[1px] bg-secondary"} />
        </div>

        <SusWatchBento />
      </div>
    </div>
  );
}
