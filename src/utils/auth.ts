export const checkPremiumAccess = (isPremium: boolean): boolean => {
  return isPremium;
};

// Reserved locked-state utility class for premium-gated UI.
export const PREMIUM_LOCKED_CLASS = "opacity-40 cursor-not-allowed pointer-events-none";
