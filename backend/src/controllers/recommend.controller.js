import { query } from "../db.js";

// Maps a rider's stated purpose to the catalog categories that best serve it.
// This is the swappable "brain" of the recommender — replace scoreBikes()
// with a call to a real ML model or an LLM prompt later without touching
// the route/controller contract.
const USE_CASE_CATEGORY_WEIGHTS = {
  commute: { commuter: 1, electric: 0.8, sport: 0.2, cruiser: 0.2, adventure: 0.1 },
  sport: { sport: 1, adventure: 0.4, commuter: 0.1, cruiser: 0.1, electric: 0.1 },
  touring: { adventure: 1, cruiser: 0.5, sport: 0.3, commuter: 0.1, electric: 0.1 },
  cruising: { cruiser: 1, adventure: 0.4, commuter: 0.2, sport: 0.2, electric: 0.1 },
  eco: { electric: 1, commuter: 0.5, sport: 0.1, cruiser: 0.1, adventure: 0.1 },
};

const EXPERIENCE_POWER_TARGET = {
  beginner: 20,      // bhp — lighter, easier to manage
  intermediate: 40,
  expert: 65,
};

function parseNumber(str) {
  if (!str) return null;
  const match = String(str).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function scoreBikes(bikes, { budgetMin, budgetMax, useCase, experience }) {
  const catWeights = USE_CASE_CATEGORY_WEIGHTS[useCase] || {};
  const targetPower = EXPERIENCE_POWER_TARGET[experience] || 35;
  const maxViews = Math.max(1, ...bikes.map((b) => b.views || 0));

  return bikes
    .map((b) => {
      let score = 0;

      // 1. Use-case / category fit (0-50)
      score += (catWeights[b.category] || 0) * 50;

      // 2. Budget fit (0-30)
      if (budgetMin != null && budgetMax != null) {
        if (b.price >= budgetMin && b.price <= budgetMax) {
          score += 30;
        } else {
          const distance = b.price < budgetMin ? budgetMin - b.price : b.price - budgetMax;
          const penalty = Math.min(30, (distance / Math.max(budgetMax, 1)) * 30);
          score += Math.max(0, 30 - penalty);
        }
      }

      // 3. Experience / power fit (0-15)
      const power = parseNumber(b.specs?.Power);
      if (power != null) {
        const diff = Math.abs(power - targetPower);
        score += Math.max(0, 15 - diff / 4);
      }

      // 4. Popularity signal (0-5)
      score += ((b.views || 0) / maxViews) * 5;

      return { ...b, matchScore: Math.round(score) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

// POST /api/recommend
// body: { budgetMin, budgetMax, useCase, experience }
export async function recommend(req, res, next) {
  try {
    const { budgetMin, budgetMax, useCase, experience } = req.body || {};

    if (!useCase || !experience) {
      return res.status(400).json({ error: "useCase and experience are required" });
    }

    const { rows: bikes } = await query(`SELECT * FROM bikes WHERE is_active = true`);
    const ranked = scoreBikes(bikes, {
      budgetMin: budgetMin != null ? Number(budgetMin) : null,
      budgetMax: budgetMax != null ? Number(budgetMax) : null,
      useCase,
      experience,
    });

    const top = ranked.slice(0, 3);

    // Log the request so the admin dashboard can show demand forecasting
    // (which use-cases / budgets people are actually asking about).
    await query(
      `INSERT INTO recommendation_requests (budget_min, budget_max, use_case, experience_level, top_bike_id)
       VALUES ($1,$2,$3,$4,$5)`,
      [budgetMin || null, budgetMax || null, useCase, experience, top[0]?.id || null]
    );

    res.json({ recommendations: top });
  } catch (err) {
    next(err);
  }
}
