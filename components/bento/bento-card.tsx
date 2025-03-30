import type React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BentoCardProps {
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
  children?: React.ReactNode;
  className?: string;
}

export function BentoCard({
  title,
  description,
  linkText,
  linkHref,
  children,
  className,
}: BentoCardProps) {
  return (
    <div
      className={`flex flex-col h-full rounded-lg bg-black/40 backdrop-blur-sm border border-zinc-800 overflow-hidden ${className}`}
    >
      <div className="flex-1 p-6">
        {children}
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm">{description}</p>
      </div>

      {linkText && linkHref && (
        <div className="p-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            asChild
            className="w-full justify-between hover:bg-zinc-800 hover:text-orange-400 group"
          >
            <Link href={linkHref}>
              {linkText}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
