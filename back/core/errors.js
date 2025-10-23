/**
 * Gestionnaire d'erreurs amélioré pour la fiabilité
 */

/**
 * Classe d'erreur personnalisée avec codes d'erreur
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Types d'erreurs prédéfinies
 */
export const ErrorTypes = {
  VALIDATION_ERROR: { statusCode: 400, code: "VALIDATION_ERROR" },
  UNAUTHORIZED: { statusCode: 401, code: "UNAUTHORIZED" },
  FORBIDDEN: { statusCode: 403, code: "FORBIDDEN" },
  NOT_FOUND: { statusCode: 404, code: "NOT_FOUND" },
  CONFLICT: { statusCode: 409, code: "CONFLICT" },
  INTERNAL_ERROR: { statusCode: 500, code: "INTERNAL_ERROR" },
};

/**
 * Crée une erreur de validation
 * @param {string} message - Message d'erreur
 * @returns {AppError} Erreur de validation
 */
export function createValidationError(message) {
  return new AppError(
    message,
    ErrorTypes.VALIDATION_ERROR.statusCode,
    ErrorTypes.VALIDATION_ERROR.code
  );
}

/**
 * Crée une erreur d'authentification
 * @param {string} message - Message d'erreur
 * @returns {AppError} Erreur d'authentification
 */
export function createUnauthorizedError(message = "Non authentifié") {
  return new AppError(
    message,
    ErrorTypes.UNAUTHORIZED.statusCode,
    ErrorTypes.UNAUTHORIZED.code
  );
}

/**
 * Crée une erreur d'autorisation
 * @param {string} message - Message d'erreur
 * @returns {AppError} Erreur d'autorisation
 */
export function createForbiddenError(message = "Accès refusé") {
  return new AppError(
    message,
    ErrorTypes.FORBIDDEN.statusCode,
    ErrorTypes.FORBIDDEN.code
  );
}

/**
 * Crée une erreur de ressource non trouvée
 * @param {string} message - Message d'erreur
 * @returns {AppError} Erreur de ressource non trouvée
 */
export function createNotFoundError(message = "Ressource non trouvée") {
  return new AppError(
    message,
    ErrorTypes.NOT_FOUND.statusCode,
    ErrorTypes.NOT_FOUND.code
  );
}

/**
 * Crée une erreur de conflit
 * @param {string} message - Message d'erreur
 * @returns {AppError} Erreur de conflit
 */
export function createConflictError(message = "Conflit de ressource") {
  return new AppError(
    message,
    ErrorTypes.CONFLICT.statusCode,
    ErrorTypes.CONFLICT.code
  );
}

/**
 * Valide qu'une ressource existe
 * @param {any} resource - Ressource à valider
 * @param {string} resourceName - Nom de la ressource pour le message d'erreur
 * @throws {AppError} Si la ressource n'existe pas
 */
export function validateResourceExists(resource, resourceName = "Ressource") {
  if (!resource) {
    throw createNotFoundError(`${resourceName} non trouvée`);
  }
  return resource;
}

/**
 * Valide qu'un utilisateur est authentifié
 * @param {Object} user - Utilisateur à valider
 * @throws {AppError} Si l'utilisateur n'est pas authentifié
 */
export function validateAuthenticatedUser(user) {
  if (!user?.id) {
    throw createUnauthorizedError("Utilisateur non authentifié");
  }
  return user;
}

/**
 * Valide les permissions de rôle
 * @param {Object} user - Utilisateur
 * @param {string[]} allowedRoles - Rôles autorisés
 * @throws {AppError} Si le rôle n'est pas autorisé
 */
export function validateUserRole(user, allowedRoles) {
  validateAuthenticatedUser(user);

  if (!user.role || !allowedRoles.includes(user.role)) {
    throw createForbiddenError(
      `Rôle '${user.role}' non autorisé. Rôles autorisés: ${allowedRoles.join(
        ", "
      )}`
    );
  }
  return true;
}
