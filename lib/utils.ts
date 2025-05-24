import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple Scene Name Generator
const adjectives = ["Mysterious", "Enchanted", "Forgotten", "Hidden", "Sunken", "Crystal", "Whispering", "Ancient", "Lost", "Secret", "Silent", "Twilight"];
const nouns = ["Forest", "Cave", "Island", "Treasure", "Path", "River", "Mountain", "Temple", "Grove", "Oasis", "Ruins", "Falls"];

export function generateSceneName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}
