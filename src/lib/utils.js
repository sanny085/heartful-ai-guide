import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function redirectToRoot() {
  const rawDomain = import.meta.env.VITE_DOMAIN?.trim();

  // Fallback if somehow not defined - use React Router navigation
  if (!rawDomain) {
    return "/";
  }

  // If it's already a full URL (dev/prod) - return as is
  if (rawDomain.startsWith("http://") || rawDomain.startsWith("https://")) {
    // Ensure it ends with / for consistency
    return rawDomain.endsWith("/") ? rawDomain : `${rawDomain}/`;
  }

  // If it's a relative path like "/" or domain name without protocol
  try {
    // Check if it looks like a domain name (contains dots but no slashes at start)
    if (rawDomain.includes(".") && !rawDomain.startsWith("/")) {
      // Assume https for domain names without protocol
      return `https://${rawDomain}${rawDomain.endsWith("/") ? "" : "/"}`;
    }
    
    // For relative paths, construct URL using current origin
    const url = new URL(rawDomain, window.location.origin);
    return url.toString();
  } catch (error) {
    console.error("Error constructing redirect URL:", error);
    // Very edge case: if URL construction fails, return root path
    return "/";
  }
}

/**
 * Performs a redirect to the root URL based on environment configuration.
 * Uses window.location.href for cross-domain redirects or React Router navigate for same-domain.
 */
export function performRedirect(navigate) {
  const redirectUrl = redirectToRoot();
  
  // Check if redirecting to a different domain
  const currentOrigin = window.location.origin;
  const redirectOrigin = redirectUrl.startsWith("http") 
    ? new URL(redirectUrl).origin 
    : currentOrigin;
  
  // If same domain, use React Router navigate (no page reload)
  if (redirectOrigin === currentOrigin || redirectUrl.startsWith("/")) {
    if (navigate) {
      navigate("/");
    } else {
      window.location.href = "/";
    }
  } else {
    // Cross-domain redirect requires full page reload
    window.location.href = redirectUrl;
  }
}
