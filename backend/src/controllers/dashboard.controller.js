import { query } from "../db.js";

// GET /api/dashboard/kpis (admin only)
export async function getKpis(req, res, next) {
  try {
    const [
      totals,
      byCategory,
      topViewed,
      leadsTotal,
      leadsLast7d,
      leadsByDay,
      demandByUseCase,
      recentLeads,
    ] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total_bikes, ROUND(AVG(price))::int AS avg_price,
                    MIN(price)::int AS min_price, MAX(price)::int AS max_price
             FROM bikes WHERE is_active = true`),
      query(`SELECT category, COUNT(*)::int AS count, ROUND(AVG(price))::int AS avg_price
             FROM bikes WHERE is_active = true GROUP BY category ORDER BY count DESC`),
      query(`SELECT id, name, category, price, views FROM bikes
             WHERE is_active = true ORDER BY views DESC LIMIT 5`),
      query(`SELECT COUNT(*)::int AS count FROM leads`),
      query(`SELECT COUNT(*)::int AS count FROM leads WHERE created_at > now() - interval '7 days'`),
      query(`SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
             FROM leads WHERE created_at > now() - interval '14 days'
             GROUP BY day ORDER BY day`),
      // "forecast" signal: which use-cases riders are actually asking about,
      // and the budget band they gave — useful for stocking decisions.
      query(`SELECT use_case, COUNT(*)::int AS requests, ROUND(AVG(budget_max))::int AS avg_budget
             FROM recommendation_requests
             WHERE created_at > now() - interval '30 days'
             GROUP BY use_case ORDER BY requests DESC`),
      query(`SELECT id, name, phone, interest, model, created_at FROM leads
             ORDER BY created_at DESC LIMIT 5`),
    ]);

    res.json({
      totals: totals.rows[0],
      byCategory: byCategory.rows,
      topViewed: topViewed.rows,
      leads: {
        total: leadsTotal.rows[0].count,
        last7Days: leadsLast7d.rows[0].count,
        byDay: leadsByDay.rows,
        recent: recentLeads.rows,
      },
      demandForecast: demandByUseCase.rows,
    });
  } catch (err) {
    next(err);
  }
}
