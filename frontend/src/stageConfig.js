export const STAGE_COLORS = {
  Wishlist: "var(--slate)",
  Applied: "var(--blue)",
  OA: "var(--amber)",
  Interview: "var(--violet)",
  Offer: "var(--green)",
  Rejected: "var(--rust)",
};

export const STAGE_ORDER = ["Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected"];

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}
