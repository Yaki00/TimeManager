import { createUser, findUserByEmail, verifyPassword } from "./service.js";
import { signAccessToken, signRefreshToken, verifyRefresh } from "./jwt.js";
import { validate, registerSchema, loginSchema } from "./validators.js";

import { asyncHandler } from "../../core/async.js";
import { conflict, unauthorized } from "../../core/httpErrors.js";

const TEXT = {
  EMAIL_IN_USE: "Email déjà utilisé",
  ERROR_SERVER: "Erreur serveur",
  INVALID_CREDENTIALS: "Identifiants invalides",
  INVALID_REFRESH: "Refresh token invalide",
};

export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber } = validate(
    registerSchema,
    req.body
  );
  const normalizedEmail = email.trim().toLowerCase();
  const exists = await findUserByEmail(normalizedEmail);
  if (exists) throw conflict(TEXT.EMAIL_IN_USE, "EMAIL_IN_USE");
  const user = await createUser({
    email: normalizedEmail,
    password,
    firstName,
    lastName,
    phoneNumber,
  });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  res.status(201).json({ user, tokens: { access, refresh } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = validate(loginSchema, req.body);
  const user = await findUserByEmail(email);
  if (!user) {
    await dummyVerifyPassword(password);
    throw unauthorized(TEXT.INVALID_CREDENTIALS, "INVALID_CREDENTIALS");
  }

  const ok = await verifyPassword(password, user.password);
  if (!ok) throw unauthorized(TEXT.INVALID_CREDENTIALS, "INVALID_CREDENTIALS");
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      lastName: user.lastName,
      firstName: user.firstName,
      phoneNumber: user.phoneNumber,
      contractType: user.contractType,
      tokens: { access, refresh },
    },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refresh: refreshToken } = req.body || {};
  if (!refreshToken) {
    throw unauthorized(TEXT.INVALID_REFRESH, "INVALID_REFRESH");
  }
  const payload = verifyRefresh(refreshToken);
  const access = signAccessToken({ sub: payload.sub });
  res.json({ access });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
