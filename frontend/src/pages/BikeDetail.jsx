import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { bikesApi } from "../api/bikes.js";
import BikeIcon from "../components/BikeIcon.jsx";
import SpecPlate from "../components/SpecPlate.jsx";
import { formatPKR, CATEGORY_LABELS } from "../utils/format.js";

export default function BikeDetail() {
  const { id } = useParams();
  const [bike, setBike] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    bikesApi.get(id).then(setBike).catch(() => setError("Bike not found."));
  }, [id]);

  if (error) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-chrome-light mb-4">{error}</p>
        <Link to="/bikes" className="btn btn-outline">Back to catalog</Link>
      </div>
    );
  }
  if (!bike) return <div className="container-page py-20 text-chrome-light">Loading…</div>;

  return (
    <section className="container-page py-16 grid md:grid-cols-2 gap-10">
      <div className="aspect-[5/3] bg-steel border border-steel-line rounded flex items-center justify-center p-10 text-chrome">
        {bike.image_url ? (
          <img src={bike.image_url} alt={bike.name} className="w-full h-full object-cover rounded" />
        ) : (
          <BikeIcon className="w-full h-full" />
        )}
      </div>
      <div>
        <div className="flex items-center gap-3">
          <span className="eyebrow">{CATEGORY_LABELS[bike.category] || bike.category}</span>
          {Number(bike.stock) > 0 ? (
            <span className="text-xs uppercase tracking-wide text-chrome-light font-mono">{bike.stock} in stock</span>
          ) : (
            <span className="text-xs uppercase tracking-wide text-danger font-mono">Out of stock</span>
          )}
        </div>
        <h1 className="text-4xl mt-2">{bike.name}</h1>
        <p className="font-mono text-amber text-2xl font-semibold mt-3">{formatPKR(bike.price)}</p>
        <p className="text-chrome-light mt-4">{bike.description}</p>
        <div className="mt-6">
          <SpecPlate specs={bike.specs} />
        </div>
        <Link to="/contact" className="btn btn-primary mt-6">Book a test ride</Link>
      </div>
    </section>
  );
}
