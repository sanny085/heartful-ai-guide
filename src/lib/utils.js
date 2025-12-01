import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function redirectToRoot () {
  const isDev = import.meta.env.DEV;
  const domain = import.meta.env.VITE_DOMAIN; 

  if (isDev) {
    window.location.href = domain;
  } else {
    const prodDomain = domain || "https://10000hearts.com/";

    window.location.href = prodDomain;
  }
};