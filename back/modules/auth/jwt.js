import jwt from "jsonwebtoken";

const {
  NODE_ENV,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TTL = "15m",
  REFRESH_TTL = "7d",
  JWT_ISSUER,
  JWT_AUDIENCE,
} = process.env;

const isTest = NODE_ENV === "test";

const ACCESS_SECRET =
  JWT_ACCESS_SECRET || (isTest ? "test-access-secret" : undefined);
const REFRESH_SECRET =
  JWT_REFRESH_SECRET || (isTest ? "test-refresh-secret" : undefined);
const ISSUER = JWT_ISSUER || (isTest ? "test-issuer" : undefined);
const AUDIENCE = JWT_AUDIENCE || (isTest ? "test-audience" : undefined);

if (!ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET manquant");
if (!REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET manquant");
if (!ISSUER) throw new Error("JWT_ISSUER manquant");
if (!AUDIENCE) throw new Error("JWT_AUDIENCE manquant");

export function signAccessToken(user) {
  const payload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function signRefreshToken(user) {
  const payload = {
    sub: String(user.id),
    tokenType: "refresh",
  };
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function verifyAccess(token) {
  const opts = isTest ? {} : { issuer: ISSUER, audience: AUDIENCE };
  return jwt.verify(token, ACCESS_SECRET, opts);
}

export function verifyRefresh(token) {
  const opts = isTest ? {} : { issuer: ISSUER, audience: AUDIENCE };
  return jwt.verify(token, REFRESH_SECRET, opts);
}
