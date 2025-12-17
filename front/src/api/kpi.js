import { getToken } from "../utils/getToken";
import { checkAuthError } from "../utils/handleAuthError";

const BASE_URL = "http://localhost:3000";

export const kpiApi = {
  /**
   * Récupère les KPI pour la vue Responsable
   * @param {string} startDate - Date de début (optionnel)
   * @param {string} endDate - Date de fin (optionnel)
   */
  async getResponsableKPIs(startDate, endDate) {
    let url = `${BASE_URL}/kpi/responsable`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Récupère les KPI pour la vue Manager d'une équipe
   * @param {number} teamId - ID de l'équipe
   * @param {string} startDate - Date de début (optionnel)
   * @param {string} endDate - Date de fin (optionnel)
   */
  async getManagerKPIs(teamId, startDate, endDate) {
    let url = `${BASE_URL}/kpi/manager/${teamId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Récupère les KPI pour un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @param {string} startDate - Date de début (optionnel)
   * @param {string} endDate - Date de fin (optionnel)
   */
  async getUserKPIs(userId, startDate, endDate) {
    let url = `${BASE_URL}/kpi/user/${userId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Récupère les KPI pour l'utilisateur connecté
   * @param {string} startDate - Date de début (optionnel)
   * @param {string} endDate - Date de fin (optionnel)
   */
  async getCurrentUserKPIs(startDate, endDate) {
    let url = `${BASE_URL}/kpi/user`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (checkAuthError(response)) {
      throw new Error("Session expirée. Redirection vers la connexion...");
    }

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  },
};

