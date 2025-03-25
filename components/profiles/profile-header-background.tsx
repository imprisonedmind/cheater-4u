"use client"

import Image from "next/image";

interface StatusBackgroundProps {
  isCheater: boolean
  ban_status: boolean
  suspicious_score: number
  height?: number
}

export function StatusBackground({
                                   isCheater,
                                   ban_status,
                                   suspicious_score,
                                   height = 32,
                                 }: StatusBackgroundProps) {
  // 1) Decide gradient classes
  let gradientClasses = ""
  if (isCheater) {
    gradientClasses = "bg-gradient-to-t from-red-800 to-red-500/30"
  } else if (ban_status) {
    gradientClasses = "bg-gradient-to-t from-red-700 to-orange-600"
  } else if (suspicious_score >= 70) {
    gradientClasses = "bg-gradient-to-t from-orange-600 to-yellow-500"
  } else {
    gradientClasses = "bg-gradient-to-t from-green-600 to-green-400"
  }

  // 2) Decide which pattern class to use
  //    If banned => apply "bg-banned-shape"
  //    If cheater => maybe a different pattern, etc.
  let patternClass = ""
  if (isCheater) {
    patternClass = "bg-[url('/svgs/cheater.svg')]"
  } else if (ban_status) {
    // Use the "banned-shape" from tailwind.config.js
    patternClass = "bg-[url('/svgs/cheater.svg')]"
  } else if (suspicious_score >= 70) {
    patternClass = "bg-[url('/patterns/topography.svg')]"
  } else {
    patternClass = "bg-[url('/patterns/jupiter.svg')]"
  }

  // 3) Combine them in a single <div>
  //    We'll do "bg-repeat" to tile the pattern, "bg-blend-multiply" to multiply it with the gradient,
  //    and "text-white" so the pattern uses fill="currentColor" => white.
  return (
      <div className={`relative h-${height} ${gradientClasses} text-white`}>
       <div  className={`${patternClass} w-full h-full p-4 bg-repeat bg-[length:66px] bg-center opacity-5`}/>
      </div>
  )
}
