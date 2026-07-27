import { env } from "../config/env.js";
import { signToken } from "../utils/jwt.js";

// Single hardcoded admin account, sourced from env vars.
// There is no admin table by design — only one admin exists.
export function adminLogin(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const emailMatches = email.trim().toLowerCase() === String(env.adminEmail).toLowerCase();
  const passwordMatches = password === env.adminPassword;

  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ email: env.adminEmail, role: "admin" });
  res.json({
    token,
    user: { email: env.adminEmail, role: "admin" },
  });
}

// Lets the frontend verify a stored token is still valid on app load.
export function me(req, res) {
  res.json({ user: req.user });
}
