import { createUser, findUserByEmail, verifyPassword } from "./service.js";
import { signAccessToken, signRefreshToken, verifyRefresh } from "./jwt.js";
import { validate, registerSchema, loginSchema } from "./validators.js";

const TEXT = {
  EMAIL_IN_USE: "Email déjà utilisé",
  ERROR_SERVER: "Erreur serveur",
  INVALID_CREDENTIALS: "Identifiants invalides",
  INVALID_REFRESH: "Refresh token invalide",
};

export async function register(req, res) {
  try {
    const { email, password, firstName, lastName, phoneNumber } = validate(
      registerSchema,
      req.body
    );
    const exists = await findUserByEmail(email);
    if (exists) return res.status(409).json({ error: TEXT.EMAIL_IN_USE });
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });
    const access = signAccessToken(user);
    const refresh = signRefreshToken(user);
    res.status(201).json({ user, tokens: { access, refresh } });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || TEXT.ERROR_SERVER });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = validate(loginSchema, req.body);
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: TEXT.INVALID_CREDENTIALS });

    const ok = await verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ error: TEXT.INVALID_CREDENTIALS });

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
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || TEXT.ERROR_SERVER });
  }
}

export async function refresh(req, res) {
  try {
    const { refresh: refreshToken } = req.body || {};
    if (!refreshToken)
      return res.status(400).json({ error: TEXT.INVALID_REFRESH });
    const payload = verifyRefresh(refreshToken);
    const access = signAccessToken({ sub: payload.sub });
    res.json({ access });
  } catch {
    res.status(401).json({ error: TEXT.INVALID_REFRESH });
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
