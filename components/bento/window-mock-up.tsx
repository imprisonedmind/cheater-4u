import type React from "react";

interface WindowMockupProps {
  children: React.ReactNode;
  showOrangeControl?: boolean;
}

export function WindowMockup({
  children,
  showOrangeControl = false,
}: WindowMockupProps) {
  return (
    <div className="bg-black/60 rounded-lg p-4 my-4 relative border border-zinc-800">
      {/* Window controls */}
      <div className="absolute top-2 right-2 flex items-center space-x-1">
        <div
          className={`w-3 h-3 ${showOrangeControl ? "bg-orange-400" : "bg-zinc-600"} rounded-full`}
        ></div>
        <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
      </div>
      {children}
    </div>
  );
}
