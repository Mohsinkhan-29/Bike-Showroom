import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { bikesApi } from "../api/bikes.js";
import BikeCard from "../components/BikeCard.jsx";

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    bikesApi.list().then((all) => setFeatured(all.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <>
      <section className="container-page pt-20 pb-16">
        <span className="eyebrow">S.M. Autos — Motorcycle Showroom</span>
        <h1 className="text-[clamp(36px,6vw,64px)] mt-3 max-w-3xl">
          Machines built for the road, not the brochure.
        </h1>
        <p className="text-chrome-light max-w-xl mt-4">
          Browse the full lineup, get a personalized recommendation based on your budget and
          riding style, or book a test ride at the showroom.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/bikes" className="btn btn-primary">Browse catalog</Link>
          <Link to="/recommend" className="btn btn-outline">Find my bike</Link>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl">Featured models</h2>
          <Link to="/bikes" className="text-amber text-sm font-display uppercase tracking-wide hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((b) => <BikeCard key={b.id} bike={b} />)}
        </div>
      </section>
    </>
  );
}
