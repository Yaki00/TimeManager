/**
 * Utilitaires communs pour les contrôleurs
 */

/**
 * Valide qu'un utilisateur est authentifié
 * @param {Object} user - Utilisateur de la requête
 * @throws {Error} Si non authentifié
 */
export function requireAuthenticatedUser(user) {
  if (!user?.id) {
    throw new Error("Utilisateur non authentifié");
  }
  return user;
}

/**
 * Vérifie les permissions de rôle
 * @param {Object} user - Utilisateur
 * @param {string[]} allowedRoles - Rôles autorisés
 * @throws {Error} Si rôle non autorisé
 */
export function requireRole(user, allowedRoles) {
  if (!user?.role || !allowedRoles.includes(user.role)) {
    throw new Error("Rôle insuffisant");
  }
  return true;
}

/**
 * Vérifie qu'un utilisateur est Manager ou Responsable
 * @param {Object} user - Utilisateur
 * @returns {boolean} True si Manager ou Responsable
 */
export function isManagerOrResponsable(user) {
  return user?.role === "Manager" || user?.role === "Responsable";
}

/**
 * Vérifie qu'un utilisateur est Responsable
 * @param {Object} user - Utilisateur
 * @returns {boolean} True si Responsable
 */
export function isResponsable(user) {
  return user?.role === "Responsable";
}

/**
 * Valide un ID numérique
 * @param {string|number} id - ID à valider
 * @returns {number} ID validé
 * @throws {Error} Si ID invalide
 */
export function validateNumericId(id) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new Error("ID invalide");
  }
  return numericId;
}

/**
 * Crée une réponse utilisateur standardisée
 * @param {Object} user - Utilisateur
 * @returns {Object} Réponse utilisateur
 */
export function createUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    lastName: user.lastName,
    firstName: user.firstName,
    phoneNumber: user.phoneNumber,
    contractType: user.contractType,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Crée une réponse d'authentification standardisée
 * @param {Object} user - Utilisateur
 * @param {string} accessToken - Token d'accès
 * @param {string} refreshToken - Token de rafraîchissement
 * @returns {Object} Réponse d'authentification
 */
export function createAuthResponse(user, accessToken, refreshToken) {
  return {
    user: {
      ...createUserResponse(user),
      tokens: { access: accessToken, refresh: refreshToken },
    },
  };
}
