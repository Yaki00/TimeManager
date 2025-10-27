import { verifyAccess } from "./jwt.js";

export function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
    if (!token) return res.status(401).json({ error: "Token manquant" });
    const payload = verifyAccess(token);
    const id = Number(payload.sub);
    if (!Number.isFinite(id)) {
      return res.status(401).json({ error: "Token invalide" });
    }

    req.user = { id, email: payload.email, role: payload.role };
    next();
  } catch (error) {
    // Log l'erreur pour le debugging en développement
    if (process.env.NODE_ENV !== "production") {
      console.error("Auth middleware error:", error.message);
    }
    return res.status(401).json({ error: "Token invalide" });
  }
}
