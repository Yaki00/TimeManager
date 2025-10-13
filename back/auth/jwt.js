import jwt from "jsonwebtoken";

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TTL = "15m",
  REFRESH_TTL = "7d",
} = process.env;

if (!JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET manquant");
if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET manquant");

export function signAccessToken(user) {
  const payload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(user) {
  const payload = {
    sub: String(user.id),
    tokenType: "refresh",
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyAccess(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}
