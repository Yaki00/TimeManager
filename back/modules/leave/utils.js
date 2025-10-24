/**
 * Utilitaires pour la gestion des congés
 */

/**
 * Convertit une date en UTC date only (sans heure)
 * @param {Date} date - Date à convertir
 * @returns {Date} Date UTC sans heure
 */
export function toUTCDateOnly(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

/**
 * Calcule le nombre de jours ouvrés entre deux dates
 * @param {Date} start - Date de début
 * @param {Date} end - Date de fin
 * @returns {number} Nombre de jours ouvrés
 */
export function computeBusinessDays(start, end) {
  const startDate = toUTCDateOnly(start);
  const endDate = toUTCDateOnly(end);

  let count = 0;
  const current = new Date(startDate);
  const endTime = endDate.getTime();

  while (current.getTime() <= endTime) {
    const dayOfWeek = current.getUTCDay();
    // Lundi = 1, Mardi = 2, ..., Vendredi = 5
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      count++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return count;
}

/**
 * Valide les dates d'une demande de congé
 * @param {Date} startDate - Date de début
 * @param {Date} endDate - Date de fin
 * @throws {Error} Si les dates sont invalides
 */
export function validateLeaveDates(startDate, endDate) {
  if (startDate > endDate) {
    throw new Error("La date de début doit précéder la date de fin");
  }

  const daysLeave = computeBusinessDays(startDate, endDate);
  if (daysLeave <= 0) {
    throw new Error("La période ne contient aucun jour ouvré");
  }

  return daysLeave;
}

/**
 * Vérifie si un utilisateur est Manager ou Responsable
 * @param {Object} user - Utilisateur à vérifier
 * @returns {boolean} True si Manager ou Responsable
 */
export function isManagerOrResponsable(user) {
  return user?.role === "Manager" || user?.role === "Responsable";
}
