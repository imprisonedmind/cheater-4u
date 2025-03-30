import { Clock } from "lucide-react";
import { BentoCard } from "@/components/bento/bento-card";
import { WindowMockup } from "@/components/bento/window-mock-up";
import MiddleSection from "@/components/bento/middle-section";
import FirstRow from "@/components/bento/first-row";
import Image from "next/image";
import pa from "@/public/png/evidence.png";

export default function SusWatchBento() {
  return (
    <section className="container px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
        <FirstRow />
        <MiddleSection />

        {/* Second row */}
        <BentoCard
          title="Profile Analysis"
          description="Monitor suspected cheaters and their activity across games with detailed profile tracking and history analysis."
        >
          <Image
            src={pa}
            alt={
              "Detective crouching behind a stone wall on Dust2 Ramp, holding a clipboard and observing a glowing orange wallhacker with a rifle in a Counter-Strike style game environment."
            }
            className={"rounded-md mb-4 h-60 w-full object-cover"}
          />
        </BentoCard>

        {/* Report Submission card */}
        <BentoCard
          title="Report Submission"
          description="Submit detailed reports with evidence such as screenshots, videos, and timestamps. Our team reviews each submission carefully."
        >
          <WindowMockup showOrangeControl={true}>
            <div className="mt-4 text-center text-sm">
              <div className="text-orange-400 font-bold">100%</div>
              <div className="flex justify-center gap-2 mt-2">
                <button className="bg-orange-400 text-white px-3 py-1 rounded text-xs">
                  Accept
                </button>
                <button className="bg-zinc-800 text-white px-3 py-1 rounded text-xs">
                  Decline
                </button>
              </div>
              <div className="mt-3 h-12 bg-zinc-800 rounded-md flex items-center justify-center">
                <div className="w-3/4 h-1 bg-orange-400"></div>
              </div>
              <div className="mt-2 h-4 w-full bg-zinc-800/50 rounded"></div>
              <div className="mt-1 h-4 w-full bg-zinc-800/50 rounded"></div>
            </div>
          </WindowMockup>
        </BentoCard>

        {/* No False Positives card */}
        <BentoCard
          title="No Witch Hunts"
          description="We do not enable public callouts or accusations without solid verification. Every report is reviewed carefully before any cheater label is applied."
        >
          <WindowMockup>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-zinc-700 relative">
                <Clock className="w-8 h-8 text-zinc-400" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-orange-400 rounded-full"></div>
              </div>

              <div className="text-right">
                <div className="text-orange-400">0 Days</div>
                <div className="mt-2 h-2 w-16 bg-orange-400 rounded-full"></div>
                <div className="mt-1 h-2 w-12 bg-orange-400 rounded-full"></div>
              </div>
            </div>
          </WindowMockup>
        </BentoCard>
      </div>
    </section>
  );
}
