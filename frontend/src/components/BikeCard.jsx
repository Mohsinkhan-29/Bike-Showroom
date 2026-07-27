import { Link } from "react-router-dom";
import BikeIcon from "./BikeIcon.jsx";
import SpecPlate from "./SpecPlate.jsx";
import { formatPKR, CATEGORY_LABELS } from "../utils/format.js";

export default function BikeCard({ bike }) {
  return (
    <article className="bg-steel/40 border border-steel-line rounded overflow-hidden flex flex-col hover:border-amber/60 transition-colors">
      <div className="aspect-[5/3] bg-steel flex items-center justify-center p-8 text-chrome">
        {bike.image_url ? (
          <img src={bike.image_url} alt={bike.name} className="w-full h-full object-cover" />
        ) : (
          <BikeIcon className="w-full h-full" />
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="eyebrow">{CATEGORY_LABELS[bike.category] || bike.category}</span>
          {Number(bike.stock) > 0 ? (
            <span className="text-[10px] uppercase tracking-wide text-chrome-light font-mono">{bike.stock} in stock</span>
          ) : (
            <span className="text-[10px] uppercase tracking-wide text-danger font-mono">Out of stock</span>
          )}
        </div>
        <h3 className="text-xl">{bike.name}</h3>
        <p className="font-mono text-amber font-semibold">{formatPKR(bike.price)}</p>
        <p className="text-chrome-light text-sm flex-1">{bike.description}</p>
        <SpecPlate specs={bike.specs} />
        <Link to={`/bikes/${bike.id}`} className="btn btn-outline mt-2 self-start">
          View details
        </Link>
      </div>
    </article>
  );
}
