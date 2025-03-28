import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  linkText: string;
  linkHref: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  linkText,
  linkHref,
}: FeatureCardProps) {
  return (
    <div className="flex flex-col h-full rounded-lg bg-black/40 backdrop-blur-sm border border-zinc-800 overflow-hidden">
      <div className="flex-1 p-6">
        <div className="mb-6 p-4 bg-green-500/5 rounded-xl w-fit">
          <Icon className="h-12 w-12 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm">{description}</p>
      </div>
      <div className="p-4 border-t border-zinc-800">
        <Button
          variant="ghost"
          asChild
          className="w-full justify-between hover:bg-zinc-800 hover:text-green-400 group"
        >
          <Link href={linkHref}>
            {linkText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
