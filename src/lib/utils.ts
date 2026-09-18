import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreTier(score: number) {
  if (score >= 850)
    return {
      label: "Elite Tier",
      tone: "emerald" as const,
      desc: "Top 5% · Direct Placement Shortlist",
    };
  if (score >= 700)
    return { label: "Advanced", tone: "cyan" as const, desc: "High Requisition Matching Rate" };
  if (score >= 550)
    return {
      label: "Intermediate",
      tone: "purple" as const,
      desc: "Standard Campus Drive Eligibility",
    };
  return { label: "Foundational", tone: "amber" as const, desc: "Accelerating Core Competency" };
}

