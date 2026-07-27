export function formatPKR(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  return `₨ ${n.toLocaleString("en-PK")}`;
}

export const CATEGORY_LABELS = {
  commuter: "Commuter",
  sport: "Sport",
  cruiser: "Cruiser",
  adventure: "Adventure",
  electric: "Electric",
};
