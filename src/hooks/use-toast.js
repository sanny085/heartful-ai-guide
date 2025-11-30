// Minimal no-op toast hook and function to avoid circular re-exports during build.
// Currently, no code in the app calls `toast(...)`, and `useToast` is only used
// inside the Radix-based <Toaster />, so returning an empty list is sufficient.

export const useToast = () => ({
  toasts: [],
});

export const toast = () => {};
