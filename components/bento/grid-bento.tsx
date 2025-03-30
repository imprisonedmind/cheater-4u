"use client";

import { useState } from "react";
import { ArrowRight, Clock, Shield, User } from "lucide-react";
import { BentoCard } from "@/components/bento/bento-card";
import { WindowMockup } from "@/components/bento/window-mock-up";

export default function SusWatchBento() {
  const [saleAmount, setSaleAmount] = useState(25);
  const [saleVolume, setSaleVolume] = useState(10000);

  return (
    <section className="container px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
        {/* First row */}
        <div className="rounded-lg bg-black/40 backdrop-blur-sm border border-zinc-800 overflow-hidden flex flex-col">
          <div className="flex-1 p-6">
            <div className="relative bg-black/60 rounded-xl p-6 border border-zinc-800 overflow-hidden mb-6">
              {/* Left orange accent border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-l-xl"></div>

              {/* Logo */}
              <div className="absolute left-6 top-6 text-3xl font-bold italic text-orange-400">
                s
              </div>

              {/* Flow diagram */}
              <div className="flex justify-between items-center mt-12 px-4">
                <div className="flex flex-col items-center">
                  <User className="h-8 w-8 mb-2 text-zinc-300" />
                  <span className="text-sm">Player</span>
                </div>

                <div className="flex flex-col items-center">
                  <Shield className="h-8 w-8 mb-2 text-zinc-300" />
                  <span className="text-sm">Steam Data</span>
                </div>

                <div className="flex flex-col items-center">
                  <User className="h-8 w-8 mb-2 text-orange-400" />
                  <span className="text-sm">Verified</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent">
                <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 text-orange-400" />
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2">Accurate Steam Data</h3>
            <p className="text-zinc-400 text-sm">
              We pull data directly from the Steam API to ensure accuracy and
              reliability. All profiles undergo thorough verification before
              being added to our database of suspected cheaters.
            </p>
          </div>
        </div>

        {/* Middle section - Thorough Investigation */}
        <div className="rounded-lg bg-black/40 backdrop-blur-sm border border-zinc-800 overflow-hidden col-span-2">
          <div className="grid grid-cols-2 gap-6 p-6">
            <div className="flex flex-col">
              {/* Competition box */}
              <div className="bg-black/60 rounded-lg px-4 py-2 inline-flex items-center self-start mb-4">
                <Shield className="h-5 w-5 mr-2 text-zinc-400" />
                <span>Investigation</span>
              </div>

              {/* Percentage indicators */}
              <div className="flex justify-between items-end mt-auto mb-6">
                <div className="text-3xl font-bold">0%</div>
                <div className="text-3xl font-bold text-orange-400">99%</div>
              </div>

              {/* Curved line connecting percentages */}
              <div className="h-1 bg-gradient-to-r from-zinc-600 via-orange-400 to-orange-400 rounded-full mb-8"></div>

              <h3 className="text-xl font-semibold mb-2">
                Thorough Investigation Process
              </h3>
              <p className="text-zinc-400 text-sm">
                Before anyone is marked as a cheater, they undergo thorough
                investigation beyond Steam's data. We are not a witch hunt
                platform - our goal is to provide objective data and
                evidence-based reporting with 99% accuracy.
              </p>
            </div>

            {/* Fee calculator equivalent */}
            <div className="bg-black/60 rounded-xl p-6 flex flex-col border border-zinc-800">
              {/* Calculator logo */}
              <div className="text-3xl font-bold italic text-orange-400 self-end mb-2">
                s
              </div>

              <h3 className="text-xl font-semibold mb-4">Reliability Score</h3>

              {/* Sale amount */}
              <div className="mb-4">
                <div className="text-xs text-zinc-400 mb-1">Evidence Count</div>
                <div className="flex items-center">
                  <span className="mr-1">#</span>
                  <span className="text-lg">{saleAmount}</span>
                </div>
              </div>

              {/* Sale volume */}
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-zinc-400">Confidence Level</div>
                  <div className="text-right">
                    ${saleVolume.toLocaleString()}
                  </div>
                </div>

                {/* Slider with orange dot */}
                <div className="relative mt-2 mb-6">
                  <div className="h-1 bg-gradient-to-r from-zinc-600 to-orange-400 rounded-full"></div>
                  <div className="absolute left-[67%] top-1/2 transform -translate-y-1/2 w-4 h-4 bg-orange-400 rounded-full"></div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-zinc-800 my-4"></div>

              {/* Fees section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span>Accuracy Rate</span>
                    <span className="ml-2 px-2 py-0.5 bg-zinc-800 text-xs rounded-full">
                      95%
                    </span>
                  </div>
                  <span className="text-orange-400">$0.50</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span>Verification Rate</span>
                    <span className="ml-2 px-2 py-0.5 bg-zinc-800 text-xs rounded-full">
                      1.5%
                    </span>
                  </div>
                  <span className="text-orange-400">$0.38</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second row */}
        <BentoCard
          title="Profile Analysis"
          description="Monitor suspected cheaters and their activity across games with detailed profile tracking and history analysis."
        />

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
          title="No False Positives"
          description="Our platform ensures accuracy through multiple verification steps. We maintain a strict policy against false positives."
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
