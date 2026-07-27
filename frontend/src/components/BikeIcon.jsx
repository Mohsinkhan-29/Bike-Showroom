// Simple procedural motorcycle silhouette used as a placeholder thumbnail
// when a bike has no image_url — mirrors the inline-SVG look of the
// original static site so the catalog never looks "broken" pre-photos.
export default function BikeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 200 120" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="50" cy="88" r="22" />
      <circle cx="155" cy="88" r="22" />
      <path d="M50 88 L95 58 L135 58 L155 88" className="text-amber" stroke="currentColor" />
      <path d="M95 58 L100 38 L125 36" />
    </svg>
  );
}
