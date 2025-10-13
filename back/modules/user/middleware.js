import { forbidden } from "../../core/httpErrors.js";
import { ROLES } from "../../core/roles.js";

export default function requireResponsable(req, _res, next) {
  if (req.user?.role !== ROLES.RESPONSABLE) {
    throw forbidden("Accès refusé : rôle insuffisant", "FORBIDDEN_ROLE");
  }
  next();
}
