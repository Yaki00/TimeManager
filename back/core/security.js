import helmet from "helmet";
import { xss } from "express-xss-sanitizer";
import hpp from "hpp";


//Middleware de sécurité regroupant Helmet, HPP et XSS Clean

export function securityMiddleware(allowedOrigins = []) {
  // Configuration Helmet avec CSP stricte
  const helmetMiddleware = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Nécessaire pour Swagger UI
          "'unsafe-eval'", // Nécessaire pour Swagger UI
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Nécessaire pour Swagger UI
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", ...allowedOrigins],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité avec Swagger
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });

  // HPP Protection contre la pollution des paramètres HTTP
  const hppMiddleware = hpp();

  // XSS Clean nettoie les données entrantes (req.body, req.query, req.headers)
  const xssMiddleware = xss();

  return (req, res, next) => {
    helmetMiddleware(req, res, () => {
      hppMiddleware(req, res, () => {
        xssMiddleware(req, res, next);
      });
    });
  };
}
