import { query } from "../db.js";

const CATEGORIES = ["commuter", "sport", "cruiser", "adventure", "electric"];

function serializeBody(body) {
  const { name, category, price, description, image_url, specs, is_active, stock } = body;
  if (!name || !category || price === undefined) {
    const err = new Error("name, category and price are required");
    err.status = 400;
    throw err;
  }
  if (!CATEGORIES.includes(category)) {
    const err = new Error(`category must be one of: ${CATEGORIES.join(", ")}`);
    err.status = 400;
    throw err;
  }
  const stockNum = stock === undefined || stock === "" ? 0 : Number(stock);
  if (!Number.isFinite(stockNum) || stockNum < 0) {
    const err = new Error("stock must be a non-negative number");
    err.status = 400;
    throw err;
  }
  return {
    name: String(name).trim(),
    category,
    price: Number(price),
    description: description || "",
    image_url: image_url || null,
    specs: specs && typeof specs === "object" ? specs : {},
    is_active: is_active === undefined ? true : Boolean(is_active),
    stock: Math.floor(stockNum),
  };
}

// GET /api/bikes?category=sport&search=raptor
export async function listBikes(req, res, next) {
  try {
    const { category, search } = req.query;
    const clauses = ["is_active = true"];
    const params = [];

    if (category && category !== "all") {
      params.push(category);
      clauses.push(`category = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      clauses.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const { rows } = await query(
      `SELECT * FROM bikes ${where} ORDER BY category, price ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/bikes/:id  (increments view count for KPI + recommendation weighting)
export async function getBike(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `UPDATE bikes SET views = views + 1 WHERE id = $1 AND is_active = true RETURNING *`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Bike not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/bikes (admin)
export async function createBike(req, res, next) {
  try {
    const b = serializeBody(req.body);
    const { rows } = await query(
      `INSERT INTO bikes (name, category, price, description, image_url, specs, is_active, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [b.name, b.category, b.price, b.description, b.image_url, JSON.stringify(b.specs), b.is_active, b.stock]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/bikes/:id (admin)
export async function updateBike(req, res, next) {
  try {
    const { id } = req.params;
    const b = serializeBody(req.body);
    const { rows } = await query(
      `UPDATE bikes SET name=$1, category=$2, price=$3, description=$4, image_url=$5,
        specs=$6, is_active=$7, stock=$8, updated_at=now()
       WHERE id=$9 RETURNING *`,
      [b.name, b.category, b.price, b.description, b.image_url, JSON.stringify(b.specs), b.is_active, b.stock, id]
    );
    if (!rows.length) return res.status(404).json({ error: "Bike not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/bikes/:id (admin) — soft delete so KPI history stays intact
export async function deleteBike(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `UPDATE bikes SET is_active = false, updated_at = now() WHERE id = $1 RETURNING id`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Bike not found" });
    res.json({ deleted: true, id: rows[0].id });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/bikes/:id/stock (admin) — quick restock without touching
// the rest of the bike's fields. body: { stock }
export async function updateStock(req, res, next) {
  try {
    const { id } = req.params;
    const { stock } = req.body || {};
    const stockNum = Number(stock);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      const err = new Error("stock must be a non-negative number");
      err.status = 400;
      throw err;
    }
    const { rows } = await query(
      `UPDATE bikes SET stock=$1, updated_at=now() WHERE id=$2 RETURNING *`,
      [Math.floor(stockNum), id]
    );
    if (!rows.length) return res.status(404).json({ error: "Bike not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/bikes/upload-image (admin) — multipart/form-data, field "image".
// Returns a data URL the frontend can drop straight into image_url. Storing
// it as a data URL (rather than a filesystem path) keeps things working on
// serverless hosts like Vercel, which don't offer persistent disk storage.
// For a production dealership site with many/large photos, swap this out
// for a real object-storage provider (S3, Cloudinary, etc.) instead.
export async function uploadBikeImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Attach it under field name 'image'." });
    }
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    res.status(201).json({ image_url: dataUrl });
  } catch (err) {
    next(err);
  }
}

export const CATEGORY_LIST = CATEGORIES;
