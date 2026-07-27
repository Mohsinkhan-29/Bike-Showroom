export function formatPKR(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  return `₨ ${n.toLocaleString("en-PK")}`;
}
