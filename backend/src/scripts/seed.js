// Seeds the bikes table with the original S.M. Autos catalog
// (previously hardcoded in bikes.html). Clears and reinserts on each run.
import { pool } from "../db.js";

const bikes = [
  {
    name: "Falcon 150",
    category: "commuter",
    price: 345000,
    description: "Light, fuel-sipping, and built for the daily grind through city traffic.",
    specs: { Engine: "149cc, single", Power: "13.2 bhp", Mileage: "52 km/l", "Kerb weight": "128 kg" },
  },
  {
    name: "Voyager 125 EFI",
    category: "commuter",
    price: 260000,
    description: "Fuel-injected and low-maintenance — the pick for first-time riders.",
    specs: { Engine: "125cc, EFI", Power: "10.8 bhp", Mileage: "58 km/l", "Kerb weight": "118 kg" },
  },
  {
    name: "Raptor RX250",
    category: "sport",
    price: 685000,
    description: "Twin-cylinder punch with a fairing built for the highway, not the showroom.",
    specs: { Engine: "249cc, twin", Power: "27.4 bhp", "Top speed": "138 km/h", "Kerb weight": "159 kg" },
  },
  {
    name: "Raptor RX400R",
    category: "sport",
    price: 920000,
    description: "The RX250's bigger sibling — track-tuned suspension, sharper brakes.",
    specs: { Engine: "399cc, twin", Power: "44.1 bhp", "Top speed": "168 km/h", "Kerb weight": "174 kg" },
  },
  {
    name: "Marauder 350",
    category: "cruiser",
    price: 595000,
    description: "Low seat, long wheelbase, and a thump that carries down the block.",
    specs: { Engine: "346cc, single", Power: "20.2 bhp", "Seat height": "765 mm", "Kerb weight": "195 kg" },
  },
  {
    name: "Trailhawk 400 ADV",
    category: "adventure",
    price: 990000,
    description: "Long-travel suspension and a tank range built for the roads that end.",
    specs: { Engine: "398cc, single", Power: "39.5 bhp", "Fuel tank": "19 L", "Ground clearance": "230 mm" },
  },
  {
    name: "Trailhawk 650 ADV",
    category: "adventure",
    price: 1450000,
    description: "Twin-cylinder tourer for riders who plan trips in weeks, not weekends.",
    specs: { Engine: "649cc, twin", Power: "67 bhp", "Fuel tank": "21 L", "Ground clearance": "220 mm" },
  },
  {
    name: "Volt-e Commuter",
    category: "electric",
    price: 215000,
    description: "Zero-emission runabout with swappable battery packs and app-based diagnostics.",
    specs: { Motor: "4.4 kW", Range: "110 km/charge", "Charge time": "4.5 hrs", "Kerb weight": "105 kg" },
  },
];

// A little seed variety for KPI charts (view counts) so the admin
// dashboard isn't empty on first run.
const sampleViews = [140, 95, 210, 260, 130, 175, 205, 88];

// Seed stock levels — a couple set to 0 so the "out of stock" state is
// visible in the catalog/demo without any extra setup.
const sampleStock = [12, 18, 5, 2, 7, 0, 3, 9];

async function seed() {
  console.log("Seeding bikes...");
  await pool.query("TRUNCATE bikes RESTART IDENTITY CASCADE");

  for (let i = 0; i < bikes.length; i++) {
    const b = bikes[i];
    await pool.query(
      `INSERT INTO bikes (name, category, price, description, specs, views, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [b.name, b.category, b.price, b.description, JSON.stringify(b.specs), sampleViews[i] || 0, sampleStock[i] ?? 0]
    );
  }

  console.log(`Seeded ${bikes.length} bikes.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
