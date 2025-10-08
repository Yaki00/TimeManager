import jwt from "jsonwebtoken";

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TTL = "15m",
  REFRESH_TTL = "7d",
} = process.env;

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyAccess(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}
