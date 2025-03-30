import { ArrowRight, User } from "lucide-react";
import steam from "@/public/svgs/Steam-logo-new-blue.svg";
import Image from "next/image";

export default function FirstRow() {
  return (
    <div className="rounded-lg bg-black/40 backdrop-blur-sm border border-zinc-800 overflow-hidden flex flex-col">
      <div className="flex-1 p-6">
        <div className="relative bg-black/60 rounded-xl p-6 border border-zinc-800 overflow-hidden mb-6">
          {/* Left orange accent border */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-l-xl"></div>

          {/* Flow diagram */}
          <div className="flex justify-between items-center px-4">
            <div className="flex flex-col items-center">
              <User className="h-8 w-8 mb-2 text-zinc-300" />
              <span className="text-sm">Player</span>
            </div>

            <div className="flex flex-col items-center">
              {/*<Shield className="h-8 w-8 mb-2 text-zinc-300" />*/}
              <Image
                src={steam}
                alt={"https://steamcommunity.com/"}
                className={"size-40 z-10"}
              />
            </div>

            <div className="flex flex-col items-center">
              <User className="h-8 w-8 mb-2 text-orange-400" />
              <span className="text-sm">Verified</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-3/4">
            <div className={"flex flex-row items-center"}>
              <div
                className={
                  "bg-gradient-to-r h-0.5 from-orange-5400/30  to-orange-400 w-full"
                }
              />
              <ArrowRight className=" text-orange-400 -ml-1" />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">Accurate Steam Data</h3>
        <p className="text-zinc-400 text-sm">
          We pull data directly from the Steam API to ensure accuracy and
          reliability. All profiles undergo thorough verification before being
          added to our database of suspected cheaters.
        </p>
      </div>
    </div>
  );
}
