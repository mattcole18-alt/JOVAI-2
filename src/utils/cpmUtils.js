export function cpmRating(cpm) {
  if (cpm >= 2.0) return { label: "Excellent", color: "#00b4a0", bg: "#e6faf7" };
  if (cpm >= 1.5) return { label: "Good", color: "#3b9e3b", bg: "#eaf5ea" };
  if (cpm >= 1.0) return { label: "Fair", color: "#f5a623", bg: "#fef6e6" };
  return { label: "Pay Cash", color: "#e5384f", bg: "#fdeaed" };
}

export function aiRecommendation(cpm) {
  if (cpm >= 2.0) return "Outstanding redemption — you're getting exceptional value from your miles. Book immediately before availability disappears.";
  if (cpm >= 1.5) return "Solid value — this is a good use of miles, especially for premium cabins. Recommended: redeem your miles.";
  if (cpm >= 1.0) return "Marginal — consider whether your miles could unlock better value on a different route or date.";
  return "Pay cash and save your miles for a higher-value redemption. Your points are worth more elsewhere.";
}
