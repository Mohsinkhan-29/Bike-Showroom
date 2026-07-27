import { query } from "../db.js";

// POST /api/leads (public — the contact form)
export async function createLead(req, res, next) {
  try {
    const { name, phone, interest, model, message } = req.body || {};
    if (!name || !phone) {
      return res.status(400).json({ error: "name and phone are required" });
    }
    const { rows } = await query(
      `INSERT INTO leads (name, phone, interest, model, message)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, phone, interest || null, model || null, message || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/leads (admin)
export async function listLeads(req, res, next) {
  try {
    const { rows } = await query(`SELECT * FROM leads ORDER BY created_at DESC LIMIT 200`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
